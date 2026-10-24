# Fase 7 — Ganti Bahasa

Dokumen ini langkah demi langkah. Di akhir fase ini, tombol **EN / ID** benar-benar mengganti teks antarmuka. Pilihan bahasa disimpan di browser, jadi refresh tidak mengembalikannya ke bahasa lama.

Nama produk, deskripsi, dan data dari Firebase tidak diterjemahkan. Yang diganti hanya label UI: tombol, judul, placeholder, dan pesan kosong.

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Tombol bahasa | Navbar, Login, Register, Detail, Cart, Favorites | Memanggil `toggleLanguage` |
| Kamus teks | `src/i18n/messages.js` | Pasangan EN dan ID |
| Service | `src/services/i18n.js` | Baca, tulis, dan terjemahkan |

## Langkah 1. Buat kamus `src/i18n/messages.js`

Satu key punya dua teks: `EN` dan `ID`.

```js
export const messages = {
  EN: {
    login: 'Login',
    signUp: 'Sign up',
    searchPlaceholder: 'Search for items',
    shopNow: 'Shop Now',
    popularItems: 'Popular items',
    // ...
  },
  ID: {
    login: 'Masuk',
    signUp: 'Daftar',
    searchPlaceholder: 'Cari barang',
    shopNow: 'Belanja Sekarang',
    popularItems: 'Barang populer',
    // ...
  },
}
```

Kalau butuh baris baru, tulis `\n` di string. Di CSS pakai `white-space: pre-line`, misalnya pada judul hero dan kartu See All.

## Langkah 2. Buat `src/services/i18n.js`

Service ini menyimpan bahasa aktif di `localStorage` dengan key `vintage_language`.

```js
import { computed, reactive } from 'vue'
import { messages } from '@/i18n/messages'

const STORAGE_KEY = 'vintage_language'
const state = reactive({
  language: localStorage.getItem(STORAGE_KEY) === 'ID' ? 'ID' : 'EN',
})

export function t(key) {
  const table = messages[state.language] || messages.EN
  return table[key] || messages.EN[key] || key
}

export function setLanguage(next) {
  state.language = next === 'ID' ? 'ID' : 'EN'
  localStorage.setItem(STORAGE_KEY, state.language)
}

export function toggleLanguage() {
  setLanguage(state.language === 'EN' ? 'ID' : 'EN')
}

export function useI18n() {
  return {
    language: computed(() => state.language),
    t,
    setLanguage,
    toggleLanguage,
  }
}

export const i18nState = state
```

| Fungsi | Tugas |
| --- | --- |
| `t('login')` | Ambil teks sesuai bahasa aktif |
| `toggleLanguage` | Ganti EN ↔ ID dan simpan |
| `setLanguage` | Dipakai select di halaman detail |
| `useI18n` | Untuk halaman `<script setup>` |
| `i18nState` | Untuk Options API supaya template ikut reaktif |

## Langkah 3. Sambungkan tombol bahasa

Di Options API, misalnya Navbar:

```js
import { i18nState, t, toggleLanguage } from '@/services/i18n'

computed: {
  language() {
    return i18nState.language
  },
},
methods: {
  t,
  switchLanguage() {
    toggleLanguage()
  },
}
```

Di template:

```vue
<button type="button" @click="switchLanguage">{{ language }} ▾</button>
<input :placeholder="t('searchPlaceholder')" />
<button>{{ t('login') }}</button>
```

Di `<script setup>`, misalnya Login dan Detail:

```js
import { useI18n } from '@/services/i18n'

const { language, t, toggleLanguage: switchLanguage, setLanguage } = useI18n()
```

Semua tombol bahasa harus memanggil service yang sama. Jangan lagi menulis `this.language = 'ID'` di dalam komponen, karena bahasa itu tidak ikut ke halaman lain.

## Langkah 4. Ganti teks yang tampil

Contoh di home:

| Key | EN | ID |
| --- | --- | --- |
| `heroTitle` | Ready to declutter you closet? | Siap merapikan lemari Anda? |
| `shopNow` | Shop Now | Belanja Sekarang |
| `popularItems` | Popular items | Barang populer |
| `newProduct` | New Product | Produk Baru |
| `productNotFound` | Product not found | Produk tidak ditemukan |

Di detail: `buyNow`, `addToCart`, `itemDescription`, `brand`, `category`, dan seterusnya. Di cart: `cart`, `orderSummary`, `checkout`. Di favorit: `favoriteItems`, `noFavoriteTitle`.

Pesan error yang disimpan di state sebaiknya berupa key, bukan kalimat Inggris. Contoh: `productError = 'productLoadError'`, lalu di template `{{ t(productError) }}`.

## Langkah 5. Uji di browser

1. Buka home. Teks default berbahasa Inggris, tombol menampilkan **EN**.
2. Klik tombol bahasa. Tombol menjadi **ID**. Hero, Popular items, Shop by brand, dan footer berganti ke Indonesia.
3. Refresh halaman. Bahasa tetap **ID**.
4. Buka Login atau Register. Placeholder dan judul ikut bahasa yang sama.
5. Buka detail produk. Select EN/ID mengganti label field dan tombol Add to Cart.
6. Buka Cart dan Favorites. Judul dan pesan kosong ikut berganti.
7. Klik lagi sampai kembali ke **EN**. Teks Inggris kembali.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| Tombol EN/ID berubah, teks tetap | Template masih hardcode | Ganti ke `t('key')` |
| Bahasa hanya berubah di satu halaman | Komponen menyimpan `language` sendiri | Pakai `i18nState` / `useI18n` |
| Setelah refresh kembali ke EN | Tidak menulis `localStorage` | Panggil `setLanguage` / `toggleLanguage` |
| Template tidak ikut update | Options API tidak membaca `i18nState.language` | Tambah computed `language` |
| Muncul key mentah seperti `shopNow` | Key belum ada di kamus | Tambahkan ke `messages.js` EN dan ID |
