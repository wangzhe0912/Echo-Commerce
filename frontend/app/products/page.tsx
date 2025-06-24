'use client'

import { useState, useEffect } from 'react'
import { productAPI, cartAPI } from '@/lib/api'
import { Product } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { showError, showWarning, showCartNotification, showLoading, updateNotification } from '@/lib/notifications'
import { PageLoading, ProductGridSkeleton } from '@/components/LoadingSpinner'
import ErrorState, { EmptyState } from '@/components/ErrorState'
import { Package, ShoppingCart } from 'lucide-react'
import Button from '@/components/Button'
import Link from 'next/link'

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await productAPI.getProducts()
      setProducts(response)
    } catch (err) {
      setError('获取商品信息失败')
      console.error('Error fetching products:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const addToCart = async (productId: string, productName: string) => {
    if (!user) {
      showWarning('请先登录再添加商品到购物车')
      return
    }

    setLoadingProductId(productId)

    try {
      await cartAPI.addToCart(productId, 1)
      showCartNotification(productName, 'added')
    } catch (err) {
      showError('添加到购物车失败')
      console.error('Error adding to cart:', err)
    } finally {
      setLoadingProductId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">商品展示</h1>
            <p className="mt-4 text-lg text-gray-600">发现精选商品</p>
          </div>
          <ProductGridSkeleton count={8} />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <ErrorState
        title="加载商品失败"
        message={error}
        onRetry={fetchProducts}
        showHomeButton={true}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">商品展示</h1>
          <p className="mt-4 text-lg text-gray-600">发现精选商品</p>
        </div>

        {products.length === 0 ? (
          <EmptyState
            title="暂无商品"
            message="商店暂时没有商品，请稍后再来查看"
            actionText="返回首页"
            actionHref="/"
            icon={
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-500" />
              </div>
            }
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                {/* 可点击的商品信息区域 */}
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={product.image_url || 'https://via.placeholder.com/300x200/e5e7eb/9ca3af?text=暂无图片'}
                      alt={product.name}
                      className="w-full h-48 object-cover hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="p-4 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors">{product.name}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-blue-600">¥{product.price}</span>
                      <span className="text-sm text-gray-500">库存: {product.stock}</span>
                    </div>
                  </div>
                </Link>
                
                {/* 购物车按钮区域 */}
                <div className="px-4 pb-4">
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart(product.id, product.name);
                    }}
                    disabled={product.stock === 0}
                    loading={loadingProductId === product.id}
                    loadingText="添加中..."
                    icon={<ShoppingCart className="w-4 h-4" />}
                    fullWidth
                    variant={product.stock === 0 ? 'secondary' : 'primary'}
                  >
                    {product.stock === 0 ? '缺货' : '加入购物车'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 