# Fase 5 — Tambah Favorit

Dokumen ini langkah demi langkah. Di akhir fase ini, hati di halaman detail menyimpan barang ke akun yang sedang login. Daftarnya muncul di halaman Favorite items.

Favorit tidak disimpan di `localStorage`. Setiap barang ditulis satu per satu ke Realtime Database, di bawah profil user.

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Tombol hati | `src/pages/Detail.vue` | Tambah atau hapus favorit barang yang sedang dibuka |
| Halaman favorit | `src/pages/FavoritesPage.vue` | Daftar barang, hapus, dan buka detail |
| Badge navbar | `src/components/Navbar.vue` | Jumlah favorit user yang login |
| Route | `src/router.js` | `/favorites` hanya bisa dibuka setelah login |

## Langkah 1. Simpan di bawah profil user

Rules fase 1 sudah mengizinkan user menulis `users/{uid}`, termasuk anak node-nya. Tidak perlu rules baru.

Satu favorit menempati `users/{uid}/favorites/{productId}`. `productId` adalah id barang dari Firebase, sama dengan yang dipakai di `/detail/:id`.

```json
{
  "users": {
    "UID_USER": {
      "fullName": "Budi Santoso",
      "username": "budi",
      "email": "budi@email.com",
      "favorites": {
        "-P2NICrLfa6X0PU9Qc8m": {
          "name": "Vintage Chicago Cubs Crewneck",
          "price": "200000",
          "size": "S / M",
          "likes": 12,
          "image": "Vintagechicagocubswhitecrewneck.png",
          "brand": "Vans",
          "category": "Sweatshirt",
          "color": "White",
          "condition": "Very Good",
          "description": "Crewneck vintage Chicago Cubs berbahan tebal dan nyaman dipakai.",
          "uploaded": "5 hours ago",
          "shipping": "20000"
        }
      }
    }
  }
}
```

`image` menyimpan nama file atau URL asli, bukan alamat hasil import Vite. `price` dan `shipping` tetap angka polos. Saat dibaca, objek ini dilewatkan ke `mapProduct` yang sama dengan fase 2.

## Langkah 2. Buat `src/services/favorites.js`

Tulisan ke database user harus membawa sesi login. Pakai SDK Firebase, bukan axios polos, supaya request ikut token user yang sedang masuk.

```js
import { get, ref, remove, set } from 'firebase/database'
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

export function mapFavorite(product) {
  return {
    name: product.name || '',
    price: String(product.rawPrice || product.price || ''),
    size: product.size || '',
    likes: Number(product.likes || 0),
    image: product.imageName || product.image || '',
    brand: product.brand || '',
    category: product.category || '',
    color: product.color || '',
    condition: product.condition || '',
    description: product.description || '',
    uploaded: product.uploaded || '',
    shipping: String(product.rawShipping || product.shipping || ''),
  }
}

export async function fetchFavorites() {
  const uid = auth.currentUser?.uid
  if (!uid) return []

  const snapshot = await get(ref(db, `users/${uid}/favorites`))
  const data = snapshot.val()
  if (!data || typeof data !== 'object') return []

  return Object.keys(data).map((id) => mapProduct(id, data[id]))
}

export async function addFavorite(product) {
  const uid = requireUid()
  await set(ref(db, `users/${uid}/favorites/${product.id}`), mapFavorite(product))
}

export async function removeFavorite(productId) {
  const uid = requireUid()
  await remove(ref(db, `users/${uid}/favorites/${productId}`))
}
```

| Fungsi | Tugas |
| --- | --- |
| `fetchFavorites` | Baca `users/{uid}/favorites`, lalu mapping tiap barang |
| `addFavorite` | `set` satu barang. Id yang sama ditimpa, tidak jadi duplikat |
| `removeFavorite` | Hapus satu child `favorites/{productId}` |

## Langkah 3. Sambungkan tombol hati

Di `src/pages/Detail.vue`, hati memanggil service. Kalau belum login, user diarahkan ke `/login?redirect=` halaman detail yang sedang dibuka.

```js
import { addFavorite, fetchFavorites, removeFavorite } from '@/services/favorites'
import { auth } from '@/firebase'

async function toggleFavorite() {
  if (!activeProduct.value.id) return
  if (!auth.currentUser) {
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }

  const wasFavorite = isFavorite.value
  isFavorite.value = !wasFavorite
  try {
    if (wasFavorite) await removeFavorite(activeProduct.value.id)
    else await addFavorite(activeProduct.value)
    const favorites = await fetchFavorites()
    favoriteCount.value = favorites.length
    isFavorite.value = favorites.some((item) => item.id === activeProduct.value.id)
  } catch (error) {
    isFavorite.value = wasFavorite
  }
}
```

Setelah detail selesai dimuat, `fetchFavorites` menentukan apakah hati harus aktif. Hati aktif berwarna merah.

## Langkah 4. Tampilkan daftar favorit

`src/pages/FavoritesPage.vue` membaca daftar yang sama saat halaman dibuka.

```js
import { fetchFavorites, removeFavorite as deleteFavorite } from '@/services/favorites'

async loadFavorites() {
  try {
    this.favorites = await fetchFavorites()
  } catch (error) {
    this.favorites = []
  }
  this.favoriteCount = this.favorites.length
}

openProduct(item) {
  this.$router.push({ name: 'detail', params: { id: item.id } })
}

async removeFavorite(item) {
  await deleteFavorite(item.id)
  this.favorites = this.favorites.filter((entry) => entry.id !== item.id)
  this.favoriteCount = this.favorites.length
}
```

Kartu menampilkan harga, nama, ukuran, dan foto hasil `mapProduct`. Klik kartu membuka `/detail/:id`. Tombol hati di kartu menghapus barang itu dari database.

Badge di navbar, cart, checkout, dan settings juga memakai `fetchFavorites`, supaya angkanya sama dengan isi halaman favorit.

## Langkah 5. Uji di browser

1. Dalam keadaan logout, buka detail barang lalu klik hati. Harus pindah ke login, dengan `redirect` kembali ke detail itu.
2. Login, kembali ke detail, klik hati. Hati menjadi merah. Di Firebase Console, `users/{uid}/favorites/{productId}` berisi field barang.
3. Buka `/favorites`. Kartu barang itu muncul, lengkap dengan harga `Rp` dan foto.
4. Klik kartu. Halaman detail barang yang sama terbuka, dan hatinya tetap aktif.
5. Klik hati lagi, atau klik hati di kartu favorit. Node barang itu hilang dari database, dan daftar favorit berkurang.
6. Logout, lalu login dengan akun lain. Daftar favorit akun pertama tidak ikut terbawa.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Klik hati selalu kembali ke login | Belum ada sesi Firebase | Login dulu, lalu ulangi dari detail |
| `Permission denied` | Rules `users/{uid}` belum di-publish | Ulangi rules fase 1 |
| Favorit tersimpan, halaman favorit kosong | Halaman masih membaca `localStorage` | Panggil `fetchFavorites` di `mounted` |
| Foto favorit pecah | `image` yang disimpan adalah URL Vite, bukan nama file | Simpan `imageName` lewat `mapFavorite` |
| Badge navbar tetap 0 | `syncFavoriteCount` masih membaca `vintage_favorite_items` | Baca jumlah dari `fetchFavorites` |
| Satu barang muncul dua kali | Key daftar memakai `name` | Pakai `item.id` sebagai key dan sebagai path database |
