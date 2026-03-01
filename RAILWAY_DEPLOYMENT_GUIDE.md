# Railway Deployment Guide for E-Quipped

**Date:** March 01, 2026

## Overview

This guide provides step-by-step instructions for deploying the E-Quipped application on Railway, a modern cloud platform designed for developers. Railway offers a simple, usage-based pricing model and excellent support for Node.js monorepos.

## Prerequisites

- A GitHub account with access to the `BambiLeeCHC/E-Quipped-by-xixvi-work` repository
- A Railway account (sign up at https://railway.app)
- All required environment variables (see `ENVIRONMENT_VARIABLES.md`)
- Admin access to Stripe, Manus, and any other third-party services

## Step 1: Create a Railway Project

1. Log in to your Railway account at https://railway.app
2. Click **"New Project"** in the top-right corner
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub account (if not already done)
5. Search for and select the `BambiLeeCHC/E-Quipped-by-xixvi-work` repository
6. Click **"Deploy"**

Railway will automatically detect the Node.js project and begin the initial setup.

## Step 2: Add a MySQL Database

1. In your Railway project dashboard, click **"+ New"** (top-right)
2. Select **"Database"** from the menu
3. Choose **"MySQL"**
4. Click **"Create"**

Railway will provision a MySQL database and automatically add the `DATABASE_URL` environment variable to your project.

## Step 3: Configure the Main Service

Railway should have automatically created a service for your application. To configure it:

1. Click on the service (usually named after your repository)
2. Go to the **"Settings"** tab
3. Verify the following settings:

   | Setting | Value |
   | :--- | :--- |
   | **Build Command** | `pnpm install && pnpm build` |
   | **Start Command** | `pnpm start` |
   | **Root Directory** | `/` |
   | **Node Version** | `22` (or latest LTS) |

4. If any settings are incorrect, update them and save

## Step 4: Add Environment Variables

1. In your Railway project, go to the **"Variables"** tab
2. Click **"+ New Variable"** for each required variable
3. Add all variables from the table below:

| Variable | Value | Notes |
| :--- | :--- | :--- |
| `VITE_APP_ID` | Your Manus App ID | From Manus Developer Settings |
| `OAUTH_SERVER_URL` | https://oauth.manus.im | Manus OAuth endpoint |
| `VITE_OAUTH_PORTAL_URL` | https://login.manus.im | Manus login portal |
| `JWT_SECRET` | Generate a secure secret | Use 32+ character random string |
| `OWNER_OPEN_ID` | Your Manus OpenID | From your Manus profile |
| `STRIPE_SECRET_KEY` | sk_live_... | From Stripe Dashboard |
| `STRIPE_WEBHOOK_SECRET` | whsec_... | Will be set after webhook creation |
| `STRIPE_PRICE_LIFETIME` | price_... | From Stripe Products |
| `BUILT_IN_FORGE_API_URL` | https://forge.manus.im | Manus Forge API endpoint |
| `BUILT_IN_FORGE_API_KEY` | Your Forge API Key | From Manus Developer Settings |
| `NODE_ENV` | production | Always use for production |

**Note:** You can temporarily leave `STRIPE_WEBHOOK_SECRET` empty and update it after deployment.

## Step 5: Deploy the Application

1. After configuring all environment variables, Railway will automatically trigger a build and deployment
2. Monitor the deployment progress in the **"Deployments"** tab
3. The build should complete in 2-5 minutes
4. Once complete, you'll see a **"Live"** status indicator

## Step 6: Get Your Public Domain

1. In your Railway project, click on your main service
2. Go to the **"Settings"** tab
3. Find the **"Domains"** section
4. You should see a public domain like: `e-quipped-prod.up.railway.app`
5. Copy this domain for use in the next steps

## Step 7: Configure Stripe Webhook

Now that your application is deployed, you need to configure the Stripe webhook:

1. Log in to your Stripe Dashboard at https://dashboard.stripe.com
2. Go to **Developers** > **Webhooks**
3. Click **"Add an endpoint"**
4. In the **Endpoint URL** field, enter: `https://<your-railway-domain>/api/stripe/webhook`
   - Replace `<your-railway-domain>` with your actual Railway domain
   - Example: `https://e-quipped-prod.up.railway.app/api/stripe/webhook`
5. In the **Events to send** section, select the following events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
6. Click **"Add endpoint"**
7. Stripe will display the **Signing secret** (starts with `whsec_`)
8. Copy this secret

## Step 8: Update Stripe Webhook Secret

1. Go back to your Railway project
2. Go to the **"Variables"** tab
3. Find the `STRIPE_WEBHOOK_SECRET` variable
4. Paste the signing secret from Stripe
5. Save the changes

Railway will automatically redeploy your application with the updated variable.

## Step 9: Run Database Migrations

Once the application is deployed and all environment variables are set, you need to set up the database schema:

### Option A: Using Railway CLI (Recommended)

1. Install the Railway CLI on your local machine:
   ```bash
   npm i -g @railway/cli
   ```

2. Link your local project to the Railway deployment:
   ```bash
   cd /path/to/e-quipped
   railway link
   ```

3. Run the database migrations:
   ```bash
   railway run pnpm db:push
   ```

### Option B: Using SSH (Alternative)

1. In your Railway project, find your main service
2. Go to the **"Settings"** tab
3. Look for SSH connection details
4. Connect via SSH and run:
   ```bash
   pnpm db:push
   ```

## Step 10: Verify the Deployment

1. Open your Railway domain in a browser: `https://<your-railway-domain>`
2. You should see the E-Quipped login page
3. Test the OAuth login flow
4. Verify that the application loads without errors

Check the **"Logs"** tab in Railway for any error messages:

1. Go to your main service
2. Click the **"Logs"** tab
3. Look for any error messages or warnings
4. Common issues:
   - Database connection errors: Check `DATABASE_URL`
   - OAuth errors: Verify `VITE_APP_ID` and OAuth URLs
   - Stripe errors: Check webhook secret and API keys

## Monitoring & Maintenance

### View Application Logs

1. In your Railway project, click on your main service
2. Go to the **"Logs"** tab
3. Logs are displayed in real-time

### Monitor Resource Usage

1. Go to the **"Metrics"** tab
2. View CPU, memory, and disk usage
3. Railway automatically scales resources based on demand

### Update the Application

To deploy a new version:

1. Push changes to the `main` branch of your GitHub repository
2. Railway automatically detects the push and triggers a new build
3. The application will be redeployed with the latest code

### Rollback to Previous Deployment

1. Go to the **"Deployments"** tab
2. Find the previous deployment you want to restore
3. Click the three-dot menu and select **"Redeploy"**

## Troubleshooting

### Build Fails with "pnpm: command not found"

**Solution:** Ensure `pnpm` is installed. Railway should auto-detect it, but you can explicitly set Node version in settings.

### Application crashes after deployment

**Solution:**
1. Check the logs for error messages
2. Verify all environment variables are set correctly
3. Ensure the database migrations have been run

### Database connection errors

**Solution:**
1. Verify `DATABASE_URL` is set in Railway variables
2. Check that the MySQL service is running
3. Ensure the database user has proper permissions

### Stripe webhook not working

**Solution:**
1. Verify the webhook endpoint URL is correct
2. Check that `STRIPE_WEBHOOK_SECRET` matches the Stripe dashboard
3. Look for webhook delivery errors in Stripe Dashboard > Webhooks > Endpoint > Events

### OAuth login fails

**Solution:**
1. Verify `VITE_APP_ID` is correct
2. Check that `OAUTH_SERVER_URL` and `VITE_OAUTH_PORTAL_URL` are correct
3. Ensure the redirect URI matches: `https://<your-domain>/api/oauth/callback`

## Performance Optimization

### Enable Caching

Railway automatically caches dependencies between builds. To optimize:

1. Ensure `.pnpm-store` is in your `.gitignore`
2. Keep `pnpm-lock.yaml` committed to version control

### Monitor Build Times

1. Go to **"Deployments"** tab
2. Click on a deployment to see build time breakdown
3. Optimize slow steps in your build process

### Optimize Database Queries

1. Monitor slow queries in the MySQL service logs
2. Add indexes to frequently queried columns
3. Use Drizzle ORM's query builder to write efficient queries

## Cost Optimization

Railway uses a usage-based pricing model. To minimize costs:

1. **Right-size your resources**: Start with small instances and scale up as needed
2. **Use Railway's free tier**: Get $5 credit per month
3. **Monitor resource usage**: Check the Metrics tab regularly
4. **Clean up unused services**: Remove services you're not using
5. **Use Railway's database**: It's cheaper than external managed databases

Typical costs for a small production app:
- Node.js service: $2-10/month
- MySQL database: $5-20/month
- **Total: $7-30/month** (depending on traffic and storage)

## Next Steps

1. Set up monitoring and alerting
2. Configure automatic backups for your database
3. Set up a custom domain (optional)
4. Configure SSL/TLS certificates (Railway handles this automatically)
5. Set up CI/CD for automated testing before deployment

## Support & Resources

- Railway Documentation: https://docs.railway.app
- Railway Community: https://community.railway.app
- E-Quipped Documentation: See other guides in this repository
- Drizzle ORM Documentation: https://orm.drizzle.team
