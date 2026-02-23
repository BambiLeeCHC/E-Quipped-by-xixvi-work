/**
 * server/stripe/products.ts
 * Central definition of E-Quipped pricing plans.
 * Price IDs are created in the Stripe dashboard / test sandbox.
 * Update the env vars or this file once you have real price IDs.
 */

export type PlanId = "monthly" | "annual" | "lifetime";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceId: string;           // Stripe Price ID
  amount: number;            // in cents
  currency: string;
  interval?: "month" | "year"; // undefined = one-time
  mode: "subscription" | "payment";
  badge?: string;
  features: string[];
}

// ── Plans ─────────────────────────────────────────────────────────────────────
// Price IDs are read from env so they can be swapped between test/live modes.
// Fall back to placeholder strings so the app doesn't crash if env is missing.

export const PLANS: Plan[] = [
  {
    id: "monthly",
    name: "Pro Monthly",
    description: "Full access to all AI business modules, sandbox, and prompt library.",
    priceId: process.env.STRIPE_PRICE_MONTHLY ?? "price_monthly_placeholder",
    amount: 2900,   // $29 / month
    currency: "usd",
    interval: "month",
    mode: "subscription",
    features: [
      "All 7 AI Business Modules",
      "AI Sandbox (unlimited sessions)",
      "Prompt Library (save & share)",
      "Quiz & certificate tracking",
      "Priority support",
    ],
  },
  {
    id: "annual",
    name: "Pro Annual",
    description: "Everything in Pro Monthly — billed annually, save 35%.",
    priceId: process.env.STRIPE_PRICE_ANNUAL ?? "price_annual_placeholder",
    amount: 22700,  // $227 / year (~$19/mo)
    currency: "usd",
    interval: "year",
    mode: "subscription",
    badge: "Best Value",
    features: [
      "Everything in Pro Monthly",
      "35% saving vs monthly billing",
      "Early access to new modules",
      "Downloadable prompt templates",
    ],
  },
  {
    id: "lifetime",
    name: "Lifetime Access",
    description: "One payment, permanent access — including all future modules.",
    priceId: process.env.STRIPE_PRICE_LIFETIME ?? "price_lifetime_placeholder",
    amount: 49700,  // $497 one-time
    currency: "usd",
    mode: "payment",
    badge: "One-Time",
    features: [
      "Everything in Pro Annual",
      "All future modules included",
      "Lifetime certificate updates",
      "Community access",
    ],
  },
];

export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
