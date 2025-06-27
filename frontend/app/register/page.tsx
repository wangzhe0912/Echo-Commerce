'use client'

import { useState, useEffect } from 'react'
import { useAuth, useAuthActions } from '@/contexts/AuthContext'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{[key: string]: string}>({})
  const { register } = useAuthActions()
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const validate = () => {
    const newErrors: {[key: string]: string} = {}
    if (!username) {
      newErrors.username = '请输入用户名'
    }
    if (!password) {
      newErrors.password = '请输入密码'
    } else if (password.length < 6) {
      newErrors.password = '密码长度至少6位'
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = '请再次输入密码'
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '两次输入的密码不一致'
    }
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    setErrors({})

    try {
      await register(username, password)
      router.push('/')
    } catch (err: any) {
      let errorMessage = '注册失败，请重试';
      
      if (err.response?.data?.detail) {
        if (typeof err.response.data.detail === 'string') {
          errorMessage = err.response.data.detail;
        } else if (Array.isArray(err.response.data.detail)) {
          errorMessage = err.response.data.detail.map((error: any) => 
            error.msg || error.message || String(error)
          ).join(', ');
        }
        setErrors({ form: errorMessage });
      } else if (err.message) {
        setErrors({ form: err.message });
      } else {
        setErrors({ form: errorMessage });
      }
      
      console.error('Register error:', err);
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          创建新账户
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          已有账户？{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            立即登录
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <div className="bg-red-50 border border-red-200 text-sm text-red-700 px-4 py-3 rounded">
                {errors.form}
              </div>
            )}
            
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                用户名
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value)
                    if (errors.username) setErrors({...errors, username: ''})
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.username ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="请输入用户名"
                />
              </div>
              {errors.username && <p className="mt-2 text-sm text-red-600">{errors.username}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密码
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) setErrors({...errors, password: ''})
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="至少6位密码"
                />
              </div>
              {errors.password && <p className="mt-2 text-sm text-red-600">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                确认密码
              </label>
              <div className="mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value)
                    if (errors.confirmPassword) setErrors({...errors, confirmPassword: ''})
                  }}
                  className={`appearance-none block w-full px-3 py-2 border rounded-md placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="再次输入密码"
                />
              </div>
              {errors.confirmPassword && <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '注册中...' : '注册'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 