'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { productAPI } from '@/lib/api';
import { PageLoading } from '@/components/LoadingSpinner';
import { PermissionError, EmptyState } from '@/components/ErrorState';
import { showSuccess, showError, showConfirm } from '@/lib/notifications';
import { Product } from '@/types';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Search,
  Eye
} from 'lucide-react';

export default function AdminProductsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
        return;
      }
      if (!user.is_admin) {
        return;
      }
      loadProducts();
    }
  }, [user, authLoading, router]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getProducts(0, 1000);
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
      showError('加载商品列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      showConfirm(
        `确定要删除商品 "${product.name}" 吗？此操作不可恢复。`,
        async () => {
          try {
            await productAPI.deleteProduct(product.id);
            showSuccess(`商品 "${product.name}" 已删除`);
            loadProducts();
          } catch (error) {
            console.error('Failed to delete product:', error);
            showError('删除商品失败');
          }
        }
      );
    } catch (error) {
      console.error('Failed to delete product:', error);
      showError('删除商品失败');
    }
  };

  // 权限检查
  if (!authLoading && (!user || !user.is_admin)) {
    return <PermissionError />;
  }

  if (authLoading || loading) {
    return <PageLoading text="加载商品管理中..." />;
  }

  // 过滤商品
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              <Package className="w-6 h-6 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">商品管理</h1>
                <p className="text-sm text-gray-600">
                  共 {products.length} 个商品
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加商品
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索栏 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="搜索商品名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* 商品列表 */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            title="暂无商品"
            message={searchTerm ? '没有找到符合条件的商品' : '还没有添加任何商品'}
            actionText="添加第一个商品"
            actionHref="#"
            icon={
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                <Package className="w-8 h-8 text-blue-500" />
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
                      商品信息
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      价格
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      库存
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            className="h-10 w-10 rounded-lg object-cover"
                            src={product.image_url}
                            alt={product.name}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/40x40?text=商品';
                            }}
                          />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500 max-w-xs truncate">
                              {product.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ¥{product.price}
                        </div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                         <div className="text-sm text-gray-900">
                           {product.stock}
                         </div>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                           product.stock > 0
                             ? 'bg-green-100 text-green-800'
                             : 'bg-red-100 text-red-800'
                         }`}>
                           {product.stock > 0 ? '有库存' : '缺货'}
                         </span>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link
                            href={`/products/${product.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="查看详情"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => setEditingProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900"
                            title="编辑"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900"
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 统计信息 */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-sm font-medium text-gray-500">总商品数</h3>
                <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50">
                <Package className="w-6 h-6 text-green-600" />
              </div>
                             <div className="ml-4">
                 <h3 className="text-sm font-medium text-gray-500">有库存商品</h3>
                 <p className="text-2xl font-bold text-gray-900">
                   {products.filter(p => p.stock > 0).length}
                 </p>
               </div>
             </div>
           </div>
           
           <div className="bg-white rounded-lg shadow-md p-6">
             <div className="flex items-center">
               <div className="p-3 rounded-lg bg-red-50">
                 <Package className="w-6 h-6 text-red-600" />
               </div>
               <div className="ml-4">
                 <h3 className="text-sm font-medium text-gray-500">缺货商品</h3>
                 <p className="text-2xl font-bold text-gray-900">
                   {products.filter(p => p.stock === 0).length}
                 </p>
               </div>
            </div>
          </div>
        </div>

        {/* 说明信息 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Package className="w-5 h-5 text-blue-600 mt-0.5 mr-3" />
            <div>
              <h3 className="text-sm font-medium text-blue-900">商品管理说明</h3>
              <p className="text-sm text-blue-700 mt-1">
                这里展示所有商品的基本信息。您可以查看、编辑和删除商品。
                商品的添加和编辑功能可以根据需要进一步开发。
                当前展示的是从后端API获取的真实数据。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 