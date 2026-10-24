import { get, ref, remove, set } from 'firebase/database'
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

export function mapFavorite(product) {
  return {
    name: product.name || '',
    price: String(product.rawPrice || product.price || ''),
    size: product.size || '',
    likes: Number(product.likes || 0),
    image: product.imageName || product.image || '',
    brand: product.brand || '',
    category: product.category || '',
    color: product.color || '',
    condition: product.condition || '',
    description: product.description || '',
    uploaded: product.uploaded || '',
    shipping: String(product.rawShipping || product.shipping || ''),
  }
}

export async function fetchFavorites() {
  const uid = auth.currentUser?.uid
  if (!uid) return []

  const snapshot = await get(ref(db, `users/${uid}/favorites`))
  const data = snapshot.val()
  if (!data || typeof data !== 'object') return []

  return Object.keys(data).map((id) => mapProduct(id, data[id]))
}

export async function addFavorite(product) {
  const uid = requireUid()
  if (!product?.id) throw new Error('Product id is required.')

  await set(ref(db, `users/${uid}/favorites/${product.id}`), mapFavorite(product))
}

export async function removeFavorite(productId) {
  const uid = requireUid()
  await remove(ref(db, `users/${uid}/favorites/${productId}`))
}
