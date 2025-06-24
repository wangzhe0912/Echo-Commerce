'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { orderAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Order } from '@/types';
import { PageLoading } from '@/components/LoadingSpinner';
import ErrorState from '@/components/ErrorState';
import Button from '@/components/Button';
import { showError, showSuccess } from '@/lib/notifications';
import { 
  ArrowLeft, 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  XCircle,
  Receipt,
  Calendar,
  CreditCard,
  User
} from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const orderId = params.id as string;

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (orderId) {
      fetchOrder();
    }
  }, [user, orderId, router]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const orderData = await orderAPI.getOrder(orderId);
      setOrder(orderData);
    } catch (err: any) {
      console.error('Error fetching order:', err);
      setError(err.response?.data?.detail || '获取订单信息失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          text: '待付款',
          icon: <Clock className="w-5 h-5" />,
          description: '订单已创建，等待付款'
        };
      case 'paid':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          text: '已付款',
          icon: <CreditCard className="w-5 h-5" />,
          description: '付款成功，商家正在准备发货'
        };
      case 'shipped':
        return {
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          text: '已发货',
          icon: <Truck className="w-5 h-5" />,
          description: '商品已发货，正在运输途中'
        };
      case 'delivered':
        return {
          color: 'bg-purple-100 text-purple-800 border-purple-200',
          text: '已送达',
          icon: <CheckCircle className="w-5 h-5" />,
          description: '商品已送达，请确认收货'
        };
      case 'cancelled':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          text: '已取消',
          icon: <XCircle className="w-5 h-5" />,
          description: '订单已取消'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          text: status,
          icon: <Package className="w-5 h-5" />,
          description: '未知状态'
        };
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return <PageLoading text="加载订单详情中..." />;
  }

  if (error || !order) {
    return (
      <ErrorState
        title="获取订单详情失败"
        message={error || '订单不存在'}
        onRetry={fetchOrder}
        showHomeButton={true}
      />
    );
  }

  const statusInfo = getStatusInfo(order.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 返回按钮 */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            返回订单列表
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 订单基本信息 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                订单详情
              </h1>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <Receipt className="w-4 h-4 mr-1" />
                  <span>订单号：{order.order_number}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>下单时间：{new Date(order.created_at).toLocaleString('zh-CN')}</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${statusInfo.color}`}>
                {statusInfo.icon}
                <span className="ml-2">{statusInfo.text}</span>
              </div>
              <p className="text-sm text-gray-600 mt-2">{statusInfo.description}</p>
            </div>
          </div>

          {/* 订单金额 */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-lg font-medium text-gray-900">订单总额</span>
              <span className="text-2xl font-bold text-blue-600">¥{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* 商品列表 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            商品清单
          </h2>
          
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-4 border-b border-gray-200 last:border-b-0">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.product_name}</h3>
                  <p className="text-sm text-gray-600">单价：¥{item.product_price}</p>
                </div>
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-gray-600">x{item.quantity}</span>
                  <span className="font-medium text-gray-900 w-20 text-right">
                    ¥{item.subtotal}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* 金额汇总 */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-lg">
              <span className="font-medium text-gray-900">商品总计</span>
              <span className="font-bold text-blue-600">¥{order.total_amount}</span>
            </div>
          </div>
        </div>

        {/* 订单状态进度 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Truck className="w-5 h-5 mr-2" />
            订单状态
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['paid', 'shipped', 'delivered'].includes(order.status) 
                  ? 'bg-green-100 text-green-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <CreditCard className="w-4 h-4" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">订单已付款</p>
                <p className="text-sm text-gray-600">
                  {['paid', 'shipped', 'delivered'].includes(order.status) 
                    ? '付款成功' 
                    : '等待付款'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                ['shipped', 'delivered'].includes(order.status) 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <Truck className="w-4 h-4" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">商品已发货</p>
                <p className="text-sm text-gray-600">
                  {['shipped', 'delivered'].includes(order.status) 
                    ? '商品正在运输途中' 
                    : '等待发货'}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                order.status === 'delivered' 
                  ? 'bg-purple-100 text-purple-600' 
                  : 'bg-gray-100 text-gray-400'
              }`}>
                <CheckCircle className="w-4 h-4" />
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900">确认收货</p>
                <p className="text-sm text-gray-600">
                  {order.status === 'delivered' 
                    ? '商品已送达，交易完成' 
                    : '等待收货'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            {order.status === 'pending' && (
              <Button
                variant="primary"
                size="lg"
                icon={<CreditCard className="w-5 h-5" />}
                onClick={() => showSuccess('支付功能开发中...')}
              >
                立即付款
              </Button>
            )}
            
            {order.status === 'paid' && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => showSuccess('申请退款功能开发中...')}
              >
                申请退款
              </Button>
            )}
            
            {order.status === 'shipped' && (
              <Button
                variant="primary"
                size="lg"
                icon={<CheckCircle className="w-5 h-5" />}
                onClick={() => showSuccess('确认收货功能开发中...')}
              >
                确认收货
              </Button>
            )}
            
            <Link href="/orders" className="flex-1 sm:flex-none">
              <Button
                variant="outline"
                size="lg"
                fullWidth
                className="sm:w-auto"
              >
                返回订单列表
              </Button>
            </Link>
            
            <Link href="/products" className="flex-1 sm:flex-none">
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                className="sm:w-auto"
                icon={<Package className="w-5 h-5" />}
              >
                继续购物
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 