'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { PageLoading } from '@/components/LoadingSpinner';
import { PermissionError, EmptyState } from '@/components/ErrorState';
import { showError } from '@/lib/notifications';
import { OrderListItem } from '@/types';
import { 
  ShoppingCart, 
  ArrowLeft,
  Search,
  Eye,
  Calendar,
  DollarSign,
  Package,
  User
} from 'lucide-react';

export default function AdminOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!user.is_admin) {
        return;
      }
      loadOrders();
    }
  }, [user, authLoading, router]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getAllOrders();
      setOrders(data);
    } catch (error) {
      console.error('Failed to load orders:', error);
      showError('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 权限检查
  if (!authLoading && (!user || !user.is_admin)) {
    return <PermissionError />;
  }

  if (authLoading || loading) {
    return <PageLoading text="加载订单管理中..." />;
  }

  // 过滤订单
  const filteredOrders = orders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 状态样式映射
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态中文映射
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return '待付款';
      case 'paid':
        return '已付款';
      case 'shipped':
        return '已发货';
      case 'delivered':
        return '已收货';
      case 'cancelled':
        return '已取消';
      default:
        return status;
    }
  };

  // 统计数据
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
    paid: orders.filter(o => o.status.toLowerCase() === 'paid').length,
    shipped: orders.filter(o => o.status.toLowerCase() === 'shipped').length,
    delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
    totalRevenue: orders.reduce((sum, order) => sum + order.total_amount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/admin"
                className="flex items-center text-gray-600 hover:text-gray-900 mr-4"
              >
                <ArrowLeft className="w-5 h-5 mr-1" />
                返回管理后台
              </Link>
              <ShoppingCart className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">订单管理</h1>
                <p className="text-sm text-gray-600">
                  共 {orders.length} 个订单
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">总订单数</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50">
                <Calendar className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">待处理</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">已完成</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-orange-50">
                <DollarSign className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">总收入</h3>
                <p className="text-2xl font-bold text-gray-900">¥{stats.totalRevenue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索栏 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索订单号或状态..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 订单列表 */}
        {filteredOrders.length === 0 ? (
          <EmptyState
            title="暂无订单"
            message={searchTerm ? '没有找到符合条件的订单' : '还没有任何订单'}
            icon={
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
            }
          />
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      订单信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      金额
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      商品数量
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      创建时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-5 h-5 text-gray-400 mr-3" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {order.order_number}
                            </div>
                            <div className="text-sm text-gray-500">
                              订单 #{order.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{order.total_amount}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.item_count} 件商品
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleString('zh-CN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                          title="查看详情"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          详情
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 状态分布 */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">订单状态分布</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">待付款</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.paid}</div>
              <div className="text-sm text-gray-500">已付款</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.shipped}</div>
              <div className="text-sm text-gray-500">已发货</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
              <div className="text-sm text-gray-500">已完成</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {orders.filter(o => o.status.toLowerCase() === 'cancelled').length}
              </div>
              <div className="text-sm text-gray-500">已取消</div>
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <ShoppingCart className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">订单管理说明</h3>
              <p className="text-sm text-blue-700 mt-1">
                这里展示所有用户的订单信息。您可以查看订单详情、统计数据和状态分布。
                订单状态管理和批量操作功能可以根据需要进一步开发。
                当前展示的是从后端API获取的真实订单数据。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 