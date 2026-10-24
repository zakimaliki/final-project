<template>
  <div class="favorites-page">
    <header class="favorites-header">
      <button class="logo-button" aria-label="Back to home" @click="goHome">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage" />
      </button>
      <label class="favorites-search"><span>⌕</span><input type="search" :placeholder="t('searchPlaceholder')" /></label>
      <div class="favorites-actions">
        <button class="header-count-button" aria-label="Cart" @click="goToCart"><span>🛒</span><b>{{ cartCount }}</b></button>
        <button class="header-count-button" aria-label="Favorites" @click="refreshFavorites"><span>♡</span><b>{{ favoriteCount }}</b></button>
        <button class="avatar-button" aria-label="Profile" @click="goToProfile"><img :src="profileImage" alt="Profile" /></button>
        <button class="language-button" @click="switchLanguage">{{ language }} ▾</button>
      </div>
    </header>

    <main class="favorites-content">
      <div class="favorites-title-row">
        <h1>{{ t('favoriteItems') }}</h1>
        <span v-if="favorites.length">{{ favorites.length }} {{ t('itemsCount') }}</span>
        <span v-else>{{ t('noFavoriteYet') }}</span>
      </div>
      <section v-if="favorites.length" class="favorites-grid">
        <article v-for="item in favorites" :key="item.id" class="favorite-card" @click="openProduct(item)">
          <img :src="item.image" :alt="item.name" />
          <strong>{{ item.name }}</strong>
          <span>{{ item.price }}</span>
          <small>{{ item.size }} <button aria-label="Remove favorite" @click.stop="removeFavorite(item)">♥</button></small>
        </article>
      </section>
      <section v-else class="empty-favorites">
        <div class="heart-icon">♥</div>
        <h2>{{ t('noFavoriteTitle') }}</h2>
        <p class="favorite-empty-hint">{{ t('noFavoriteHint') }}</p>
        <button @click="goHome">{{ t('findProducts') }}</button>
      </section>
    </main>
  </div>
</template>

<script>
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { fetchFavorites, removeFavorite as deleteFavorite } from '@/services/favorites'
import { getCartCount } from '@/services/cart'
import { i18nState, t, toggleLanguage } from '@/services/i18n'

export default {
  name: 'FavoritesPage',
  data() {
    return {
      favorites: [],
      profileImage: localStorage.getItem('vintage_profile_image') || defaultProfileImage,
      cartCount: 0,
      favoriteCount: 0,
    }
  },
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
    goHome() {
      this.$router.push({ name: 'home' })
    },
    openProduct(item) {
      if (!item?.id) return
      this.$router.push({ name: 'detail', params: { id: item.id } })
    },
    async removeFavorite(item) {
      if (!item?.id) return
      await deleteFavorite(item.id)
      this.favorites = this.favorites.filter((entry) => entry.id !== item.id)
      this.favoriteCount = this.favorites.length
    },
    async loadFavorites() {
      try {
        this.favorites = await fetchFavorites()
      } catch (error) {
        this.favorites = []
      }
      this.favoriteCount = this.favorites.length
    },
    goToCart() {
      this.$router.push({ name: 'cart' })
    },
    goToProfile() {
      this.$router.push({ name: 'settings' })
    },
    refreshFavorites() {
      this.loadFavorites()
    },
  },
  async mounted() {
    try {
      this.cartCount = await getCartCount()
    } catch (error) {
      this.cartCount = 0
    }
    await this.loadFavorites()
  },
}
</script>

<style scoped>
.favorites-page {
  min-height: 100vh;
  background: #f3f3f3;
  color: #222;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.favorites-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 14px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e4e4;
}

.logo-button,
.back-button {
  border: 0;
  background: transparent;
  cursor: pointer;
}

.logo-button img {
  display: block;
  width: 132px;
}

.favorites-search {
  flex: 1;
  max-width: 520px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  color: #888;
}

.favorites-search input {
  width: 100%;
  border: 0;
  outline: 0;
  font-size: 12px;
}

.favorites-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: auto;
}

.favorites-actions button {
  border: 0;
  background: transparent;
  color: #555;
  cursor: pointer;
  font-size: 16px;
}

.header-count-button {
  position: relative;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
}

.header-count-button b {
  position: absolute;
  top: -5px;
  right: -4px;
  min-width: 14px;
  height: 14px;
  display: grid;
  place-items: center;
  padding: 0 3px;
  border-radius: 50%;
  background: #f64646;
  color: #fff;
  font-size: 8px;
  font-weight: 700;
}

.avatar-button {
  width: 25px;
  height: 25px;
  padding: 0 !important;
  border-radius: 50% !important;
  overflow: hidden;
}

.avatar-button img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.language-button {
  font-size: 11px !important;
}

.back-button {
  color: #087b7c;
  font-size: 14px;
}

.favorites-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.favorites-title-row h1 {
  margin: 0;
  font-size: 20px;
}

.favorites-title-row span {
  color: #777;
  font-size: 11px;
}

.favorites-content {
  width: 100%;
  padding: 40px 24px;
}

.favorites-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 20px;
}

.favorite-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px;
  background: #fff;
  cursor: pointer;
}

.favorite-card img {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
  background: #eee;
}

.favorite-card strong {
  font-size: 15px;
}

.favorite-card span {
  color: #087b7c;
}

.favorite-card small {
  display: flex;
  justify-content: space-between;
  color: #888;
  font-size: 11px;
}

.favorite-card small button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #e74c4c;
  cursor: pointer;
}

.empty-favorites {
  max-width: 420px;
  margin: 80px auto;
  text-align: center;
}

.heart-icon {
  color: #087b7c;
  font-size: 54px;
}

.empty-favorites h2 {
  margin: 8px 0;
}

.empty-favorites p,
.favorite-empty-hint {
  color: #777;
  white-space: pre-line;
}

.empty-favorites button {
  padding: 10px 18px;
  border: 0;
  border-radius: 4px;
  background: #087b7c;
  color: #fff;
  cursor: pointer;
}

@media (max-width: 600px) {
  .favorites-header {
    gap: 12px;
    padding: 12px 16px;
  }

  .logo-button img {
    width: 100px;
  }

  .favorites-search {
    order: 3;
    flex-basis: 100%;
    max-width: none;
  }

  .back-button {
    font-size: 12px;
  }
}
</style>
