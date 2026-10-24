<template>
  <div class="settings-shell">
    <div class="settings-page">
      <header class="settings-header">
        <div class="brand-area" @click="goHome" role="button" tabindex="0" @keydown.enter.prevent="goHome" @keydown.space.prevent="goHome">
          <img src="@/assets/img/LogoHorizontal.png" alt="Vintage logo" class="brand-logo" />
        </div>

        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input type="text" placeholder="Search for items" />
        </div>

        <div class="header-actions">
          <button class="icon-button cart-button" type="button" aria-label="Shopping cart" @click="goToCart">
            <span>🛒</span>
            <b>{{ cartCount }}</b>
          </button>

          <button class="icon-button" type="button" aria-label="Favorites" @click="goToFavorites">
            <span>♡</span>
            <b>{{ favoriteCount }}</b>
          </button>

          <button class="profile-mini" type="button" aria-label="User profile" @click="goToProfile">
            <img :src="profileImage" alt="User avatar" />
          </button>

          <button class="lang-button" type="button" @click="toggleLanguage">{{ language }} <span>▾</span></button>
        </div>
      </header>

      <main class="settings-content">
        <aside class="settings-sidebar">
          <h1>Settings</h1>
          <nav class="sidebar-nav" aria-label="Settings navigation">
            <button
              type="button"
              :class="['nav-item', { active: currentSection === 'profile' }]"
              @click="currentSection = 'profile'"
            >
              Profile details
            </button>
            <button
              type="button"
              :class="['nav-item', { active: currentSection === 'password' }]"
              @click="currentSection = 'password'"
            >
              Change Password
            </button>
            <button
              type="button"
              :class="['nav-item', { active: currentSection === 'history' }]"
              @click="currentSection = 'history'"
            >
              Transaction History
            </button>
          </nav>
        </aside>

        <section class="settings-panel">
          <div v-if="currentSection === 'profile'" class="panel-card profile-card">
            <h2>Edit Profile</h2>

            <div class="photo-row">
              <div class="avatar-circle">
                <img :src="profileImage" alt="Profile photo" />
              </div>
              <input ref="photoInput" class="photo-input" type="file" accept="image/png,image/jpeg,image/webp" @change="handlePhotoChange" />
              <button type="button" class="upload-button" @click="$refs.photoInput.click()">Choose</button>
              <button type="button" class="icon-action" aria-label="Remove photo" @click="removePhoto">🗑</button>
            </div>

            <label class="field-label">Full name</label>
            <input v-model="profile.fullName" type="text" />

            <label class="field-label">Username</label>
            <input v-model="profile.username" type="text" />

            <label class="field-label">Email</label>
            <input v-model="profile.email" type="email" />

            <button type="button" class="submit-button" @click="updateProfile">Update Profile</button>
          </div>

          <div v-else-if="currentSection === 'password'" class="panel-card password-card">
            <h2>Change Password</h2>

            <label class="field-label">Old Password</label>
            <div class="input-wrap">
              <input v-model="passwordForm.oldPassword" :type="showOldPassword ? 'text' : 'password'" placeholder="Old password" />
              <button type="button" class="field-icon-button" @click="showOldPassword = !showOldPassword" aria-label="Toggle old password visibility">
                {{ showOldPassword ? '🙈' : '👁' }}
              </button>
            </div>

            <label class="field-label">New Password</label>
            <div class="input-wrap">
              <input v-model="passwordForm.newPassword" :type="showNewPassword ? 'text' : 'password'" placeholder="New password" />
              <button type="button" class="field-icon-button" @click="showNewPassword = !showNewPassword" aria-label="Toggle new password visibility">
                {{ showNewPassword ? '🙈' : '👁' }}
              </button>
            </div>

            <label class="field-label">Confirmation New Password</label>
            <div class="input-wrap">
              <input v-model="passwordForm.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'" placeholder="Confirmation password" />
              <button type="button" class="field-icon-button" @click="showConfirmPassword = !showConfirmPassword" aria-label="Toggle confirm password visibility">
                {{ showConfirmPassword ? '🙈' : '👁' }}
              </button>
            </div>

            <button type="button" class="submit-button" @click="savePasswordChanges">Save Changes</button>
          </div>

          <div v-else-if="transactionHistory.length" class="panel-card history-card">
            <h2>My Order</h2>
            <div class="order-history-list">
              <article v-for="order in transactionHistory" :key="order.id" class="order-history-card" @click="openOrderDetail(order)">
                <div class="order-history-header">
                  <span>🛍 Shopping</span>
                  <span>{{ order.date }} · {{ order.time || '-' }}</span>
                  <span class="order-status">Done</span>
                  <small>{{ order.id }}</small>
                </div>
                <div class="order-history-body">
                  <img :src="order.items[0].image" :alt="order.items[0].name" />
                  <div class="order-product-copy">
                    <strong>{{ order.items[0].name }}</strong>
                    <span>{{ order.items[0].qty }} product · {{ formatCurrency(order.items[0].price) }}</span>
                    <small>{{ order.items[0].size }}</small>
                    <small v-if="order.items.length > 1">+ {{ order.items.length - 1 }} more products</small>
                  </div>
                  <div class="order-total">
                    <small>Total price</small>
                    <strong>{{ formatCurrency(order.total) }}</strong>
                  </div>
                </div>
                <button type="button" class="buy-again-button" @click.stop="buyAgain(order)">Buy Again</button>
              </article>
            </div>
          </div>
          <div v-else class="panel-card history-card">
            <h2>My Order</h2>
            <div class="empty-history">
              <img src="@/assets/img/bag-cross.png" alt="No orders" class="empty-order-icon" />
              <h3>No orders yet</h3>
              <p>When you buy an item, your order will appear here.</p>
              <button type="button" class="shop-now-button" @click="goHome">Shop now</button>
            </div>
          </div>
        </section>
      </main>

      <div v-if="selectedOrder" class="order-detail-backdrop" @click.self="selectedOrder = null">
        <section class="order-detail-modal" role="dialog" aria-modal="true" aria-label="Transaction detail">
          <button type="button" class="order-detail-close" aria-label="Close" @click="selectedOrder = null">×</button>
          <h2>Transaction detail</h2>
          <p class="order-detail-id">{{ selectedOrder.id }} · {{ selectedOrder.date }} · {{ selectedOrder.time || '-' }}</p>
          <div class="order-detail-list">
            <div v-for="item in selectedOrder.items" :key="item.id" class="order-detail-item">
              <img :src="item.image" :alt="item.name" />
              <div>
                <strong>{{ item.name }}</strong>
                <span>{{ item.qty }} × {{ formatCurrency(item.price) }}</span>
              </div>
            </div>
          </div>
          <dl class="order-detail-info">
            <div><dt>Delivery address</dt><dd>{{ selectedOrder.address || '-' }}</dd></div>
            <div><dt>Delivery</dt><dd>{{ selectedOrder.delivery || '-' }}</dd></div>
            <div><dt>Payment method</dt><dd>{{ formatPaymentMethod(selectedOrder) }}</dd></div>
          </dl>
          <div class="order-cost-breakdown">
            <div><span>Order subtotal</span><strong>{{ formatCurrency(selectedOrder.subtotal || getOrderSubtotal(selectedOrder)) }}</strong></div>
            <div><span>Protection fee</span><strong>{{ formatCurrency(selectedOrder.protectionFee || 0) }}</strong></div>
            <div><span>Payment fee</span><strong>{{ formatCurrency(selectedOrder.paymentFee || 0) }}</strong></div>
            <div><span>Shipping fee</span><strong>{{ formatCurrency(selectedOrder.shippingFee || 0) }}</strong></div>
            <div class="order-cost-total"><span>Total paid</span><strong>{{ formatCurrency(selectedOrder.total) }}</strong></div>
          </div>
        </section>
      </div>

      <footer class="site-footer">
        <div class="footer-grid">
          <div class="footer-col">
            <h3>Vintage</h3>
            <ul>
              <li>About us</li>
              <li>Sustainability</li>
              <li>Blog</li>
              <li>Advertising</li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Discover</h3>
            <ul>
              <li>How it works</li>
              <li>Help center</li>
              <li>Infoboard</li>
              <li>Mobile apps</li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Help</h3>
            <ul>
              <li>Help center</li>
              <li>Buying</li>
              <li>Trust &amp; Safety</li>
            </ul>
          </div>

          <div class="footer-col">
            <h3>Community</h3>
            <ul>
              <li>Forum</li>
            </ul>
          </div>
        </div>

        <div class="footer-bottom">
          <div class="social-row">
            <span class="social-icon">◔</span>
            <span class="social-icon">◎</span>
            <span class="social-icon">in</span>
          </div>
          <div class="copyright">© Vintage, 2023</div>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { fetchFavorites } from '@/services/favorites'
import { addToCart, getCartCount } from '@/services/cart'
import { i18nState, toggleLanguage as switchAppLanguage } from '@/services/i18n'

export default {
  name: 'ProfileSettingsPage',
  data() {
    return {
      currentSection: 'profile',
      cartCount: 0,
      favoriteCount: 0,
      profileImage: localStorage.getItem('vintage_profile_image') || defaultProfileImage,
      profile: {
        fullName: '',
        username: '',
        email: '',
      },
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      },
      showOldPassword: false,
      showNewPassword: false,
      showConfirmPassword: false,
      transactionHistory: [],
      selectedOrder: null,
    }
  },
  computed: {
    language() {
      return i18nState.language
    },
  },
  mounted() {
    this.loadProfile()
    this.loadHeaderCounts()
    if (this.$route.query.section === 'history') {
      this.currentSection = 'history'
    }
  },
  methods: {
    getStoredUser() {
      try {
        return JSON.parse(localStorage.getItem('vintage_user') || '{}')
      } catch (error) {
        return {}
      }
    },
    updateProfile() {
      const fullName = this.profile.fullName.trim()
      const username = this.profile.username.trim()
      const email = this.profile.email.trim()

      if (!fullName || !username || !email) {
        alert('Please complete all profile fields.')
        return
      }

      const activeUser = this.getStoredUser()
      const updatedUser = {
        ...activeUser,
        fullName,
        username,
        email,
      }

      const users = JSON.parse(localStorage.getItem('vintage_users') || '[]')
      const userIndex = users.findIndex((user) => user.email && user.email.toLowerCase() === email.toLowerCase())

      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], fullName, username, email }
      } else {
        users.push(updatedUser)
      }

      localStorage.setItem('vintage_users', JSON.stringify(users))
      localStorage.setItem('vintage_user', JSON.stringify(updatedUser))
      alert('Profile updated successfully.')
    },
    savePasswordChanges() {
      const { oldPassword, newPassword, confirmPassword } = this.passwordForm

      if (!oldPassword || !newPassword || !confirmPassword) {
        alert('Please complete all password fields.')
        return
      }

      const activeUser = this.getStoredUser()
      const storedPassword = activeUser.password || ''

      if (storedPassword && oldPassword !== storedPassword) {
        alert('Old password is incorrect.')
        return
      }

      if (newPassword !== confirmPassword) {
        alert('New password and confirmation do not match.')
        return
      }

      const updatedUser = {
        ...activeUser,
        password: newPassword,
      }

      const users = JSON.parse(localStorage.getItem('vintage_users') || '[]')
      const userIndex = users.findIndex((user) => user.email && user.email.toLowerCase() === (updatedUser.email || '').toLowerCase())

      if (userIndex >= 0) {
        users[userIndex] = { ...users[userIndex], password: newPassword }
      }

      localStorage.setItem('vintage_users', JSON.stringify(users))
      localStorage.setItem('vintage_user', JSON.stringify(updatedUser))
      this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' }
      alert('Password updated successfully.')
    },
    goHome() {
      this.$router.push({ name: 'home' })
    },
    goToHome() {
      this.$router.push({ name: 'home' })
    },
    goToProfile() {
      this.$router.push({ name: 'settings' })
    },
    goToCart() {
      this.$router.push({ name: 'cart' })
    },
    goToFavorites() {
      this.$router.push({ name: 'favorites' })
    },
    async syncFavoriteCount() {
      try {
        const favorites = await fetchFavorites()
        this.favoriteCount = favorites.length
      } catch (error) {
        this.favoriteCount = 0
      }
    },
    async loadHeaderCounts() {
      try {
        this.cartCount = await getCartCount()
      } catch (error) {
        this.cartCount = 0
      }
      await this.syncFavoriteCount()
    },
    toggleLanguage() {
      switchAppLanguage()
    },
    handlePhotoChange(event) {
      const file = event.target.files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        this.profileImage = reader.result
        localStorage.setItem('vintage_profile_image', reader.result)
      }
      reader.readAsDataURL(file)
    },
    removePhoto() {
      this.profileImage = defaultProfileImage
      localStorage.removeItem('vintage_profile_image')
      if (this.$refs.photoInput) this.$refs.photoInput.value = ''
    },
    formatCurrency(value) {
      return `Rp${Number(value).toLocaleString('id-ID')}`
    },
    getOrderSubtotal(order) {
      return (order.items || []).reduce((sum, item) => sum + Number(item.price || 0) * Number(item.qty || 0), 0)
    },
    formatPaymentMethod(order) {
      const labels = {
        'bank-transfer': 'Bank transfer',
        'e-wallet': 'E-wallet',
        'cash-on-delivery': 'Cash on delivery',
        'credit-card': 'Credit card',
        paylater: 'PayLater',
      }
      const label = labels[order.paymentMethod] || order.paymentMethod || '-'
      return order.paymentMethod === 'paylater' && order.paylaterTerm ? `${label} (${order.paylaterTerm.replace('-', ' ')})` : label
    },
    async buyAgain(order) {
      try {
        for (const item of order.items || []) {
          await addToCart(
            {
              id: item.id,
              name: item.name,
              size: item.size,
              rawPrice: item.price,
              imageName: item.imageName || item.image,
              image: item.image,
              rawShipping: item.shipping || 0,
            },
            Number(item.qty || 1),
          )
        }
        this.cartCount = await getCartCount()
      } catch (error) {
        return
      }
      this.$router.push({ name: 'cart' })
    },
    openOrderDetail(order) {
      this.selectedOrder = order
    },
    loadProfile() {
      try {
        const saved = JSON.parse(localStorage.getItem('vintage_user') || '{}')
        this.profile = {
          fullName: saved.fullName || '',
          username: saved.username || '',
          email: saved.email || '',
        }
        this.passwordForm.oldPassword = saved.password || ''
        this.transactionHistory = JSON.parse(localStorage.getItem('vintage_orders') || '[]')
      } catch (error) {
        this.profile = { fullName: '', username: '', email: '' }
        this.passwordForm.oldPassword = ''
        this.transactionHistory = []
      }
    },
  },
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.settings-shell {
  min-height: 100vh;
  background: #f1f1f1;
  padding: 0;
}

.settings-page {
  width: 100%;
  margin: 0;
  background: #f1f1f1;
  border: 0;
  overflow: hidden;
}

.settings-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px 20px;
  background: rgba(250, 250, 250, 0.96);
  border-bottom: 1px solid #e1e1e1;
}

.brand-area {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 170px;
}

.brand-mark {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1cc3c9, #1a979f);
  position: relative;
  box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.7);
}

.brand-ring {
  position: absolute;
  inset: 8px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.9);
  border-left-color: transparent;
  transform: rotate(20deg);
}

.brand-logo {
  display: block;
  height: 30px;
  width: auto;
  object-fit: contain;
}

.search-box {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  background: #f6f6f6;
  border: 1px solid #d7d7d7;
  border-radius: 8px;
  min-height: 42px;
  padding: 0 14px;
}

.search-icon {
  color: #7d7d7d;
  font-size: 18px;
}

.search-box input {
  width: 100%;
  border: 0;
  background: transparent;
  outline: none;
  font-size: 14px;
  color: #2d2d2d;
}

.search-box input::placeholder {
  color: #7a7a7a;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.icon-button,
.profile-mini,
.lang-button {
  border: 1px solid #dedede;
  background: rgba(255,255,255,0.7);
  color: #2f2f2f;
  cursor: pointer;
  font: inherit;
}

.icon-button {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  display: grid;
  place-items: center;
  font-size: 16px;
}

.icon-button b {
  position: absolute;
  top: -7px;
  right: -6px;
  min-width: 16px;
  height: 16px;
  padding: 2px 4px;
  border-radius: 50%;
  background: #f74747;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: grid;
  place-items: center;
}

.profile-mini {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  overflow: hidden;
  padding: 0;
}

.profile-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.lang-button {
  min-width: 62px;
  height: 34px;
  border-radius: 8px;
  font-size: 13px;
  padding: 0 10px;
}

.settings-content {
  display: grid;
  grid-template-columns: 220px 1fr;
  min-height: 540px;
  background: #f3f3f3;
}

.settings-sidebar {
  padding: 28px 18px 0 26px;
}

.settings-sidebar h1 {
  font-size: 2.2rem;
  font-weight: 700;
  color: #141414;
  margin-bottom: 16px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.nav-item {
  appearance: none;
  border: 0;
  background: transparent;
  text-align: left;
  font-size: 1.04rem;
  color: #3d3d3d;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: 0.2s ease;
}

.nav-item.active {
  color: #0d0d0d;
  background: rgba(44, 170, 177, 0.08);
  font-weight: 600;
}

.settings-panel {
  padding: 30px 20px 26px 12px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.panel-card {
  width: min(100%, 700px);
  background: rgba(255,255,255,0.18);
  border: 1px solid #d6d6d8;
  border-radius: 8px;
  padding: 18px 18px 14px;
  min-height: 380px;
}

.panel-card h2 {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 18px;
  color: #1e1e1e;
}

.profile-card {
  padding-top: 12px;
}

.photo-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 18px;
}

.avatar-circle {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: #d5f6f5;
  color: #1fb4ba;
  display: grid;
  place-items: center;
  font-size: 2rem;
  font-weight: 700;
  border: 1px solid #bfe6e1;
  overflow: hidden;
}

.avatar-circle img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.photo-input {
  display: none;
}

.upload-button,
.icon-action {
  border: 1px solid #d8d8d8;
  background: rgba(255,255,255,0.7);
  color: #4b4b4b;
  border-radius: 6px;
  cursor: pointer;
  font: inherit;
}

.upload-button {
  padding: 8px 16px;
  min-width: 100px;
}

.icon-action {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  color: #4b4b4b;
  margin-bottom: 8px;
  margin-top: 10px;
}

input {
  width: 100%;
  min-height: 42px;
  border: 1px solid #d4d4d4;
  background: rgba(255,255,255,0.5);
  border-radius: 6px;
  padding: 10px 12px;
  color: #282828;
  font-size: 0.97rem;
  outline: none;
}

.input-wrap {
  position: relative;
}

.input-wrap input {
  padding-right: 38px;
}

.field-icon {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #7f7f7f;
  font-size: 0.8rem;
}

.field-icon-button {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.9rem;
  color: #6d6d6d;
}

.submit-button {
  display: block;
  margin-top: 22px;
  margin-left: auto;
  border: 0;
  background: #20b8c6;
  color: white;
  min-width: 140px;
  min-height: 40px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.95rem;
}

.password-card .submit-button {
  min-width: 150px;
}

.empty-history {
  min-height: 250px;
  display: grid;
  justify-items: center;
  align-content: center;
  gap: 8px;
  border: 1px solid #eeeeee;
  border-radius: 8px;
  color: #666;
  background: #fff;
  text-align: center;
}

.empty-order-icon {
  width: 58px;
  height: 58px;
  object-fit: contain;
  margin-bottom: 4px;
}

.empty-history h3 {
  margin: 0;
  color: #333;
  font-size: 16px;
  font-weight: 600;
}

.empty-history p {
  margin: 0;
  color: #888;
  font-size: 11px;
}

.shop-now-button {
  min-width: 120px;
  margin-top: 4px;
  padding: 8px 18px;
  border: 0;
  border-radius: 3px;
  background: #0aa1a4;
  color: #fff;
  cursor: pointer;
  font-size: 11px;
}

.order-history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-history-card {
  position: relative;
  padding: 12px;
  border: 1px solid #e5e5e5;
  border-radius: 7px;
  background: #fff;
  cursor: pointer;
}

.order-history-header,
.order-history-body {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-history-header {
  padding-bottom: 9px;
  border-bottom: 1px solid #eeeeee;
  color: #777;
  font-size: 10px;
}

.order-history-header small {
  margin-left: auto;
  color: #999;
  font-size: 9px;
}

.order-status {
  color: #1da66a;
}

.order-history-body {
  align-items: flex-start;
  padding: 10px 0 4px;
}

.order-history-body img {
  width: 54px;
  height: 54px;
  border-radius: 4px;
  object-fit: cover;
  background: #f3f3f3;
}

.order-product-copy {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.order-product-copy strong {
  overflow: hidden;
  color: #333;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.order-product-copy span,
.order-product-copy small,
.order-total small {
  color: #888;
  font-size: 10px;
}

.order-total {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 90px;
}

.order-total strong {
  color: #333;
  font-size: 11px;
}

.buy-again-button {
  display: block;
  margin: 5px 0 0 auto;
  padding: 6px 13px;
  border: 0;
  border-radius: 3px;
  background: #0aa1a4;
  color: #fff;
  cursor: pointer;
  font-size: 10px;
}

.order-detail-backdrop {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(0, 0, 0, 0.45);
}

.order-detail-modal {
  position: relative;
  width: min(100%, 520px);
  max-height: 90vh;
  overflow: auto;
  padding: 22px;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 14px 40px rgba(0, 0, 0, 0.2);
}

.order-detail-modal h2 {
  margin: 0 0 4px;
  color: #222;
  font-size: 18px;
}

.order-detail-id {
  margin: 0 0 16px;
  color: #888;
  font-size: 11px;
}

.order-detail-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: 0;
  background: transparent;
  color: #777;
  cursor: pointer;
  font-size: 22px;
}

.order-detail-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 14px;
  border-bottom: 1px solid #eee;
}

.order-detail-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-detail-item img {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  object-fit: cover;
}

.order-detail-item div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.order-detail-item strong {
  color: #333;
  font-size: 12px;
}

.order-detail-item span {
  color: #888;
  font-size: 10px;
}

.order-detail-info {
  margin: 14px 0 0;
}

.order-detail-info div {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 10px;
  padding: 7px 0;
  border-bottom: 1px solid #f1f1f1;
  font-size: 11px;
}

.order-detail-info dt {
  color: #888;
}

.order-detail-info dd {
  margin: 0;
  color: #333;
}

.order-cost-breakdown {
  display: flex;
  flex-direction: column;
  gap: 7px;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid #eee;
  font-size: 11px;
}

.order-cost-breakdown div {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.order-cost-breakdown span {
  color: #888;
}

.order-cost-breakdown strong {
  color: #333;
}

.order-cost-total {
  margin-top: 3px;
  padding-top: 8px;
  border-top: 1px solid #eee;
  font-size: 12px;
}

.site-footer {
  background: #0d8d9b;
  color: white;
  padding: 18px 28px 10px;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  gap: 16px;
  padding: 12px 0 18px;
  border-bottom: 1px solid rgba(255,255,255,0.25);
}

.footer-col h3 {
  margin-bottom: 14px;
  font-size: 1.2rem;
  font-weight: 700;
}

.footer-col ul {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: rgba(255,255,255,0.92);
}

.footer-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 14px;
}

.social-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.social-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255,255,255,0.16);
  display: grid;
  place-items: center;
  font-size: 0.8rem;
  font-weight: 700;
}

.copyright {
  font-size: 0.9rem;
  color: rgba(255,255,255,0.9);
}

@media (max-width: 880px) {
  .settings-content {
    grid-template-columns: 1fr;
  }

  .settings-sidebar {
    padding: 24px 20px 0;
  }

  .sidebar-nav {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .settings-panel {
    padding: 20px 20px 24px;
  }

  .search-box {
    display: none;
  }

  .footer-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }
}
</style>
