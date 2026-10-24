<template>
  <div class="page-shell cart-page-shell">
    <header class="topbar">
      <div class="brand-wrap" @click="toHome">
        <img src="@/assets/img/LogoHorizontal.png" alt="Vintage logo" class="brand-logo" />
      </div>

      <div class="search-wrap">
        <span class="search-icon">⌕</span>
        <input type="text" placeholder="Search for items" />
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
        <button class="profile-pill" aria-label="profile" @click="goToProfile">
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
        <section class="checkout-panel">
          <div class="panel-block">
            <h2>Order</h2>
            <div v-if="cartItems.length === 0" class="empty-checkout">No item selected.</div>
            <div v-for="item in cartItems" :key="item.id" class="checkout-item">
              <img :src="item.image" :alt="item.name" />
              <div class="checkout-copy">
                <div class="checkout-row">
                  <div>
                    <h3>{{ item.name }}</h3>
                    <p>{{ item.size }}</p>
                  </div>
                  <span class="checkout-qty">x{{ item.qty }}</span>
                </div>
                <strong>{{ formatCurrency(item.price) }}</strong>
              </div>
            </div>
          </div>

          <div class="panel-block">
            <h2>Address</h2>
            <div class="address-box editable-box">
              <span class="pin">📍</span>
              <textarea v-model="address" aria-label="Delivery address" rows="3" placeholder="Enter your delivery address"></textarea>
            </div>
          </div>

          <div class="panel-block">
            <h2>Delivery details</h2>
            <div class="delivery-box editable-box">
              <span class="truck">🚚</span>
              <label class="control-field">
                <span>Choose delivery speed</span>
                <select v-model="selectedDelivery">
                  <option v-for="option in deliveryOptions" :key="option.key" :value="option.key">{{ option.label }}</option>
                </select>
                <small>{{ selectedDeliveryOption.description }} · {{ formatCurrency(shippingFee) }}</small>
              </label>
            </div>
          </div>

          <div class="panel-block">
            <h2>Payment Method</h2>
            <div class="payment-box editable-box">
              <div class="visa-mark">PAY</div>
              <label class="control-field">
                <span>Choose payment method</span>
                <select v-model="paymentMethod">
                  <option value="bank-transfer">Bank transfer</option>
                  <option value="e-wallet">E-wallet</option>
                  <option value="cash-on-delivery">Cash on delivery</option>
                  <option value="credit-card">Credit card</option>
                  <option value="paylater">PayLater</option>
                </select>
              </label>
            </div>
            <div v-if="paymentMethod === 'bank-transfer'" class="payment-instructions">
              <strong>Transfer to Vintage Store</strong>
              <span>Bank BCA · 1234567890</span>
              <small>Account name: PT Vintage Indonesia</small>
            </div>
            <div v-if="paymentMethod === 'paylater'" class="paylater-fields">
              <label class="control-field">
                <span>Choose PayLater tenor</span>
                <select v-model="paylaterTerm">
                  <option value="1-month">Pay in 1 month</option>
                  <option value="3-months">Pay in 3 months</option>
                  <option value="6-months">Pay in 6 months</option>
                </select>
              </label>
              <small>PayLater approval and fees depend on your provider.</small>
            </div>
            <div v-if="paymentMethod === 'credit-card'" class="card-fields">
              <label class="control-field">
                <span>Card number</span>
                <input v-model="cardForm.number" type="text" inputmode="numeric" maxlength="19" placeholder="1234 5678 9012 3456" />
              </label>
              <div class="card-fields-row">
                <label class="control-field">
                  <span>Expiry date</span>
                  <input v-model="cardForm.expiry" type="text" maxlength="5" placeholder="MM/YY" />
                </label>
                <label class="control-field">
                  <span>CVC</span>
                  <input v-model="cardForm.cvc" type="password" inputmode="numeric" maxlength="4" placeholder="123" />
                </label>
              </div>
              <label class="control-field">
                <span>Cardholder name</span>
                <input v-model="cardForm.name" type="text" placeholder="Name as shown on card" />
              </label>
            </div>
          </div>
        </section>

        <aside class="summary-panel">
          <h2>Order summary</h2>
          <div class="summary-list">
            <div class="summary-row">
              <span>Order</span>
              <strong>{{ formatCurrency(orderSubtotal) }}</strong>
            </div>
            <div class="summary-row muted-row">
              <span>Protection fee</span>
              <strong>{{ formatCurrency(protectionFee) }}</strong>
            </div>
            <div class="summary-row muted-row">
              <span>Payment fee</span>
              <strong>{{ formatCurrency(paymentFee) }}</strong>
            </div>
            <div class="summary-row muted-row">
              <span>Shipping ({{ selectedDeliveryOption.shortLabel }})</span>
              <strong>{{ formatCurrency(shippingFee) }}</strong>
            </div>
            <div class="summary-row total-row">
              <span>Total to pay</span>
              <strong>{{ formatCurrency(total) }}</strong>
            </div>
          </div>
          <button class="checkout-btn" :disabled="!canPlaceOrder" @click="placeOrder">Order Now</button>
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

    <div v-if="showSuccessModal" class="modal-backdrop" @click.self="closeModal">
      <div class="success-modal">
        <div class="modal-badge">💳</div>
        <h3>Order #{{ currentOrderId }}<br />placed successfully</h3>
        <p>Thank you for do online shopping at Vintage.<br />You can track and see your order on transaction history menu.</p>
        <button class="primary-modal-btn" @click="continueShopping">Continue shopping</button>
        <button class="secondary-modal-btn" @click="goToHistory">Go to History Transaction</button>
      </div>
    </div>
  </div>
</template>

<script>
import imgWhite from '@/assets/img/Vintagechicagocubswhitecrewneck.png'
import imgRed from '@/assets/img/Red Crewneck.png'
import defaultProfileImage from '@/assets/img/profile-user.jpg'
import { fetchFavorites } from '@/services/favorites'
import { fetchCart, getCartCount, updateCartQty, removeCartItem } from '@/services/cart'
import { i18nState, toggleLanguage as switchAppLanguage } from '@/services/i18n'

export default {
  name: 'CheckoutPage',
  data() {
    return {
      showSuccessModal: false,
      currentOrderId: '',
      profileImage: localStorage.getItem('vintage_profile_image') || defaultProfileImage,
      cartCount: 0,
      favoriteCount: 0,
      cartItems: this.getSelectedCartItems(),
      address: localStorage.getItem('vintage_delivery_address') || 'PT. Timedoor Indonesia, Jl. Tukad Yanyan No. 46, Renon, Denpasar Selatan, Kota Denpasar, Bali 80226',
      selectedDelivery: localStorage.getItem('vintage_delivery_option') || 'standard',
      paymentMethod: localStorage.getItem('vintage_payment_method') || 'bank-transfer',
      paylaterTerm: localStorage.getItem('vintage_paylater_term') || '1-month',
      cardForm: {
        number: '',
        expiry: '',
        cvc: '',
        name: '',
      },
      deliveryOptions: [
        { key: 'same-day', label: 'Same day delivery', shortLabel: 'Same day', description: 'Arrives today for nearby addresses', fee: 35000 },
        { key: 'standard', label: 'Standard delivery (1-3 days)', shortLabel: '1-3 days', description: 'Recommended for most distances', fee: 15000 },
        { key: 'economy', label: 'Economy delivery (3-5 days)', shortLabel: '3-5 days', description: 'Lower cost for longer delivery time', fee: 10000 },
      ],
      protectionFee: 2000,
    }
  },
  computed: {
    language() {
      return i18nState.language
    },
    adminPhone() {
      return (import.meta.env.ADMIN_PHONE || import.meta.env.VITE_ADMIN_PHONE || '').trim()
    },
    orderSubtotal() {
      return this.cartItems.reduce((sum, item) => sum + item.price * item.qty, 0)
    },
    total() {
      return this.orderSubtotal + this.protectionFee + this.paymentFee + this.shippingFee
    },
    paymentFee() {
      const fees = {
        'bank-transfer': 1000,
        'e-wallet': 2000,
        'cash-on-delivery': 1000,
        'credit-card': 2000,
        paylater: 2000,
      }
      return fees[this.paymentMethod] || 1000
    },
    selectedDeliveryOption() {
      return this.deliveryOptions.find((option) => option.key === this.selectedDelivery) || this.deliveryOptions[1]
    },
    shippingFee() {
      return this.selectedDeliveryOption.fee
    },
    canPlaceOrder() {
      const hasAddress = Boolean(this.address.trim())
      const hasCardDetails = this.paymentMethod !== 'credit-card' || (
        this.cardForm.number.trim() &&
        this.cardForm.expiry.trim() &&
        this.cardForm.cvc.trim() &&
        this.cardForm.name.trim()
      )
      return this.cartItems.length > 0 && hasAddress && hasCardDetails
    },
  },
  mounted() {
    this.syncHeaderCounts()
  },
  methods: {
    async syncFavoriteCount() {
      try {
        const favorites = await fetchFavorites()
        this.favoriteCount = favorites.length
      } catch (error) {
        this.favoriteCount = 0
      }
    },
    async syncHeaderCounts() {
      try {
        this.cartCount = await getCartCount()
      } catch (error) {
        this.cartCount = 0
      }
      await this.syncFavoriteCount()
    },
    getSelectedCartItems() {
      try {
        const selected = JSON.parse(localStorage.getItem('vintage_checkout_items') || '[]')
        if (selected && selected.length) {
          return selected
        }
      } catch (error) {
        // ignore localStorage issues
      }
      return [
        { id: 1, name: 'White crewneck', size: 'B / M', price: 200000, qty: 1, image: imgWhite },
        { id: 2, name: 'White crewneck', size: 'B / M', price: 200000, qty: 1, image: imgRed },
      ]
    },
    formatCurrency(value) {
      return `Rp${Number(value).toLocaleString('id-ID')}`
    },
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
    },
    openWhatsAppOrder() {
      const phone = (this.adminPhone || '').replace(/[^\d+]/g, '')
      if (!phone) {
        alert('Nomor admin WhatsApp belum diatur di ENV ADMIN_PHONE.')
        return
      }

      const message = this.buildOrderMessage()
      const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    },
    async placeOrder() {
      if (this.cartItems.length === 0) {
        alert('Pilih produk terlebih dahulu sebelum checkout.')
        return
      }
      if (!this.address.trim()) {
        alert('Masukkan alamat pengiriman terlebih dahulu.')
        return
      }
      if (this.paymentMethod === 'credit-card' && (!this.cardForm.number || !this.cardForm.expiry || !this.cardForm.cvc || !this.cardForm.name)) {
        alert('Lengkapi nomor kartu, tanggal kedaluwarsa, CVC, dan nama pemegang kartu.')
        return
      }
      localStorage.setItem('vintage_delivery_address', this.address.trim())
      localStorage.setItem('vintage_delivery_option', this.selectedDelivery)
      localStorage.setItem('vintage_payment_method', this.paymentMethod)
      localStorage.setItem('vintage_paylater_term', this.paylaterTerm)
      localStorage.setItem('vintage_order_details', JSON.stringify({ address: this.address.trim(), delivery: this.selectedDeliveryOption, paymentMethod: this.paymentMethod, paylaterTerm: this.paymentMethod === 'paylater' ? this.paylaterTerm : '', cardholderName: this.paymentMethod === 'credit-card' ? this.cardForm.name : '' }))
      const orders = JSON.parse(localStorage.getItem('vintage_orders') || '[]')
      const orderId = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`
      this.currentOrderId = orderId
      orders.unshift({
        id: orderId,
        date: new Date().toLocaleDateString('en-GB'),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        items: this.cartItems.map((item) => ({ ...item })),
        address: this.address.trim(),
        delivery: this.selectedDeliveryOption.label,
        shippingFee: this.shippingFee,
        protectionFee: this.protectionFee,
        paymentFee: this.paymentFee,
        subtotal: this.orderSubtotal,
        paymentMethod: this.paymentMethod,
        paylaterTerm: this.paymentMethod === 'paylater' ? this.paylaterTerm : '',
        total: this.total,
      })
      localStorage.setItem('vintage_orders', JSON.stringify(orders))
      await this.removePurchasedItemsFromCart()
      this.openWhatsAppOrder()
      this.showSuccessModal = true
    },
    async removePurchasedItemsFromCart() {
      try {
        const cartItems = await fetchCart()
        const purchasedItems = new Map(this.cartItems.map((item) => [item.id, Number(item.qty || 0)]))
        for (const item of cartItems) {
          const boughtQty = purchasedItems.get(item.id) || 0
          if (!boughtQty) continue
          const remainingQty = Number(item.qty || 0) - boughtQty
          if (remainingQty > 0) await updateCartQty(item.id, remainingQty)
          else await removeCartItem(item.id)
        }
        this.cartCount = await getCartCount()
      } catch (error) {
        this.cartCount = 0
      }
    },
    closeModal() {
      this.showSuccessModal = false
    },
    continueShopping() {
      localStorage.removeItem('vintage_checkout_items')
      this.$router.push({ name: 'home' })
    },
    goToHistory() {
      localStorage.removeItem('vintage_checkout_items')
      this.$router.push({ name: 'settings', query: { section: 'history' } })
    },
    toHome() {
      localStorage.removeItem('vintage_checkout_items')
      this.$router.push({ name: 'home' })
    },
    goToCart() {
      this.$router.push({ name: 'cart' })
    },
    goToFavorites() {
      this.$router.push({ name: 'favorites' })
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
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  background: transparent;
  border: 1px solid #d9d9d9;
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
  border: 0;
  background: transparent;
  cursor: pointer;
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

.checkout-panel {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.panel-block {
  background: rgba(255,255,255,0.45);
  border: 1px solid #e4e4e4;
  border-radius: 10px;
  padding: 14px 16px;
}

.panel-block h2 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.checkout-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #ededed;
}

.checkout-item img {
  width: 68px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
}

.checkout-copy {
  flex: 1;
}

.checkout-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.checkout-copy h3 {
  margin: 0;
  font-size: 12px;
  font-weight: 600;
}

.checkout-copy p {
  margin: 4px 0 0;
  color: #7a7a7a;
  font-size: 11px;
}

.checkout-copy strong {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: #1d1d1d;
}

.checkout-qty {
  font-size: 11px;
  color: #666;
}

.address-box,
.delivery-box,
.payment-box {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f8f8f8;
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  padding: 12px;
}

.pin,
.truck {
  font-size: 18px;
}

.address-box span:last-child {
  font-size: 12px;
  line-height: 1.5;
  color: #2b2b2b;
}

.editable-box {
  align-items: flex-start;
}

.editable-box textarea,
.control-field select {
  width: 100%;
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font: inherit;
}

.editable-box textarea {
  min-height: 72px;
  padding: 8px 10px;
  resize: vertical;
  font-size: 12px;
  line-height: 1.45;
}

.control-field {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 5px;
}

.control-field > span {
  color: #555;
  font-size: 11px;
  font-weight: 600;
}

.control-field select {
  min-height: 34px;
  padding: 6px 9px;
  font-size: 12px;
}

.control-field small {
  color: #888;
  font-size: 10px;
}

.control-field input {
  width: 100%;
  min-height: 34px;
  padding: 6px 9px;
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font: inherit;
  font-size: 12px;
}

.card-fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 12px;
  padding: 12px;
  border: 1px solid #e3e3e3;
  border-radius: 6px;
  background: #f8f8f8;
}

.card-fields-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.payment-instructions,
.paylater-fields {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 12px;
  padding: 11px 12px;
  border: 1px solid #dce8e8;
  border-radius: 6px;
  background: #f3fbfb;
  color: #3e5555;
  font-size: 11px;
}

.payment-instructions strong {
  color: #087b7c;
  font-size: 12px;
}

.payment-instructions small,
.paylater-fields small {
  color: #777;
  font-size: 10px;
}

.paylater-fields .control-field select {
  background: #fff;
}

.delivery-box strong,
.payment-copy strong {
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
}

.delivery-box p,
.payment-copy p {
  margin: 0;
  color: #666;
  font-size: 11px;
}

.delivery-box small,
.payment-copy small {
  display: block;
  margin-top: 4px;
  color: #888;
  font-size: 10px;
}

.payment-box {
  display: flex;
  align-items: center;
  gap: 14px;
}

.visa-mark {
  background: #1b4ec7;
  color: white;
  font-weight: 700;
  font-size: 12px;
  letter-spacing: 1px;
  border-radius: 4px;
  padding: 8px 10px;
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

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.3);
  z-index: 50;
}

.success-modal {
  width: min(92vw, 360px);
  background: white;
  border-radius: 12px;
  padding: 26px 22px 18px;
  box-shadow: 0 18px 36px rgba(0,0,0,0.16);
  text-align: center;
}

.modal-badge {
  width: 52px;
  height: 52px;
  margin: 0 auto 12px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  background: #f0f0f0;
  font-size: 28px;
}

.success-modal h3 {
  margin: 0 0 10px;
  font-size: 20px;
  line-height: 1.3;
  color: #222;
}

.success-modal p {
  margin: 0 auto 18px;
  max-width: 260px;
  color: #666;
  font-size: 12px;
  line-height: 1.5;
}

.primary-modal-btn,
.secondary-modal-btn {
  width: 100%;
  border-radius: 6px;
  height: 42px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.primary-modal-btn {
  background: linear-gradient(180deg, #2ac1cd, #1da9b4);
  border: 0;
  color: white;
}

.secondary-modal-btn {
  margin-top: 8px;
  background: linear-gradient(180deg, #2ac1cd, #1da9b4);
  border: 0;
  color: white;
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
