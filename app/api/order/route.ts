import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    
    const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!webhookUrl) {
      console.log('No webhook URL configured, order accepted locally');
      return NextResponse.json({ success: true, message: 'Order received (no webhook configured)' });
    }

    console.log('Forwarding order to n8n:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseText = await response.text();
    console.log('n8n response:', response.status, responseText);

    if (response.ok) {
      return NextResponse.json({ success: true, message: 'Order sent to n8n successfully' });
    } else {
      // Still return success to not block the order
      console.error('n8n returned error but accepting order:', response.status);
      return NextResponse.json({ success: true, message: 'Order received (webhook had issues)' });
    }
  } catch (error) {
    console.error('API route error:', error);
    // Still return success to not block the order
    return NextResponse.json({ success: true, message: 'Order received (error occurred)' });
  }
}
