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
    console.warn('n8n webhook URL not configured. Skipping webhook notification.');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('n8n webhook failed:', response.status, response.statusText);
      return false;
    }

    console.log('✅ Order sent to n8n successfully');
    return true;
  } catch (error) {
    console.error('Error sending order to n8n:', error);
    return false;
  }
}
