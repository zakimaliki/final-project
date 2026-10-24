# Fase 6 — Add to Cart

Dokumen ini langkah demi langkah. Di akhir fase ini, tombol **Add to Cart** dan **Buy Now** di halaman detail menyimpan barang ke akun yang sedang login. Halaman Cart menampilkan barang itu, bisa mengubah jumlah, dan bisa menghapus.

Keranjang tidak disimpan di `localStorage`. Setiap barang ditulis ke Realtime Database di bawah profil user. Item yang dipilih untuk checkout tetap disalin sementara ke `vintage_checkout_items` di browser, supaya fase checkout berikutnya tidak berubah.

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Add to Cart / Buy Now | `src/pages/Detail.vue` | Tambah satu barang ke keranjang |
| Modal sukses | `src/pages/Detail.vue` | Lanjut belanja atau buka cart |
| Halaman cart | `src/pages/CartPage.vue` | Daftar, ubah qty, hapus, checkout |
| Badge navbar | `src/components/Navbar.vue` | Jumlah total qty di keranjang |
| Route | `src/router.js` | `/cart` hanya bisa dibuka setelah login |

## Langkah 1. Simpan di bawah profil user

Rules fase 1 sudah mengizinkan user menulis `users/{uid}`, termasuk anak node-nya. Tidak perlu rules baru.

Satu barang di keranjang menempati `users/{uid}/cart/{productId}`. Id-nya sama dengan id barang di `/detail/:id`. Kalau barang yang sama ditambah lagi, `qty` bertambah.

```json
{
  "users": {
    "UID_USER": {
      "fullName": "Budi Santoso",
      "username": "budi",
      "email": "budi@email.com",
      "cart": {
        "-P2NICrLfa6X0PU9Qc8m": {
          "name": "Vintage Chicago Cubs Crewneck",
          "price": "200000",
          "size": "S / M",
          "image": "Vintagechicagocubswhitecrewneck.png",
          "shipping": "20000",
          "qty": 2
        }
      }
    }
  }
}
```

`image` menyimpan nama file atau URL asli, bukan alamat hasil import Vite. `price` dan `shipping` tetap angka polos. Saat dibaca, field itu dipetakan lewat `mapProduct`, lalu ditambah `qty` dan harga numerik untuk ringkasan order.

## Langkah 2. Buat `src/services/cart.js`

Tulisan ke database user harus membawa sesi login. Pakai SDK Firebase, bukan axios polos.

```js
import { get, ref, remove, set, update } from 'firebase/database'
import { auth, db } from '@/firebase'
import { mapProduct } from '@/services/products'

function requireUid() {
  const uid = auth.currentUser?.uid
  if (!uid) {
    const error = new Error('Login required.')
    error.code = 'auth/required'
    throw error
  }
  return uid
}

export function mapCartPayload(product, qty = 1) {
  return {
    name: product.name || '',
    price: String(product.rawPrice || product.price || ''),
    size: product.size || '',
    image: product.imageName || product.image || '',
    shipping: String(product.rawShipping || product.shipping || 0),
    qty: Math.max(1, Number(qty || 1)),
  }
}

export async function fetchCart() {
  const uid = auth.currentUser?.uid
  if (!uid) return []
  const snapshot = await get(ref(db, `users/${uid}/cart`))
  const data = snapshot.val()
  if (!data || typeof data !== 'object') return []
  return Object.keys(data).map((id) => {
    const product = mapProduct(id, data[id])
    return {
      id: product.id,
      name: product.name,
      size: product.size,
      price: Number(product.rawPrice || 0),
      qty: Math.max(1, Number(data[id].qty || 1)),
      image: product.image,
      imageName: product.imageName,
      shipping: Number(product.rawShipping || 0),
    }
  })
}

export async function addToCart(product, qty = 1) {
  const uid = requireUid()
  const itemRef = ref(db, `users/${uid}/cart/${product.id}`)
  const snapshot = await get(itemRef)
  const currentQty = snapshot.exists() ? Number(snapshot.val()?.qty || 0) : 0
  await set(itemRef, mapCartPayload(product, currentQty + qty))
}

export async function updateCartQty(productId, qty) {
  const uid = requireUid()
  if (qty <= 0) {
    await remove(ref(db, `users/${uid}/cart/${productId}`))
    return
  }
  await update(ref(db, `users/${uid}/cart/${productId}`), { qty })
}

export async function removeCartItem(productId) {
  const uid = requireUid()
  await remove(ref(db, `users/${uid}/cart/${productId}`))
}
```

| Fungsi | Tugas |
| --- | --- |
| `fetchCart` | Baca `users/{uid}/cart`, mapping tiap barang |
| `getCartCount` | Jumlah seluruh `qty` untuk badge |
| `addToCart` | Tambah barang baru, atau naikkan `qty` kalau id sudah ada |
| `updateCartQty` | Ubah jumlah. `qty` 0 atau kurang menghapus node |
| `removeCartItem` | Hapus satu child `cart/{productId}` |

## Langkah 3. Sambungkan tombol di detail

Di `src/pages/Detail.vue`, **Add to Cart** dan **Buy Now** memanggil service yang sama. Kalau belum login, user diarahkan ke `/login?redirect=` halaman detail yang sedang dibuka.

```js
import { addToCart as addProductToCart, getCartCount } from '@/services/cart'
import { auth } from '@/firebase'

async function addToCart() {
  if (!activeProduct.value.id) return
  if (!auth.currentUser) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  await addProductToCart(activeProduct.value, 1)
  cartCount.value = await getCartCount()
  showCart.value = true
}
```

Modal sukses muncul setelah write ke database berhasil. **Go to cart** membuka `/cart`.

## Langkah 4. Tampilkan dan kelola keranjang

`src/pages/CartPage.vue` membaca daftar yang sama saat halaman dibuka. Hapus data contoh yang ditulis hardcode.

```js
import { fetchCart, removeCartItem, updateCartQty } from '@/services/cart'

async loadCart() {
  this.cartItems = await fetchCart()
  this.selectedIds = this.cartItems.map((item) => item.id)
}

async changeQty(id, delta) {
  const item = this.cartItems.find((entry) => entry.id === id)
  const nextQty = Number(item.qty || 0) + delta
  await updateCartQty(id, nextQty)
  if (nextQty <= 0) {
    this.cartItems = this.cartItems.filter((entry) => entry.id !== id)
  } else {
    item.qty = nextQty
  }
}

async removeItem(id) {
  await removeCartItem(id)
  this.cartItems = this.cartItems.filter((entry) => entry.id !== id)
}
```

**Checkout** tetap menyalin barang terpilih ke `vintage_checkout_items`. Setelah order berhasil, barang yang dibeli dikurangi dari `users/{uid}/cart`.

Badge di navbar, detail, favorit, settings, dan checkout memakai `getCartCount`, supaya angkanya sama dengan isi halaman cart.

## Langkah 5. Uji di browser

1. Dalam keadaan logout, buka detail barang lalu klik **Add to Cart**. Harus pindah ke login, dengan `redirect` kembali ke detail itu.
2. Login, kembali ke detail, klik **Add to Cart**. Modal sukses muncul. Di Firebase Console, `users/{uid}/cart/{productId}` berisi field barang dan `qty: 1`.
3. Klik **Add to Cart** sekali lagi untuk barang yang sama. `qty` menjadi `2`. Badge keranjang menampilkan `2`.
4. Buka `/cart`. Nama, ukuran, harga `Rp`, foto, dan jumlah sesuai data Firebase.
5. Tekan `+` dan `−`. Node `qty` di database ikut berubah. Tekan `−` sampai 0, atau klik ✕. Node barang itu hilang.
6. Logout, lalu login dengan akun lain. Keranjang akun pertama tidak ikut terbawa.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Klik Add to Cart selalu ke login | Belum ada sesi Firebase | Login dulu, lalu ulangi dari detail |
| `Permission denied` | Rules `users/{uid}` belum di-publish | Ulangi rules fase 1 |
| Cart masih menampilkan barang contoh | Data hardcode belum dihapus | `cartItems` mulai dari `[]`, isi lewat `fetchCart` |
| Badge navbar tetap 0 | Masih membaca `vintage_cart_items` | Baca jumlah dari `getCartCount` |
| Foto di cart pecah | `image` yang disimpan URL Vite | Simpan `imageName` lewat `mapCartPayload` |
| Qty tidak naik saat barang sama ditambah | `addToCart` selalu menulis `qty: 1` | Baca qty lama dulu, lalu jumlahkan |
