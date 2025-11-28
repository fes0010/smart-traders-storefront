'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { Customer } from '@/lib/supabase';
import { sendOrderToN8N, OrderWebhookPayload } from '@/lib/n8n-webhook';
import { X, Check, Loader2, CreditCard, Truck, ShoppingBag } from 'lucide-react';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [customer, setCustomer] = useState<Customer>({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [address, setAddress] = useState({ line1: '', city: '', notes: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const code = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Send order to n8n AI agent - the agent will handle database operations
      const webhookPayload: OrderWebhookPayload = {
        order_code: code,
        customer: {
          name: `${customer.first_name} ${customer.last_name || ''}`.trim(),
          phone: customer.phone,
          email: customer.email || undefined,
        },
        shipping_address: {
          line1: address.line1,
          city: address.city,
          notes: address.notes || undefined,
        },
        items: items.map((item) => ({
          product_id: item.id,
          product_name: item.name,
          sku: item.sku,
          quantity: item.cart_quantity,
          price: item.selected_price_type === 'retail' ? item.retail_price : item.wholesale_price,
          price_type: item.selected_price_type,
          subtotal: (item.selected_price_type === 'retail' ? item.retail_price : item.wholesale_price) * item.cart_quantity,
        })),
        total_amount: getTotalPrice(),
        payment_method: paymentMethod,
        currency: process.env.NEXT_PUBLIC_CURRENCY || 'KES',
        created_at: new Date().toISOString(),
      };

      const result = await sendOrderToN8N(webhookPayload);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to submit order. Please try again.');
      }

      setOrderCode(code);
      setOrderComplete(true);
      clearCart();
    } catch (error: unknown) {
      console.error('Checkout error:', error);
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (orderComplete) {
      setOrderComplete(false);
      setCustomer({ first_name: '', last_name: '', phone: '', email: '' });
      setOrderCode('');
      setAddress({ line1: '', city: '', notes: '' });
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50" onClick={handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] text-[color:var(--foreground)] rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-[color:var(--border)]">
          <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-[var(--card-bg)] border-[color:var(--border)] rounded-t-2xl">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {orderComplete ? <Check className="w-6 h-6 text-[color:var(--success)]" /> : <ShoppingBag className="w-6 h-6" />}
              {orderComplete ? 'Order Submitted!' : 'Checkout'}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-[color:var(--accent)] rounded-xl transition-colors">
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-5">
            {orderComplete ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 hero-gradient rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold mb-2">Thank you! 🎉</h3>
                <p className="text-[color:var(--muted)] mb-2">Your order has been submitted for processing.</p>
                <p className="text-[color:var(--muted)] mb-6 text-sm">We'll contact you shortly to confirm availability and delivery.</p>
                <div className="bg-[color:var(--accent)] rounded-xl p-5 mb-6 border border-[color:var(--border)]">
                  <p className="text-sm text-[color:var(--muted)] mb-1">Order Reference</p>
                  <p className="text-2xl font-mono font-bold text-[color:var(--primary)]">{orderCode}</p>
                  <p className="text-xs text-[color:var(--muted)] mt-2">Save this code for your records</p>
                </div>
                <button onClick={handleClose} className="w-full btn-primary py-3.5 rounded-xl font-semibold">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order Summary */}
                <div className="rounded-xl p-4 border border-[color:var(--border)] bg-[color:var(--accent)]">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4" /> Order Summary
                  </h3>
                  <div className="space-y-2 text-sm max-h-32 overflow-y-auto">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-[color:var(--muted)]">{item.name} × {item.cart_quantity}</span>
                        <span className="font-medium">{process.env.NEXT_PUBLIC_CURRENCY} {((item.selected_price_type === 'retail' ? item.retail_price : item.wholesale_price) * item.cart_quantity).toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-[color:var(--border)] mt-3 pt-3 flex justify-between font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-[color:var(--primary)]">{process.env.NEXT_PUBLIC_CURRENCY} {getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full hero-gradient text-white text-xs flex items-center justify-center">1</span> Your Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First Name *</label>
                      <input type="text" required value={customer.first_name} onChange={(e) => setCustomer({ ...customer, first_name: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last Name</label>
                      <input type="text" value={customer.last_name || ''} onChange={(e) => setCustomer({ ...customer, last_name: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone *</label>
                      <input type="tel" required value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input type="email" value={customer.email || ''} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" />
                    </div>
                  </div>
                </div>

                {/* Shipping */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full hero-gradient text-white text-xs flex items-center justify-center">2</span> Delivery Address</h3>
                  
                  {/* Free Delivery Notice */}
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg px-3 py-2 mb-3 text-sm">
                    <Truck className="w-4 h-4 flex-shrink-0" />
                    <span>🎉 FREE delivery within Kagio Town!</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Address *</label>
                      <input type="text" required value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" placeholder="Street address, landmark" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Town/City *</label>
                      <input type="text" required value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)]" placeholder="e.g., Kagio" />
                      {address.city && address.city.toLowerCase().includes('kagio') && (
                        <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                          <Check className="w-3 h-3" /> Free delivery applies!
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Delivery Notes</label>
                      <textarea value={address.notes} onChange={(e) => setAddress({ ...address, notes: e.target.value })} rows={2} className="w-full px-4 py-2.5 border border-[color:var(--border)] rounded-xl focus:ring-2 focus:ring-[color:var(--primary)] bg-[var(--card-bg)] resize-none" placeholder="Any special instructions for delivery..." />
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><span className="w-6 h-6 rounded-full hero-gradient text-white text-xs flex items-center justify-center">3</span> Payment Method</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'cash' ? 'border-[color:var(--primary)] bg-[color:var(--accent)]' : 'border-[color:var(--border)] hover:border-[color:var(--primary)]'}`}>
                      <input type="radio" name="payment" value="cash" checked={paymentMethod === 'cash'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                      <Truck className="w-5 h-5 text-[color:var(--primary)]" />
                      <span className="font-medium">Cash on Delivery</span>
                    </label>
                    <label className={`flex items-center gap-3 p-4 border rounded-xl cursor-pointer transition-all ${paymentMethod === 'mpesa' ? 'border-[color:var(--primary)] bg-[color:var(--accent)]' : 'border-[color:var(--border)] hover:border-[color:var(--primary)]'}`}>
                      <input type="radio" name="payment" value="mpesa" checked={paymentMethod === 'mpesa'} onChange={(e) => setPaymentMethod(e.target.value)} className="sr-only" />
                      <CreditCard className="w-5 h-5 text-[color:var(--primary)]" />
                      <span className="font-medium">M-Pesa</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={isProcessing} className="w-full btn-primary py-4 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" /> Submitting Order...</>) : 'Submit Order'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
