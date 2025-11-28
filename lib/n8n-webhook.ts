// Order submission - saves to DB, notifies n8n agent with order code only

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

export async function sendOrderToN8N(payload: OrderWebhookPayload): Promise<{ success: boolean; error?: string }> {
  try {
    console.log('Submitting order:', payload.order_code);
    
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
      console.log('✅ Order saved successfully');
      return { success: true };
    }

    console.error('Order failed:', data.error);
    return { success: false, error: data.error || 'Failed to save order' };
  } catch (error) {
    console.error('Error submitting order:', error);
    return { success: false, error: 'Network error - please try again' };
  }
}
