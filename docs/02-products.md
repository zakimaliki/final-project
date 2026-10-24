# Fase 2 — List Produk dari Firebase

Dokumen ini langkah demi langkah. Di akhir fase ini, halaman home menampilkan barang dari Realtime Database, bukan dari data yang ditulis di dalam file Vue.

Sumber datanya adalah [https://vintage-8d691-default-rtdb.firebaseio.com](https://vintage-8d691-default-rtdb.firebaseio.com). Setiap barang disimpan satu per satu di node `products`.

## Bentuk satu barang

Satu produk selalu punya field yang sama. `price` dan `shipping` angka polos, tanpa `Rp` dan tanpa titik.

```json
{
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
```

| Field | Tipe | Dipakai di UI |
| --- | --- | --- |
| `name` | string | Nama di kartu dan halaman detail |
| `price` | string angka | Harga, diformat menjadi `Rp200.000` |
| `size` | string | Ukuran di kartu dan detail |
| `likes` | number | Angka di sebelah ikon hati |
| `image` | string | Nama file di `src/assets/img`, atau URL `https://` |
| `brand` | string | Filter Shop by brand |
| `category` | string | Detail produk |
| `color` | string | Detail produk |
| `condition` | string | Detail produk |
| `description` | string | Deskripsi di detail |
| `uploaded` | string | Waktu unggah di detail |
| `shipping` | string angka | Ongkir, diformat menjadi `Rp20.000` |

Daftar lengkap yang dikirim ada di `src/data/products.json`. Ada 12 barang.

## Langkah 1. Izinkan baca dan tulis node products

Rules fase 1 hanya membuka `users/{uid}`. Tanpa aturan di bawah, POST dan GET ke `products` dibalas `Permission denied`.

Di Firebase Console: **Build → Realtime Database → Rules**, tempel, lalu **Publish**.

```json
{
  "rules": {
    "products": {
      ".read": true,
      ".write": true
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

Katalog boleh dibaca siapa saja, termasuk pengunjung yang belum login. Profil user tetap hanya bisa dibaca pemiliknya.

## Langkah 2. POST satu barang satu request

Jangan kirim seluruh array dalam satu body. Firebase Realtime Database membuat satu child baru setiap kali ada POST ke `products.json`, lalu membalas dengan id acak.

```http
POST https://vintage-8d691-default-rtdb.firebaseio.com/products.json
Content-Type: application/json
```

Body-nya satu objek, contoh barang pertama di `src/data/products.json`.

Balasan yang benar:

```json
{ "name": "-P2NICrLfa6X0PU9Qc8m" }
```

`name` di balasan itu adalah id barang, bukan nama produk. Ulangi POST untuk barang berikutnya sampai 12 request selesai. Setelah itu node di database berbentuk:

```json
{
  "products": {
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
```

## Langkah 3. Endpoint yang dipakai aplikasi

| Fungsi | Method | URL |
| --- | --- | --- |
| Semua produk | GET | `https://vintage-8d691-default-rtdb.firebaseio.com/products.json` |
| Satu produk | GET | `https://vintage-8d691-default-rtdb.firebaseio.com/products/{id}.json` |

GET list membalas objek. Key-nya id Firebase, value-nya field barang. Kalau node kosong, balasannya `null`.

## Langkah 4. Buat `src/services/products.js`

Axios sudah ada di proyek. Service ini yang memanggil endpoint, lalu mengubah setiap barang menjadi bentuk yang dipakai kartu produk.

```js
import axios from 'axios'

const BASE_URL = 'https://vintage-8d691-default-rtdb.firebaseio.com'

export const productEndpoints = {
  list: `${BASE_URL}/products.json`,
  detail: (id) => `${BASE_URL}/products/${id}.json`,
}

function formatRupiah(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9]/g, ''))
  if (!Number.isFinite(amount)) return 'Rp0'
  return `Rp${amount.toLocaleString('id-ID')}`
}

export function mapProduct(id, item = {}) {
  return {
    id,
    name: item.name || '',
    price: formatRupiah(item.price),
    rawPrice: String(item.price ?? ''),
    size: item.size || '',
    likes: Number(item.likes || 0),
    image: item.image || '',
    imageName: item.image || '',
    brand: item.brand || '',
    category: item.category || '',
    color: item.color || '',
    condition: item.condition || '',
    description: item.description || '',
    uploaded: item.uploaded || '',
    shipping: formatRupiah(item.shipping),
    rawShipping: String(item.shipping ?? ''),
  }
}

export function mapProductList(data) {
  if (!data || typeof data !== 'object') return []
  return Object.keys(data).map((id) => mapProduct(id, data[id]))
}

export async function fetchProducts() {
  const response = await axios.get(productEndpoints.list)
  return mapProductList(response.data)
}

export async function fetchProductById(id) {
  const response = await axios.get(productEndpoints.detail(id))
  if (!response.data) return null
  return mapProduct(id, response.data)
}
```

Di file proyek, `image` yang berupa nama file lokal diubah dulu ke gambar di `src/assets/img`. Kalau nilainya sudah diawali `https://`, URL itu dipakai langsung.

Hasil mapping satu barang:

| Field API | Field di aplikasi |
| --- | --- |
| key Firebase | `id` |
| `name` | `name` |
| `price` `"200000"` | `price` `Rp200.000`, `rawPrice` `"200000"` |
| `size` | `size` |
| `likes` | `likes` |
| `image` | `image` untuk `<img>`, `imageName` nama asli dari database |
| `brand` | `brand` |
| `category` | `category` |
| `color` | `color` |
| `condition` | `condition` |
| `description` | `description` |
| `uploaded` | `uploaded` |
| `shipping` `"20000"` | `shipping` `Rp20.000`, `rawShipping` `"20000"` |

Tidak ada field yang dibuang. Harga dan ongkir tetap disimpan versi mentahnya karena keranjang butuh angka, sedangkan kartu butuh teks rupiah.

## Langkah 5. Tampilkan list di home

Di `src/script.js`, data kartu tidak lagi ditulis manual. Saat halaman dibuat, panggil `fetchProducts`.

```js
import { fetchProducts } from './services/products'

created() {
  this.loadProducts()
},
computed: {
  allProducts() {
    return this.apiProducts
  },
  popularProducts() {
    return this.allProducts.slice(0, 5)
  },
  newProducts() {
    return this.allProducts.slice(5, 10)
  },
},
methods: {
  async loadProducts() {
    this.isLoadingProducts = true
    this.productError = ''
    try {
      this.apiProducts = await fetchProducts()
    } catch (error) {
      this.apiProducts = []
      this.productError = 'Product list could not be loaded.'
    } finally {
      this.isLoadingProducts = false
    }
  },
}
```

`popularProducts` mengambil 5 barang pertama. `newProducts` mengambil 5 barang berikutnya. **See all** memakai seluruh hasil GET, lalu bisa disaring lewat nama atau brand.

Di `src/pages/Home.Vue`, status request ditaruh di atas konten:

```vue
<p v-if="isLoadingProducts" class="product-status">Loading products...</p>
<p v-else-if="productError" class="product-status">{{ productError }}</p>
```

## Langkah 6. Uji di browser

1. Buka `https://vintage-8d691-default-rtdb.firebaseio.com/products.json`. Harus ada 12 key, masing-masing berisi 12 field di atas.
2. Jalankan `npm run dev`, lalu buka home.
3. Popular items menampilkan 5 barang pertama, dengan harga `Rp200.000` dan angka likes.
4. New Product menampilkan 5 barang berikutnya.
5. Klik **See all**. Grid menampilkan 12 barang.
6. Klik brand **Uniqlo**. Yang tersisa dua: dress dan t-shirt.
7. Klik satu kartu. Halaman detail menerima nama, harga, ukuran, brand, kategori, warna, kondisi, deskripsi, waktu unggah, dan ongkir dari barang yang sama.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| `Permission denied` | Rules `products` belum di-publish | Ulangi langkah 1 |
| Home kosong, muncul pesan gagal | GET gagal atau balasan bukan objek | Cek URL berakhiran `/products.json` |
| Gambar lokal pecah | `image` tidak sama dengan nama file di `src/assets/img` | Samakan nama file, termasuk spasi |
| Harga tampil `Rp0` | `price` berisi teks selain angka | Simpan `"200000"`, bukan `"Rp200.000"` |
| Brand tidak menyaring apa pun | Field `brand` kosong di database | Isi `brand` saat POST |
