'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { authAPI } from '@/lib/api';
import type { User } from '@/types';
import { showSuccess } from '@/lib/notifications';
import LoadingSpinner from '@/components/LoadingSpinner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

interface AuthActionsContextType {
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const AuthActionsContext = createContext<AuthActionsContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = Cookies.get('token');
      if (token) {
        try {
          const userData = await authAPI.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Auth check failed:', error);
          Cookies.remove('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const actions = useMemo(() => ({
    login: async (username: string, password: string): Promise<void> => {
      try {
        const response = await authAPI.login(username, password);
        Cookies.set('token', response.access_token, { expires: 7 });
        setUser(response.user);
        showSuccess('登录成功！', { duration: 2000 });
      } catch (error: any) {
        console.error('Login failed:', error);
        throw error;
      }
    },
    register: async (username: string, password: string): Promise<void> => {
      try {
        const response = await authAPI.register(username, password);
        Cookies.set('token', response.access_token, { expires: 7 });
        setUser(response.user);
        showSuccess('注册成功！', { duration: 2000 });
      } catch (error: any) {
        console.error('Registration failed:', error);
        throw error;
      }
    },
    logout: () => {
      Cookies.remove('token');
      setUser(null);
      showSuccess('已退出登录', { duration: 2000 });
    }
  }), []);

  const authState = useMemo(() => ({ user, loading }), [user, loading]);

  if (loading) {
    return <LoadingSpinner fullscreen={true} />;
  }

  return (
    <AuthContext.Provider value={authState}>
      <AuthActionsContext.Provider value={actions}>
        {children}
      </AuthActionsContext.Provider>
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

export function useAuthActions() {
    const context = useContext(AuthActionsContext);
    if (context === undefined) {
        throw new Error('useAuthActions must be used within an AuthProvider');
    }
    return context;
} 