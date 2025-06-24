'use client';

import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showHomeButton?: boolean;
  icon?: React.ReactNode;
  className?: string;
}

export default function ErrorState({
  title = '出现了一些问题',
  message,
  onRetry,
  showHomeButton = false,
  icon,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 ${className}`}>
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* 图标 */}
          <div className="flex justify-center mb-4">
            {icon || (
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
          </div>
          
          {/* 标题 */}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {title}
          </h2>
          
          {/* 错误消息 */}
          <p className="text-gray-600 mb-6 leading-relaxed">
            {message}
          </p>
          
          {/* 操作按钮 */}
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-center">
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                重试
              </button>
            )}
            
            {showHomeButton && (
              <Link
                href="/"
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                <Home className="w-4 h-4 mr-2" />
                返回首页
              </Link>
            )}
          </div>
        </div>
        
        {/* 辅助信息 */}
        <p className="mt-4 text-xs text-gray-500">
          如果问题持续存在，请联系客服或稍后再试
        </p>
      </div>
    </div>
  );
}

// 网络错误状态
export function NetworkError({ onRetry }: { onRetry?: () => void }) {
  return (
    <ErrorState
      title="网络连接异常"
      message="无法连接到服务器，请检查您的网络连接"
      onRetry={onRetry}
      showHomeButton={true}
      icon={
        <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-orange-500" />
        </div>
      }
    />
  );
}

// 404 错误状态
export function NotFoundError() {
  return (
    <ErrorState
      title="页面未找到"
      message="抱歉，您访问的页面不存在或已被移除"
      showHomeButton={true}
      icon={
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <span className="text-2xl font-bold text-blue-500">404</span>
        </div>
      }
    />
  );
}

// 权限错误状态
export function PermissionError() {
  return (
    <ErrorState
      title="权限不足"
      message="您没有访问此页面的权限，请登录后重试"
      showHomeButton={true}
      icon={
        <div className="w-16 h-16 bg-yellow-50 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-yellow-500" />
        </div>
      }
    />
  );
}

// 空状态组件
export function EmptyState({ 
  title, 
  message, 
  actionText, 
  actionHref, 
  icon 
}: {
  title: string;
  message: string;
  actionText?: string;
  actionHref?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {icon || (
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      
      <p className="text-gray-600 mb-6">
        {message}
      </p>
      
      {actionText && actionHref && (
        <Link
          href={actionHref}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
} 