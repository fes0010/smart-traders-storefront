import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

interface OrderItem {
  product_id: string;
  product_name: string;
  sku: string;
  quantity: number;
  price: number;
  price_type: string;
  subtotal: number;
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Validate stock availability for all items (prevents overselling)
    const productIds = payload.items.map((item: OrderItem) => item.product_id);
    const { data: products, error: stockError } = await supabase
      .from('products')
      .select('id, name, quantity')
      .in('id', productIds);

    if (stockError) {
      console.error('Stock check error:', stockError);
      return NextResponse.json({ 
        success: false, 
        error: 'Unable to verify stock availability' 
      }, { status: 500 });
    }

    // Check each item has sufficient stock
    const stockMap = new Map(products?.map(p => [p.id, p.quantity]) || []);
    for (const item of payload.items as OrderItem[]) {
      const available = stockMap.get(item.product_id) || 0;
      if (available < item.quantity) {
        const productName = products?.find(p => p.id === item.product_id)?.name || item.product_name;
        return NextResponse.json({ 
          success: false, 
          error: `Sorry, "${productName}" has insufficient stock (${available} available, ${item.quantity} requested)` 
        }, { status: 400 });
      }
    }

    // 2. Save pending order to database
    const { data: pendingOrder, error: orderError } = await supabase
      .from('pending_orders')
      .insert({
        order_code: payload.order_code,
        customer_name: payload.customer.name,
        customer_phone: payload.customer.phone,
        customer_email: payload.customer.email || null,
        address_line1: payload.shipping_address.line1,
        address_city: payload.shipping_address.city,
        address_notes: payload.shipping_address.notes || null,
        total_amount: payload.total_amount,
        payment_method: payload.payment_method,
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error saving pending order:', orderError);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to save order: ' + orderError.message 
      }, { status: 500 });
    }

    // 3. Save order items
    const orderItems = payload.items.map((item: OrderItem) => ({
      pending_order_id: pendingOrder.id,
      product_id: item.product_id,
      product_name: item.product_name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.price,
      price_type: item.price_type,
      subtotal: item.subtotal,
    }));

    const { error: itemsError } = await supabase
      .from('pending_order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Error saving order items:', itemsError);
      // Don't fail the order, items can be recovered from the main order
    }

    // 4. Notify n8n with just the order code (agent will fetch details from DB)
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (webhookUrl) {
      try {
        console.log('Notifying n8n agent with order code:', payload.order_code);
        
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            order_code: payload.order_code,
            // Include minimal info for quick reference
            customer_phone: payload.customer.phone,
            total_amount: payload.total_amount,
            item_count: payload.items.length,
          }),
        });
        
        console.log('✅ n8n notified successfully');
      } catch (webhookError) {
        // Don't fail the order if webhook fails - order is safely in DB
        console.error('Webhook notification failed (order still saved):', webhookError);
      }
    }

    return NextResponse.json({ 
      success: true, 
      order_code: payload.order_code,
      message: 'Order saved successfully' 
    });

  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Server error occurred' 
    }, { status: 500 });
  }
}
