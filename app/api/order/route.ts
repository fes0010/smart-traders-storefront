import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // 1. Save pending order to database
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

    // 2. Save order items
    const orderItems = payload.items.map((item: {
      product_id: string;
      product_name: string;
      sku: string;
      quantity: number;
      price: number;
      price_type: string;
      subtotal: number;
    }) => ({
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

    // 3. Notify n8n with just the order code (agent will fetch details from DB)
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
