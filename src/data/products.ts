export type Product = {
  id: number
  name: string
  brand: string
  category: string
  price: number
  rating: number
  stock: number
  updatedAt: string // ISO date
  hue: number
}

// Small seeded random generator, so every visitor gets the same 10,000 products
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const adjectives = ['Classic', 'Smart', 'Wireless', 'Organic', 'Compact', 'Premium', 'Ergonomic', 'Vintage', 'Portable', 'Eco', 'Ultra', 'Modern']
const nouns = ['Headphones', 'Backpack', 'Desk Lamp', 'Water Bottle', 'Keyboard', 'Sneakers', 'Coffee Maker', 'Sunglasses', 'Notebook', 'Speaker', 'Watch', 'Jacket', 'Blender', 'Chair']
const brands = ['Northwind', 'Acme', 'Globex', 'Initech', 'Umbrella', 'Stark', 'Wayne', 'Hooli', 'Vandelay', 'Soylent']
const categories = ['Electronics', 'Home', 'Fashion', 'Sports', 'Office', 'Kitchen']

export const PRODUCT_COUNT = 10_000

export function generateProducts(count = PRODUCT_COUNT): Product[] {
  const rand = mulberry32(42)
  const pick = <T,>(list: T[]) => list[Math.floor(rand() * list.length)]
  const start = Date.UTC(2025, 10, 1)
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `${pick(adjectives)} ${pick(nouns)} ${100 + Math.floor(rand() * 900)}`,
    brand: pick(brands),
    category: pick(categories),
    price: Math.round((5 + rand() * 995) * 100) / 100,
    rating: Math.round((2.5 + rand() * 2.5) * 10) / 10,
    stock: Math.floor(rand() * 200),
    updatedAt: new Date(start + Math.floor(rand() * 360) * 86_400_000).toISOString(),
    hue: Math.floor(rand() * 360),
  }))
}

export const products = generateProducts()
