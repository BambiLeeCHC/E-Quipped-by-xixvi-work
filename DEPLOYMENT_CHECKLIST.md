# E-Quipped Deployment Checklist

**Date:** March 01, 2026

## Pre-Deployment Phase

### Code & Repository
- [ ] All code is committed to the `main` branch
- [ ] No uncommitted changes remain (`git status` shows clean)
- [ ] `.gitignore` includes `.env` and sensitive files
- [ ] `pnpm-lock.yaml` is committed to version control
- [ ] Build succeeds locally: `pnpm build`
- [ ] Tests pass: `pnpm test`
- [ ] TypeScript type checking passes: `pnpm check`
- [ ] No console errors or warnings in development build

### Environment Variables
- [ ] `DATABASE_URL` is obtained and verified
- [ ] `VITE_APP_ID` is obtained from Manus
- [ ] `OAUTH_SERVER_URL` is obtained from Manus
- [ ] `VITE_OAUTH_PORTAL_URL` is obtained from Manus
- [ ] `JWT_SECRET` is generated (32+ characters)
- [ ] `OWNER_OPEN_ID` is obtained from Manus profile
- [ ] `STRIPE_SECRET_KEY` is obtained from Stripe (use `sk_live_` for production)
- [ ] `STRIPE_PRICE_LIFETIME` is obtained from Stripe Products
- [ ] `BUILT_IN_FORGE_API_URL` is obtained from Manus
- [ ] `BUILT_IN_FORGE_API_KEY` is obtained from Manus
- [ ] `NODE_ENV` is set to `production`
- [ ] All secrets are stored securely (not in version control)

### Database
- [ ] MySQL database is provisioned and accessible
- [ ] Database credentials are correct and verified
- [ ] Database user has `CREATE TABLE` and `ALTER TABLE` permissions
- [ ] Database is empty (no conflicting tables)
- [ ] Backup of any existing data has been created (if applicable)

### Third-Party Services
- [ ] Stripe account is active and in production mode
- [ ] Stripe API keys are generated and verified
- [ ] Stripe product and pricing are configured
- [ ] Manus OAuth app is created and configured
- [ ] Manus Forge API key is generated and verified
- [ ] All API keys and secrets are securely stored

### Infrastructure
- [ ] Railway account is created and verified
- [ ] GitHub repository is accessible from Railway
- [ ] Railway project is created and linked to GitHub
- [ ] MySQL service is provisioned on Railway
- [ ] Node.js service is configured with correct build/start commands
- [ ] All environment variables are added to Railway

## Deployment Phase

### Initial Deployment
- [ ] Railway build completes successfully
- [ ] Application is marked as "Live" in Railway
- [ ] Public domain is assigned (e.g., `e-quipped-prod.up.railway.app`)
- [ ] No errors in Railway logs
- [ ] Application is accessible via public domain

### Database Setup
- [ ] Database migrations are run successfully
- [ ] All 14 tables are created in the database
- [ ] Table schemas match the Drizzle ORM definitions
- [ ] No migration errors in logs

### Stripe Webhook Configuration
- [ ] Stripe webhook endpoint is created
- [ ] Webhook URL is correct: `https://<domain>/api/stripe/webhook`
- [ ] Webhook signing secret is obtained from Stripe
- [ ] `STRIPE_WEBHOOK_SECRET` is updated in Railway
- [ ] Application is redeployed with webhook secret
- [ ] Webhook delivery is tested in Stripe dashboard

## Post-Deployment Phase

### Application Verification
- [ ] Application loads without errors
- [ ] Homepage is accessible and renders correctly
- [ ] All static assets load (CSS, JavaScript, images)
- [ ] No console errors in browser DevTools
- [ ] No errors in application logs

### Authentication Testing
- [ ] OAuth login flow works correctly
- [ ] User is redirected to Manus login portal
- [ ] After login, user is redirected back to application
- [ ] Session cookie is set correctly
- [ ] User profile is accessible
- [ ] Logout works correctly

### Database Testing
- [ ] Database connection is successful
- [ ] User data is persisted correctly
- [ ] Queries execute without errors
- [ ] No connection timeouts or pool exhaustion

### Stripe Integration Testing
- [ ] Stripe checkout page loads correctly
- [ ] Payment form is functional
- [ ] Test payment succeeds (use Stripe test card: `4242 4242 4242 4242`)
- [ ] Webhook is triggered after successful payment
- [ ] Payment record is created in database
- [ ] User status is updated to "verified" after payment

### AI Features Testing
- [ ] LLM API calls work correctly
- [ ] Sandbox chat feature is functional
- [ ] Prompt evaluation works
- [ ] File uploads work (if applicable)

### Security Testing
- [ ] HTTPS is enforced (no mixed content)
- [ ] Security headers are present (CSP, X-Frame-Options, etc.)
- [ ] API endpoints require authentication where needed
- [ ] Admin endpoints are protected
- [ ] CORS is properly configured
- [ ] Secrets are not exposed in client-side code

### Performance Testing
- [ ] Page load time is acceptable (< 3 seconds)
- [ ] API responses are fast (< 500ms)
- [ ] Database queries are optimized
- [ ] No memory leaks in application
- [ ] No unnecessary network requests

### Monitoring & Logging
- [ ] Application logs are being captured
- [ ] Error logs are being sent to monitoring service (if configured)
- [ ] Database logs are accessible
- [ ] Stripe webhook logs are accessible
- [ ] No critical errors in logs

## Production Readiness

### Backups & Disaster Recovery
- [ ] Database backups are configured and tested
- [ ] Backup retention policy is set (e.g., 30 days)
- [ ] Backup restoration procedure is documented
- [ ] Disaster recovery plan is in place

### Monitoring & Alerting
- [ ] Application uptime monitoring is configured
- [ ] Error rate alerts are configured
- [ ] Database performance alerts are configured
- [ ] Stripe webhook failure alerts are configured
- [ ] Team is notified of critical alerts

### Documentation
- [ ] Deployment guide is complete and accurate
- [ ] Environment variables guide is complete
- [ ] Database migration guide is complete
- [ ] Troubleshooting guide is available
- [ ] Team has access to all documentation

### Team Readiness
- [ ] Team members have access to deployment tools
- [ ] Team members understand the deployment process
- [ ] Rollback procedure is documented and tested
- [ ] On-call rotation is established
- [ ] Escalation procedures are defined

## Post-Launch Phase (First Week)

### Monitoring
- [ ] Monitor application logs daily for errors
- [ ] Monitor database performance and query times
- [ ] Monitor Stripe webhook delivery success rate
- [ ] Monitor API response times and error rates
- [ ] Monitor user feedback and bug reports

### Performance Optimization
- [ ] Identify and optimize slow database queries
- [ ] Identify and optimize slow API endpoints
- [ ] Optimize frontend bundle size if needed
- [ ] Review and optimize database indexes

### Security Hardening
- [ ] Review and strengthen security headers
- [ ] Audit API endpoints for authorization issues
- [ ] Review and rotate API keys if needed
- [ ] Monitor for suspicious activity

### User Feedback
- [ ] Collect feedback from initial users
- [ ] Address critical bugs immediately
- [ ] Document known issues and workarounds
- [ ] Plan fixes for non-critical issues

## Rollback Procedure (If Needed)

If critical issues are discovered after deployment:

1. [ ] Identify the issue and severity
2. [ ] Notify the team and stakeholders
3. [ ] Prepare a rollback plan
4. [ ] In Railway, go to Deployments tab
5. [ ] Find the previous stable deployment
6. [ ] Click the three-dot menu and select "Redeploy"
7. [ ] Verify the rollback was successful
8. [ ] Investigate the root cause of the issue
9. [ ] Fix the issue and redeploy

## Sign-Off

- [ ] Project Manager: _________________ Date: _______
- [ ] Lead Developer: _________________ Date: _______
- [ ] DevOps/Infrastructure: _________________ Date: _______
- [ ] QA Lead: _________________ Date: _______

## Notes

Use this section to document any deviations from the standard deployment process or special considerations:

```
[Add notes here]
```

---

## Quick Reference

### Critical Environment Variables
```
DATABASE_URL=mysql://...
STRIPE_SECRET_KEY=sk_live_...
JWT_SECRET=... (32+ chars)
OWNER_OPEN_ID=...
```

### Important URLs
- Railway Dashboard: https://railway.app
- Stripe Dashboard: https://dashboard.stripe.com
- Manus Developer Settings: https://manus.im/settings/developer
- Application Domain: https://<your-railway-domain>

### Emergency Contacts
- Railway Support: support@railway.app
- Stripe Support: https://support.stripe.com
- Manus Support: https://help.manus.im

### Useful Commands
```bash
# View logs
railway run tail -f /var/log/app.log

# Run migrations
railway run pnpm db:push

# Restart application
railway redeploy

# Connect to database
mysql -h <host> -u <user> -p <database>
```
