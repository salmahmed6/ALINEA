#!/bin/bash

# ALINEA Production Setup Script
# Run this to configure your environment for production deployment

set -e

echo "=================================================="
echo "   ALINEA - Production Setup Script"
echo "=================================================="
echo ""

# Check if .env.local exists
if [ -f .env.local ]; then
    echo "⚠️  .env.local already exists. Skipping creation."
else
    echo "📝 Creating .env.local template..."
    cat > .env.local << 'EOF'
# Database (from Neon)
DATABASE_URL=postgresql://user:password@host/dbname
ENCRYPTION_KEY=<generate-with-openssl-rand-base64-32>

# NextAuth
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
NEXTAUTH_URL=https://yourdomain.com

# Web3
NEXT_PUBLIC_WC_PROJECT_ID=<your-walletconnect-project-id>
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR-KEY
NFT_CONTRACT_ADDRESS=0x...
NFT_MINTER_PRIVATE_KEY=0x...

# Email
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
EOF
    echo "✅ Created .env.local template"
fi

echo ""
echo "🔧 Environment Setup Steps:"
echo ""
echo "1. Update .env.local with your actual values:"
echo "   - DATABASE_URL: Get from Neon dashboard"
echo "   - ENCRYPTION_KEY: Run: openssl rand -base64 32"
echo "   - NEXTAUTH_SECRET: Run: openssl rand -base64 32"
echo "   - NEXT_PUBLIC_WC_PROJECT_ID: Get from WalletConnect dashboard"
echo "   - RPC_URL: Get from Alchemy/Infura"
echo "   - NFT details: From your smart contract"
echo "   - SENDGRID_API_KEY: From SendGrid dashboard"
echo "   - NEXT_PUBLIC_APP_URL: Your production domain"
echo ""

echo "2. Install dependencies:"
echo "   npm install"
echo ""

echo "3. Setup database:"
echo "   psql \$DATABASE_URL < scripts/setup-db.sql"
echo ""

echo "4. Test locally:"
echo "   npm run dev"
echo ""

echo "5. Deploy to Vercel:"
echo "   vercel --prod"
echo ""

echo "💡 Quick Reference:"
echo ""
echo "Generate secure random strings:"
echo "  openssl rand -base64 32"
echo ""

echo "Test database connection:"
echo "  psql \$DATABASE_URL -c 'SELECT 1;'"
echo ""

echo "View deployment logs:"
echo "  vercel logs --prod"
echo ""

echo "Rollback last deployment:"
echo "  vercel rollback --prod"
echo ""

echo "=================================================="
echo "✨ ALINEA is ready for production!"
echo "=================================================="
