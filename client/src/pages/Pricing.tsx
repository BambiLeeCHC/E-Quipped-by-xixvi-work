/**
 * client/src/pages/Pricing.tsx
 * Single-plan pricing page — Lifetime Access at $675 (one-time payment).
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  CheckCircle2,
  Crown,
  Zap,
  BookOpen,
  Brain,
  Shield,
  ArrowRight,
  Sparkles,
  Lock,
  CreditCard,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";

const FEATURES = [
  { icon: BookOpen,     text: "All 7 AI Business Modules — 36 in-depth lessons" },
  { icon: Brain,        text: "AI Sandbox — unlimited practice sessions with live feedback" },
  { icon: Zap,          text: "Prompt Library — save, rate & reuse your best prompts" },
  { icon: CheckCircle2, text: "Quiz & XP tracking with completion certificates" },
  { icon: Sparkles,     text: "All future modules included at no extra cost" },
  { icon: Shield,       text: "Lifetime certificate updates & priority support" },
];

const MODULES = [
  "Foundations of AI Prompting",
  "AI for Data & Analysis",
  "AI for Business Writing",
  "AI for Presentations & Decks",
  "AI for Research & Synthesis",
  "AI for Email & Client Comms",
  "AI Workflow Automation",
];

export default function Pricing() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [checkingOut, setCheckingOut] = useState(false);

  const { data: subscription, refetch: refetchSub } = trpc.stripe.mySubscription.useQuery(undefined, {
    enabled: !!user,
  });
  const hasAccess = subscription?.isActive ?? false;

  const createCheckout = trpc.stripe.createCheckout.useMutation({
    onSuccess: ({ url }) => {
      if (url) {
        toast.info("Redirecting to secure checkout…");
        window.open(url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message ?? "Could not start checkout. Please try again.");
    },
    onSettled: () => setCheckingOut(false),
  });

  const createPortal = trpc.stripe.createPortal.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: (err) => toast.error(err.message ?? "Could not open billing portal"),
  });

  // Handle success / cancel query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "1") {
      toast.success("🎉 Payment confirmed — your Lifetime Access is now active!");
      window.history.replaceState({}, "", "/pricing");
      void refetchSub();
    } else if (params.get("canceled") === "1") {
      toast.info("Checkout was cancelled — no charge was made.");
      window.history.replaceState({}, "", "/pricing");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBuy = () => {
    if (!user) {
      navigate("/");
      toast.info("Sign in first, then return to this page to purchase.");
      return;
    }
    setCheckingOut(true);
    createCheckout.mutate({ planId: "lifetime", origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="font-bold text-fuchsia-600 hover:text-fuchsia-700 transition-colors text-sm"
          >
            E-Quipped: Work
          </button>
          {user && (
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/courses")} className="text-xs text-foreground/50 hover:text-foreground transition-colors">Courses</button>
              <button
                onClick={() => navigate("/profile")}
                className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs glow-primary"
              >
                {(user.name ?? user.email ?? "U")[0]?.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-4xl mx-auto py-16 px-4">

        {/* Already has access */}
        {hasAccess && (
          <div className="mb-10 rounded-2xl border border-green-200/60 bg-green-50/60 p-6 flex items-center gap-4">
            <Crown className="w-8 h-8 text-green-500 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-green-800 text-lg">You have Lifetime Access</p>
              <p className="text-sm text-green-700/80 mt-0.5">All modules and lessons are unlocked. Keep learning!</p>
            </div>
            <div className="flex gap-2 shrink-0 flex-wrap">
              <Button
                size="sm"
                variant="outline"
                className="border-green-300/60 text-green-700 hover:bg-green-100/60"
                onClick={() => createPortal.mutate({ origin: window.location.origin })}
                disabled={createPortal.isPending}
              >
                Manage Billing
              </Button>
              <Button className="gradient-primary text-white border-0 glow-primary" onClick={() => navigate("/courses")}>
                Go to Courses <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Hero heading */}
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200/60 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3 h-3 mr-1.5" />One-Time Payment · No Subscription · No Renewals
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
            Master AI for Business.<br />
            <span className="text-fuchsia-600">Pay Once. Own It Forever.</span>
          </h1>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
            E-Quipped: Work gives you everything you need to use AI across every dimension of modern business — from prompt engineering fundamentals to automated workflows.
          </p>
        </div>

        {/* Pricing card */}
        <div className="max-w-lg mx-auto mb-14">
          <div className="relative rounded-3xl border-2 border-fuchsia-300/60 bg-white shadow-2xl shadow-fuchsia-100/40 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500" />

            <div className="p-8 sm:p-10">
              {/* Badges */}
              <div className="flex items-center justify-between mb-6">
                <Badge className="bg-fuchsia-600 text-white border-0 px-3 py-1 text-xs font-bold uppercase tracking-wider">
                  <Crown className="w-3 h-3 mr-1.5" />Lifetime Access
                </Badge>
                <Badge variant="outline" className="border-green-300/60 text-green-700 bg-green-50 text-xs font-semibold">
                  One-Time Payment
                </Badge>
              </div>

              {/* Price */}
              <div className="mb-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-6xl font-black text-foreground">$675</span>
                  <span className="text-foreground/40 text-lg mb-2">USD</span>
                </div>
                <p className="text-sm text-foreground/50">
                  One payment. Permanent access. All future modules included.
                </p>
              </div>

              {/* CTA */}
              {!hasAccess ? (
                <Button
                  size="lg"
                  className="w-full gradient-primary text-white border-0 glow-primary text-base font-bold py-6 rounded-xl mb-6"
                  onClick={handleBuy}
                  disabled={checkingOut}
                >
                  {checkingOut ? (
                    <><RefreshCw className="w-4 h-4 mr-2 animate-spin" />Opening Checkout…</>
                  ) : (
                    <><CreditCard className="w-4 h-4 mr-2" />Get Lifetime Access — $675</>
                  )}
                </Button>
              ) : (
                <Button
                  size="lg"
                  className="w-full gradient-primary text-white border-0 glow-primary text-base font-bold py-6 rounded-xl mb-6"
                  onClick={() => navigate("/courses")}
                >
                  <ArrowRight className="w-4 h-4 mr-2" />Go to Your Courses
                </Button>
              )}

              {/* Features */}
              <ul className="space-y-3">
                {FEATURES.map(({ icon: Icon, text }) => (
                  <li key={text} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-fuchsia-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="w-3 h-3 text-fuchsia-600" />
                    </div>
                    <span className="text-sm text-foreground/75 leading-snug">{text}</span>
                  </li>
                ))}
              </ul>

              {/* Trust signals */}
              <div className="mt-6 pt-6 border-t border-border/30 flex items-center justify-center gap-6 flex-wrap">
                <span className="flex items-center gap-1.5 text-xs text-foreground/40">
                  <ShieldCheck className="w-3.5 h-3.5" />Secure checkout via Stripe
                </span>
                <span className="flex items-center gap-1.5 text-xs text-foreground/40">
                  <Lock className="w-3.5 h-3.5" />No recurring charges
                </span>
              </div>
            </div>
          </div>

          {/* Test mode note */}
          <p className="text-center text-xs text-foreground/35 mt-4">
            Testing? Use card <span className="font-mono font-semibold">4242 4242 4242 4242</span> with any future expiry and any CVC.
          </p>
        </div>

        {/* What's included — module list */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Everything included in your Lifetime Access
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {MODULES.map((mod, i) => (
              <div key={mod} className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/60 px-4 py-3 lucite">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 flex items-center justify-center shrink-0">
                  <span className="text-white text-xs font-bold">{i + 1}</span>
                </div>
                <span className="text-sm font-medium text-foreground/80">{mod}</span>
              </div>
            ))}
            <div className="flex items-center gap-3 rounded-xl border border-dashed border-fuchsia-300/60 bg-fuchsia-50/40 px-4 py-3">
              <div className="w-7 h-7 rounded-lg bg-fuchsia-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
              </div>
              <span className="text-sm font-medium text-fuchsia-600">Future modules — included free</span>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold text-foreground text-center mb-6">Common questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "Is this really a one-time payment?",
                a: "Yes. You pay $675 once and have access to E-Quipped: Work forever — including every new module we add in the future.",
              },
              {
                q: "What happens after I pay?",
                a: "Your account is upgraded instantly. All 7 modules and 36 lessons unlock immediately, and your progress is tracked from your first lesson.",
              },
              {
                q: "Can I get a refund?",
                a: "If you're not satisfied within 7 days of purchase, contact us for a full refund — no questions asked.",
              },
              {
                q: "Do I need a subscription to keep my access?",
                a: "No. Lifetime Access means exactly that — no renewals, no recurring charges, no expiry.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="rounded-xl border border-border/40 bg-white/60 lucite px-5 py-4">
                <p className="font-semibold text-foreground text-sm mb-1.5">{q}</p>
                <p className="text-sm text-foreground/60 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
