import axios from 'axios';
import Cookies from 'js-cookie';
import type { Product, Cart, CartItem, Order, OrderListItem, AuthResponse, User } from '@/types';

// 使用相对路径，通过Next.js API路由代理
const API_URL = '/api';

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
    const response = await api.post('/auth/register', { username, password });
    return response.data;
  },

  login: async (username: string, password: string): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// 商品相关API
export const productAPI = {
  getProducts: async (skip = 0, limit = 20): Promise<Product[]> => {
    const response = await api.get(`/products?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  createProduct: async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product> => {
    const response = await api.post('/products', product);
    return response.data;
  },

  updateProduct: async (id: string, product: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, product);
    return response.data;
  },

  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};

// 购物车相关API
export const cartAPI = {
  getCart: async (): Promise<Cart> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (product_id: string, quantity: number): Promise<CartItem> => {
    const response = await api.post('/cart/items', { product_id, quantity });
    return response.data;
  },

  updateCartItem: async (item_id: string, quantity: number): Promise<CartItem> => {
    const response = await api.put(`/cart/items/${item_id}`, { quantity });
    return response.data;
  },

  removeFromCart: async (item_id: string): Promise<void> => {
    await api.delete(`/cart/items/${item_id}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart/clear');
  },
};

// 订单相关API
export const orderAPI = {
  createOrder: async (): Promise<Order> => {
    const response = await api.post('/orders');
    return response.data;
  },

  getOrders: async (): Promise<OrderListItem[]> => {
    const response = await api.get('/orders');
    return response.data;
  },

  getOrder: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

// 管理员相关API
export const adminAPI = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  getDashboard: async () => {
    const response = await api.get('/admin/dashboard');
    return response.data;
  },

  getUsers: async (skip = 0, limit = 20) => {
    const response = await api.get(`/admin/users?skip=${skip}&limit=${limit}`);
    return response.data;
  },

  getRecentActivities: async () => {
    const response = await api.get('/admin/recent-activities');
    return response.data;
  },

  setUserAdmin: async (userId: string, isAdmin: boolean) => {
    const response = await api.put(`/admin/users/${userId}/admin`, { is_admin: isAdmin });
    return response.data;
  },

  getAllOrders: async () => {
    const response = await api.get('/admin/orders');
    return response.data;
  },

  getOrder: async (orderId: string) => {
    const response = await api.get(`/admin/orders/${orderId}`);
    return response.data;
  },
};

export default api; 