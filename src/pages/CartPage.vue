<template>
  <div class="page-shell cart-page-shell">
    <header class="topbar">
      <div class="brand-wrap" @click="toHome">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage logo" class="brand-logo" />
      </div>

      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input type="text" :placeholder="t('searchPlaceholder')" />
      </div>

      <div class="header-actions">
        <button class="mini-icon" aria-label="cart" @click="goToCart">
          <span>🛒</span>
          <b>{{ cartCount }}</b>
        </button>
        <button class="mini-icon" aria-label="favorite" @click="goToFavorites">
          <span>♡</span>
          <b>{{ favoriteCount }}</b>
        </button>
        <div class="profile-pill" @click="goToProfile">
          <img :src="profileImage" alt="User" />
        </div>
        <div class="lang-switch" @click="switchLanguage">
          <span>{{ language }}</span>
          <span class="caret">▾</span>
        </div>
      </div>
    </header>

    <main class="page-body">
      <div class="content-panel">
        <section class="cart-panel">
          <h1>{{ t('cart') }}</h1>

          <div v-if="cartItems.length" class="select-all-row">
            <label class="select-all-label">
              <input type="checkbox" :checked="allSelected" @change="toggleSelectAll" />
              <span>{{ t('selectAllItems') }}</span>
            </label>
          </div>

          <div v-for="item in cartItems" :key="item.id" class="cart-row">
            <label class="item-checkbox">
              <input type="checkbox" :checked="selectedIds.includes(item.id)" @change="toggleSelected(item.id)" />
            </label>
            <div class="item-main">
              <img :src="item.image" :alt="item.name" />
              <div class="item-copy">
                <div class="row-top">
                  <h3>{{ item.name }}</h3>
                  <button class="remove-btn" @click="removeItem(item.id)">✕</button>
                </div>
                <p class="meta">{{ item.size }}</p>
                <p class="price">{{ formatCurrency(item.price) }}</p>
              </div>
            </div>

            <div class="item-actions">
              <div class="qty-box">
                <button @click="changeQty(item.id, -1)">−</button>
                <span>{{ item.qty }}</span>
                <button @click="changeQty(item.id, 1)">+</button>
              </div>
            </div>
          </div>

          <div v-if="!cartItems.length" class="empty-cart-state">
            <div class="empty-cart-icon">🛒</div>
            <h2>{{ t('emptyCartTitle') }}</h2>
            <p>{{ t('emptyCartHint') }}</p>
            <button type="button" class="shopping-now-button" @click="goToHome">{{ t('shoppingNow') }}</button>
          </div>
        </section>

        <aside class="summary-panel">
          <h2>{{ t('orderSummary') }}</h2>
          <div class="summary-list">
            <div class="summary-row">
              <span>{{ t('orderSum') }}</span>
              <strong>{{ formatCurrency(selectedSubtotal) }}</strong>
            </div>
            <div class="summary-row muted-row">
              <span>{{ t('protectionFee') }}</span>
              <strong>{{ formatCurrency(protectionFee) }}</strong>
            </div>
            <div class="summary-row muted-row">
              <span>{{ t('shippingFee') }}</span>
              <strong>-</strong>
            </div>
            <div class="summary-row total-row">
              <span>{{ t('totalToPay') }}</span>
              <strong>{{ formatCurrency(selectedTotal) }}</strong>
            </div>
          </div>
          <button class="checkout-btn" :disabled="selectedItems.length === 0" @click="goToCheckout">{{ t('checkout') }}</button>
        </aside>
      </div>
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
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { fetchFavorites } from '@/services/favorites'
import { fetchCart, removeCartItem, updateCartQty } from '@/services/cart'
import { i18nState, t, toggleLanguage } from '@/services/i18n'

export default {
  name: 'CartPage',
  data() {
    return {
      profileImage: localStorage.getItem('vintage_profile_image') || defaultProfileImage,
      cartItems: [],
      selectedIds: [],
      favoriteCount: 0,
      protectionFee: 2000,
      shippingFee: 15000,
      isLoadingCart: false,
    }
  },
  computed: {
    language() {
      return i18nState.language
    },
    cartCount() {
      return this.cartItems.reduce((total, item) => total + Number(item.qty || 0), 0)
    },
    selectedItems() {
      return this.cartItems.filter((item) => this.selectedIds.includes(item.id))
    },
    allSelected() {
      return this.cartItems.length > 0 && this.selectedItems.length === this.cartItems.length
    },
    selectedSubtotal() {
      return this.selectedItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    },
    selectedTotal() {
      return this.selectedSubtotal + this.protectionFee
    },
  },
  methods: {
    t,
    switchLanguage() {
      toggleLanguage()
    },
    async syncFavoriteCount() {
      try {
        const favorites = await fetchFavorites()
        this.favoriteCount = favorites.length
      } catch (error) {
        this.favoriteCount = 0
      }
    },
    async loadCart() {
      this.isLoadingCart = true
      try {
        this.cartItems = await fetchCart()
        this.selectedIds = this.cartItems.map((item) => item.id)
      } catch (error) {
        this.cartItems = []
        this.selectedIds = []
      } finally {
        this.isLoadingCart = false
      }
    },
    formatCurrency(value) {
      return `Rp${Number(value).toLocaleString('id-ID')}`
    },
    toggleSelected(id) {
      const exists = this.selectedIds.includes(id)
      this.selectedIds = exists
        ? this.selectedIds.filter((value) => value !== id)
        : [...this.selectedIds, id]
    },
    toggleSelectAll(event) {
      this.selectedIds = event.target.checked ? this.cartItems.map((item) => item.id) : []
    },
    async changeQty(id, delta) {
      const item = this.cartItems.find((entry) => entry.id === id)
      if (!item) return
      const nextQty = Number(item.qty || 0) + delta
      try {
        await updateCartQty(id, nextQty)
        if (nextQty <= 0) {
          this.cartItems = this.cartItems.filter((entry) => entry.id !== id)
          this.selectedIds = this.selectedIds.filter((entryId) => entryId !== id)
        } else {
          item.qty = nextQty
        }
      } catch (error) {
        await this.loadCart()
      }
    },
    async removeItem(id) {
      try {
        await removeCartItem(id)
        this.cartItems = this.cartItems.filter((entry) => entry.id !== id)
        this.selectedIds = this.selectedIds.filter((entryId) => entryId !== id)
      } catch (error) {
        await this.loadCart()
      }
    },
    goToCheckout() {
      if (this.selectedItems.length === 0) {
        alert('Pilih minimal satu produk untuk checkout.')
        return
      }
      localStorage.setItem('vintage_checkout_items', JSON.stringify(this.selectedItems))
      this.$router.push({ name: 'checkout' })
    },
    goToCart() {
      this.$router.push({ name: 'cart' })
    },
    goToHome() {
      this.$router.push({ name: 'home' })
    },
    goToProfile() {
      this.$router.push({ name: 'settings' })
    },
    goToFavorites() {
      this.$router.push({ name: 'favorites' })
    },
    toHome() {
      this.$router.push({ name: 'home' })
    },
  },
  async mounted() {
    this.syncFavoriteCount()
    await this.loadCart()
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

.brand-logo {
  display: block;
  width: 132px;
  height: auto;
  object-fit: contain;
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

.mini-icon b {
  position: absolute;
  top: -6px;
  right: -4px;
  min-width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #ff7d48;
  color: #fff;
  font-size: 8px;
  display: grid;
  place-items: center;
}

.profile-pill {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  overflow: hidden;
  border: 1px solid #d9d9d9;
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

.cart-panel h1 {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
}

.empty-cart-state {
  min-height: 270px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  text-align: center;
}

.empty-cart-icon {
  color: #0aa1a4;
  font-size: 52px;
}

.empty-cart-state h2 {
  margin: 0;
  color: #333;
  font-size: 18px;
}

.empty-cart-state p {
  margin: 0;
  color: #888;
  font-size: 12px;
}

.shopping-now-button {
  margin-top: 6px;
  padding: 9px 22px;
  border: 0;
  border-radius: 4px;
  background: #0aa1a4;
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.cart-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-top: 1px solid #e5e5e5;
  padding: 14px 10px 12px;
}

.item-checkbox {
  display: flex;
  align-items: center;
  margin-right: 12px;
}

.item-checkbox input {
  width: 16px;
  height: 16px;
  accent-color: #1b9ba6;
}

.select-all-row {
  display: flex;
  justify-content: flex-start;
  margin: 0 0 12px;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
}

.select-all-label input {
  width: 16px;
  height: 16px;
  accent-color: #1b9ba6;
}

.item-main {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.item-main img {
  width: 78px;
  height: 78px;
  object-fit: cover;
  background: #f5f5f5;
  border-radius: 4px;
}

.item-copy {
  flex: 1;
}

.row-top {
  display: flex;
  justify-content: space-between;
  gap: 10px;
}

.item-copy h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.remove-btn {
  border: 0;
  background: transparent;
  color: #888;
  cursor: pointer;
  font-size: 13px;
}

.meta,
.price {
  margin: 6px 0 0;
  font-size: 11px;
  color: #777;
}

.price {
  color: #1d1d1d;
  font-weight: 600;
}

.item-actions {
  display: flex;
  align-items: center;
}

.qty-box {
  display: flex;
  align-items: center;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  overflow: hidden;
  background: #fff;
}

.qty-box button {
  min-width: 28px;
  height: 28px;
  border: 0;
  background: transparent;
  color: #4d4d4d;
  cursor: pointer;
  font-size: 18px;
}

.qty-box span {
  min-width: 28px;
  text-align: center;
  font-size: 13px;
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

.total-row {
  font-weight: 700;
  font-size: 13px;
  color: #1d1d1d;
  margin-top: 8px;
}

.checkout-btn {
  width: 100%;
  margin-top: 18px;
  border: 0;
  border-radius: 6px;
  background: linear-gradient(180deg, #32c0c9, #1ca7b4);
  color: white;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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
}
</style>
