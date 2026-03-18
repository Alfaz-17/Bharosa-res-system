export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  WAITER = "WAITER",
  KITCHEN = "KITCHEN",
}

export enum OrderStatus {
  CREATED = "CREATED",
  CONFIRMED = "CONFIRMED",
  IN_KITCHEN = "IN_KITCHEN",
  READY = "READY",
  SERVED = "SERVED",
  PAID = "PAID",
  CANCELLED = "CANCELLED",
}

export enum PaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  UPI = "UPI",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  restaurant_id: string;
  last_active?: string;
  avatar_url?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  timezone: string;
  tax_rate: number;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  _count?: {
    items: number;
  };
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  category?: MenuCategory;
  image_url: string;
  is_available: boolean;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  menu_item: MenuItem;
  quantity: number;
  price: number;
  notes?: string;
}

export interface Order {
  id: string;
  order_number: string;
  table_number: string;
  status: OrderStatus;
  waiter_id: string;
  waiter?: User;
  restaurant_id: string;
  total_amount: number;
  notes?: string;
  order_items: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Invoice {
  id: string;
  order_id: string;
  invoice_number: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  status: "PENDING" | "PAID";
  created_at: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  method: PaymentMethod;
  amount: number;
  reference_number?: string;
  created_at: string;
}

export interface AnalyticsRevenue {
  from: string;
  to: string;
  total_revenue: number;
  order_count: number;
  average_order_value: number;
}

export interface AnalyticsTopItem {
  item_name: string;
  category_name: string;
  total_quantity: number;
  total_revenue: number;
}

export interface OrderTrend {
  date: string;
  order_count: number;
  revenue: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}
