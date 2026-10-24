<template>
	<div class="detail-page">
		<header class="detail-navbar">
			<button class="detail-logo-button" aria-label="Back to home" @click="goHome"><img src="../assets/img/LogoHorizontal.png" alt="Vintage" class="detail-logo" /></button>
			<label class="detail-search"><span aria-hidden="true">⌕</span><input type="search" :placeholder="t('searchPlaceholder')" /></label>
			<nav class="detail-actions" aria-label="Account actions">
				<button class="action-icon" aria-label="Shopping cart" @click="goToCart">🛒<b>{{ cartCount }}</b></button>
				<button class="action-icon" aria-label="Favorites" @click="goToFavorites">♡<b>{{ favoriteCount }}</b></button>
				<img :src="profileImage" alt="Profile" class="detail-avatar" @click="goToProfile" /><label class="detail-language" aria-label="Choose language"><select :value="language" @change="onLanguageChange"><option value="EN">EN</option><option value="ID">ID</option></select></label>
			</nav>
		</header>

		<main class="detail-content">
			<p v-if="isLoading" class="product-status">{{ t('loadingProduct') }}</p>
			<p v-else-if="loadError" class="product-status">{{ t(loadError) }}</p>
			<div v-else class="product-layout">
				<section class="product-gallery">
					<img :src="selectedImage" :alt="activeProduct.name" class="main-product-image" @error="handleImageError" />
					<h2>{{ t('otherProduct') }}</h2>
					<div class="other-products">
						<article v-for="relatedProduct in relatedProducts" :key="relatedProduct.id" class="mini-product">
							<img :src="relatedProduct.image" :alt="relatedProduct.name" @click="selectProduct(relatedProduct)" @error="handleImageError" />
							<strong>{{ relatedProduct.price }}</strong><span>{{ relatedProduct.name }}</span><small>{{ relatedProduct.size }} <em>♡ {{ relatedProduct.likes }}</em></small>
						</article>
					</div>
				</section>

				<aside class="product-summary">
					<div class="summary-heading"><div><p class="product-price">{{ activeProduct.price }}</p><h1>{{ activeProduct.name }}</h1></div><button class="favorite" :class="{ active: isFavorite }" aria-label="Add to favorites" @click="toggleFavorite">{{ isFavorite ? '♥' : '♡' }}</button></div>
					<p class="muted">5.0 · {{ activeProduct.condition }} · {{ activeProduct.size }}</p><hr />
					<p class="summary-label">{{ t('itemDescription') }}</p><p class="description">{{ activeProduct.description }}</p>
					<dl class="details-list"><div><dt>{{ t('brand') }}</dt><dd>{{ activeProduct.brand }}</dd></div><div><dt>{{ t('category') }}</dt><dd>{{ activeProduct.category }}</dd></div><div><dt>{{ t('size') }}</dt><dd>{{ activeProduct.size }}</dd></div><div><dt>{{ t('condition') }}</dt><dd>{{ activeProduct.condition }}</dd></div><div><dt>{{ t('color') }}</dt><dd>{{ activeProduct.color }}</dd></div><div><dt>{{ t('uploaded') }}</dt><dd>{{ activeProduct.uploaded }}</dd></div><div><dt>{{ t('shipping') }}</dt><dd>{{ activeProduct.shipping }}</dd></div></dl>
					<button class="buy-button" @click="addToCart">{{ t('buyNow') }}</button><button class="cart-button" @click="addToCart">{{ t('addToCart') }}</button>
					<div class="seller-card"><img src="../assets/img/profile-user.jpg" alt="Seller" /><div><strong>Jack on the cover</strong><span>★★★★★</span></div></div>
				</aside>
			</div>
		</main>

		<footer class="detail-footer"><div class="footer-columns"><div><strong>Vintage</strong><a>About us</a><a>Sustainability</a><a>Blog</a><a>Advertising</a></div><div><strong>Discover</strong><a>How it works</a><a>Help center</a><a>Infoboard</a><a>Mobile apps</a></div><div><strong>Help</strong><a>Help center</a><a>Buying</a><a>Trust &amp; Safety</a></div><div><strong>Community</strong><a>Forum</a></div></div><div class="footer-bottom"><span class="social-links"><a href="#" aria-label="WhatsApp"><i class="fa-brands fa-whatsapp"></i></a><a href="#" aria-label="Instagram"><i class="fa-brands fa-instagram"></i></a><a href="#" aria-label="LinkedIn"><i class="fa-brands fa-linkedin"></i></a></span><small>© Vintage, 2023</small></div></footer>

		<div v-if="showCart" class="modal-backdrop" @click.self="showCart = false"><section class="cart-modal" role="dialog" aria-modal="true" aria-labelledby="cart-title"><button class="modal-close" aria-label="Close" @click="showCart = false">×</button><div class="cart-icon">🛒</div><h2 id="cart-title" class="cart-success-title">{{ t('cartSuccessTitle') }}</h2><p>“{{ activeProduct.name }}” {{ t('cartSuccessText') }}</p><button class="continue-button" @click="showCart = false">{{ t('continueShopping') }}</button><button class="go-cart-button" @click="goToCart">{{ t('goToCart') }}</button></section></div>
	</div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import cubsWhite from '../assets/img/Vintagechicagocubswhitecrewneck.png'
import defaultProfileImage from '../assets/img/profile-user.jpg'
import { fetchProductById, fetchProducts } from '@/services/products'
import { addFavorite, fetchFavorites, removeFavorite } from '@/services/favorites'
import { addToCart as addProductToCart, getCartCount } from '@/services/cart'
import { auth } from '@/firebase'
import { useI18n } from '@/services/i18n'

const emit = defineEmits(['go-home'])
const route = useRoute()
const router = useRouter()
const { language, t, setLanguage } = useI18n()
const profileImage = ref(localStorage.getItem('vintage_profile_image') || defaultProfileImage)
const emptyProduct = {
	id: '',
	name: '',
	price: '',
	size: '',
	likes: 0,
	image: '',
	brand: '',
	category: '',
	color: '',
	condition: '',
	description: '',
	uploaded: '',
	shipping: '',
}
const selectedImage = ref(cubsWhite)
const activeProduct = ref({ ...emptyProduct })
const relatedProducts = ref([])
const isLoading = ref(false)
const loadError = ref('')
const showCart = ref(false)
const cartCount = ref(0)
const favoriteCount = ref(0)
const isFavorite = ref(false)
async function syncHeaderCounts() {
	try {
		cartCount.value = await getCartCount()
	} catch (error) {
		cartCount.value = 0
	}
	try {
		const favorites = await fetchFavorites()
		favoriteCount.value = favorites.length
		isFavorite.value = favorites.some((item) => item.id === activeProduct.value.id)
	} catch (error) {
		favoriteCount.value = 0
		isFavorite.value = false
	}
}
async function loadDetail(id) {
	if (!id) return
	isLoading.value = true
	loadError.value = ''
	try {
		const [product, list] = await Promise.all([
			fetchProductById(id),
			fetchProducts(),
		])
		if (!product) {
			activeProduct.value = { ...emptyProduct }
			relatedProducts.value = []
			loadError.value = 'productNotFound'
			return
		}
		activeProduct.value = product
		selectedImage.value = product.image || cubsWhite
		relatedProducts.value = list.filter((item) => item.id !== id).slice(0, 8)
		syncHeaderCounts()
	} catch (error) {
		activeProduct.value = { ...emptyProduct }
		relatedProducts.value = []
		loadError.value = 'productDetailError'
	} finally {
		isLoading.value = false
	}
}
onMounted(syncHeaderCounts)
watch(() => route.params.id, (id) => {
	loadDetail(id)
}, { immediate: true })
function selectProduct(relatedProduct) {
	if (!relatedProduct?.id || relatedProduct.id === route.params.id) return
	router.push({ name: 'detail', params: { id: relatedProduct.id } })
}
function handleImageError(event) {
	event.target.src = cubsWhite
	event.target.onerror = null
}
function goHome() {
	router.push({ name: 'home' })
	emit('go-home')
}
function goToCart() {
	showCart.value = false
	router.push({ name: 'cart' })
}
function goToProfile() {
	router.push({ name: 'settings' })
}
function goToFavorites() {
	router.push({ name: 'favorites' })
}
async function addToCart() {
	if (!activeProduct.value.id) return
	if (!auth.currentUser) {
		router.push({ name: 'login', query: { redirect: route.fullPath } })
		return
	}

	try {
		await addProductToCart(activeProduct.value, 1)
		cartCount.value = await getCartCount()
		showCart.value = true
	} catch (error) {
		loadError.value = 'productDetailError'
	}
}
function onLanguageChange(event) {
	setLanguage(event.target.value)
}
async function toggleFavorite() {
	if (!activeProduct.value.id) return
	if (!auth.currentUser) {
		router.push({ name: 'login', query: { redirect: route.fullPath } })
		return
	}

	const wasFavorite = isFavorite.value
	isFavorite.value = !wasFavorite
	try {
		if (wasFavorite) await removeFavorite(activeProduct.value.id)
		else await addFavorite(activeProduct.value)
		const favorites = await fetchFavorites()
		favoriteCount.value = favorites.length
		isFavorite.value = favorites.some((item) => item.id === activeProduct.value.id)
	} catch (error) {
		isFavorite.value = wasFavorite
	}
}
</script>

<style scoped>
:global(*) { box-sizing: border-box; } :global(body) { margin: 0; background: #fff; font-family: Arial, Helvetica, sans-serif; color: #242424; } button, input { font: inherit; } button { cursor: pointer; } .detail-logo-button { padding: 0; border: 0; background: transparent; }
.detail-page { width: 100%; min-height: 100vh; background: #fff; font-size: 12px; }.detail-navbar { height: 54px; padding: 0 24px; display: flex; align-items: center; gap: 25px; border-bottom: 1px solid #dedede; }.detail-logo { width: 88px; height: auto; }.detail-search { height: 28px; flex: 1; max-width: 555px; display: flex; align-items: center; gap: 7px; padding: 0 10px; border: 1px solid #d6d6d6; border-radius: 4px; color: #aaa; }.detail-search input { width: 100%; border: 0; outline: 0; font-size: 11px; }.detail-actions { margin-left: auto; display: flex; align-items: center; gap: 15px; color: #777; }.action-icon { position: relative; padding: 0; border: 0; background: none; color: #555; font-size: 17px; }.action-icon b { position: absolute; top: -7px; right: -7px; min-width: 13px; height: 13px; padding: 1px; border-radius: 50%; background: #f08b45; color: #fff; font-size: 8px; font-weight: normal; }.detail-avatar { width: 25px; height: 25px; border-radius: 50%; object-fit: cover; }.detail-language select { appearance: none; border: 0; padding: 3px 12px 3px 0; background: transparent; color: #777; cursor: pointer; font-size: 10px; }
.product-status { margin: 0 0 16px; color: #2c6367; font-size: 13px; }.detail-content { padding: 20px 52px 58px; }.product-layout { display: grid; grid-template-columns: minmax(0, 1.55fr) minmax(255px, .8fr); gap: 24px; }.main-product-image { display: block; width: 100%; aspect-ratio: 1.45; object-fit: cover; background: #eee; }.product-gallery h2 { margin: 20px 0 14px; font-size: 13px; font-weight: normal; }.other-products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 22px 12px; }.mini-product { min-width: 0; display: flex; flex-direction: column; gap: 2px; font-size: 9px; }.mini-product img { width: 100%; aspect-ratio: 1; object-fit: cover; background: #f2f2f2; cursor: pointer; }.mini-product strong { color: #008f91; font-size: 9px; font-weight: normal; }.mini-product span { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; color: #555; }.mini-product small { color: #999; font-size: 8px; }.mini-product em { float: right; font-style: normal; }
.product-summary { padding-top: 2px; }.summary-heading { display: flex; justify-content: space-between; gap: 10px; }.product-price { margin: 0 0 8px; font-size: 16px; }.summary-heading h1 { max-width: 190px; margin: 0; font-size: 12px; font-weight: normal; line-height: 1.4; }.favorite { border: 0; background: none; font-size: 19px; color: #777; }.favorite.active { color: #d0124a; }.muted { margin: 9px 0 12px; color: #999; font-size: 9px; }.product-summary hr { border: 0; border-top: 1px solid #eee; }.summary-label { margin: 15px 0 5px; font-size: 9px; font-weight: bold; }.description { margin: 0 0 14px; color: #666; font-size: 9px; line-height: 1.5; }.details-list { margin: 0 0 17px; font-size: 9px; }.details-list div { display: grid; grid-template-columns: 90px 1fr; margin: 6px 0; }.details-list dt { color: #999; }.details-list dd { margin: 0; color: #555; }.buy-button, .cart-button { width: 100%; height: 27px; border-radius: 2px; font-size: 9px; }.buy-button { border: 1px solid #008f91; background: #008f91; color: #fff; }.cart-button { margin-top: 7px; border: 1px solid #008f91; background: #fff; color: #008f91; }.seller-card { display: flex; align-items: center; gap: 8px; margin-top: 13px; padding: 7px; border: 1px solid #eee; font-size: 9px; }.seller-card img { width: 23px; height: 23px; border-radius: 50%; object-fit: cover; }.seller-card div { display: flex; flex-direction: column; gap: 2px; }.seller-card span { color: #f39a27; letter-spacing: 1px; }
.detail-footer { padding: 30px 52px 17px; background: #087b7c; color: #fff; }.footer-columns { display: grid; grid-template-columns: repeat(4, 1fr); gap: 30px; }.footer-columns div { display: flex; flex-direction: column; gap: 7px; }.footer-columns strong { margin-bottom: 4px; font-size: 10px; font-weight: normal; }.footer-columns a { color: #d3eeee; font-size: 8px; }.footer-bottom { display: flex; justify-content: space-between; margin-top: 26px; padding-top: 13px; border-top: 1px solid rgba(255,255,255,.16); color: #c7e8e8; font-size: 9px; }.footer-bottom small { font-size: 8px; }.footer-bottom .social-links { display: flex; align-items: center; gap: 22px; }.footer-bottom .social-links a { color: #fff; font-size: 22px; text-decoration: none; line-height: 1; }
.modal-backdrop { position: fixed; inset: 0; display: grid; place-items: center; background: rgba(0,0,0,.56); z-index: 5; }.cart-modal { position: relative; width: 250px; padding: 22px 18px 17px; text-align: center; background: #fff; border-radius: 3px; box-shadow: 0 8px 30px rgba(0,0,0,.25); }.modal-close { position: absolute; top: 5px; right: 8px; border: 0; background: none; color: #aaa; font-size: 19px; }.cart-icon { display: grid; place-items: center; width: 43px; height: 43px; margin: 0 auto 12px; border-radius: 50%; background: #ffad00; font-size: 19px; }.cart-modal h2, .cart-success-title { margin: 0 0 10px; font-size: 12px; line-height: 1.3; white-space: pre-line; }.cart-modal p { margin: 0 auto 16px; max-width: 195px; color: #888; font-size: 8px; line-height: 1.4; }.continue-button, .go-cart-button { width: 100%; height: 25px; font-size: 9px; border-radius: 2px; }.continue-button { border: 1px solid #00a0a0; background: #fff; color: #008f91; }.go-cart-button { margin-top: 6px; border: 0; background: #008f91; color: #fff; }
@media (max-width: 700px) { .detail-navbar { padding: 0 16px; gap: 12px; }.detail-actions { gap: 8px; }.detail-content { padding: 18px; }.product-layout { grid-template-columns: 1fr; }.product-summary { padding-top: 8px; }.detail-footer { padding: 28px 18px 16px; } }
</style>
