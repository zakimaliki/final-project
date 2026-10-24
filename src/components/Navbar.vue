<template>
  <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">Navbar</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="#">Link</a>
        </li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
            Dropdown
          </a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Action</a></li>
            <li><a class="dropdown-item" href="#">Another action</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">Something else here</a></li>
          </ul>
        </li>
        <li class="nav-item">
          <a class="nav-link disabled" aria-disabled="true">Disabled</a>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search"/>
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>
  <!-- <div class="navbar-demo-shell">
    <header class="nav-guest" v-if="!isLoggedIn">
      <div class="brand-area" @click="navigateTo('/')">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage" class="brand-logo" />
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input :value="modelValue" type="text" :placeholder="t('searchPlaceholder')" @input="$emit('update:modelValue', $event.target.value)" @keyup.enter="submitSearch" />
      </div>

      <div class="action-group">
        <button class="btn-login" type="button" @click="goToLogin">{{ t('login') }}</button>
        <button class="btn-signup" type="button" @click="goToRegister">{{ t('signUp') }}</button>
        <button class="lang-btn" type="button" @click="switchLanguage">{{ language }} <span>▾</span></button>
      </div>
    </header>

    <header class="nav-user" v-else>
      <div class="brand-area" @click="navigateTo('/')">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage" class="brand-logo" />
      </div>

      <div class="search-box">
        <span class="search-icon">⌕</span>
        <input :value="modelValue" type="text" :placeholder="t('searchPlaceholder')" @input="$emit('update:modelValue', $event.target.value)" @keyup.enter="submitSearch" />
      </div>

      <div class="user-actions">
        <button class="cart-action" type="button" aria-label="cart" @click="goToCart">
          <span>🛒</span>
          <b>{{ cartCount }}</b>
        </button>

        <button class="cart-action" type="button" aria-label="favorite" @click="goToFavorites">
          <span>♡</span>
          <b>{{ favoriteCount }}</b>
        </button>

        <div class="profile-trigger" @click="toggleProfileMenu">
          <img :src="profileImage" alt="user" />
        </div>

        <button class="lang-btn" type="button" @click="switchLanguage">{{ language }} <span>▾</span></button>
      </div>
    </header>

    <div v-if="showProfileMenu" class="profile-menu">
      <div class="menu-item" @click="goToProfile"><span>👤</span> <span>{{ t('profile') }}</span></div>
      <div class="menu-item" @click="goToCart"><span>🧾</span> <span>{{ t('order') }}</span></div>
      <div class="menu-item logout-item" @click="showLogoutModal = true"><span>↩</span> <span>{{ t('logout') }}</span></div>
    </div>

    <div v-if="showLogoutModal" class="logout-modal-backdrop" @click.self="showLogoutModal = false">
      <div class="logout-modal">
        <div class="modal-header">
          <h3>{{ t('logoutTitle') }}</h3>
          <button class="close-btn" type="button" @click="showLogoutModal = false">×</button>
        </div>

        <p>{{ t('logoutConfirm') }}</p>

        <div class="modal-actions">
          <button class="ghost-btn" type="button" @click="showLogoutModal = false">{{ t('close') }}</button>
          <button class="danger-btn" type="button" @click="doLogout">{{ t('logout') }}</button>
        </div>
      </div>
    </div>
  </div> -->
</template>

<script>
// import defaultProfileImage from '@/assets/img/profile-user.jpg'
// import { logoutAccount, watchAuth } from '@/services/auth'
// import { fetchFavorites } from '@/services/favorites'
// import { getCartCount } from '@/services/cart'
// import { i18nState, t, toggleLanguage } from '@/services/i18n'

// export default {
//   name: 'Navbar',
//   props: {
//     modelValue: { type: String, default: '' },
//   },
//   emits: ['update:modelValue', 'search'],
//   data() {
//     return {
//       isLoggedIn: false,
//       showProfileMenu: false,
//       showLogoutModal: false,
//       cartCount: 0,
//       favoriteCount: 0,
//       profileImage: defaultProfileImage,
//     }
//   },
//   computed: {
//     language() {
//       return i18nState.language
//     },
//   },
//   mounted() {
//     this.stopWatchingAuth = watchAuth((profile) => {
//       this.isLoggedIn = Boolean(profile)
//       if (!profile) this.showProfileMenu = false
//       this.syncFavoriteCount()
//       this.syncCartCount()
//     })
//     this.profileImage = localStorage.getItem('vintage_profile_image') || this.profileImage
//   },
//   beforeUnmount() {
//     if (this.stopWatchingAuth) this.stopWatchingAuth()
//   },
//   methods: {
//     submitSearch() {
//       this.$emit('search', (this.modelValue || '').trim())
//     },
//     navigateTo(path) {
//       this.$router.push(path.startsWith('/') ? path : `/${path}`)
//     },
//     goToLogin() {
//       this.$router.push({ name: 'login' })
//     },
//     goToRegister() {
//       this.$router.push({ name: 'register' })
//     },
//     toggleProfileMenu() {
//       this.showProfileMenu = !this.showProfileMenu
//     },
//     goToProfile() {
//       this.showProfileMenu = false
//       this.$router.push({ name: 'settings' })
//     },
//     goToCart() {
//       this.showProfileMenu = false
//       this.$router.push({ name: 'cart' })
//     },
//     goToFavorites() {
//       this.showProfileMenu = false
//       this.$router.push({ name: 'favorites' })
//     },
//     async syncCartCount() {
//       if (!this.isLoggedIn) {
//         this.cartCount = 0
//         return
//       }
//       try {
//         this.cartCount = await getCartCount()
//       } catch (error) {
//         this.cartCount = 0
//       }
//     },
//     async syncFavoriteCount() {
//       if (!this.isLoggedIn) {
//         this.favoriteCount = 0
//         return
//       }
//       try {
//         const favorites = await fetchFavorites()
//         this.favoriteCount = favorites.length
//       } catch (error) {
//         this.favoriteCount = 0
//       }
//     },
//     t,
//     switchLanguage() {
//       toggleLanguage()
//     },
//     async doLogout() {
//       try {
//         await logoutAccount()
//       } catch (error) {
//         this.isLoggedIn = false
//       }
//       this.isLoggedIn = false
//       this.showProfileMenu = false
//       this.showLogoutModal = false
//       this.$router.push({ name: 'home' })
//     },
//   },
// }
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.navbar-demo-shell {
  position: relative;
  background: #ffffff;
  padding: 0;
  min-height: 0;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.nav-guest,
.nav-user {
  width: 100%;
  margin: 0;
  background: rgba(243, 243, 243, 0.96);
  border: 1px solid #e7e7e7;
  border-radius: 0;
  box-shadow: none;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 12px 18px 14px;
  min-height: 62px;
}

.nav-user {
  margin-top: 0;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 170px;
  cursor: pointer;
}

.brand-logo {
  display: block;
  height: 30px;
  width: auto;
  object-fit: contain;
}

.search-box {
  flex: 1;
  max-width: 700px;
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid rgba(80, 80, 80, 0.25);
  border-radius: 8px;
  background: rgba(255,255,255,0.18);
  padding: 0 14px;
}

.search-icon {
  font-size: 18px;
  color: #707070;
}

.search-box input {
  width: 100%;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 15px;
  color: #505050;
}

.search-box input::placeholder {
  color: #7d7d7d;
}

.action-group,
.user-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-login,
.btn-signup,
.lang-btn,
.cart-action {
  border: 1px solid rgba(100, 100, 100, 0.15);
  background: transparent;
  color: #2d2d2d;
  cursor: pointer;
  font-family: inherit;
}

.btn-login,
.btn-signup {
  min-width: 90px;
  height: 34px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
}

.btn-login {
  border-color: #20b9c7;
  color: #1faec2;
  background: rgba(255,255,255,0.15);
}

.btn-signup {
  border-color: #1ebaaf;
  background: linear-gradient(180deg, #27c0c9, #1cadb6);
  color: white;
}

.lang-btn {
  min-width: 72px;
  height: 34px;
  border-radius: 6px;
  font-size: 13px;
  padding: 0 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.cart-action {
  position: relative;
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  font-size: 19px;
  padding: 0;
  display: grid;
  place-items: center;
}

.cart-action b {
  position: absolute;
  top: -6px;
  right: -5px;
  min-width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f64646;
  color: white;
  font-size: 8px;
  font-weight: 700;
  display: grid;
  place-items: center;
  padding: 1px 2px;
}

.profile-trigger {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid rgba(0,0,0,0.08);
  cursor: pointer;
  background: #f0f0f0;
}

.profile-trigger img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-menu {
  position: absolute;
  right: 18px;
  top: 68px;
  width: 180px;
  background: rgba(255,255,255,0.96);
  border: 1px solid rgba(100,100,100,0.18);
  border-radius: 8px;
  box-shadow: 0 10px 18px rgba(0,0,0,0.12);
  padding: 10px 0;
  z-index: 10;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 14px;
  color: #373737;
  cursor: pointer;
}

.logout-item {
  color: #e55a5a;
}

.logout-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.38);
  display: grid;
  place-items: center;
  z-index: 20;
}

.logout-modal {
  width: min(100%, 420px);
  background: rgba(255,255,255,0.96);
  border-radius: 12px;
  padding: 18px 20px 16px;
  box-shadow: 0 14px 24px rgba(0,0,0,0.16);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.modal-header h3 {
  margin: 0;
  font-size: 26px;
  font-weight: 600;
  color: #2f2f2f;
}

.close-btn {
  border: 0;
  background: transparent;
  font-size: 24px;
  color: #666;
  cursor: pointer;
}

.logout-modal p {
  margin: 0;
  text-align: center;
  color: #555;
  font-size: 16px;
  line-height: 1.5;
  padding: 8px 0 18px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.ghost-btn,
.danger-btn {
  min-width: 90px;
  height: 38px;
  border-radius: 6px;
  border: 1px solid rgba(100,100,100,0.15);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn {
  border-color: #d7d7d7;
  background: transparent;
  color: #4e4e4e;
}

.danger-btn {
  border-color: #d94b4b;
  background: #d94b4b;
  color: white;
}

@media (max-width: 860px) {
  .nav-guest,
  .nav-user {
    width: calc(100% - 20px);
    flex-wrap: wrap;
    padding: 12px 14px;
  }

  .search-box {
    order: 3;
    width: 100%;
    max-width: none;
  }

  .profile-menu {
    right: 20px;
    top: 78px;
  }
}
</style>
