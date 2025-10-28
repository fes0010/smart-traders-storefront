#!/bin/bash

# Smart Traders E-Commerce Storefront Setup Script
# This script helps you set up the storefront quickly

set -e

echo "🛍️  Smart Traders E-Commerce Storefront Setup"
echo "=============================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env.local exists
if [ -f ".env.local" ]; then
    echo "⚠️  .env.local already exists. Do you want to reconfigure? (y/n)"
    read -r RECONFIGURE
    if [ "$RECONFIGURE" != "y" ]; then
        echo "Skipping environment configuration..."
    else
        rm .env.local
    fi
fi

# Configure environment variables if needed
if [ ! -f ".env.local" ]; then
    echo "📝 Let's configure your environment variables..."
    echo ""
    
    # Supabase URL
    echo "Enter your Supabase URL (default: https://supabase.munene.shop):"
    read -r SUPABASE_URL
    SUPABASE_URL=${SUPABASE_URL:-https://supabase.munene.shop}
    
    # Supabase Anon Key
    echo ""
    echo "Enter your Supabase Anon Key:"
    read -r SUPABASE_ANON_KEY
    
    # Store Name
    echo ""
    echo "Enter your store name (default: Smart Traders Store):"
    read -r STORE_NAME
    STORE_NAME=${STORE_NAME:-Smart Traders Store}
    
    # Currency
    echo ""
    echo "Enter your currency code (default: KES):"
    read -r CURRENCY
    CURRENCY=${CURRENCY:-KES}
    
    # Create .env.local
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY

# Store Configuration
NEXT_PUBLIC_STORE_NAME=$STORE_NAME
NEXT_PUBLIC_STORE_DESCRIPTION=Quality products at great prices
NEXT_PUBLIC_CURRENCY=$CURRENCY

# Features
NEXT_PUBLIC_ENABLE_REAL_TIME=true
NEXT_PUBLIC_SHOW_STOCK_COUNT=true
NEXT_PUBLIC_LOW_STOCK_THRESHOLD=10
EOF
    
    echo ""
    echo "✅ Environment configuration saved to .env.local"
fi

echo ""
echo "📦 Installing dependencies..."
npm install

echo ""
echo "🏗️  Building application..."
npm run build

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Next steps:"
echo "   1. Start development server: npm run dev"
echo "   2. Or start production server: npm start"
echo "   3. Open http://localhost:3000 in your browser"
echo ""
echo "📚 For deployment instructions, see DEPLOYMENT.md"
echo ""


