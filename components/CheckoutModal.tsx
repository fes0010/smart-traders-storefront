'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/cart-store';
import { supabase, Customer } from '@/lib/supabase';
import { X, CreditCard, Check, Loader2, MapPin, User, Phone, Mail } from 'lucide-react';

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
  const [address, setAddress] = useState({
    line1: '',
    city: '',
    notes: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Generate unique order code
      const code = `ORD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Create transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert({
          customer_name: `${customer.first_name} ${customer.last_name || ''}`.trim(),
          customer_phone: customer.phone,
          total_amount: getTotalPrice(),
          payment_method: paymentMethod,
          view_mode: 'retail', // E-commerce is retail by default
          unique_code: code,
          address_line1: address.line1 || null,
          address_city: address.city || null,
          address_notes: address.notes || null,
        })
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Create transaction items
      const transactionItems = items.map((item) => ({
        transaction_id: transaction.id,
        product_id: item.id,
        quantity: item.cart_quantity,
        price: item.selected_price_type === 'retail' ? item.retail_price : item.wholesale_price,
      }));

      const { error: itemsError } = await supabase
        .from('transaction_items')
        .insert(transactionItems);

      if (itemsError) throw itemsError;

      // Update product quantities
      for (const item of items) {
        const { error: updateError } = await supabase
          .from('products')
          .update({ quantity: item.quantity - item.cart_quantity })
          .eq('id', item.id);

        if (updateError) throw updateError;
      }

      // Success!
      setOrderCode(code);
      setOrderComplete(true);
      clearCart();
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to complete order. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (orderComplete) {
      setOrderComplete(false);
      setCustomer({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
      });
      setOrderCode('');
      setAddress({ line1: '', city: '', notes: '' });
    }
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-[var(--card-bg)] text-[color:var(--foreground)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-[color:var(--border)]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-[var(--card-bg)] border-[color:var(--border)]">
            <h2 className="text-xl font-bold">
              {orderComplete ? 'Order Complete!' : 'Checkout'}
            </h2>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-4">
            {orderComplete ? (
              /* Success State */
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-10 h-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Thank you for your order!
                </h3>
                <p className="text-gray-600 mb-4">
                  Your order has been successfully placed.
                </p>
                <div className="bg-[color:var(--background)] rounded-lg p-4 mb-6 border border-[color:var(--border)]">
                  <p className="text-sm text-gray-600 mb-1">Order Code</p>
                  <p className="text-xl font-mono font-bold">
                    {orderCode}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Save this code for tracking your order
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-full btn-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              /* Checkout Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Order Summary */}
                <div className="rounded-lg p-4 border border-[color:var(--border)]">
                  <h3 className="font-semibold mb-2">Order Summary</h3>
                  <div className="space-y-1 text-sm">
                    {items.map((item) => (
                      <div key={item.id} className="flex justify-between">
                        <span className="text-gray-600">
                          {item.name} × {item.cart_quantity}
                        </span>
                        <span className="font-medium">
                          {process.env.NEXT_PUBLIC_CURRENCY}{' '}
                          {(
                            (item.selected_price_type === 'retail'
                              ? item.retail_price
                              : item.wholesale_price) * item.cart_quantity
                          ).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="border-t mt-2 pt-2 flex justify-between font-bold">
                    <span>Total:</span>
                    <span>
                      {process.env.NEXT_PUBLIC_CURRENCY} {getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Information */}
                <div>
                  <h3 className="font-semibold mb-3">Customer Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={customer.first_name}
                        onChange={(e) =>
                          setCustomer({ ...customer, first_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Last Name
                      </label>
                      <input
                        type="text"
                        value={customer.last_name || ''}
                        onChange={(e) =>
                          setCustomer({ ...customer, last_name: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customer.phone}
                        onChange={(e) =>
                          setCustomer({ ...customer, phone: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={customer.email || ''}
                        onChange={(e) =>
                          setCustomer({ ...customer, email: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-semibold mb-3">Shipping Address</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1">Address Line *</label>
                      <input
                        type="text"
                        required
                        value={address.line1}
                        onChange={(e) => setAddress({ ...address, line1: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">City *</label>
                      <input
                        type="text"
                        required
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Notes</label>
                      <textarea
                        value={address.notes}
                        onChange={(e) => setAddress({ ...address, notes: e.target.value })}
                        className="w-full px-3 py-2 border border-[color:var(--border)] rounded-lg focus:ring-2 focus:ring-[color:var(--primary)] focus:border-transparent bg-[var(--card-bg)]"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <div className="space-y-2">
                    <label className="flex items-center p-3 border border-[color:var(--border)] rounded-lg cursor-pointer hover:bg-[color:var(--background)]">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                      <span>Cash on Delivery</span>
                    </label>
                    <label className="flex items-center p-3 border border-[color:var(--border)] rounded-lg cursor-pointer hover:bg-[color:var(--background)]">
                      <input
                        type="radio"
                        name="payment"
                        value="mpesa"
                        checked={paymentMethod === 'mpesa'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="mr-3"
                      />
                      <CreditCard className="w-5 h-5 mr-2 text-gray-600" />
                      <span>M-Pesa</span>
                    </label>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary py-3 rounded-lg font-semibold hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Place Order'
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}


