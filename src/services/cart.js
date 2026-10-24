import { get, ref, remove, set, update } from 'firebase/database'
import { auth, db } from '@/firebase'
import { mapProduct } from '@/services/products'

function requireUid() {
  const uid = auth.currentUser?.uid
  if (!uid) {
    const error = new Error('Login required.')
    error.code = 'auth/required'
    throw error
  }
  return uid
}

function toNumber(value) {
  return Number(String(value ?? '').replace(/[^0-9]/g, '')) || 0
}

export function mapCartPayload(product, qty = 1) {
  return {
    name: product.name || '',
    price: String(product.rawPrice || toNumber(product.price)),
    size: product.size || '',
    image: product.imageName || product.image || '',
    shipping: String(product.rawShipping || toNumber(product.shipping) || 0),
    qty: Math.max(1, Number(qty || 1)),
  }
}

export function mapCartItem(id, item = {}) {
  const product = mapProduct(id, item)
  return {
    id: product.id,
    name: product.name,
    size: product.size,
    price: toNumber(product.rawPrice),
    qty: Math.max(1, Number(item.qty || 1)),
    image: product.image,
    imageName: product.imageName,
    shipping: toNumber(product.rawShipping),
  }
}

export async function fetchCart() {
  const uid = auth.currentUser?.uid
  if (!uid) return []

  const snapshot = await get(ref(db, `users/${uid}/cart`))
  const data = snapshot.val()
  if (!data || typeof data !== 'object') return []

  return Object.keys(data).map((id) => mapCartItem(id, data[id]))
}

export async function getCartCount() {
  const items = await fetchCart()
  return items.reduce((total, item) => total + Number(item.qty || 0), 0)
}

export async function addToCart(product, qty = 1) {
  const uid = requireUid()
  if (!product?.id) throw new Error('Product id is required.')

  const itemRef = ref(db, `users/${uid}/cart/${product.id}`)
  const snapshot = await get(itemRef)
  const currentQty = snapshot.exists() ? Number(snapshot.val()?.qty || 0) : 0
  const nextQty = currentQty + Math.max(1, Number(qty || 1))

  await set(itemRef, mapCartPayload(product, nextQty))
  return nextQty
}

export async function updateCartQty(productId, qty) {
  const uid = requireUid()
  const nextQty = Number(qty || 0)

  if (nextQty <= 0) {
    await remove(ref(db, `users/${uid}/cart/${productId}`))
    return 0
  }

  await update(ref(db, `users/${uid}/cart/${productId}`), { qty: nextQty })
  return nextQty
}

export async function removeCartItem(productId) {
  const uid = requireUid()
  await remove(ref(db, `users/${uid}/cart/${productId}`))
}

export async function setCartItems(items) {
  const uid = requireUid()
  const payload = {}

  for (const item of items) {
    if (!item?.id) continue
    payload[item.id] = mapCartPayload(item, item.qty)
  }

  await set(ref(db, `users/${uid}/cart`), payload)
}
