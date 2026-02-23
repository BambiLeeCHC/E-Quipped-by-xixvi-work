/**
 * scripts/verify-stripe-checkout.mjs
 * Verifies the Stripe price ID is valid and a checkout session can be created.
 * Run: node scripts/verify-stripe-checkout.mjs
 */
import Stripe from "stripe";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const key = process.env.STRIPE_SECRET_KEY;
const priceId = process.env.STRIPE_PRICE_LIFETIME;

if (!key) { console.error("❌  STRIPE_SECRET_KEY not set"); process.exit(1); }
if (!priceId) { console.error("❌  STRIPE_PRICE_LIFETIME not set"); process.exit(1); }

const stripe = new Stripe(key, { apiVersion: "2026-01-28.clover" });

async function main() {
  console.log(`Verifying price ID: ${priceId}`);

  // 1. Retrieve the price to confirm it exists
  const price = await stripe.prices.retrieve(priceId);
  console.log(`✅  Price found: ${price.id}`);
  console.log(`    Product: ${price.product}`);
  console.log(`    Amount:  $${(price.unit_amount / 100).toFixed(2)} ${price.currency.toUpperCase()}`);
  console.log(`    Type:    ${price.type}`);

  if (price.unit_amount !== 67500) {
    console.warn(`⚠️  Expected $675.00 but got $${(price.unit_amount / 100).toFixed(2)}`);
  }

  // 2. Create a test checkout session (expires immediately — no real charge)
  console.log("\nCreating test checkout session…");
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: priceId, quantity: 1 }],
    client_reference_id: "test-user-999",
    customer_email: "test@example.com",
    allow_promotion_codes: true,
    success_url: "https://example.com/success",
    cancel_url: "https://example.com/cancel",
    metadata: {
      user_id: "999",
      customer_email: "test@example.com",
      customer_name: "Test User",
      plan: "lifetime",
    },
  });

  console.log(`✅  Checkout session created: ${session.id}`);
  console.log(`    Status:  ${session.status}`);
  console.log(`    URL:     ${session.url?.substring(0, 60)}…`);
  console.log(`    Amount:  $${((session.amount_total ?? 0) / 100).toFixed(2)} ${(session.currency ?? "usd").toUpperCase()}`);

  // 3. Expire the session immediately (clean up)
  await stripe.checkout.sessions.expire(session.id);
  console.log(`✅  Session expired (clean up — no charge made)`);

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("  Stripe checkout verification PASSED");
  console.log("  Price ID is valid, checkout sessions create successfully.");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main().catch((err) => {
  console.error("❌  Verification failed:", err.message);
  process.exit(1);
});
