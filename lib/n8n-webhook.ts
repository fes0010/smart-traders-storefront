// n8n Webhook Integration
// Configure your n8n webhook URL in .env as NEXT_PUBLIC_N8N_WEBHOOK_URL

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
  const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
  
  if (!webhookUrl) {
    console.warn('n8n webhook URL not configured. Order will be accepted without webhook.');
    // Return true to allow order to complete even without webhook
    return true;
  }

  try {
    console.log('Sending order to n8n:', webhookUrl);
    
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log('n8n response status:', response.status);

    // Accept any 2xx response as success
    if (response.ok) {
      console.log('✅ Order sent to n8n successfully');
      return true;
    }

    // Log error but still return true to not block the order
    console.error('n8n webhook returned error:', response.status, response.statusText);
    // Return true anyway - we don't want to block orders if webhook has issues
    return true;
  } catch (error) {
    console.error('Error sending order to n8n:', error);
    // Return true anyway - network errors shouldn't block orders
    return true;
  }
}
