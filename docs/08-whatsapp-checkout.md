# Fase 8 — Order Now ke WhatsApp

Dokumen ini langkah demi langkah. Di akhir fase ini, tombol **Order Now** di halaman checkout tidak lagi hanya menulis ke `localStorage`, tetapi langsung membuka WhatsApp admin dengan isi pesan pesanan yang sudah lengkap. Nomor admin diambil dari variabel environment, yaitu `ADMIN_PHONE` (dan fallback ke `VITE_ADMIN_PHONE` agar kompatibel dengan Vite).

## Yang sudah ada di UI

| Bagian | File | Yang disambungkan |
| --- | --- | --- |
| Tombol Order Now | `src/pages/CheckoutPage.vue` | Validasi order dan buka WhatsApp |
| Summary order | `src/pages/CheckoutPage.vue` | Menampilkan subtotal, fee, dan total |
| Env | `.env` | Menyimpan nomor admin WhatsApp |
| Modal sukses | `src/pages/CheckoutPage.vue` | Tetap muncul setelah order dibuat |

## Langkah 1. Simpan nomor admin di environment

Nomor WhatsApp admin harus disimpan di file `.env`.

```dotenv
ADMIN_PHONE=+6281703311792
VITE_ADMIN_PHONE=+6281703311792
```

`ADMIN_PHONE` dipakai untuk kebutuhan backend atau konfigurasi umum, sementara `VITE_ADMIN_PHONE` dipakai langsung oleh aplikasi Vue/Vite di browser. Untuk menjaga kompatibilitas, kode checkout memeriksa keduanya.

## Langkah 2. Siapkan format pesan order

Di `src/pages/CheckoutPage.vue`, buat fungsi yang menghasilkan string pesan WhatsApp berdasarkan barang di keranjang.

```js
buildOrderMessage() {
  const itemsText = this.cartItems.map((item) => {
    const lineTotal = Number(item.price || 0) * Number(item.qty || 0)
    return `- ${item.name} (${item.size}) x${item.qty} = ${this.formatCurrency(lineTotal)}`
  }).join('\n')

  const paymentLabel = {
    'bank-transfer': 'Bank transfer',
    'e-wallet': 'E-wallet',
    'cash-on-delivery': 'Cash on delivery',
    'credit-card': 'Credit card',
    paylater: 'PayLater',
  }[this.paymentMethod] || this.paymentMethod

  return [
    'Halo Vintage, saya ingin melakukan pemesanan.',
    '',
    `Order ID: ${this.currentOrderId || 'Pending'}`,
    'Detail pesanan:',
    itemsText,
    '',
    `Alamat: ${this.address.trim()}`,
    `Pengiriman: ${this.selectedDeliveryOption.label}`,
    `Metode pembayaran: ${paymentLabel}`,
    `Subtotal: ${this.formatCurrency(this.orderSubtotal)}`,
    `Protection fee: ${this.formatCurrency(this.protectionFee)}`,
    `Payment fee: ${this.formatCurrency(this.paymentFee)}`,
    `Shipping: ${this.formatCurrency(this.shippingFee)}`,
    `Total: ${this.formatCurrency(this.total)}`,
    '',
    'Mohon konfirmasi pesanan saya. Terima kasih.',
  ].join('\n')
}
```

## Langkah 3. Buka WhatsApp dengan nomor admin

Gunakan URL `https://wa.me/{phone}?text={message}`.

```js
openWhatsAppOrder() {
  const phone = (this.adminPhone || '').replace(/[^\d+]/g, '')
  if (!phone) {
    alert('Nomor admin WhatsApp belum diatur di ENV ADMIN_PHONE.')
    return
  }

  const message = this.buildOrderMessage()
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
  window.open(url, '_blank', 'noopener,noreferrer')
}
```

Kunci penting di sini adalah:

- `phone` harus bersih dari karakter selain angka dan `+`
- `encodeURIComponent()` memastikan pesan berisi spasi, tanda baca, dan newline aman dikirim ke WhatsApp
- `window.open()` memunculkan WA di tab baru, sehingga user tetap bisa melihat halaman checkout

## Langkah 4. Hubungkan ke tombol Order Now

Saat user menekan Order Now, sistem tetap melakukan validasi seperti alamat, produk, dan data kartu. Setelah semua valid selesai, order disimpan ke `localStorage` dan WA dibuka.

```js
async placeOrder() {
  if (this.cartItems.length === 0) {
    alert('Pilih produk terlebih dahulu sebelum checkout.')
    return
  }
  if (!this.address.trim()) {
    alert('Masukkan alamat pengiriman terlebih dahulu.')
    return
  }

  const orders = JSON.parse(localStorage.getItem('vintage_orders') || '[]')
  const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
  this.currentOrderId = orderId

  orders.unshift({
    id: orderId,
    items: this.cartItems.map((item) => ({ ...item })),
    address: this.address.trim(),
    delivery: this.selectedDeliveryOption.label,
    shippingFee: this.shippingFee,
    protectionFee: this.protectionFee,
    paymentFee: this.paymentFee,
    subtotal: this.orderSubtotal,
    total: this.total,
  })

  localStorage.setItem('vintage_orders', JSON.stringify(orders))
  this.openWhatsAppOrder()
  this.showSuccessModal = true
}
```

## Langkah 5. Uji di browser

1. Buka halaman checkout dengan minimal satu produk di keranjang.
2. Isi alamat dan pilih metode pembayaran.
3. Klik **Order Now**.
4. Browser akan membuka WhatsApp ke nomor `ADMIN_PHONE` dengan pesan berisi order ID, daftar produk, alamat, pengiriman, subtotal, fee, dan total.
5. Modal sukses tetap tampil setelah WA dibuka.
6. Cek `localStorage['vintage_orders']` untuk memastikan order berhasil tersimpan.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| WA tidak terbuka | `ADMIN_PHONE` kosong | Isi `.env` dengan nomor seperti `+6281703311792` |
| Pesan order kosong | `this.cartItems` kosong | Pastikan user memilih produk sebelum checkout |
| WA membuka ke nomor tak valid | `phone` masih punya karakter non-digit | Gunakan `replace(/[^\d+]/g, '')` |
| Pesan tidak ter-encode dengan benar | Tidak pakai `encodeURIComponent` | Selalu encode teks WA |
| Modal tidak muncul | `placeOrder` gagal sebelum `showSuccessModal = true` | Pastikan validasi sudah lolos sebelum membuka WA |

## Catatan

Flow ini mempermudah proses order tanpa harus membuat backend transaksi dulu. Karena project ini masih demo front-end, order dikirim ke admin melalui WhatsApp dan tetap tersimpan di browser local storage untuk kebutuhan history. Jika nanti ingin ke production, flow ini bisa diperluas ke backend yang menyimpan order ke database dan mengirim notifikasi otomatis.
