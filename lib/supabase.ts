import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Types for our database
export interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  retail_price: number;
  wholesale_price: number;
  quantity: number;
  min_stock_level: number;
  image_url: string | null;
  sku: string;
  selling_mode: 'retail' | 'wholesale' | 'both';
  status: 'active' | 'archived';
  created_at: string;
  updated_at: string | null;
}

export interface CartItem extends Product {
  cart_quantity: number;
  selected_price_type: 'retail' | 'wholesale';
}

export interface Customer {
  id?: string;
  first_name: string;
  last_name: string | null;
  phone: string;
  email: string | null;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  total_amount: number;
  payment_method: string;
  view_mode: 'retail' | 'wholesale';
  created_at: string;
  unique_code: string;
  items: OrderItem[];
}

export interface OrderItem {
  product_id: string;
  quantity: number;
  price: number;
}

