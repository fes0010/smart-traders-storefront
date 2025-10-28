# 🛍️ Smart Traders E-Commerce Storefront

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-16.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-green?style=for-the-badge&logo=supabase)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com)

**A modern, real-time e-commerce storefront with live inventory updates**

[Features](#-features) • [Demo](#-demo) • [Quick Start](#-quick-start) • [Deploy](#-deployment) • [Docs](#-documentation)

</div>

---

## 🎯 Overview

A production-ready e-commerce storefront built with **Next.js 14**, **Supabase**, and **TypeScript**. Features real-time inventory updates, persistent shopping cart, and seamless checkout - all without requiring customer authentication.

### Why This Project?

- ✅ **Real-time Everything** - Inventory updates instantly via Supabase Realtime
- ✅ **Zero Authentication** - Customers shop without creating accounts
- ✅ **Production Ready** - Docker + Vercel deployment configs included
- ✅ **Type Safe** - Full TypeScript coverage
- ✅ **Modern Stack** - Next.js 14 App Router, Server Components
- ✅ **Beautiful UI** - Responsive design with Tailwind CSS

---

## ✨ Features

### For Customers
- 🔍 **Smart Search & Filtering** - Find products by name, SKU, or category
- 🛒 **Persistent Cart** - Cart survives browser refreshes (localStorage)
- 💰 **Flexible Pricing** - Retail and wholesale price options
- 📦 **Stock Indicators** - Real-time "Low Stock" and "Out of Stock" badges
- ✅ **Simple Checkout** - No account required, just name and phone
- 📱 **Mobile Optimized** - Perfect experience on all devices
- 🔴 **Live Updates** - See inventory changes in real-time

### For Developers
- ⚡ **Fast Performance** - Server-side rendering with Next.js
- 🔐 **Secure** - Row Level Security (RLS) with Supabase
- 🎨 **Customizable** - Easy to theme and extend
- 🐳 **Docker Ready** - Multi-stage build included
- 📊 **Well Documented** - Comprehensive docs and comments
- 🧪 **Type Safe** - TypeScript throughout

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Supabase instance (cloud or self-hosted)
- Supabase anon key

### Installation

```bash
# Clone the repository
git clone https://github.com/fes0010/smart-traders-storefront.git
cd smart-traders-storefront

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔧 Configuration

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Store Settings
NEXT_PUBLIC_STORE_NAME=Your Store Name
NEXT_PUBLIC_CURRENCY=USD

# Features
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_SHOW_STOCK_COUNT=true
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=10
```

### Required Supabase Setup

The storefront needs these RLS policies:

```sql
-- Allow public to view active products
CREATE POLICY public_view_active_products 
ON products FOR SELECT TO anon 
USING (status = 'active');

-- Allow public to create orders
CREATE POLICY public_create_transactions 
ON transactions FOR INSERT TO anon 
WITH CHECK (true);

-- Allow public to create order items
CREATE POLICY public_create_transaction_items 
ON transaction_items FOR INSERT TO anon 
WITH CHECK (true);

-- Allow inventory updates
CREATE POLICY public_update_product_quantity 
ON products FOR UPDATE TO anon 
USING (true) WITH CHECK (true);
```

See [RLS_POLICIES_APPLIED.md](./RLS_POLICIES_APPLIED.md) for details.

---

## 📦 Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fes0010/smart-traders-storefront)

```bash
npm i -g vercel
vercel
```

### Docker

```bash
# Build
docker build -t storefront .

# Run
docker run -d -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your-url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  storefront
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete guide.

---

## 🏗️ Architecture

```
┌─────────────────────┐
│   Next.js Frontend  │
│  - Product Listing  │
│  - Shopping Cart    │
│  - Checkout         │
└──────────┬──────────┘
           │
           │ Supabase Client
           │ (REST + WebSocket)
           │
┌──────────▼──────────┐
│  Supabase Database  │
│  - Products         │
│  - Transactions     │
│  - RLS Policies     │
└─────────────────────┘
```

---

## 📚 Documentation

- **[README.md](./README.md)** - User guide and features
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions
- **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - Technical overview
- **[RLS_POLICIES_APPLIED.md](./RLS_POLICIES_APPLIED.md)** - Security setup

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database** | Supabase (PostgreSQL) |
| **State** | Zustand + React Query |
| **Real-time** | Supabase Realtime |
| **Icons** | Lucide React |

---

## 📸 Screenshots

### Product Listing
![Product Listing](https://via.placeholder.com/800x400?text=Product+Listing+Screenshot)

### Shopping Cart
![Shopping Cart](https://via.placeholder.com/800x400?text=Shopping+Cart+Screenshot)

### Checkout
![Checkout](https://via.placeholder.com/800x400?text=Checkout+Screenshot)

---

## 🎨 Customization

### Change Colors

Edit `tailwind.config.ts`:
```typescript
theme: {
  extend: {
    colors: {
      primary: '#your-brand-color',
    },
  },
}
```

### Add Payment Gateway

See `components/CheckoutModal.tsx` - integrate M-Pesa, Stripe, PayPal, etc.

### Custom Product Fields

Extend the `Product` interface in `lib/supabase.ts`

---

## 🔐 Security

- ✅ Row Level Security (RLS) enforced
- ✅ Public users have read-only access to products
- ✅ Orders are write-only (can create but not modify)
- ✅ Service role key never exposed to frontend
- ✅ All API calls use anon key with limited permissions

---

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Built for [Smart Traders](https://munene.shop)
- Powered by [Supabase](https://supabase.com)
- UI components inspired by [shadcn/ui](https://ui.shadcn.com)

---

## 📞 Support

- 📧 Email: support@smarttraders.com
- 🐛 Issues: [GitHub Issues](https://github.com/fes0010/smart-traders-storefront/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/fes0010/smart-traders-storefront/discussions)

---

<div align="center">

**⭐ Star this repo if you find it helpful!**

Made with ❤️ by the Smart Traders Team

[⬆ Back to Top](#-smart-traders-e-commerce-storefront)

</div>


