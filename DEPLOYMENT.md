# 🚀 Deployment Guide - Smart Traders E-Commerce Storefront

Complete deployment instructions for various platforms.

## 📋 Pre-Deployment Checklist

- [ ] Get Supabase anon key from your instance
- [ ] Configure RLS policies (see Security section)
- [ ] Test locally with `npm run dev`
- [ ] Choose deployment platform
- [ ] Prepare domain name (optional)

---

## 🔐 Security Setup (IMPORTANT!)

Before deploying, ensure your Supabase database has proper Row Level Security (RLS) policies:

### 1. Enable RLS on Tables

```sql
-- Enable RLS on products table
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transactions table
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Enable RLS on transaction_items table
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;
```

### 2. Create Public Access Policies

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

-- Allow public to update product quantities (for inventory)
CREATE POLICY "Public can update product quantities"
ON products FOR UPDATE
USING (true)
WITH CHECK (true);
```

### 3. Get Your Anon Key

```bash
# SSH into your server
ssh festus@munene.shop

# Get anon key from Supabase container
docker exec supabase-7071-kong cat /var/lib/kong/config/kong.yml | grep anon -A 2
```

Or from Supabase Dashboard:
1. Go to Settings > API
2. Copy "anon public" key

---

## 🌐 Option 1: Vercel (Easiest - Recommended for Beginners)

### Why Vercel?
- ✅ Free tier available
- ✅ Automatic HTTPS
- ✅ Global CDN
- ✅ Instant deployments
- ✅ Built for Next.js

### Steps:

1. **Install Vercel CLI:**
```bash
npm i -g vercel
```

2. **Login to Vercel:**
```bash
vercel login
```

3. **Deploy:**
```bash
cd e-commerce-storefront
vercel
```

4. **Answer prompts:**
   - Set up and deploy? **Y**
   - Which scope? **Your account**
   - Link to existing project? **N**
   - Project name? **smart-traders-storefront**
   - Directory? **./  (press Enter)**

5. **Add environment variables:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://supabase.munene.shop

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key

vercel env add NEXT_PUBLIC_STORE_NAME
# Paste: Smart Traders Store

vercel env add NEXT_PUBLIC_CURRENCY
# Paste: KES
```

6. **Deploy to production:**
```bash
vercel --prod
```

7. **Your store is live! 🎉**
   - URL: `https://smart-traders-storefront.vercel.app`
   - Or custom domain in Vercel dashboard

---

## 🐳 Option 2: Docker + Dokploy (Same Server as POS)

### Why Dokploy?
- ✅ All services on one server
- ✅ Easy management
- ✅ Share database connection
- ✅ Cost-effective

### Steps:

1. **SSH into server:**
```bash
ssh festus@munene.shop
```

2. **Navigate to project:**
```bash
cd "/home/festus/john selfhosted/smart-traders-selfhosted/e-commerce-storefront"
```

3. **Create `.env` file:**
```bash
nano .env
```

Add:
```env
SUPABASE_ANON_KEY=your-anon-key-here
```

Save (Ctrl+O, Enter, Ctrl+X)

4. **Build and run:**
```bash
# Build Docker image
docker build -t smart-traders-storefront .

# Run container
docker run -d \
  --name smart-traders-storefront \
  --restart unless-stopped \
  -p 3001:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://supabase.munene.shop \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here \
  -e NEXT_PUBLIC_STORE_NAME="Smart Traders Store" \
  -e NEXT_PUBLIC_CURRENCY=KES \
  --network smart-traders-network \
  smart-traders-storefront
```

Or use docker-compose:
```bash
# Start with docker-compose
docker-compose up -d
```

5. **Configure Dokploy:**
   - Go to Dokploy dashboard
   - Add "Existing Application"
   - Point to port 3001
   - Set domain: `shop.munene.shop`
   - Enable SSL

6. **Your store is live! 🎉**
   - Local: `http://munene.shop:3001`
   - Public: `https://shop.munene.shop`

---

## 🌩️ Option 3: Netlify

### Steps:

1. **Install Netlify CLI:**
```bash
npm i -g netlify-cli
```

2. **Login:**
```bash
netlify login
```

3. **Build:**
```bash
cd e-commerce-storefront
npm run build
```

4. **Deploy:**
```bash
netlify deploy --prod
```

5. **Add environment variables:**
   - Go to Netlify dashboard
   - Site settings > Environment variables
   - Add all `NEXT_PUBLIC_*` variables

6. **Redeploy:**
```bash
netlify deploy --prod
```

---

## 🔧 Post-Deployment Setup

### 1. Test Real-time Functionality

Visit your store and open browser console:
```javascript
// Should see:
✅ Real-time connected
```

Look for green "Live" badge in header.

### 2. Test Checkout Flow

1. Add products to cart
2. Proceed to checkout
3. Fill customer info
4. Place order
5. Check order appears in POS system

### 3. Configure Domain (Optional)

#### For Vercel:
1. Vercel dashboard > Domains
2. Add custom domain: `shop.yourdomain.com`
3. Update DNS records as shown

#### For Dokploy:
1. Dokploy dashboard > Applications
2. Add domain
3. Enable SSL (Let's Encrypt)

### 4. Performance Optimization

```bash
# Generate optimized images
npm run build

# Analyze bundle size
npx @next/bundle-analyzer
```

---

## 📊 Monitoring & Maintenance

### Health Check

```bash
# Check if container is running
docker ps | grep storefront

# Check logs
docker logs smart-traders-storefront

# Check real-time connection
curl https://shop.munene.shop
```

### Update Deployment

```bash
# Pull latest changes
cd "/home/festus/john selfhosted/smart-traders-selfhosted/e-commerce-storefront"
git pull

# Rebuild
docker build -t smart-traders-storefront .

# Stop old container
docker stop smart-traders-storefront
docker rm smart-traders-storefront

# Start new container
docker run -d \
  --name smart-traders-storefront \
  --restart unless-stopped \
  -p 3001:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=https://supabase.munene.shop \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key \
  smart-traders-storefront
```

---

## 🐛 Troubleshooting

### Issue: Products not loading

**Check:**
1. Supabase URL is correct
2. Anon key is valid
3. RLS policies are set
4. Products table has data

**Fix:**
```bash
# Test Supabase connection
curl "https://supabase.munene.shop/rest/v1/products?status=eq.active" \
  -H "apikey: your-anon-key" \
  -H "Authorization: Bearer your-anon-key"
```

### Issue: Real-time not working

**Check:**
1. Realtime enabled in Supabase
2. WebSocket connection in Network tab
3. RLS allows SELECT on products

**Fix:**
```sql
-- Check Realtime is enabled
SELECT * FROM pg_publication;

-- Should see: supabase_realtime

-- Enable if missing
CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
```

### Issue: Checkout failing

**Check:**
1. RLS allows INSERT on transactions
2. Product quantities available
3. Browser console errors

**Fix:**
```sql
-- Test insert permission
INSERT INTO transactions (customer_name, customer_phone, total_amount, payment_method, view_mode, unique_code)
VALUES ('Test', '0700000000', 100, 'cash', 'retail', 'TEST-123');
```

### Issue: CORS errors

**Fix in Supabase:**
```sql
-- Add CORS headers (if self-hosted)
-- In Kong configuration:
cors_origins: "*"
```

---

## 🔒 Security Best Practices

1. **Never expose service role key**
   - Only use anon key in frontend
   - Service role key stays in backend only

2. **Restrict RLS policies**
   - Only allow public read for active products
   - Don't allow public DELETE or UPDATE on transactions

3. **Enable rate limiting**
   - Configure Kong rate limits in Supabase
   - Add Cloudflare for DDoS protection

4. **Use environment variables**
   - Never hardcode keys in code
   - Use different keys for dev/prod

5. **Monitor logs**
   - Check for suspicious activity
   - Set up alerts for errors

---

## 📈 Performance Tips

1. **Enable caching:**
   - Vercel automatically caches static assets
   - Configure CDN for Docker deployment

2. **Optimize images:**
   - Use Next.js Image component
   - Compress images before upload

3. **Database indexing:**
```sql
-- Add indexes for common queries
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_selling_mode ON products(selling_mode);
CREATE INDEX idx_products_category ON products(category);
```

4. **Connection pooling:**
   - Supabase handles this automatically
   - Default: 15 connections

---

## 🎉 Success Checklist

After deployment, verify:
- [ ] Store loads correctly
- [ ] Products display with images
- [ ] Search and filters work
- [ ] Cart persists on refresh
- [ ] Checkout creates orders
- [ ] Real-time updates work
- [ ] Mobile responsive
- [ ] HTTPS enabled
- [ ] Custom domain working (if applicable)
- [ ] Orders appear in POS

---

## 🆘 Need Help?

1. Check logs:
   - Vercel: Dashboard > Deployments > View Logs
   - Docker: `docker logs smart-traders-storefront`

2. Test locally:
   ```bash
   npm run dev
   ```

3. Verify database:
   ```bash
   docker exec -it supabase-7071-db psql -U postgres
   \dt  # List tables
   SELECT COUNT(*) FROM products WHERE status = 'active';
   ```

---

**Congratulations! Your e-commerce store is now live! 🚀🛍️**

