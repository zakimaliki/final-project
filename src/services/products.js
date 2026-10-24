import axios from 'axios'
import imgCubsWhite from '@/assets/img/Vintagechicagocubswhitecrewneck.png'
import imgRedCrewneck from '@/assets/img/Red Crewneck.png'
import imgNecklaceFlower from '@/assets/img/Necklaceflower.png'
import imgNecklaceBlue from '@/assets/img/Necklaceblue.png'
import imgNecklaceYellow from '@/assets/img/Necklace yeellow.png'
import imgCubsYellow from '@/assets/img/Vintagechicagocubswhitecrewneckyellow.png'
import imgRedCrewneckBlack from '@/assets/img/RedCrewneckblack.png'
import imgNecklaceBlack from '@/assets/img/Necklaceblack.png'
import imgNecklaceGreen from '@/assets/img/Necklacegreeen.png'
import imgNecklacePurple from '@/assets/img/Necklacepurple.png'

const BASE_URL = 'https://vintage-8d691-default-rtdb.firebaseio.com'

export const productEndpoints = {
  list: `${BASE_URL}/products.json`,
  detail: (id) => `${BASE_URL}/products/${id}.json`,
}

const localImages = {
  'Vintagechicagocubswhitecrewneck.png': imgCubsWhite,
  'Red Crewneck.png': imgRedCrewneck,
  'Necklaceflower.png': imgNecklaceFlower,
  'Necklaceblue.png': imgNecklaceBlue,
  'Necklace yeellow.png': imgNecklaceYellow,
  'Vintagechicagocubswhitecrewneckyellow.png': imgCubsYellow,
  'RedCrewneckblack.png': imgRedCrewneckBlack,
  'Necklaceblack.png': imgNecklaceBlack,
  'Necklacegreeen.png': imgNecklaceGreen,
  'Necklacepurple.png': imgNecklacePurple,
}

function formatRupiah(value) {
  const amount = Number(String(value ?? '').replace(/[^0-9]/g, ''))
  if (!Number.isFinite(amount)) return 'Rp0'
  return `Rp${amount.toLocaleString('id-ID')}`
}

function resolveImage(image) {
  if (!image) return imgCubsWhite
  if (String(image).startsWith('http')) return image
  return localImages[image] || image
}

export function mapProduct(id, item = {}) {
  return {
    id,
    name: item.name || '',
    price: formatRupiah(item.price),
    rawPrice: String(item.price ?? ''),
    size: item.size || '',
    likes: Number(item.likes || 0),
    image: resolveImage(item.image),
    imageName: item.image || '',
    brand: item.brand || '',
    category: item.category || '',
    color: item.color || '',
    condition: item.condition || '',
    description: item.description || '',
    uploaded: item.uploaded || '',
    shipping: formatRupiah(item.shipping),
    rawShipping: String(item.shipping ?? ''),
  }
}

export function mapProductList(data) {
  if (!data || typeof data !== 'object') return []

  return Object.keys(data).map((id) => mapProduct(id, data[id]))
}

export async function fetchProducts() {
  const response = await axios.get(productEndpoints.list)
  return mapProductList(response.data)
}

export async function fetchProductById(id) {
  const response = await axios.get(productEndpoints.detail(id))
  if (!response.data) return null
  return mapProduct(id, response.data)
}
