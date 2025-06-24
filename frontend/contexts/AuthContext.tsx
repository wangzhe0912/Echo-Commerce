'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';
import { showSuccess, showError } from '@/lib/notifications';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = Cookies.get('token');
    if (token) {
      try {
        const userData = await authAPI.getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Auth check failed:', error);
        Cookies.remove('token');
      }
    }
    setLoading(false);
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.login(username, password);
      Cookies.set('token', response.access_token, { expires: 7 });
      setUser(response.user);
      showSuccess('登录成功！', { duration: 2000 });
      return true;
    } catch (error: any) {
      console.error('Login failed:', error);
      showError(error.response?.data?.detail || '登录失败');
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await authAPI.register(username, password);
      Cookies.set('token', response.access_token, { expires: 7 });
      setUser(response.user);
      showSuccess('注册成功！', { duration: 2000 });
      return true;
    } catch (error: any) {
      console.error('Registration failed:', error);
      let errorMessage = '注册失败';
      
      if (error.response?.data?.detail) {
        // 处理单个错误信息
        if (typeof error.response.data.detail === 'string') {
          errorMessage = error.response.data.detail;
        } else if (Array.isArray(error.response.data.detail)) {
          // 处理验证错误数组
          errorMessage = error.response.data.detail.map((err: any) => err.msg || err).join(', ');
        }
      }
      
      showError(errorMessage);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('token');
    setUser(null);
    showSuccess('已退出登录', { duration: 2000 });
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 