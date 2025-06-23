export interface User {
  id: string;
  username: string;
  is_admin: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image_url: string;
  created_at: string;
  updated_at?: string;
}

export interface CartItem {
  id: string;
  product_id: string;
  quantity: number;
  product_name: string;
  product_price: number;
  product_image_url: string;
  subtotal: number;
  created_at: string;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
  total_items: number;
}

export interface OrderItem {
  product_id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderListItem {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  item_count: number;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
} 