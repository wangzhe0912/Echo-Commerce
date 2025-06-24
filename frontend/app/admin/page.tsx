'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { PageLoading } from '@/components/LoadingSpinner';
import { PermissionError } from '@/components/ErrorState';
import { showError } from '@/lib/notifications';
import { 
  Package, 
  ShoppingCart, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  BarChart3,
  Settings,
  Shield,
  Database
} from 'lucide-react';

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!user.is_admin) {
        return; // 会显示权限错误
      }
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // 获取管理员统计数据
      const statsData = await adminAPI.getStats();
      
      setStats({
        totalProducts: statsData.total_products,
        totalOrders: statsData.total_orders,
        totalUsers: statsData.total_users,
        totalRevenue: statsData.total_revenue
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      showError('加载管理员数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 检查权限
  if (!authLoading && (!user || !user.is_admin)) {
    return <PermissionError />;
  }

  if (authLoading || loading) {
    return <PageLoading text="加载管理后台中..." />;
  }

  const statCards = [
    {
      title: '商品总数',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: '订单总数',
      value: stats?.totalOrders || 0,
      icon: ShoppingCart,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: '注册用户',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: '总收入',
      value: `¥${stats?.totalRevenue || 0}`,
      icon: TrendingUp,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600'
    }
  ];

  const quickActions = [
    {
      title: '商品管理',
      description: '添加、编辑、删除商品',
      icon: Package,
      href: '/admin/products',
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      title: '订单管理',
      description: '查看和管理所有订单',
      icon: ShoppingCart,
      href: '/admin/orders',
      color: 'bg-green-600 hover:bg-green-700'
    },
    {
      title: '用户管理',
      description: '管理用户账户和权限',
      icon: Users,
      href: '/admin/users',
      color: 'bg-purple-600 hover:bg-purple-700'
    },
    {
      title: '数据统计',
      description: '查看销售和用户统计',
      icon: BarChart3,
      href: '/admin/analytics',
      color: 'bg-indigo-600 hover:bg-indigo-700'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">管理后台</h1>
                <p className="text-sm text-gray-600">欢迎，{user?.username}</p>
              </div>
            </div>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              返回商店
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => {
            const IconComponent = card.icon;
            return (
              <div key={index} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <IconComponent className={`w-6 h-6 ${card.textColor}`} />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-sm font-medium text-gray-500">{card.title}</h3>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 快捷操作 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">快捷操作</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon;
              return (
                <Link
                  key={index}
                  href={action.href}
                  className={`block p-6 rounded-lg text-white transition-colors ${action.color}`}
                >
                  <IconComponent className="w-8 h-8 mb-3" />
                  <h3 className="font-semibold mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 系统状态 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最近活动 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              最近活动
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">系统启动</span>
                <span className="text-xs text-gray-500">刚刚</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">数据库连接正常</span>
                <span className="text-xs text-green-600">正常</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">商品数据已加载</span>
                <span className="text-xs text-green-600">完成</span>
              </div>
            </div>
          </div>

          {/* 系统信息 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Database className="w-5 h-5 mr-2" />
              系统信息
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">系统版本</span>
                <span className="text-sm font-medium">Echo-Commerce v1.0</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">数据库状态</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  在线
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-600">最后更新</span>
                <span className="text-sm text-gray-500">
                  {new Date().toLocaleString('zh-CN')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 开发提示 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Settings className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">开发提示</h3>
              <p className="text-sm text-blue-700 mt-1">
                这是管理后台的首页。各个管理模块（商品管理、订单管理等）的详细页面可以根据需要进一步开发。
                当前已实现基础的商品CRUD API，可以在此基础上构建完整的管理界面。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 