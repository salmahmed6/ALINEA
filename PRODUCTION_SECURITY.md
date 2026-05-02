# ALINEA Production Security & Deployment Checklist

## Overview
This document outlines all security practices, environment setup, and production readiness checks for ALINEA.

## Environment Variables Required

### Critical Secrets (Never commit these)
```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname
ENCRYPTION_KEY=your-strong-encryption-key-here

# Authentication
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=https://yourdomain.com

# Wallet & Web3
NEXT_PUBLIC_WC_PROJECT_ID=your-walletconnect-project-id
NFT_CONTRACT_ADDRESS=0x...
NFT_MINTER_PRIVATE_KEY=0x... (private key for NFT minting wallet)
RPC_URL=https://mainnet.infura.io/v3/YOUR-PROJECT-ID

# Email Service
SENDGRID_API_KEY=SG.xxx
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Application
NEXT_PUBLIC_APP_URL=https://yourdomain.com
NODE_ENV=production
```

## Security Checklist

### 1. Data Encryption
- [ ] All user profiles encrypted with libsodium/crypto-js before storage
- [ ] Sensitive fields use AES-256 encryption
- [ ] Encryption keys rotated every 90 days
- [ ] Database backups encrypted at rest
- [ ] Transit encryption enforced (TLS 1.3)

### 2. Authentication & Sessions
- [ ] NextAuth.js SIWE (Sign In with Ethereum) configured
- [ ] Session tokens use secure httpOnly cookies
- [ ] CSRF protection enabled
- [ ] Session timeout: 30 days max
- [ ] Wallet addresses hashed before logging
- [ ] No private keys ever stored server-side
- [ ] Rate limiting on auth endpoints (5 attempts/minute)

### 3. Database Security
- [ ] Row Level Security (RLS) enabled on all tables
- [ ] Policies enforce user isolation
- [ ] Foreign key constraints in place
- [ ] Indexes optimized for performance
- [ ] Regular backups (daily minimum)
- [ ] Backups tested for restoration
- [ ] Database activity logging enabled

### 4. API Security
- [ ] All endpoints require authentication
- [ ] Request validation with Zod
- [ ] Response sanitization implemented
- [ ] Rate limiting on all endpoints (100 req/minute per user)
- [ ] CORS properly configured
- [ ] No sensitive data in logs
- [ ] API versioning strategy in place

### 5. Wallet & Transaction Safety
- [ ] Wallet addresses never logged in plaintext
- [ ] Transaction hashes logged but not signed data
- [ ] No private keys in environment (only signer private key for NFT minting)
- [ ] Multi-chain support validated for each chain
- [ ] Transaction simulation before execution
- [ ] Mempool watching for frontrun detection
- [ ] Gas price monitoring

### 6. Smart Contract Integration (NFT Minting)
- [ ] Contract audited by professional firm
- [ ] Contract verified on Etherscan
- [ ] Pause/unpause functionality for emergencies
- [ ] Minting limits per user enforced
- [ ] Test deployment on testnets first
- [ ] Gradual rollout to mainnet

### 7. Error Handling & Logging
- [ ] No sensitive data in error messages
- [ ] All errors logged securely (Sentry integration)
- [ ] Error monitoring alerts configured
- [ ] User-friendly error messages
- [ ] Server errors logged server-side only
- [ ] Audit trails for all data modifications

### 8. Frontend Security
- [ ] Content Security Policy (CSP) headers
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Referrer-Policy: strict-origin-when-cross-origin
- [ ] No sensitive data in localStorage (use httpOnly cookies)
- [ ] Input validation on all forms
- [ ] Output encoding for XSS prevention

### 9. Email Security
- [ ] SendGrid API key rotated every 90 days
- [ ] Email verification required for sensitive operations
- [ ] Unsubscribe links on all marketing emails
- [ ] DKIM/SPF/DMARC configured
- [ ] Email validation before sending
- [ ] Bounce handling automated
- [ ] Reply-to address monitored

### 10. Monitoring & Incident Response
- [ ] Sentry error tracking configured
- [ ] Real-time alerts for critical errors
- [ ] Uptime monitoring (e.g., Better Stack)
- [ ] Daily log analysis
- [ ] Weekly security audit reports
- [ ] Incident response plan documented
- [ ] On-call rotation schedule

### 11. Deployment & Infrastructure
- [ ] Environment variables managed in Vercel/hosting provider
- [ ] Never expose .env files in git
- [ ] Staging environment mirrors production
- [ ] Canary deployments for critical changes
- [ ] Blue-green deployment strategy
- [ ] Rollback procedures documented and tested
- [ ] CI/CD pipeline with security checks

### 12. Third-Party Dependencies
- [ ] All dependencies checked with npm audit
- [ ] Security scanning on every deployment
- [ ] Vulnerability alerts enabled
- [ ] Dependency updates reviewed before applying
- [ ] Lock files committed to version control
- [ ] No dev dependencies in production build

### 13. Compliance & Privacy
- [ ] Privacy Policy published and accessible
- [ ] Terms of Service reviewed by legal
- [ ] GDPR compliance (if serving EU users)
- [ ] Data retention policy enforced
- [ ] User deletion triggers cascade delete
- [ ] No tracking without consent
- [ ] Cookies policy compliant

### 14. Performance & Reliability
- [ ] Database query performance monitored
- [ ] Slow queries optimized (< 100ms target)
- [ ] Caching strategy implemented
- [ ] CDN for static assets
- [ ] Database connection pooling configured
- [ ] Graceful degradation for service outages
- [ ] Load testing completed

### 15. Backup & Disaster Recovery
- [ ] Daily database backups (encrypted)
- [ ] Off-site backup replication
- [ ] Recovery time objective (RTO): < 1 hour
- [ ] Recovery point objective (RPO): < 15 minutes
- [ ] Backup restoration tested monthly
- [ ] Disaster recovery plan documented
- [ ] Communication plan for outages

## Production Deployment Steps

### Pre-Deployment
1. [ ] All tests passing locally
2. [ ] Code review completed by 2+ developers
3. [ ] Security scan passes (no critical issues)
4. [ ] Staging environment tested end-to-end
5. [ ] Database migration tested
6. [ ] Environment variables set correctly
7. [ ] Backup created
8. [ ] Rollback plan documented

### Deployment
1. [ ] Blue-green deployment initiated
2. [ ] Health checks passing
3. [ ] Smoke tests completed
4. [ ] Monitoring alerts active
5. [ ] On-call engineer standing by
6. [ ] Stakeholders notified

### Post-Deployment
1. [ ] User traffic monitored (no spike in errors)
2. [ ] Performance metrics normal
3. [ ] Database queries performing
4. [ ] Email delivery confirmed
5. [ ] Wallet connections tested
6. [ ] Achievement NFT minting tested
7. [ ] Weekly report emails sent
8. [ ] Deployment documented

## Security Headers Configuration

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:; frame-ancestors 'none'; base-uri 'self'; form-action 'self';",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
        ],
      },
    ];
  },
};
```

## Incident Response Procedures

### Database Compromise
1. Immediately revoke all active sessions
2. Force password reset for all users
3. Audit all recent access logs
4. Notify affected users
5. Restore from clean backup
6. Enable enhanced monitoring

### API Breach
1. Rate limit API to 1 req/minute
2. Rotate all API keys
3. Enable 2FA for admin accounts
4. Review access logs
5. Patch vulnerability
6. Deploy patched version

### Smart Contract Exploit
1. Pause NFT minting immediately
2. Investigate transaction details
3. Notify all users
4. Engage legal counsel
5. Submit bug bounty if applicable
6. Post mortem analysis

## Regular Maintenance Schedule

- **Daily:** Monitor error rates, check backups
- **Weekly:** Security audit, performance review
- **Monthly:** Dependency updates, backup restoration test
- **Quarterly:** Security assessment, penetration testing
- **Annually:** Full security audit, compliance review

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Ethereum Security Best Practices](https://ethereum.org/en/developers/tutorials/secure-development-workflow/)
- [SendGrid Security](https://docs.sendgrid.com/for-developers/security/security-best-practices)
- [NextAuth.js Security](https://next-auth.js.org/security)

## Approval & Sign-Off

- [ ] Security Lead: _________________ Date: _______
- [ ] DevOps Lead: _________________ Date: _______
- [ ] Product Manager: _________________ Date: _______
