'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  text?: string;
  className?: string;
  fullscreen?: boolean;
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text, 
  className = '',
  fullscreen = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    green: 'border-green-600',
    red: 'border-red-600',
    yellow: 'border-yellow-600',
    gray: 'border-gray-600'
  };

  // 全屏模式
  if (fullscreen) {
    return (
      <div className="flex justify-center items-center h-screen w-screen fixed top-0 left-0 bg-white z-50">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // 内联模式
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative">
        <div
          className={`${sizeClasses[size]} ${colorClasses[color]} border-2 border-t-transparent rounded-full animate-spin`}
        />
        <div
          className={`absolute inset-0 ${sizeClasses[size]} border-2 border-transparent border-t-current rounded-full animate-ping opacity-20`}
        />
      </div>
      {text && (
        <p className="mt-3 text-sm font-medium text-gray-600 animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

// 导出一个专门用于页面加载的组件
export function PageLoading({ text = "加载中..." }: { text?: string }) {
  return <LoadingSpinner fullscreen={true} text={text} />;
}

// 卡片加载占位符
export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded mb-2" />
        <div className="h-4 bg-gray-200 rounded mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded mb-3 w-1/2" />
        <div className="flex items-center justify-between mb-3">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-200 rounded" />
      </div>
    </div>
  );
}

// 产品网格加载状态
export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <CardSkeleton key={index} />
      ))}
    </div>
  );
} 