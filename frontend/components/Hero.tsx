'use client';

import Link from 'next/link';
import { ArrowRight, ShoppingCart, User, Package } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export default function Hero() {
  const { user, loading } = useAuth();

  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Echo-Commerce
          </h1>
          <p className="text-xl mb-8 text-blue-100">
            智能化测试演示平台 - 基于 FastAPI + Next.js 的现代化电商系统
          </p>
          
          {!loading && (
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              {user ? (
                // 已登录用户显示的按钮
                <>
                  <Link 
                    href="/products" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <span>浏览商品</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/cart" 
                    className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>我的购物车</span>
                  </Link>
                  <Link 
                    href="/orders" 
                    className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <Package className="h-4 w-4" />
                    <span>我的订单</span>
                  </Link>
                </>
              ) : (
                // 未登录用户显示的按钮
                <>
                  <Link 
                    href="/products" 
                    className="bg-white text-blue-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <span>浏览商品</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link 
                    href="/register" 
                    className="border border-white text-white hover:bg-white hover:text-blue-600 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>立即注册</span>
                  </Link>
                </>
              )}
            </div>
          )}
          
          {/* 用户欢迎信息 */}
          {user && (
            <div className="mt-8 text-blue-100">
              <p className="text-lg">
                欢迎回来，<span className="font-semibold text-white">{user.username}</span>！
                {user.is_admin && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    管理员
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
} 