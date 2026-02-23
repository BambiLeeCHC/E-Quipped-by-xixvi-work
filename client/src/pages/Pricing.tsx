import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Zap,
  Crown,
  Infinity,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Clock,
} from "lucide-react";

// ── Plan icon map ─────────────────────────────────────────────────────────────
const PLAN_ICONS: Record<string, React.ReactNode> = {
  monthly: <Zap className="w-6 h-6" />,
  annual: <Crown className="w-6 h-6" />,
  lifetime: <Infinity className="w-6 h-6" />,
};

const PLAN_COLORS: Record<string, { bg: string; border: string; accent: string; text: string }> = {
  monthly: {
    bg: "oklch(0.16 0.04 250)",
    border: "oklch(0.45 0.18 250)",
    accent: "oklch(0.65 0.18 250)",
    text: "oklch(0.78 0.12 250)",
  },
  annual: {
    bg: "oklch(0.16 0.06 310)",
    border: "oklch(0.55 0.22 310)",
    accent: "oklch(0.72 0.22 310)",
    text: "oklch(0.82 0.14 310)",
  },
  lifetime: {
    bg: "oklch(0.16 0.06 155)",
    border: "oklch(0.50 0.20 155)",
    accent: "oklch(0.70 0.20 155)",
    text: "oklch(0.80 0.14 155)",
  },
};

export default function Pricing() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const { data: plans = [] } = trpc.stripe.plans.useQuery();
  const { data: subscription } = trpc.stripe.mySubscription.useQuery(undefined, {
    enabled: !!user,
  });

  const createCheckout = trpc.stripe.createCheckout.useMutation();
  const createPortal = trpc.stripe.createPortal.useMutation();

  // Handle success / cancel query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      const plan = params.get("plan");
      toast.success(`🎉 Welcome to E-Quipped Pro${plan ? ` (${plan})` : ""}! Your account is now active.`);
      // Clean URL
      window.history.replaceState({}, "", "/pricing");
    } else if (params.get("canceled") === "1") {
      toast.info("Checkout was cancelled — no charge was made.");
      window.history.replaceState({}, "", "/pricing");
    }
  }, [location]);

  async function handleSubscribe(planId: string) {
    if (!user) {
      toast.error("Please sign in to subscribe.");
      return;
    }
    setLoadingPlan(planId);
    try {
      const result = await createCheckout.mutateAsync({
        planId: planId as "monthly" | "annual" | "lifetime",
        origin: window.location.origin,
      });
      if (result.url) {
        toast.info("Redirecting to secure checkout…");
        window.open(result.url, "_blank");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Checkout failed";
      toast.error(msg);
    } finally {
      setLoadingPlan(null);
    }
  }

  async function handleManage() {
    try {
      const result = await createPortal.mutateAsync({ origin: window.location.origin });
      if (result.url) window.open(result.url, "_blank");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Could not open billing portal";
      toast.error(msg);
    }
  }

  const isActive = subscription?.isActive;
  const currentPlan = subscription?.plan;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, oklch(0.10 0.04 260) 0%, oklch(0.08 0.02 280) 50%, oklch(0.11 0.05 310) 100%)",
        color: "oklch(0.94 0.01 260)",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <div style={{ textAlign: "center", padding: "4rem 1.5rem 2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "oklch(0.22 0.08 310 / 0.5)",
            border: "1px solid oklch(0.55 0.22 310 / 0.4)",
            borderRadius: "9999px",
            padding: "0.35rem 1rem",
            fontSize: "0.8rem",
            color: "oklch(0.82 0.14 310)",
            marginBottom: "1.5rem",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>

        <h1
          style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: "1rem",
            color: "oklch(0.97 0.01 260)",
          }}
        >
          Invest in your AI skills
        </h1>
        <p
          style={{
            fontSize: "1.15rem",
            color: "oklch(0.72 0.04 260)",
            maxWidth: "520px",
            margin: "0 auto 1rem",
            lineHeight: 1.6,
          }}
        >
          Unlock all 7 AI business modules, unlimited sandbox sessions, and your personal prompt library.
        </p>

        {/* Active subscription banner */}
        {isActive && (
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              background: "oklch(0.22 0.08 155 / 0.5)",
              border: "1px solid oklch(0.50 0.20 155 / 0.5)",
              borderRadius: "0.75rem",
              padding: "0.6rem 1.2rem",
              fontSize: "0.9rem",
              color: "oklch(0.80 0.14 155)",
              marginTop: "0.5rem",
            }}
          >
            <ShieldCheck className="w-4 h-4" />
            You are on the <strong style={{ color: "oklch(0.90 0.16 155)" }}>Pro {currentPlan}</strong> plan.{" "}
            <button
              onClick={handleManage}
              style={{
                background: "none",
                border: "none",
                color: "oklch(0.80 0.14 155)",
                cursor: "pointer",
                textDecoration: "underline",
                fontSize: "inherit",
                padding: 0,
              }}
            >
              Manage subscription
            </button>
          </div>
        )}
      </div>

      {/* ── Plan Cards ────────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.5rem",
          maxWidth: "1000px",
          margin: "0 auto",
          padding: "1rem 1.5rem 4rem",
        }}
      >
        {plans.map((plan) => {
          const colors = PLAN_COLORS[plan.id] ?? PLAN_COLORS.monthly;
          const isCurrent = currentPlan === plan.id && isActive;
          const isAnnual = plan.id === "annual";

          return (
            <div
              key={plan.id}
              style={{
                background: colors.bg,
                border: `1.5px solid ${isCurrent ? colors.accent : colors.border + "80"}`,
                borderRadius: "1.25rem",
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                position: "relative",
                transform: isAnnual ? "scale(1.03)" : "scale(1)",
                boxShadow: isAnnual
                  ? `0 0 40px ${colors.accent}30`
                  : "none",
                transition: "box-shadow 0.2s",
              }}
            >
              {/* Badge */}
              {plan.badge && (
                <div
                  style={{
                    position: "absolute",
                    top: "-0.75rem",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: colors.accent,
                    color: "oklch(0.10 0.02 260)",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.2rem 0.75rem",
                    borderRadius: "9999px",
                    whiteSpace: "nowrap",
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                  }}
                >
                  {plan.badge}
                </div>
              )}

              {/* Icon + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div
                  style={{
                    width: "2.5rem",
                    height: "2.5rem",
                    borderRadius: "0.75rem",
                    background: `${colors.accent}20`,
                    border: `1px solid ${colors.accent}40`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: colors.accent,
                  }}
                >
                  {PLAN_ICONS[plan.id]}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "oklch(0.95 0.01 260)",
                    }}
                  >
                    {plan.name}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: colors.text }}>
                    {plan.description}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.25rem" }}>
                  <span
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: 800,
                      color: "oklch(0.97 0.01 260)",
                      lineHeight: 1,
                    }}
                  >
                    ${(plan.amount / 100).toFixed(0)}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: colors.text }}>
                    {plan.interval === "month"
                      ? "/ month"
                      : plan.interval === "year"
                      ? "/ year"
                      : "one-time"}
                  </span>
                </div>
                {plan.id === "annual" && (
                  <div style={{ fontSize: "0.78rem", color: colors.text, marginTop: "0.25rem" }}>
                    ~${Math.round(plan.amount / 100 / 12)}/mo — save 35% vs monthly
                  </div>
                )}
              </div>

              {/* Features */}
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {plan.features.map((f) => (
                  <li
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "0.5rem",
                      fontSize: "0.875rem",
                      color: "oklch(0.88 0.02 260)",
                    }}
                  >
                    <CheckCircle2
                      className="w-4 h-4 flex-shrink-0 mt-0.5"
                      style={{ color: colors.accent }}
                    />
                    {f}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div style={{ marginTop: "auto" }}>
                {isCurrent ? (
                  <button
                    onClick={handleManage}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      background: `${colors.accent}20`,
                      border: `1px solid ${colors.accent}60`,
                      color: colors.accent,
                      fontWeight: 600,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                    }}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Current Plan — Manage
                  </button>
                ) : (
                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    disabled={loadingPlan === plan.id}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "0.75rem",
                      background: isAnnual
                        ? `linear-gradient(135deg, ${colors.accent}, oklch(0.65 0.22 280))`
                        : colors.accent,
                      border: "none",
                      color: "oklch(0.10 0.02 260)",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                      cursor: loadingPlan === plan.id ? "not-allowed" : "pointer",
                      opacity: loadingPlan === plan.id ? 0.7 : 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.4rem",
                      transition: "opacity 0.15s",
                    }}
                  >
                    {loadingPlan === plan.id ? (
                      "Redirecting…"
                    ) : (
                      <>
                        {user ? "Get Started" : "Sign In to Subscribe"}
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Free tier reminder ────────────────────────────────────────────────── */}
      <div
        style={{
          textAlign: "center",
          padding: "0 1.5rem 3rem",
          color: "oklch(0.60 0.03 260)",
          fontSize: "0.85rem",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "0.5rem",
          }}
        >
          <Clock className="w-3.5 h-3.5" />
          Module 1, Lesson 1 is always free — no credit card required.
        </div>
        <div>
          Test payments use card <code style={{ background: "oklch(0.18 0.03 260)", padding: "0.1rem 0.4rem", borderRadius: "0.3rem" }}>4242 4242 4242 4242</code> with any future expiry and any CVC.
        </div>
      </div>
    </div>
  );
}
