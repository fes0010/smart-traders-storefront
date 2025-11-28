# n8n Webhook Integration

This storefront can send order data to an n8n workflow when a customer completes checkout.

## Setup

1. In your n8n instance, create a new workflow
2. Add a **Webhook** trigger node
3. Set the HTTP Method to `POST`
4. Copy the webhook URL (e.g., `https://your-n8n.com/webhook/abc123`)
5. Add the URL to your `.env` file:

```env
NEXT_PUBLIC_N8N_WEBHOOK_URL=https://your-n8n.com/webhook/abc123
```

## Webhook Payload

When an order is placed, the following JSON is sent to your webhook:

```json
{
  "order_code": "ORD-1234567890-ABCDE",
  "customer": {
    "name": "John Doe",
    "phone": "+1234567890",
    "email": "john@example.com"
  },
  "shipping_address": {
    "line1": "123 Main Street",
    "city": "Nairobi",
    "notes": "Gate code: 1234"
  },
  "items": [
    {
      "product_id": "uuid-here",
      "product_name": "Product Name",
      "sku": "SKU001",
      "quantity": 2,
      "price": 100.00,
      "price_type": "retail",
      "subtotal": 200.00
    }
  ],
  "total_amount": 200.00,
  "payment_method": "cash",
  "currency": "USD",
  "created_at": "2025-11-28T10:30:00.000Z"
}
```

## Example n8n Workflows

### Send Email Notification
1. Webhook → Email node
2. Use the payload data to compose an order confirmation email

### Send SMS via Twilio
1. Webhook → Twilio node
2. Send order confirmation to customer phone

### Update Google Sheets
1. Webhook → Google Sheets node
2. Log all orders to a spreadsheet

### Slack Notification
1. Webhook → Slack node
2. Notify your team of new orders

## Testing

1. Set up your webhook in n8n
2. Add the URL to your environment
3. Place a test order
4. Check n8n execution history to verify the payload was received
