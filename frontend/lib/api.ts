import axios from 'axios';
import Cookies from 'js-cookie';
import type { Product, Cart, CartItem, Order, OrderListItem, AuthResponse, User } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// 创建 axios 实例
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// 认证相关API
export const authAPI = {
  register: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/api/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
};

// 商品相关API
export const productAPI = {
  getProducts: async (skip = 0, limit = 20): Promise<Product[]> => {
    const response = await api.get(`/api/products?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await api.post('/api/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/api/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/api/products/${id}`);
  },
};

// 购物车相关API
export const cartAPI = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/api/cart');
    return response.data;
  },

  addToCart: async (product_id: string, quantity: number): Promise<CartItem> => {
    const response = await api.post('/api/cart/items', { product_id, quantity });
    return response.data;
  },

  updateCartItem: async (item_id: string, quantity: number): Promise<CartItem> => {
    const response = await api.put(`/api/cart/items/${item_id}`, { quantity });
    return response.data;
  },

  removeFromCart: async (item_id: string): Promise<void> => {
    await api.delete(`/api/cart/items/${item_id}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/api/cart/clear');
  },
};

// 订单相关API
export const orderAPI = {
  createOrder: async (): Promise<Order> => {
    const response = await api.post('/api/orders');
    return response.data;
  },

  getOrders: async (): Promise<OrderListItem[]> => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/api/orders/${id}`);
    return response.data;
  },
};

// 管理员相关API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/api/admin/stats');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/api/admin/dashboard');
    return response.data;
  },

  getUsers: async (skip = 0, limit = 20) => {
    const response = await api.get(`/api/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/api/admin/recent-activities');
    return response.data;
  },

  setUserAdmin: async (userId: string, isAdmin: boolean) => {
    const response = await api.put(`/api/admin/users/${userId}/admin`, { is_admin: isAdmin });
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/api/admin/orders');
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/api/admin/orders/${orderId}`);
    return response.data;
  },
};

export default api; 