'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';
import { PageLoading } from '@/components/LoadingSpinner';
import { PermissionError, EmptyState } from '@/components/ErrorState';
import { showSuccess, showError, showConfirm } from '@/lib/notifications';
import { User } from '@/types';
import { 
  Users, 
  ArrowLeft,
  Search,
  Shield,
  ShieldCheck,
  Calendar,
  UserCheck
} from 'lucide-react';

export default function AdminUsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
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
      loadUsers();
    }
  }, [user, authLoading, router]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminAPI.getUsers(0, 1000);
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      showError('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAdmin = async (targetUser: User) => {
    const action = targetUser.is_admin ? '取消管理员权限' : '设置为管理员';
    const newStatus = !targetUser.is_admin;
    
    showConfirm(
      `确定要${action}用户 "${targetUser.username}" 吗？`,
      async () => {
        try {
          await adminAPI.setUserAdmin(targetUser.id, newStatus);
          showSuccess(`已${action}用户 "${targetUser.username}"`);
          loadUsers();
        } catch (error) {
          console.error('Failed to update user admin status:', error);
          showError(`${action}失败`);
        }
      }
    );
  };

  // 权限检查
  if (!authLoading && (!user || !user.is_admin)) {
    return <PermissionError />;
  }

  if (authLoading || loading) {
    return <PageLoading text="加载用户管理中..." />;
  }

  // 过滤用户
  const filteredUsers = users.filter(u =>
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 统计数据
  const stats = {
    total: users.length,
    admins: users.filter(u => u.is_admin).length,
    regular: users.filter(u => !u.is_admin).length,
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
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">用户管理</h1>
                <p className="text-sm text-gray-600">
                  共 {users.length} 个用户
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">总用户数</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-50">
                <ShieldCheck className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">管理员</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <UserCheck className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">普通用户</h3>
                <p className="text-2xl font-bold text-gray-900">{stats.regular}</p>
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
              placeholder="搜索用户名..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 用户列表 */}
        {filteredUsers.length === 0 ? (
          <EmptyState
            title="暂无用户"
            message={searchTerm ? '没有找到符合条件的用户' : '还没有任何用户'}
            icon={
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Users className="w-8 h-8 text-blue-500" />
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
                      用户信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      权限
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      注册时间
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((targetUser) => (
                    <tr key={targetUser.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {targetUser.username}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {targetUser.id.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          targetUser.is_admin
                            ? 'bg-red-100 text-red-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {targetUser.is_admin ? (
                            <>
                              <ShieldCheck className="w-3 h-3 mr-1" />
                              管理员
                            </>
                          ) : (
                            <>
                              <UserCheck className="w-3 h-3 mr-1" />
                              普通用户
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(targetUser.created_at).toLocaleDateString('zh-CN')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {targetUser.id !== user?.id ? (
                          <button
                            onClick={() => handleToggleAdmin(targetUser)}
                            className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                              targetUser.is_admin
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                            }`}
                          >
                            <Shield className="w-4 h-4 mr-1" />
                            {targetUser.is_admin ? '取消管理员' : '设为管理员'}
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">当前用户</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 说明信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Users className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">用户管理说明</h3>
              <p className="text-sm text-blue-700 mt-1">
                这里展示所有注册用户的信息。您可以管理用户的管理员权限，但不能修改自己的权限。
                管理员拥有系统的完全访问权限，包括商品管理、订单管理和用户管理等功能。
                请谨慎设置管理员权限。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 