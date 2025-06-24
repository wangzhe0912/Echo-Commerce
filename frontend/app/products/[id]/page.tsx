'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { productAPI, cartAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Product } from '@/types';
import { PageLoading } from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import Button from '@/components/Button';
import { showWarning, showCartNotification, showError } from '@/lib/notifications';
import { 
  ShoppingCart, 
  ArrowLeft, 
  Star, 
  Package, 
  Truck, 
  Shield, 
  RefreshCw,
  Plus,
  Minus
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);

  const productId = params.id as string;

  useEffect(() => {
    if (productId) {
      fetchProduct();
    }
  }, [productId]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const productData = await productAPI.getProduct(productId);
      setProduct(productData);
    } catch (err: any) {
      console.error('Error fetching product:', err);
      setError(err.response?.data?.detail || '获取商品信息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 0)) {
      setQuantity(newQuantity);
    }
  };

  const addToCart = async () => {
    if (!user) {
      showWarning('请先登录再添加商品到购物车');
      router.push('/login');
      return;
    }

    if (!product) return;

    setAddingToCart(true);

    try {
      await cartAPI.addToCart(product.id, quantity);
      showCartNotification(product.name, 'added');
      // 重置数量为1
      setQuantity(1);
    } catch (err: any) {
      console.error('Error adding to cart:', err);
      showError('添加到购物车失败');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return <PageLoading text="加载商品详情中..." />;
  }

  if (error || !product) {
    return (
      <ErrorState
        title="获取商品详情失败"
        message={error || '商品不存在'}
        onRetry={fetchProduct}
        showHomeButton={true}
      />
    );
  }

  const isOutOfStock = product.stock === 0;
  const maxQuantity = Math.min(product.stock, 10); // 限制最大购买数量为10

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 商品图片 */}
          <div className="relative">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                             <Image
                 src={product.image_url || 'https://via.placeholder.com/400x400/e5e7eb/9ca3af?text=暂无图片'}
                 alt={product.name}
                 fill
                 className="object-cover"
                 sizes="(max-width: 1024px) 100vw, 50vw"
                 priority
               />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white text-xl font-semibold">已售罄</span>
                </div>
              )}
            </div>
          </div>

          {/* 商品信息 */}
          <div className="space-y-6">
            {/* 标题和价格 */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-4 mb-4">
                <span className="text-4xl font-bold text-blue-600">
                  ¥{product.price}
                </span>
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <Star className="w-5 h-5 text-gray-300" />
                  <span className="text-sm text-gray-600 ml-2">(4.2)</span>
                </div>
              </div>
            </div>

            {/* 商品描述 */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">商品描述</h3>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* 库存信息 */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">库存数量</span>
                <span className={`text-sm font-semibold ${isOutOfStock ? 'text-red-600' : 'text-green-600'}`}>
                  {isOutOfStock ? '缺货' : `${product.stock} 件`}
                </span>
              </div>
            </div>

            {/* 数量选择 */}
            {!isOutOfStock && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  购买数量
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-16 text-center font-medium text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= maxQuantity}
                    className="p-2 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-500">
                    (最多 {maxQuantity} 件)
                  </span>
                </div>
              </div>
            )}

            {/* 操作按钮 */}
            <div className="space-y-3">
              <Button
                onClick={addToCart}
                disabled={isOutOfStock}
                loading={addingToCart}
                loadingText="添加中..."
                icon={<ShoppingCart className="w-5 h-5" />}
                size="lg"
                fullWidth
              >
                {isOutOfStock ? '商品已售罄' : '加入购物车'}
              </Button>
              
              <Link href="/cart" className="block">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  icon={<Package className="w-5 h-5" />}
                >
                  查看购物车
                </Button>
              </Link>
            </div>

            {/* 服务保障 */}
            <div className="bg-blue-50 rounded-lg p-4 space-y-3">
              <h4 className="font-semibold text-gray-900">服务保障</h4>
              <div className="grid grid-cols-1 gap-2">
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>全国包邮，次日达</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <Shield className="w-4 h-4 text-green-600" />
                  <span>7天无理由退换</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-700">
                  <RefreshCw className="w-4 h-4 text-purple-600" />
                  <span>正品保证</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 推荐商品区域可以在这里添加 */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            您可能还喜欢
          </h2>
          <div className="text-center py-8">
            <Link
              href="/products"
              className="inline-flex items-center px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Package className="w-5 h-5 mr-2" />
              浏览更多商品
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 