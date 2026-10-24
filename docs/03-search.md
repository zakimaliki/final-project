# Fase 3 — Pencarian Produk

Dokumen ini langkah demi langkah. Di akhir fase ini, kotak search di navbar menyaring barang yang sudah di-mapping dari Firebase. Tidak ada endpoint baru. Pencarian berjalan di browser, memakai daftar dari `fetchProducts`.

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Kotak search | `src/components/Navbar.vue` | Ketik kata kunci, lalu Enter |
| Hasil dan tag | `src/pages/Home.Vue` | Grid barang, tag filter, dan halaman kosong |
| Data dan filter | `src/script.js` | Bandingkan kata kunci dengan field hasil mapping |

## Langkah 1. Sambungkan kotak search ke halaman home

Navbar punya data sendiri, jadi `v-model` di dalamnya tidak mengubah `searchQuery` di home. Jadikan nilai kotak itu milik home.

Di kedua input search, guest maupun user yang sudah login:

```vue
<input
  :value="modelValue"
  type="text"
  placeholder="Search for items"
  @input="$emit('update:modelValue', $event.target.value)"
  @keyup.enter="submitSearch"
/>
```

Di `<script>` Navbar:

```js
props: {
  modelValue: { type: String, default: '' },
},
emits: ['update:modelValue', 'search'],
methods: {
  submitSearch() {
    this.$emit('search', (this.modelValue || '').trim())
  },
}
```

Di `src/pages/Home.Vue`:

```vue
<Navbar v-model="searchQuery" @search="handleSearch" />
```

Enter mengirim kata kunci ke home. Tombol **Reset Keyword** mengosongkan `searchQuery`, dan kotak di navbar ikut kosong karena `v-model`.

## Langkah 2. Buka halaman hasil

`handleSearch` di `src/script.js` menyimpan kata kunci, menutup filter brand, lalu pindah dari home ke daftar barang.

```js
handleSearch(query) {
  const keyword = String(query ?? this.searchQuery).trim()
  this.searchQuery = keyword
  if (!keyword) return

  this.currentView = 'products'
  this.selectedBrand = ''

  if (keyword.toLowerCase().includes('ninja')) {
    this.activeFilterTag = 'Sweater Cloth Ninja'
  } else {
    this.activeFilterTag = keyword
  }
}
```

Kata kunci kosong tidak mengubah halaman. Kata yang mengandung `ninja` sengaja tidak punya barang, supaya layar **Product not found** bisa dicoba. Tag yang tampil adalah `Sweater Cloth Ninja`. Kata lain ditampilkan apa adanya di tag filter.

## Langkah 3. Saring field hasil mapping

`filteredProducts` memakai barang yang sudah lewat `mapProduct`. Pencarian membandingkan huruf kecil dari nama, brand, kategori, dan warna.

```js
filteredProducts() {
  if (this.activeFilterTag === 'Sweater Cloth Ninja') {
    return []
  }

  let list = [...this.allProducts]

  if (this.selectedBrand) {
    return list.filter((product) => product.brand === this.selectedBrand)
  }

  const keyword = this.searchQuery.trim().toLowerCase()
  if (keyword) {
    return list.filter((product) => {
      const haystack = [product.name, product.brand, product.category, product.color]
        .join(' ')
        .toLowerCase()
      return haystack.includes(keyword)
    })
  }

  return list
}
```

| Kata kunci | Yang cocok | Contoh barang |
| --- | --- | --- |
| `crewneck` | `name` | Vintage Chicago Cubs Crewneck |
| `necklace` | `name` | Flower Statement Necklace |
| `uniqlo` | `brand` | AIRism Ultra Stretch Sleeveless Dress |
| `dress` | `category` | AIRism Ultra Stretch Sleeveless Dress |
| `purple` | `color` atau `name` | AIRism Cotton Short Sleeve T-Shirt dan Purple Charm Necklace |
| `ninja` | tidak ada | Layar Product not found |

Filter brand dari tombol **Shop by brand** tetap sama persis dengan field `brand`. Search dan brand tidak dipakai bersamaan. Search yang baru menghapus brand yang sedang aktif.

## Langkah 4. Uji di browser

1. Jalankan `npm run dev`, lalu buka home.
2. Ketik `crewneck` di kotak search, lalu tekan Enter. Judul halaman menjadi **Items**, tag menampilkan `crewneck`, dan kartu yang tersisa namanya mengandung crewneck.
3. Klik **✕** pada tag, atau **Reset Keyword** jika hasilnya kosong. Daftar kembali menampilkan semua barang, dan kotak search kosong.
4. Ketik `uniqlo`, lalu Enter. Yang tersisa dress dan t-shirt.
5. Ketik `ninja`, lalu Enter. Tag menjadi **Sweater Cloth Ninja**, ikon tas muncul, dan teksnya **Product not found**.
6. Klik **Reset Keyword**. Dua belas barang tampil lagi.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Enter tidak mengubah daftar | Navbar masih menyimpan `searchQuery` sendiri | Ulangi langkah 1 |
| Hasil selalu kosong | `fetchProducts` gagal, jadi `allProducts` kosong | Selesaikan fase 2 dulu |
| `purple` tidak menemukan t-shirt | Filter hanya memeriksa `name` | Masukkan `color` ke `haystack` |
| Tag hilang tetapi kotak search masih terisi | Input tidak memakai `modelValue` | Ikat dengan `v-model="searchQuery"` |
