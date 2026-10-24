# Fase 1 — Autentikasi dengan Firebase

Dokumen ini langkah demi langkah. Ikuti urutannya. Di akhir fase ini, murid bisa daftar, login, logout, dan halaman yang butuh akun tidak bisa dibuka sebelum login.

Password **tidak** disimpan di Realtime Database. Firebase Authentication yang menyimpan password. Realtime Database hanya menyimpan profil: nama, username, dan email.

## Yang sudah ada di UI

| Layar | File | Yang disambungkan |
| --- | --- | --- |
| Sign up | `src/pages/RegisterPage.vue` | Buat akun + simpan profil |
| Login | `src/pages/LoginPage.vue` | Masuk dengan email dan password |
| Navbar | `src/components/Navbar.vue` | Tampilkan menu user dan logout |
| Route | `src/router.js` | Cart, checkout, favorit, dan settings wajib login |

## Langkah 1. Siapkan Firebase Console

1. Buka [Firebase Console](https://console.firebase.google.com/) lalu pilih project **vintage-8d691**.
2. Masuk ke **Build → Authentication → Sign-in method**.
3. Aktifkan provider **Email/Password**. Jangan aktifkan Email link.
4. Masuk ke **Build → Realtime Database**.
5. Buka tab **Rules**, ganti isinya dengan aturan di bawah, lalu klik **Publish**.

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid == $uid",
        ".write": "auth != null && auth.uid == $uid"
      }
    }
  }
}
```

Arti aturan itu: user yang sedang login hanya boleh membaca dan menulis profilnya sendiri, yaitu node `users/{uid}`. Orang lain tidak bisa membaca password, karena password memang tidak ada di database ini.

Kalau aturan belum di-publish, register akan gagal dengan pesan `Database permission denied`.

## Langkah 2. Pasang SDK Firebase

Di folder proyek, jalankan:

```sh
npm install firebase
```

Lalu jalankan aplikasi:

```sh
npm run dev
```

Buka alamat yang muncul di terminal, biasanya `http://localhost:5173`.

## Langkah 3. Buat `src/firebase.js`

File ini menghubungkan aplikasi Vue ke project Firebase. Salin konfigurasi dari Firebase Console: **Project settings → Your apps → SDK setup and configuration**.

```js
import { initializeApp } from 'firebase/app'
import { getAnalytics, isSupported } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getDatabase } from 'firebase/database'

const firebaseConfig = {
  apiKey: 'AIzaSyCJhui9KXgeVvkojwgfiDhNVJCrKO2cqYc',
  authDomain: 'vintage-8d691.firebaseapp.com',
  databaseURL: 'https://vintage-8d691-default-rtdb.firebaseio.com',
  projectId: 'vintage-8d691',
  storageBucket: 'vintage-8d691.firebasestorage.app',
  messagingSenderId: '633042637582',
  appId: '1:633042637582:web:2ef3857d2859603ab37d5f',
  measurementId: 'G-EPCZ8BZ293',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getDatabase(app)

isSupported()
  .then((supported) => {
    if (supported) getAnalytics(app)
  })
  .catch(() => {})
```

`apiKey` di file ini memang boleh terlihat di frontend. Yang melindungi data adalah **Rules** di langkah 1, bukan menyembunyikan key.

## Langkah 4. Buat `src/services/auth.js`

Semua panggilan auth ada di satu file supaya halaman Vue tidak memanggil Firebase secara acak.

```js
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { get, ref, set } from 'firebase/database'
import { auth, db } from '@/firebase'

const SESSION_KEY = 'vintage_user'

function saveSession(profile) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(profile))
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY)
}

export function mapAuthError(error) {
  const code = error?.code || ''

  if (code === 'auth/email-already-in-use') return 'This email is already registered.'
  if (code === 'auth/invalid-email') return 'Email is not valid.'
  if (code === 'auth/weak-password') return 'Password must be at least 6 characters.'
  if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
    return 'Email or password is incorrect.'
  }
  if (code === 'auth/too-many-requests') return 'Too many attempts. Please try again later.'
  if (code === 'PERMISSION_DENIED' || code.includes('permission-denied')) {
    return 'Database permission denied. Update Realtime Database rules.'
  }

  return error?.message || 'Something went wrong. Please try again.'
}

async function readProfile(user) {
  const snapshot = await get(ref(db, `users/${user.uid}`))
  const data = snapshot.val() || {}

  return {
    uid: user.uid,
    fullName: data.fullName || '',
    username: data.username || '',
    email: data.email || user.email || '',
  }
}

export async function registerAccount({ fullName, username, email, password }) {
  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password)
  const profile = {
    fullName: fullName.trim(),
    username: username.trim(),
    email: email.trim(),
  }

  await set(ref(db, `users/${credential.user.uid}`), profile)

  const session = { uid: credential.user.uid, ...profile }
  saveSession(session)
  return session
}

export async function loginAccount(email, password) {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password)
  let profile

  try {
    profile = await readProfile(credential.user)
  } catch {
    profile = {
      uid: credential.user.uid,
      fullName: '',
      username: '',
      email: credential.user.email || email.trim(),
    }
  }

  saveSession(profile)
  return profile
}

export async function logoutAccount() {
  await signOut(auth)
  clearSession()
}

export function watchAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (!user) {
      clearSession()
      callback(null)
      return
    }

    try {
      const profile = await readProfile(user)
      saveSession(profile)
      callback(profile)
    } catch {
      const profile = {
        uid: user.uid,
        fullName: '',
        username: '',
        email: user.email || '',
      }
      saveSession(profile)
      callback(profile)
    }
  })
}

export function resolveAuthUser() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe()
      resolve(user)
    })
  })
}
```

Fungsi yang perlu dipahami:

| Fungsi | Tugas |
| --- | --- |
| `registerAccount` | `createUserWithEmailAndPassword`, lalu `set` profil ke `users/{uid}` |
| `loginAccount` | `signInWithEmailAndPassword`, lalu baca profil |
| `logoutAccount` | `signOut` dan hapus `vintage_user` di browser |
| `watchAuth` | Navbar ikut berubah saat login atau logout, termasuk setelah refresh |
| `resolveAuthUser` | Router menunggu Firebase selesai membaca sesi sebelum memutuskan boleh masuk atau tidak |
| `mapAuthError` | Mengubah kode error Firebase menjadi kalimat yang tampil di form |

Contoh data di Realtime Database setelah register berhasil:

```json
{
  "users": {
    "UID_DARI_FIREBASE": {
      "fullName": "Budi Santoso",
      "username": "budi",
      "email": "budi@email.com"
    }
  }
}
```

Salinan di browser (`localStorage`, key `vintage_user`) bentuknya sama, ditambah `uid`. Password tidak ada di situ.

## Langkah 5. Sambungkan halaman register

Di `src/pages/RegisterPage.vue`, tambahkan pesan error di bawah subtitle:

```vue
<p class="subtitle">Enter your details below</p>
<p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
```

Ubah tombol Sign up supaya tidak bisa diklik dua kali:

```vue
<button class="primary-btn" type="submit" :disabled="isSubmitting">
  {{ isSubmitting ? 'Please wait...' : 'Sign up' }}
</button>
```

Ganti bagian `<script setup>` yang menangani form. Import service, lalu ganti `handleRegister` yang tadinya menulis `localStorage` saja.

```js
import { mapAuthError, registerAccount } from '@/services/auth'

const isSubmitting = ref(false)
const errorMessage = ref('')

async function handleRegister() {
  errorMessage.value = ''

  if (!form.fullName || !form.username || !form.email || !form.password || !form.confirmPassword) {
    return
  }

  if (form.password.length < 6) {
    errorMessage.value = 'Password must be at least 6 characters.'
    return
  }

  if (form.password !== form.confirmPassword) {
    errorMessage.value = 'Password and confirmation password must match.'
    return
  }

  isSubmitting.value = true
  try {
    await registerAccount({
      fullName: form.fullName,
      username: form.username,
      email: form.email,
      password: form.password,
    })
    router.push({ name: 'success-register' })
  } catch (error) {
    errorMessage.value = mapAuthError(error)
  } finally {
    isSubmitting.value = false
  }
}
```

Tambahkan style pesan error di `<style scoped>`:

```css
.form-error {
  margin: -8px 0 14px;
  color: #b42318;
  font-size: 13px;
  text-align: center;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
```

Kalau berhasil, user pindah ke halaman **Successfully Register**.

## Langkah 6. Sambungkan halaman login

Di `src/pages/LoginPage.vue`, tambahkan pesan error dan tombol loading dengan pola yang sama seperti register.

```vue
<p class="subtitle">Enter your details below</p>
<p v-if="errorMessage" class="form-error">{{ errorMessage }}</p>
```

```vue
<button class="primary-btn" type="submit" :disabled="isSubmitting">
  {{ isSubmitting ? 'Please wait...' : 'Continue' }}
</button>
```

```js
import { loginAccount, mapAuthError } from '@/services/auth'

const isSubmitting = ref(false)
const errorMessage = ref('')

function goAfterLogin() {
  const redirect = router.currentRoute.value.query.redirect
  if (typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')) {
    router.push(redirect)
    return
  }
  router.push({ name: 'home' })
}

async function handleLogin() {
  const email = form.email.trim()
  const password = form.password

  errorMessage.value = ''
  if (!email || !password) return

  isSubmitting.value = true
  try {
    await loginAccount(email, password)
    goAfterLogin()
  } catch (error) {
    errorMessage.value = mapAuthError(error)
  } finally {
    isSubmitting.value = false
  }
}
```

`query.redirect` dipakai kalau user tadi ditolak router karena belum login. Contoh: membuka `/cart` akan diarahkan ke `/login?redirect=/cart`. Setelah login berhasil, user kembali ke `/cart`.

## Langkah 7. Navbar ikut status login

Di `src/components/Navbar.vue`, import service:

```js
import { logoutAccount, watchAuth } from '@/services/auth'
```

Di `mounted`, jangan lagi membaca `localStorage` untuk memutuskan login. Dengarkan Firebase:

```js
mounted() {
  this.stopWatchingAuth = watchAuth((profile) => {
    this.isLoggedIn = Boolean(profile)
    if (!profile) this.showProfileMenu = false
  })
  this.syncCartCount()
  this.syncFavoriteCount()
  this.profileImage = localStorage.getItem('vintage_profile_image') || this.profileImage
},
beforeUnmount() {
  if (this.stopWatchingAuth) this.stopWatchingAuth()
},
```

`beforeUnmount` wajib. Tanpa itu, listener tetap hidup setelah komponen hilang.

Logout memanggil Firebase, bukan hanya menghapus data lokal:

```js
async doLogout() {
  try {
    await logoutAccount()
  } catch (error) {
    this.isLoggedIn = false
  }
  this.isLoggedIn = false
  this.showProfileMenu = false
  this.showLogoutModal = false
  this.$router.push({ name: 'home' })
},
```

Setelah logout, navbar kembali menampilkan tombol **Login** dan **Sign up**. Refresh halaman tidak mengembalikan sesi, karena `signOut` sudah menghapus sesi Firebase di browser.

## Langkah 8. Kunci halaman yang butuh akun

Di `src/router.js`, tambahkan import dan dua daftar route:

```js
import { resolveAuthUser } from './services/auth'

const protectedRoutes = new Set(['cart', 'checkout', 'cart-empty', 'settings', 'favorites'])
const guestOnlyRoutes = new Set(['login', 'register'])
```

Di bawah `createRouter`, sebelum `export default router`:

```js
router.beforeEach(async (to) => {
  const user = await resolveAuthUser()

  if (protectedRoutes.has(to.name) && !user) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  if (guestOnlyRoutes.has(to.name) && user) {
    return { name: 'home' }
  }

  return true
})
```

Home dan detail produk tetap bisa dibuka tanpa login. Cart, checkout, favorit, dan settings tidak.

## Langkah 9. Uji di browser

1. Buka `/register`. Isi nama, username, email, password minimal 6 karakter, centang persetujuan, lalu Sign up.
2. Harus muncul halaman Successfully Register. Di Firebase Console, **Authentication → Users** ada email baru. Di **Realtime Database**, node `users/{uid}` berisi `fullName`, `username`, dan `email`.
3. Kembali ke home. Navbar menampilkan ikon keranjang, favorit, dan foto profil, bukan tombol Login.
4. Buka menu profil, pilih Logout, lalu konfirmasi. Navbar kembali menjadi tamu.
5. Buka `/login`, masukkan email dan password yang sama. Harus masuk ke home dalam keadaan login.
6. Coba password yang salah. Form menampilkan `Email or password is incorrect.`
7. Dalam keadaan logout, buka `/cart` langsung. Harus pindah ke `/login?redirect=/cart`.
8. Login dari halaman itu. Harus kembali ke `/cart`.

## Masalah yang sering muncul

| Gejala | Penyebab | Perbaikan |
| --- | --- | --- |
| `auth/operation-not-allowed` | Email/Password belum diaktifkan | Langkah 1, nyalakan provider |
| `Database permission denied` | Rules belum di-publish, atau masih menolak semua | Tempel dan Publish rules di langkah 1 |
| `This email is already registered.` | Email yang sama sudah ada di Authentication | Pakai email lain, atau login |
| `Password must be at least 6 characters.` | Aturan bawaan Firebase Auth | Password minimal 6 karakter |
| `Email or password is incorrect.` | Email belum terdaftar, atau password salah | Daftar dulu, atau cek password |
| Navbar masih tamu setelah login | `watchAuth` belum dipasang di `mounted` | Ulangi langkah 7 |
| `/cart` tetap terbuka tanpa login | `beforeEach` belum dipasang | Ulangi langkah 8 |
