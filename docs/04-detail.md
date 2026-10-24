# Fase 4 — Detail Produk

Dokumen ini langkah demi langkah. Di akhir fase ini, klik satu kartu membuka halaman detail barang itu. Datanya diambil dari Firebase memakai id, bukan disalin ke URL.

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Kartu produk | `src/pages/Home.Vue` | Klik kartu memanggil `openDetail` |
| Halaman detail | `src/pages/Detail.vue` | Harga, nama, deskripsi, dan daftar field |
| Other Product | `src/pages/Detail.vue` | Barang lain dari daftar yang sama |
| Route | `src/router.js` | `/detail/:id` |

## Langkah 1. Buka detail dengan id saja

Di `src/script.js`, `openDetail` tidak lagi menaruh seluruh objek produk di query. Cukup kirim id Firebase.

```js
openDetail(product) {
  if (!product?.id) return
  this.$router.push({ name: 'detail', params: { id: product.id } })
}
```

Di `src/router.js`, route detail menerima id di path:

```js
{ path: '/detail/:id', name: 'detail', component: Detail }
```

Contoh alamat: `/detail/-P2NICrLfa6X0PU9Qc8m`.

## Langkah 2. Endpoint satu barang

Endpoint ini sudah ada di `src/services/products.js` dari fase 2. `fetchProductById` memakai GET, lalu `mapProduct` mengubah field mentah menjadi bentuk yang dipakai UI.

```http
GET https://vintage-8d691-default-rtdb.firebaseio.com/products/{id}.json
```

Balasan Firebase adalah satu objek, tanpa key id. Id-nya ada di URL. Kalau id tidak ada, balasannya `null`.

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

`mapProduct` menghasilkan:

| Field API | Tampil di detail |
| --- | --- |
| key di URL | `id`, dipakai lagi saat pindah barang |
| `name` | Judul |
| `price` `"200000"` | `Rp200.000` |
| `size` | Baris Size dan teks di bawah harga |
| `likes` | Angka hati di Other Product |
| `image` | Foto utama. Nama file lokal diarahkan ke `src/assets/img`. URL `https://` dipakai langsung |
| `brand` | Baris Brand |
| `category` | Baris Category |
| `color` | Baris Color |
| `condition` | Baris Condition |
| `description` | Item Description |
| `uploaded` | Baris Uploaded |
| `shipping` `"20000"` | `Rp20.000` |

## Langkah 3. Muat detail saat id berubah

Di `src/pages/Detail.vue`, baca `route.params.id`. Setiap id berganti, panggil dua request bersamaan: satu barang, dan seluruh daftar untuk Other Product.

```js
import { fetchProductById, fetchProducts } from '@/services/products'

async function loadDetail(id) {
  if (!id) return
  isLoading.value = true
  loadError.value = ''
  try {
    const [product, list] = await Promise.all([
      fetchProductById(id),
      fetchProducts(),
    ])
    if (!product) {
      loadError.value = 'Product not found.'
      return
    }
    activeProduct.value = product
    selectedImage.value = product.image
    relatedProducts.value = list.filter((item) => item.id !== id).slice(0, 8)
  } catch (error) {
    loadError.value = 'Product detail could not be loaded.'
  } finally {
    isLoading.value = false
  }
}

watch(() => route.params.id, (id) => {
  loadDetail(id)
}, { immediate: true })
```

Other Product memakai hasil `fetchProducts`, lalu membuang barang yang sedang dibuka. Maksimal 8 kartu.

Klik salah satu kartu itu pindah route, bukan hanya mengganti variabel lokal:

```js
function selectProduct(relatedProduct) {
  if (!relatedProduct?.id || relatedProduct.id === route.params.id) return
  router.push({ name: 'detail', params: { id: relatedProduct.id } })
}
```

Karena `watch` melihat `route.params.id`, halaman yang sama memuat ulang data barang baru.

Di template, daftar field memakai hasil mapping:

```vue
<p v-if="isLoading" class="product-status">Loading product...</p>
<p v-else-if="loadError" class="product-status">{{ loadError }}</p>
<div v-else class="product-layout">
  ...
  <dl class="details-list">
    <div><dt>Brand</dt><dd>{{ activeProduct.brand }}</dd></div>
    <div><dt>Category</dt><dd>{{ activeProduct.category }}</dd></div>
    <div><dt>Size</dt><dd>{{ activeProduct.size }}</dd></div>
    <div><dt>Condition</dt><dd>{{ activeProduct.condition }}</dd></div>
    <div><dt>Color</dt><dd>{{ activeProduct.color }}</dd></div>
    <div><dt>Uploaded</dt><dd>{{ activeProduct.uploaded }}</dd></div>
    <div><dt>Shipping</dt><dd>{{ activeProduct.shipping }}</dd></div>
  </dl>
</div>
```

## Langkah 4. Uji di browser

1. Jalankan `npm run dev`, buka home, lalu klik **Vintage Chicago Cubs Crewneck**.
2. Alamat menjadi `/detail/` ditambah id Firebase. Harga `Rp200.000`, brand **Vans**, kategori **Sweatshirt**, warna **White**, ongkir `Rp20.000`.
3. Other Product menampilkan barang lain, bukan barang yang sedang dibuka.
4. Klik **Flower Statement Necklace**. Alamat id-nya berubah. Deskripsi, ukuran **Adjustable**, dan warna **Multicolor** ikut berganti.
5. Buka `/detail/id-yang-tidak-ada`. Halaman menampilkan `Product not found.`

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Detail masih menampilkan teks bawaan | Halaman masih membaca `route.query` | Muat lewat `fetchProductById(route.params.id)` |
| `Product not found.` | Id di URL tidak ada di node `products` | Klik kartu dari home, jangan ketik id manual |
| `Product detail could not be loaded.` | GET gagal, biasanya rules `products` belum di-publish | Ulangi rules di fase 2 |
| Other Product ikut menampilkan barang yang sedang dibuka | Daftar tidak menyaring `item.id !== id` | Tambahkan `filter` di langkah 3 |
| Foto lokal pecah | `image` tidak sama dengan nama file | Samakan dengan pemetaan di `src/services/products.js` |
