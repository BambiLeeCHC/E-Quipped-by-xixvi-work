# Environment Variables Configuration Guide

**Date:** March 01, 2026

## Overview

The E-Quipped application requires several environment variables for proper operation. This guide provides detailed information about each variable, where to obtain it, and how to configure it for different deployment environments.

## Environment Variables Reference

### Database Configuration

#### `DATABASE_URL` (Required)

**Description:** The connection string for the MySQL database.

**Format:** `mysql://username:password@host:port/database_name`

**Example:** `mysql://root:mypassword@localhost:3306/equipped_ai`

**Where to obtain:**
- **Railway:** Provided automatically when you add a MySQL service to your project
- **TiDB Cloud:** Available in the cluster connection settings
- **Self-hosted MySQL:** Construct manually using your database credentials

**Notes:**
- The connection string must use the `mysql://` protocol
- Port 3306 is the default MySQL port
- URL-encode special characters in the password (e.g., `@` becomes `%40`)

---

### Authentication & OAuth

#### `VITE_APP_ID` (Required)

**Description:** The Manus application ID used for OAuth authentication.

**Where to obtain:**
1. Log in to your Manus account at https://manus.im
2. Navigate to Developer Settings or Project Settings
3. Find the "App ID" or "Application ID" field
4. Copy the value

**Notes:**
- This is a public identifier and can be safely included in client-side code
- The `VITE_` prefix indicates this variable is exposed to the frontend

---

#### `OAUTH_SERVER_URL` (Required)

**Description:** The base URL for the Manus OAuth service.

**Example:** `https://oauth.manus.im` or `https://auth.manus.im`

**Where to obtain:**
1. Log in to your Manus account
2. Navigate to Developer Settings
3. Find the "OAuth Server URL" or "Authorization Endpoint"
4. Copy the base URL (without trailing slash)

**Notes:**
- This is typically a Manus-hosted endpoint
- Must be HTTPS in production
- The server uses this to exchange authorization codes for tokens

---

#### `VITE_OAUTH_PORTAL_URL` (Required)

**Description:** The URL for the Manus user-facing login portal.

**Example:** `https://login.manus.im` or `https://app.manus.im`

**Where to obtain:**
1. Log in to your Manus account
2. Navigate to Developer Settings
3. Find the "OAuth Portal URL" or "Login Portal URL"
4. Copy the URL

**Notes:**
- This is where users are redirected to log in
- The `VITE_` prefix indicates this is exposed to the frontend
- Must be HTTPS in production

---

#### `JWT_SECRET` (Required)

**Description:** A secret key used to sign and verify JWT session tokens.

**Example:** `your-super-secret-key-min-32-characters-long!`

**How to generate:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Notes:**
- Must be at least 32 characters long
- Should be a random, cryptographically secure string
- Keep this secret; never commit it to version control
- Changing this value will invalidate all existing sessions

---

#### `OWNER_OPEN_ID` (Required)

**Description:** The Manus OpenID of the application owner, used to automatically grant admin privileges.

**Where to obtain:**
1. Log in to your Manus account
2. Navigate to your user profile or account settings
3. Find your "OpenID" or "User ID"
4. Copy the value

**Notes:**
- This user will automatically be assigned the `admin` role
- Only set this for the primary account owner
- Multiple admins can be created through the application UI after deployment

---

### Stripe Payment Integration

#### `STRIPE_SECRET_KEY` (Required)

**Description:** The secret API key for your Stripe account.

**Where to obtain:**
1. Log in to your Stripe Dashboard at https://dashboard.stripe.com
2. Navigate to Developers > API Keys
3. Copy the "Secret key" (starts with `sk_live_` or `sk_test_`)

**Notes:**
- Use `sk_test_` for development/testing
- Use `sk_live_` for production
- Keep this secret; never expose it in client-side code
- Rotate this key periodically for security

---

#### `STRIPE_WEBHOOK_SECRET` (Required)

**Description:** The signing secret for Stripe webhook events.

**Where to obtain:**
1. Deploy the application to get a public domain
2. Log in to Stripe Dashboard > Developers > Webhooks
3. Click "Add an endpoint"
4. Set the endpoint URL to: `https://your-domain.com/api/stripe/webhook`
5. Select events to listen for (e.g., `checkout.session.completed`)
6. Click "Add endpoint"
7. Copy the "Signing secret" (starts with `whsec_`)

**Notes:**
- This secret is used to verify webhook authenticity
- Different webhook endpoints have different signing secrets
- You can rotate this secret in the Stripe dashboard if compromised

---

#### `STRIPE_PRICE_LIFETIME` (Required)

**Description:** The Stripe Price ID for the lifetime access plan ($675 one-time payment).

**Where to obtain:**
1. Log in to Stripe Dashboard > Products
2. Create or find the "Lifetime Access" product
3. Click on the product to view its prices
4. Copy the Price ID (starts with `price_`)

**Example:** `price_1Hs5asHjNbCYur5B1234567890`

**Notes:**
- This is the one-time payment option (not a subscription)
- The amount should be set to $67,500 cents ($675.00)
- You can have multiple price IDs for different currencies

---

### Manus Forge API (LLM & Storage)

#### `BUILT_IN_FORGE_API_URL` (Required)

**Description:** The base URL for the Manus Forge API, used for LLM invocations and file storage.

**Example:** `https://forge.manus.im` or `https://api.manus.im`

**Where to obtain:**
1. Log in to your Manus account
2. Navigate to Developer Settings
3. Find the "Forge API URL" or "API Endpoint"
4. Copy the base URL

**Notes:**
- This is used for AI features and file uploads
- Must be HTTPS in production
- The server uses this for LLM calls and S3 storage operations

---

#### `BUILT_IN_FORGE_API_KEY` (Required)

**Description:** The API key for accessing the Manus Forge API.

**Where to obtain:**
1. Log in to your Manus account
2. Navigate to Developer Settings or API Keys
3. Generate a new API key or copy an existing one
4. Copy the key value

**Notes:**
- Keep this secret; never expose it in client-side code
- Use this only on the server side
- Rotate this key periodically for security

---

### Optional Environment Variables

#### `NODE_ENV`

**Description:** Sets the application environment.

**Values:**
- `development`: Enables debug logging, hot reloading, and development features
- `production`: Optimizes for performance, disables debug output

**Default:** `development`

**Notes:**
- Always set to `production` in production deployments
- The build process respects this variable

---

#### `VITE_ANALYTICS_ENDPOINT` (Optional)

**Description:** The endpoint URL for analytics tracking (Umami).

**Example:** `https://analytics.example.com`

**Notes:**
- If not set, analytics will be disabled
- The `VITE_` prefix indicates this is exposed to the frontend

---

#### `VITE_ANALYTICS_WEBSITE_ID` (Optional)

**Description:** The website ID for analytics tracking (Umami).

**Example:** `a1b2c3d4-e5f6-7890-abcd-ef1234567890`

**Notes:**
- If not set, analytics will be disabled
- The `VITE_` prefix indicates this is exposed to the frontend

---

## Deployment Environment Examples

### Railway Deployment

```bash
# Set these in Railway's environment variables UI
DATABASE_URL=mysql://user:pass@host:port/db
VITE_APP_ID=your-app-id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=your-secret-key-min-32-characters
OWNER_OPEN_ID=your-manus-openid
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_LIFETIME=price_...
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
NODE_ENV=production
```

### Local Development (.env file)

```bash
# Create a .env file in the root directory
DATABASE_URL=mysql://root:password@localhost:3306/equipped_ai
VITE_APP_ID=dev-app-id
OAUTH_SERVER_URL=https://oauth.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
JWT_SECRET=dev-secret-key-min-32-characters-long!
OWNER_OPEN_ID=dev-user-openid
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_test_...
STRIPE_PRICE_LIFETIME=price_test_...
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=dev-forge-api-key
NODE_ENV=development
```

## Security Best Practices

1. **Never commit secrets to version control**: Use `.env` files and `.gitignore` to exclude them
2. **Use strong secrets**: Generate cryptographically secure random values for `JWT_SECRET`
3. **Rotate secrets regularly**: Change API keys and secrets periodically
4. **Use different keys for environments**: Keep development and production secrets separate
5. **Limit secret access**: Only share secrets with team members who need them
6. **Monitor secret usage**: Watch for unauthorized access to your APIs
7. **Use secret management tools**: Consider using tools like HashiCorp Vault or AWS Secrets Manager for production

## Troubleshooting

### Error: "DATABASE_URL is required"

**Solution:** Ensure the `DATABASE_URL` environment variable is set and the connection string is valid.

### Error: "Invalid OAuth credentials"

**Solution:** Verify that `VITE_APP_ID`, `OAUTH_SERVER_URL`, and `VITE_OAUTH_PORTAL_URL` are correct and match your Manus account settings.

### Error: "Stripe webhook signature verification failed"

**Solution:** Ensure `STRIPE_WEBHOOK_SECRET` matches the signing secret from the Stripe dashboard for the correct webhook endpoint.

### Error: "Forge API authentication failed"

**Solution:** Verify that `BUILT_IN_FORGE_API_KEY` is valid and `BUILT_IN_FORGE_API_URL` is correct.

## Next Steps

1. Gather all required environment variables from the respective services
2. Configure them in your deployment platform (Railway, etc.)
3. Test the application to ensure all services are connected
4. Monitor logs for any configuration-related errors
5. Set up alerts for failed external API calls
