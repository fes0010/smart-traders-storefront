# 🛍️ Smart Traders E-Commerce Storefront

A modern, real-time e-commerce storefront built with Next.js 14, TypeScript, and Supabase. Features live inventory updates, shopping cart persistence, and seamless checkout.

## ✨ Features

### Core Functionality
- 🔴 **Real-time Product Updates** - Inventory and prices update live via Supabase Realtime
- 🛒 **Persistent Shopping Cart** - Cart saves to localStorage, survives page refreshes
- 🔍 **Smart Search & Filtering** - Search by name, SKU, or category
- 📦 **Stock Management** - Low stock warnings and out-of-stock indicators
- 💰 **Flexible Pricing** - Support for both retail and wholesale prices
- ✅ **Seamless Checkout** - Simple, mobile-friendly checkout flow
- 📱 **Responsive Design** - Works perfectly on all devices

### Technical Features
- ⚡ Server-side rendering with Next.js 14 App Router
- 🎨 Beautiful UI with Tailwind CSS
- 🔄 State management with Zustand
- 📡 Real-time subscriptions via Supabase
- 🎯 Type-safe with TypeScript

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Access to your Supabase instance (https://supabase.munene.shop)
- Supabase anon key

### Installation

1. **Navigate to the storefront directory:**
```bash
cd e-commerce-storefront
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Edit `.env.local` and add your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://supabase.munene.shop
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Run the development server:**
```bash
npm run dev
```

5. **Open your browser:**
Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase instance URL | ✅ Yes | - |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ Yes | - |
| `NEXT_PUBLIC_STORE_NAME` | Store display name | ❌ No | Smart Traders Store |
| `NEXT_PUBLIC_STORE_DESCRIPTION` | Store meta description | ❌ No | Quality products at great prices |
| `NEXT_PUBLIC_CURRENCY` | Currency code (KES, USD, etc.) | ❌ No | KES |
| `NEXT_PUBLIC_ENABLE_REAL_TIME` | Enable live updates | ❌ No | true |
| `NEXT_PUBLIC_SHOW_STOCK_COUNT` | Show stock quantities | ❌ No | true |
| `NEXT_PUBLIC_LOW_STOCK_THRESHOLD` | Low stock warning level | ❌ No | 10 |

### Database Requirements

The storefront connects to the same database as your POS system. Ensure these tables exist:
- `products` - Product catalog
- `transactions` - Order records
- `transaction_items` - Order line items

No additional migrations needed! 🎉

## 📦 Deployment

### Option 1: Vercel (Recommended)

Vercel is the easiest way to deploy Next.js apps:

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Add environment variables in Vercel dashboard:**
   - Go to your project settings
   - Navigate to "Environment Variables"
   - Add all `NEXT_PUBLIC_*` variables

4. **Redeploy:**
```bash
vercel --prod
```

### Option 2: Dokploy (Same Server as POS)

Deploy alongside your existing services:

1. **Create `Dockerfile.production`:**
```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
ENV PORT 3000
CMD ["node", "server.js"]
```

2. **Update `next.config.ts`:**
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
};

export default nextConfig;
```

3. **Build Docker image:**
```bash
docker build -f Dockerfile.production -t smart-traders-storefront .
```

4. **Run container:**
```bash
docker run -d \
  --name storefront \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://supabase.munene.shop \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  smart-traders-storefront
```

5. **Configure Dokploy:**
   - Add as new application
   - Point to port 3000
   - Set up domain (e.g., shop.munene.shop)

### Option 3: Netlify

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Build:**
```bash
npm run build
```

3. **Deploy:**
```bash
netlify deploy --prod
```

4. **Configure environment variables in Netlify dashboard**

## 🔐 Security Considerations

### Row Level Security (RLS)

Ensure your Supabase RLS policies allow public read access to products:

```sql
-- Allow public to read active products
CREATE POLICY "Public can read active products"
ON products FOR SELECT
USING (status = 'active');

-- Allow public to create transactions
CREATE POLICY "Public can create transactions"
ON transactions FOR INSERT
WITH CHECK (true);

-- Allow public to create transaction items
CREATE POLICY "Public can create transaction items"
ON transaction_items FOR INSERT
WITH CHECK (true);
```

### API Keys

- ✅ Use the **anon/public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
- ❌ **Never** expose the service role key in frontend code

## 🎨 Customization

### Branding

Update colors in `tailwind.config.ts`:
```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#3b82f6', // Your brand color
      },
    },
  },
};
```

### Add More Payment Methods

Edit `components/CheckoutModal.tsx` to add payment gateways like:
- M-Pesa integration
- Stripe/PayPal
- Bank transfers

### Custom Product Fields

Extend the `Product` type in `lib/supabase.ts`:
```typescript
export interface Product {
  // ... existing fields
  brand?: string;
  weight?: number;
  dimensions?: string;
}
```

## 📊 Performance

### Optimization Features
- ⚡ Static generation where possible
- 🗜️ Image optimization with Next.js Image
- 📦 Code splitting and lazy loading
- 💾 Client-side caching with Zustand persist

### Monitoring

Check real-time connection status:
- Look for green "Live" badge in header
- Console logs show subscription status
- Network tab shows Realtime WebSocket connection

## 🐛 Troubleshooting

### Products Not Loading

1. Check Supabase connection:
```bash
curl https://supabase.munene.shop/rest/v1/products?status=eq.active \
  -H "apikey: your-anon-key"
```

2. Verify environment variables are set correctly
3. Check browser console for errors

### Real-time Not Working

1. Ensure Realtime is enabled in Supabase dashboard
2. Check RLS policies allow SELECT on products table
3. Verify WebSocket connection in Network tab

### Cart Not Persisting

1. Check localStorage is enabled in browser
2. Clear localStorage and try again:
```javascript
localStorage.removeItem('smart-traders-cart');
```

### Checkout Failing

1. Verify RLS policies allow INSERT on transactions and transaction_items
2. Check product quantities are sufficient
3. Review browser console for error details

## 📚 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **State Management:** Zustand
- **Icons:** Lucide React
- **Deployment:** Vercel / Dokploy

## 🤝 Integration with POS

The storefront shares the same database as your POS system:
- ✅ Inventory syncs automatically
- ✅ Orders appear in POS transaction history
- ✅ No duplicate data
- ✅ Single source of truth

## 📞 Support

For issues or questions:
1. Check this README
2. Review browser console logs
3. Check Supabase logs
4. Contact system administrator

## 🎉 What's Next?

Future enhancements:
- 📧 Email notifications for orders
- 🔔 Push notifications for status updates
- ⭐ Product reviews and ratings
- 🎁 Discount codes and promotions
- 📱 Progressive Web App (PWA) support
- 🌍 Multi-language support

---

Built with ❤️ for Smart Traders
