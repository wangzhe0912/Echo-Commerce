'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            Echo-Commerce
          </h1>
          <p className="text-xl mb-8 text-primary-100">
            智能化测试演示平台 - 基于 FastAPI + Next.js 的现代化电商系统
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/products" 
              className="bg-white text-primary-600 hover:bg-gray-100 font-medium py-3 px-6 rounded-md transition-colors flex items-center space-x-2"
            >
              <span>浏览商品</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              href="/register" 
              className="border border-white text-white hover:bg-white hover:text-primary-600 font-medium py-3 px-6 rounded-md transition-colors"
            >
              立即注册
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 