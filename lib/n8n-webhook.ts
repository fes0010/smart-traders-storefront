// n8n Webhook Integration
// Orders are sent through our API route to avoid CORS issues

export interface OrderWebhookPayload {
  order_code: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  shipping_address: {
    line1: string;
    city: string;
    notes?: string;
  };
  items: Array<{
    product_id: string;
    product_name: string;
    sku: string;
    quantity: number;
    price: number;
    price_type: 'retail' | 'wholesale';
    subtotal: number;
  }>;
  total_amount: number;
  payment_method: string;
  currency: string;
  created_at: string;
}

export async function sendOrderToN8N(payload: OrderWebhookPayload): Promise<boolean> {
  try {
    console.log('Sending order via API route...');
    
    // Use our API route to forward to n8n (avoids CORS issues)
    const response = await fetch('/api/order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('API response:', data);

    if (response.ok && data.success) {
      console.log('✅ Order submitted successfully');
      return true;
    }

    console.error('Order API returned error:', data);
    // Still return true to not block the order
    return true;
  } catch (error) {
    console.error('Error sending order:', error);
    // Return true anyway - errors shouldn't block orders
    return true;
  }
}
