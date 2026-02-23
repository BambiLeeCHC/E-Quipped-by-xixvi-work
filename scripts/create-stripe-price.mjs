/**
 * scripts/create-stripe-price.mjs
 * Creates the E-Quipped Lifetime Access product and $675 price in Stripe.
 * Run once: node scripts/create-stripe-price.mjs
 */
import Stripe from "stripe";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("❌  STRIPE_SECRET_KEY not found in environment.");
  process.exit(1);
}

const stripe = new Stripe(key, {  apiVersion: "2026-01-28.clover"});

async function main() {
  console.log("Creating Stripe product…");

  // Create the product
  const product = await stripe.products.create({
    name: "E-Quipped: Work — Lifetime Access",
    description:
      "One-time payment for permanent access to all 7 AI Business Modules, the AI Sandbox, Prompt Library, quizzes, certificates, and all future modules.",
    metadata: { platform: "e-quipped", plan: "lifetime" },
  });

  console.log(`✅  Product created: ${product.id} (${product.name})`);

  // Create the price — $675 one-time
  const price = await stripe.prices.create({
    product: product.id,
    unit_amount: 67500, // $675.00 in cents
    currency: "usd",
    metadata: { plan: "lifetime" },
  });

  console.log(`✅  Price created: ${price.id}`);
  console.log("");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`  STRIPE_PRICE_LIFETIME=${price.id}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("");
  console.log("Add the above line to your environment secrets (Settings → Secrets).");
}

main().catch((err) => {
  console.error("❌  Error:", err.message);
  process.exit(1);
});
