'use client';

import Link from 'next/link';
import { useAuth, useAuthActions } from '@/contexts/AuthContext';
import { ShoppingCart, User, LogOut, Package, Home, Grid3X3, ClipboardList } from 'lucide-react';

export default function Header() {
  const { user } = useAuth();
  const { logout } = useAuthActions();

  return (
    <header className="bg-white shadow-md border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Echo-Commerce</span>
          </Link>

          {/* Navigation */}
          <nav className="flex items-center space-x-6">
            <Link 
              href="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Home className="h-4 w-4" />
              <span>首页</span>
            </Link>
            
            <Link 
              href="/products" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
              <span>商品</span>
            </Link>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/cart" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  <span>购物车</span>
                </Link>

                <Link 
                  href="/orders" 
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>我的订单</span>
                </Link>

                {user.is_admin && (
                  <Link 
                    href="/admin" 
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span>管理后台</span>
                  </Link>
                )}

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">欢迎，{user.username}</span>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 text-gray-700 hover:text-red-600 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>退出</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/login" 
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  登录
                </Link>
                <Link 
                  href="/register" 
                  className="btn-primary"
                >
                  注册
                </Link>
              </div>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
} 