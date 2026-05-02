# ALINEA Production Deployment Guide

## Architecture Overview

ALINEA is a full-stack, production-ready application with:
- **Frontend:** Next.js 16 with React 19, Tailwind CSS, animations
- **Backend:** Next.js API routes with Neon PostgreSQL, Zod validation, RLS
- **Wallet:** Wagmi v2 + RainbowKit (Ethereum, Polygon, Base, Arbitrum)
- **Authentication:** NextAuth.js with SIWE (Sign In with Ethereum)
- **Email:** SendGrid for transactional & weekly reports
- **Market Data:** CoinGecko API for real-time sentiment
- **NFT Achievements:** ERC-721 minting on supported chains
- **Internationalization:** Multi-language support (EN, ES, ZH, JA, KO)
- **Security:** AES-256 encryption, httpOnly cookies, RLS policies, rate limiting

## Pre-Deployment Checklist

### Infrastructure Setup
- [ ] Neon PostgreSQL project created
- [ ] Database URL copied to Vercel environment variables
- [ ] Daily backup enabled in Neon console
- [ ] SendGrid account created and API key generated
- [ ] WalletConnect project created (for Wagmi)
- [ ] NFT smart contract deployed to mainnet (or testnet for MVP)
- [ ] Etherscan verification completed

### Environment Variables
Create a `.env.local` file locally and configure in Vercel:

```bash
# Database (from Neon)
DATABASE_URL=postgresql://user:password@host/dbname
ENCRYPTION_KEY=<generate-strong-key>

# NextAuth
NEXTAUTH_SECRET=<openssl rand -base64 32>
NEXTAUTH_URL=https://yourdomain.com

# Web3 / Wagmi
NEXT_PUBLIC_WC_PROJECT_ID=<your-walletconnect-id>
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/<your-key>
NFT_CONTRACT_ADDRESS=0x...
NFT_MINTER_PRIVATE_KEY=0x...

# Email
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# App
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

### Database Setup

1. **Execute migration script:**
```bash
psql -h <host> -U <user> -d <database> -f scripts/setup-db.sql
```

2. **Verify tables created:**
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

3. **Test RLS policies:**
```sql
-- Connect as authenticated user
SET LOCAL ROLE authenticated_user;
SELECT * FROM users WHERE id != current_user_id; -- Should return empty
```

## Deployment Steps

### 1. GitHub Repository Setup
```bash
# Initialize git
git init

# Add files
git add .

# Commit
git commit -m "Initial ALINEA production release"

# Push to GitHub
git branch -M main
git push -u origin main
```

### 2. Vercel Deployment

**Option A: Direct Vercel Connection**
1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Add environment variables (from `.env.local`)
4. Set Node.js version to 18+
5. Deploy

**Option B: Manual Deployment**
```bash
npm i -g vercel
vercel login
vercel env pull # Downloads production environment
npm run build
vercel --prod
```

### 3. Post-Deployment Testing

**Health Checks:**
```bash
# API endpoint test
curl https://yourdomain.com/api/health

# Wallet connection test
# Try connecting different chains in browser

# Database connectivity
# Check Neon console for connection logs

# Email verification
# Trigger a weekly report manually and verify receipt
```

**Manual Testing Checklist:**
- [ ] Landing page loads, animations work
- [ ] Wallet connection works (MetaMask, WalletConnect)
- [ ] SIWE signature request works
- [ ] Onboarding archetype selection saves
- [ ] Dashboard loads user data correctly
- [ ] Transaction test simulation works
- [ ] Emotional score calculation displays
- [ ] API rate limiting works (test with 101 rapid requests)
- [ ] Weekly report email sends
- [ ] Achievement NFT minting works (if connected)
- [ ] Language switching works
- [ ] All 4 blockchains testable (if using testnets)

## Monitoring & Maintenance

### Real-Time Monitoring

**Sentry Setup (for error tracking):**
```javascript
// lib/sentry.ts
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

**Set up alerts for:**
- API errors > 5% error rate
- Database connection timeouts
- Email delivery failures
- NFT minting failures
- Rate limit triggers

### Database Maintenance

**Weekly:**
```sql
-- Analyze query performance
ANALYZE;

-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Reindex if needed
REINDEX TABLE trade_history;
```

**Monthly:**
```sql
-- Update statistics
VACUUM ANALYZE;

-- Check for unused indexes
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE schemaname NOT IN ('pg_catalog', 'information_schema');
```

### Backup Verification

Test monthly backup restoration:
1. Download backup from Neon console
2. Restore to staging database
3. Run smoke tests
4. Verify data integrity

## Scaling Considerations

### Traffic Scaling
- Vercel auto-scales serverless functions
- Monitor cold start times
- Consider edge caching for static assets

### Database Scaling
- Monitor query times in Neon console
- Add indexes for slow queries (< 100ms target)
- Consider read replicas for reporting queries

### Rate Limiting Scaling
- Migrate from in-memory to Redis (Upstash)
- Use stricter limits for API vs. UI
- Implement per-IP + per-user hybrid limiting

### Email Scaling
- SendGrid handles up to 500 emails/second
- Use scheduled jobs for weekly digests (avoid peaks)
- Monitor bounce rates weekly

## Security Maintenance

### Weekly
- [ ] Review audit logs for suspicious activity
- [ ] Check rate limit triggers
- [ ] Verify backup integrity
- [ ] Monitor Sentry for errors

### Monthly
- [ ] Update dependencies (`npm update`)
- [ ] Run security audit (`npm audit`)
- [ ] Review email bounce/complaint rates
- [ ] Check SSL certificate expiration

### Quarterly
- [ ] Penetration testing
- [ ] Security code review
- [ ] Rotate API keys
- [ ] Review and update security policies

## Troubleshooting

### Common Issues

**"Database connection refused"**
- Check DATABASE_URL format
- Verify IP whitelisting in Neon console
- Test with `psql -c "SELECT 1"`

**"SIWE signature verification failed"**
- Ensure NEXTAUTH_URL matches domain exactly
- Check NEXTAUTH_SECRET is set
- Verify wallet address format (lowercase)

**"NFT minting fails"**
- Check NFT_MINTER_PRIVATE_KEY has funds
- Verify RPC_URL is correct for chain
- Check contract address is valid
- Test on testnet first

**"Emails not sending"**
- Verify SENDGRID_API_KEY is set
- Check sender email authenticated in SendGrid
- Review SendGrid bounce/complaint logs
- Test with `curl -X POST` to SendGrid API

**"Slow transaction API response"**
- Check CoinGecko API rate limits
- Add timeout for market mood fetch
- Cache market sentiment for 5 minutes
- Use cached data on API errors

## Incident Response

### Database Compromised
1. Rotate DATABASE_URL immediately
2. Revoke all active sessions
3. Force users to re-authenticate
4. Audit all recent queries
5. Restore from backup if needed

### API Under Attack
1. Enable IP blocking in Vercel WAF
2. Increase rate limits to 10 req/minute
3. Contact SendGrid/WalletConnect support
4. Scale up Vercel functions
5. Update DNS to CDN

### Smart Contract Exploit
1. Pause NFT minting immediately
2. Notify users via email
3. Investigate transaction
4. Engage legal counsel
5. Post mortem analysis

## Performance Optimization

### Frontend
- [ ] Enable Vercel Analytics
- [ ] Monitor Core Web Vitals
- [ ] Optimize image sizes with next/image
- [ ] Use dynamic imports for code splitting

### API
- [ ] Monitor response times in Vercel Analytics
- [ ] Cache CoinGecko responses (5 min TTL)
- [ ] Use prepared statements for queries
- [ ] Implement query result caching

### Database
- [ ] Monitor slow query log
- [ ] Create indexes on WHERE/JOIN columns
- [ ] Partition large tables (trade_history)
- [ ] Use connection pooling (default in Neon)

## Cost Estimation (Monthly)

- **Vercel:** $20-$100 (based on traffic)
- **Neon:** $25-$100 (based on compute/storage)
- **SendGrid:** $0-$50 (free for <100 emails/day)
- **WalletConnect:** Free (with project ID)
- **Domain/SSL:** $10-$20
- **Total estimate:** $55-$270/month

## Support & Resources

- **Neon Docs:** https://neon.tech/docs
- **NextAuth.js:** https://next-auth.js.org
- **Wagmi Docs:** https://wagmi.sh
- **SendGrid:** https://docs.sendgrid.com
- **Vercel:** https://vercel.com/docs

## Team Handoff Checklist

Before handing off to ops team:
- [ ] All env vars documented (securely)
- [ ] Database backup procedures documented
- [ ] Runbook for common issues
- [ ] On-call rotation schedule
- [ ] Alert thresholds configured
- [ ] Monitoring dashboards set up
- [ ] Incident response templates ready
- [ ] Weekly sync meetings scheduled
