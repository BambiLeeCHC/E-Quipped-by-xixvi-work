/**
 * server/stripe/products.ts
 * E-Quipped pricing — single one-time Lifetime Access plan at $675.
 * The Stripe Price ID is read from the environment so it can be swapped
 * between test and live modes without touching code.
 */

export type PlanId = "lifetime";

export interface Plan {
  id: PlanId;
  name: string;
  description: string;
  priceId: string;    // Stripe Price ID
  amount: number;     // in cents
  currency: string;
  mode: "payment";    // always one-time
  badge?: string;
  features: string[];
}

// ── Plan ──────────────────────────────────────────────────────────────────────
export const PLANS: Plan[] = [
  {
    id: "lifetime",
    name: "Lifetime Access",
    description: "One payment. Permanent access to every module, lesson, and future update — forever.",
    priceId: process.env.STRIPE_PRICE_LIFETIME ?? "price_lifetime_placeholder",
    amount: 67500,  // $675 one-time
    currency: "usd",
    mode: "payment",
    badge: "One-Time Payment",
    features: [
      "All 7 AI Business Modules (36 lessons)",
      "AI Sandbox — unlimited practice sessions",
      "Prompt Library — save, rate & reuse your best prompts",
      "Quiz & XP tracking with completion certificates",
      "All future modules included at no extra cost",
      "Lifetime certificate updates",
      "Priority support",
    ],
  },
];

export function getPlanById(id: PlanId): Plan | undefined {
  return PLANS.find((p) => p.id === id);
}
