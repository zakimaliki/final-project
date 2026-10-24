import { createRouter, createWebHistory } from 'vue-router'
import Home from './pages/Home.vue'
import Detail from './pages/Detail.vue'
import LoginPage from './pages/LoginPage.vue'
import RegisterPage from './pages/RegisterPage.vue'
import SuccessRegister from './pages/SuccessRegister.vue'
import CartPage from './pages/CartPage.vue'
import CheckoutPage from './pages/CheckoutPage.vue'
import EmptyCartPage from './pages/EmptyCartPage.vue'
import ProfileSettingsPage from './pages/ProfileSettingsPage.vue'
import FavoritesPage from './pages/FavoritesPage.vue'
import { resolveAuthUser } from './services/auth'

const protectedRoutes = new Set(['cart', 'checkout', 'cart-empty', 'settings', 'favorites'])
const guestOnlyRoutes = new Set(['login', 'register'])

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'home', component: Home },
    { path: '/login', name: 'login', component: LoginPage },
    { path: '/register', name: 'register', component: RegisterPage },
    { path: '/success-register', name: 'success-register', component: SuccessRegister },
    { path: '/detail/:id', name: 'detail', component: Detail },
    { path: '/cart', name: 'cart', component: CartPage },
    { path: '/checkout', name: 'checkout', component: CheckoutPage },
    { path: '/cart-empty', name: 'cart-empty', component: EmptyCartPage },
    { path: '/settings', name: 'settings', component: ProfileSettingsPage },
    { path: '/favorites', name: 'favorites', component: FavoritesPage },
  ],
})

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

export default router
