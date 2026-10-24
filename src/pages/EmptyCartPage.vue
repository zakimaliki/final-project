<template>
  <div class="page-shell empty-cart-shell">
    <header class="topbar">
      <div class="brand-wrap" @click="toHome">
        <div class="brand-mark">V</div>
        <span class="brand-label">Vintage</span>
      </div>

      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Search for items" />
      </div>

      <div class="header-actions">
        <button class="mini-icon" aria-label="cart">
          <span>🛒</span>
        </button>
        <button class="mini-icon" aria-label="favorite">
          <span>♡</span>
        </button>
        <button class="profile-pill" aria-label="Profile" @click="goToProfile">
          <img :src="profileImage" alt="User" />
        </button>
        <button class="lang-switch" type="button" @click="toggleLanguage">
          <span>{{ language }}</span>
          <span class="caret">▾</span>
        </button>
      </div>
    </header>

    <main class="page-body">
      <div class="content-panel">
        <section class="cart-panel empty-state-panel">
          <div class="empty-bag">🛒</div>
          <h1>Your cart still empty</h1>
          <p>Find your favorite items and add to cart before you check out.</p>
          <button class="find-btn" @click="toHome">Find Products</button>
        </section>

        <aside class="summary-panel">
          <h2>Order Summary</h2>
          <div class="summary-list">
            <div class="summary-row">
              <span>Order sum</span>
              <strong>Rp0</strong>
            </div>
            <div class="summary-row muted-row">
              <span>Protection fee</span>
              <strong>Rp0</strong>
            </div>
            <div class="summary-row muted-row">
              <span>Shipping</span>
              <strong>Rp0</strong>
            </div>
          </div>
          <button class="checkout-btn" disabled>Checkout</button>
        </aside>
      </div>

      <section class="related-section">
        <h2>Other Product</h2>
        <div class="product-grid">
          <div v-for="(product, index) in products" :key="index" class="product-card">
            <img :src="product.image" :alt="product.name" />
            <div class="product-info">
              <strong>{{ formatCurrency(product.price) }}</strong>
              <span>{{ product.name }}</span>
              <small>{{ product.size }} / {{ product.stock }}</small>
            </div>
          </div>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-grid">
        <div class="footer-col">
          <h3>Vintage</h3>
          <a href="#">About us</a>
          <a href="#">Sustainability</a>
          <a href="#">Blog</a>
          <a href="#">Advertising</a>
        </div>
        <div class="footer-col">
          <h3>Discover</h3>
          <a href="#">How it works</a>
          <a href="#">Help center</a>
          <a href="#">Infoboard</a>
          <a href="#">Mobile apps</a>
        </div>
        <div class="footer-col">
          <h3>Help</h3>
          <a href="#">Help center</a>
          <a href="#">Buying</a>
          <a href="#">Trust &amp; Safety</a>
        </div>
        <div class="footer-col">
          <h3>Community</h3>
          <a href="#">Forum</a>
        </div>
      </div>

      <div class="footer-bottom">
        <div class="footer-socials">
          <span>◉</span>
          <span>◎</span>
          <span>◌</span>
        </div>
        <span>© Vintage, 2023</span>
      </div>
    </footer>
  </div>
</template>

<script>
import imgWhite from '@/assets/img/Vintagechicagocubswhitecrewneck.png'
import imgRed from '@/assets/img/Red Crewneck.png'
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { i18nState, toggleLanguage as switchAppLanguage } from '@/services/i18n'

export default {
  name: 'EmptyCartPage',
  data() {
    return {
      profileImage: localStorage.getItem('vintage_profile_image') || defaultProfileImage,
      products: [
        { name: 'Vintage chicago cubs white crewneck', price: 200000, size: 'B / M', stock: '12', image: imgWhite },
        { name: 'Red Crewneck', price: 200000, size: 'B / M', stock: '12', image: imgRed },
        { name: 'Vintage chicago cubs white crewneck', price: 200000, size: 'B / M', stock: '12', image: imgWhite },
        { name: 'Red Crewneck', price: 200000, size: 'B / M', stock: '12', image: imgRed },
        { name: 'Vintage chicago cubs white crewneck', price: 200000, size: 'B / M', stock: '12', image: imgWhite },
        { name: 'Red Crewneck', price: 200000, size: 'B / M', stock: '12', image: imgRed },
      ],
    }
  },
  computed: {
    language() {
      return i18nState.language
    },
  },
  methods: {
    formatCurrency(value) {
      return `Rp${Number(value).toLocaleString('id-ID')}`
    },
    toHome() {
      this.$router.push({ name: 'home' })
    },
    goToProfile() {
      this.$router.push({ name: 'settings' })
    },
    toggleLanguage() {
      switchAppLanguage()
    },
  },
}
</script>

<style scoped>
* { box-sizing: border-box; }

.page-shell {
  background: #f3f3f3;
  min-height: 100vh;
  color: #222;
  font-family: 'Segoe UI', Tahoma, sans-serif;
}

.topbar {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 14px 18px 10px;
  background: rgba(255,255,255,0.96);
  border-bottom: 1px solid #e4e4e4;
}

.brand-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  cursor: pointer;
}

.brand-mark {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #20b6c6, #0f8d9e);
}

.brand-label {
  font-weight: 700;
  color: #1e8e9d;
  font-size: 19px;
}

.search-wrap {
  flex: 1;
  max-width: 540px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  background: #f7f7f7;
  padding: 8px 12px;
}

.search-wrap input {
  border: 0;
  outline: none;
  background: transparent;
  width: 100%;
  font-size: 14px;
  color: #444;
}

.search-icon {
  color: #7e7e7e;
  font-size: 18px;
}

.header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.mini-icon {
  position: relative;
  width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  cursor: pointer;
  font-size: 18px;
  color: #2d2d2d;
}

.profile-pill {
  width: 26px;
  height: 26px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #d9d9d9;
  background: transparent;
  cursor: pointer;
}

.profile-pill img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.lang-switch {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #555;
}

.page-body {
  width: 100%;
  padding: 24px 18px 40px;
}

.content-panel {
  display: grid;
  grid-template-columns: minmax(0, 1.8fr) 320px;
  align-items: start;
  gap: 30px;
}

.cart-panel {
  background: rgba(255,255,255,0.4);
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  padding: 12px 12px 10px;
}

.empty-state-panel {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  background: #f6f6f6;
}

.empty-bag {
  width: 86px;
  height: 86px;
  display: grid;
  place-items: center;
  background: #dff3f5;
  border-radius: 18px;
  font-size: 42px;
  color: #1fb7ca;
  margin-bottom: 20px;
}

.empty-state-panel h1 {
  margin: 0 0 6px;
  font-size: 20px;
  font-weight: 700;
}

.empty-state-panel p {
  margin: 0 0 18px;
  max-width: 360px;
  color: #666;
  font-size: 12px;
  line-height: 1.6;
}

.find-btn {
  border: 0;
  border-radius: 6px;
  padding: 12px 24px;
  background: linear-gradient(180deg, #2ac1cd, #1ca9b5);
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.summary-panel {
  background: rgba(255,255,255,0.4);
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  padding: 14px 16px 10px;
}

.summary-panel h2 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.summary-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ededed;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #555;
}

.summary-row strong {
  color: #2a2a2a;
  font-weight: 600;
}

.muted-row {
  color: #7d7d7d;
}

.checkout-btn {
  width: 100%;
  margin-top: 18px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(180deg, #c8c8c8, #b7b7b7);
  color: white;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  cursor: not-allowed;
}

.related-section {
  margin-top: 30px;
}

.related-section h2 {
  margin: 0 0 18px;
  font-size: 18px;
  font-weight: 600;
}

.product-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(120px, 1fr));
  gap: 18px;
}

.product-card {
  background: rgba(255,255,255,0.5);
  border: 1px solid #e6e6e6;
  border-radius: 8px;
  overflow: hidden;
}

.product-card img {
  width: 100%;
  height: 150px;
  object-fit: cover;
  display: block;
}

.product-info {
  padding: 10px 8px 12px;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.product-info strong {
  color: #0b909c;
  font-size: 13px;
}

.product-info span {
  font-size: 11px;
  color: #4b4b4b;
  line-height: 1.4;
}

.product-info small {
  color: #7a7a7a;
  font-size: 10px;
}

.site-footer {
  background: linear-gradient(180deg, #0e7a81, #0b6d73);
  color: white;
  padding: 28px 20px 16px;
  margin-top: 36px;
}

.footer-grid {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 26px;
  padding-bottom: 18px;
  border-bottom: 1px solid rgba(255,255,255,0.2);
}

.footer-col {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-col h3 {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
}

.footer-col a {
  color: rgba(255,255,255,0.82);
  text-decoration: none;
  font-size: 12px;
}

.footer-bottom {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
  font-size: 12px;
  color: rgba(255,255,255,0.8);
}

.footer-socials {
  display: flex;
  gap: 18px;
  font-size: 18px;
}

@media (max-width: 900px) {
  .content-panel {
    grid-template-columns: 1fr;
  }

  .topbar {
    flex-wrap: wrap;
  }

  .search-wrap {
    order: 3;
    width: 100%;
    max-width: none;
  }

  .product-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}
</style>
