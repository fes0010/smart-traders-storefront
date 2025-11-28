-- Create pending_orders table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS pending_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_code VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50) NOT NULL,
  customer_email VARCHAR(255),
  address_line1 TEXT NOT NULL,
  address_city VARCHAR(100) NOT NULL,
  address_notes TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pending_order_items table
CREATE TABLE IF NOT EXISTS pending_order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pending_order_id UUID REFERENCES pending_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL,
  product_name VARCHAR(255) NOT NULL,
  sku VARCHAR(50) NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  price_type VARCHAR(20) NOT NULL CHECK (price_type IN ('retail', 'wholesale')),
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_pending_orders_code ON pending_orders(order_code);
CREATE INDEX IF NOT EXISTS idx_pending_orders_status ON pending_orders(status);
CREATE INDEX IF NOT EXISTS idx_pending_orders_phone ON pending_orders(customer_phone);
CREATE INDEX IF NOT EXISTS idx_pending_order_items_order ON pending_order_items(pending_order_id);

-- Enable RLS (Row Level Security)
ALTER TABLE pending_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE pending_order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to insert orders (for storefront)
CREATE POLICY "Allow anonymous insert on pending_orders" ON pending_orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Allow anonymous insert on pending_order_items" ON pending_order_items
  FOR INSERT TO anon WITH CHECK (true);

-- Allow reading own orders by phone (optional - for order tracking)
CREATE POLICY "Allow read by phone" ON pending_orders
  FOR SELECT TO anon USING (true);

CREATE POLICY "Allow read order items" ON pending_order_items
  FOR SELECT TO anon USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at
CREATE TRIGGER update_pending_orders_updated_at
  BEFORE UPDATE ON pending_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
