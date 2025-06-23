import ProductList from '@/components/ProductList'
import Hero from '@/components/Hero'

export default function Home() {
  return (
    <div>
      <Hero />
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">热门商品</h2>
        <ProductList />
      </div>
    </div>
  )
} 