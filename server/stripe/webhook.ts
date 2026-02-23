/**
 * server/stripe/webhook.ts
 * Stripe webhook handler — registered BEFORE express.json() so the raw body
 * is available for signature verification.
 */
import type { Express, Request, Response } from "express";
import express from "express";
import Stripe from "stripe";
import { stripe } from "./client";
import { getDb } from "../db";
import { users, stripePayments } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export function registerStripeWebhook(app: Express) {
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req: Request, res: Response) => {
      const sig = req.headers["stripe-signature"] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret ?? ""
        );
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", message);
        return res.status(400).send(`Webhook Error: ${message}`);
      }

      // ── Test event passthrough ────────────────────────────────────────────
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }

      console.log(`[Webhook] ${event.type} — ${event.id}`);

      try {
        switch (event.type) {
          // ── Checkout completed (subscription or one-time) ─────────────────
          case "checkout.session.completed": {
            const session = event.data.object as {
              id: string;
              client_reference_id?: string;
              customer?: string;
              subscription?: string;
              payment_intent?: string;
              metadata?: Record<string, string>;
              mode?: string;
              amount_total?: number;
              currency?: string;
            };

            const userId = session.client_reference_id
              ? parseInt(session.client_reference_id)
              : null;

            if (!userId) break;

            const customerId = session.customer as string | undefined;
            const plan = (session.metadata?.plan ?? "monthly") as
              | "monthly"
              | "annual"
              | "lifetime";

            const db = await getDb();
            if (!db) break;

            // Update user with Stripe customer ID
            if (customerId) {
              await db
                .update(users)
                .set({ stripeCustomerId: customerId })
                .where(eq(users.id, userId));
            }

            // Subscription mode
            if (session.mode === "subscription" && session.subscription) {
              const sub = await stripe.subscriptions.retrieve(
                session.subscription as string
              );
              const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
              await db
                .update(users)
                .set({
                  stripeSubscriptionId: sub.id,
                  subscriptionStatus: sub.status as
                    | "active"
                    | "trialing"
                    | "past_due"
                    | "canceled"
                    | "unpaid",
                  subscriptionPlan: plan,
                  subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
                  status: "verified",
                })
                .where(eq(users.id, userId));
            }

            // One-time payment (lifetime)
            if (session.mode === "payment" && session.payment_intent) {
              await db
                .update(users)
                .set({
                  subscriptionStatus: "active",
                  subscriptionPlan: "lifetime",
                  subscriptionPeriodEnd: new Date("2099-12-31"),
                  status: "verified",
                })
                .where(eq(users.id, userId));

              await db.insert(stripePayments).values({
                userId,
                stripePaymentIntentId: session.payment_intent as string,
                stripeCustomerId: customerId,
                amount: session.amount_total ?? 67500,
                currency: session.currency ?? "usd",
                status: "succeeded",
                plan: "lifetime",
              });

              // Notify owner of new sale
              const buyerName = session.metadata?.customer_name ?? "Unknown";
              const buyerEmail = session.metadata?.customer_email ?? "Unknown";
              const amountFormatted = `$${((session.amount_total ?? 67500) / 100).toFixed(2)}`;
              await notifyOwner({
                title: `🎉 New Sale — E-Quipped Lifetime Access`,
                content: `A new Lifetime Access purchase has been completed.\n\n**Buyer:** ${buyerName}\n**Email:** ${buyerEmail}\n**Amount:** ${amountFormatted} USD\n**Plan:** Lifetime (one-time)\n**Payment Intent:** ${session.payment_intent}\n\nThe user's account has been automatically upgraded to verified status with full course access.`,
              }).catch((err) => {
                console.error("[Webhook] notifyOwner failed:", err);
              });
            }
            break;
          }

          // ── Subscription updated ──────────────────────────────────────────
          case "customer.subscription.updated": {
            const sub = event.data.object as unknown as {
              id: string;
              customer: string;
              status: string;
              current_period_end: number;
              metadata?: Record<string, string>;
            };

            const dbU = await getDb();
            if (!dbU) break;

            const [user] = await dbU
              .select()
              .from(users)
              .where(eq(users.stripeSubscriptionId, sub.id));

            if (user) {
              await dbU
                .update(users)
                .set({
                  subscriptionStatus: sub.status as
                    | "active"
                    | "trialing"
                    | "past_due"
                    | "canceled"
                    | "unpaid",
                  subscriptionPeriodEnd: new Date(sub.current_period_end * 1000),
                })
                .where(eq(users.id, user.id));
            }
            break;
          }

          // ── Subscription deleted / cancelled ──────────────────────────────
          case "customer.subscription.deleted": {
            const sub = event.data.object as { id: string };

            const dbD = await getDb();
            if (!dbD) break;

            const [userD] = await dbD
              .select()
              .from(users)
              .where(eq(users.stripeSubscriptionId, sub.id));

            if (userD) {
              await dbD
                .update(users)
                .set({ subscriptionStatus: "canceled" })
                .where(eq(users.id, userD.id));
            }
            break;
          }

          // ── Invoice paid (recurring renewal) ─────────────────────────────
          case "invoice.paid": {
            const invoice = event.data.object as {
              subscription?: string;
              customer?: string;
              amount_paid?: number;
              currency?: string;
              payment_intent?: string;
            };

            if (invoice.subscription) {
              const sub = await stripe.subscriptions.retrieve(
                invoice.subscription as string
              );
              const periodEnd = (sub as unknown as { current_period_end: number }).current_period_end;
              const dbI = await getDb();
              if (!dbI) break;
              const [userI] = await dbI
                .select()
                .from(users)
                .where(eq(users.stripeSubscriptionId, sub.id));

              if (userI) {
                await dbI
                  .update(users)
                  .set({
                    subscriptionStatus: "active",
                    subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1000) : undefined,
                  })
                  .where(eq(users.id, userI.id));

                if (invoice.payment_intent) {
                  await dbI.insert(stripePayments).values({
                    userId: userI.id,
                    stripePaymentIntentId: invoice.payment_intent as string,
                    stripeCustomerId: invoice.customer as string | undefined,
                    amount: invoice.amount_paid ?? 0,
                    currency: invoice.currency ?? "usd",
                    status: "succeeded",
                    plan: userI.subscriptionPlan ?? "monthly",
                  });
                }
              }
            }
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Handler error:", err);
        return res.status(500).json({ error: "Webhook handler failed" });
      }

      res.json({ received: true });
    }
  );
}
