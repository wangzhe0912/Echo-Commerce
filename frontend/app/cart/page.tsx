'use client'

import { useState, useEffect } from 'react'
import { cartAPI, orderAPI } from '@/lib/api'
import { Cart } from '@/types'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { showError, showSuccess, showWarning, showOrderNotification, showLoading, updateNotification } from '@/lib/notifications'
import Button, { SecondaryButton } from '@/components/Button'
import { ShoppingBag, Trash2 } from 'lucide-react'

export default function CartPage() {
  const [cart, setCart] = useState<Cart | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }
    fetchCart()
  }, [user, router])

  const fetchCart = async () => {
    try {
      setIsLoading(true)
      const response = await cartAPI.getCart()
      setCart(response)
    } catch (err) {
      setError('获取购物车信息失败')
      console.error('Error fetching cart:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId)
      return
    }

    try {
      await cartAPI.updateCartItem(itemId, quantity)
      await fetchCart()
      showSuccess('商品数量已更新', { duration: 1500 })
    } catch (err) {
      showError('更新商品数量失败')
      console.error('Error updating quantity:', err)
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      await cartAPI.removeFromCart(itemId)
      await fetchCart()
      showSuccess('商品已从购物车移除', { duration: 1500 })
    } catch (err) {
      showError('删除商品失败')
      console.error('Error removing item:', err)
    }
  }

  const checkout = async () => {
    if (!cart || cart.items.length === 0) {
      showWarning('购物车为空，请先添加商品')
      return
    }

    const loadingToast = showLoading('正在创建订单...')
    
    try {
      setIsCheckingOut(true)
      const order = await orderAPI.createOrder()
      updateNotification(loadingToast, '订单创建成功！', 'success')
      showOrderNotification(order.order_number, 'created')
      await fetchCart() // 刷新购物车
      router.push('/orders')
    } catch (err) {
      updateNotification(loadingToast, '创建订单失败', 'error')
      console.error('Error creating order:', err)
    } finally {
      setIsCheckingOut(false)
    }
  }

  if (!user) {
    return null
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">加载购物车中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchCart}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            重试
          </button>
        </div>
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">购物车</h1>
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">购物车为空</p>
            <Link
              href="/products"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              去购物
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">购物车</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            {cart.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center space-x-4">
                  <img
                    src={item.product_image_url || '/placeholder-product.jpg'}
                    alt={item.product_name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.product_name}</h3>
                    <p className="text-gray-600">¥{item.product_price}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-semibold">¥{item.subtotal}</p>
                  </div>
                  
                  <button
                    onClick={() => removeItem(item.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold">总计：</span>
              <span className="text-2xl font-bold text-blue-600">¥{cart.total_amount}</span>
            </div>
            
            <div className="flex space-x-4">
              <Link
                href="/products"
                className="flex-1"
              >
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<ShoppingBag className="w-5 h-5" />}
                >
                  继续购物
                </Button>
              </Link>
              <Button
                onClick={checkout}
                loading={isCheckingOut}
                loadingText="处理中..."
                size="lg"
                fullWidth
                icon={<ShoppingBag className="w-5 h-5" />}
                className="flex-1"
              >
                结算
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 