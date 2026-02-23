/**
 * client/src/pages/Pricing.tsx
 * Single-plan pricing page — Lifetime Access at $675 (one-time payment).
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import MenuPanel from "@/components/MenuPanel";
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
  ShieldCheck,
  ChevronDown,
} from "lucide-react";

// Declare the Stripe Buy Button custom element for TypeScript
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "stripe-buy-button": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        "buy-button-id": string;
        "publishable-key": string;
      };
    }
  }
}

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
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { data: subscription } = trpc.stripe.mySubscription.useQuery(undefined, {
    enabled: !!user,
  });
  const hasAccess = subscription?.isActive ?? false;

  const createPortal = trpc.stripe.createPortal.useMutation({
    onSuccess: ({ url }) => { if (url) window.open(url, "_blank"); },
    onError: (err) => toast.error(err.message ?? "Could not open billing portal"),
  });

  // Inject the Stripe Buy Button script once
  useEffect(() => {
    const scriptId = "stripe-buy-button-script";
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://js.stripe.com/v3/buy-button.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* Nav */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="font-bold text-fuchsia-600 hover:text-fuchsia-700 transition-colors text-sm"
          >
            E-Quipped: Work
          </button>
          <div className="flex items-center gap-2">
            {user && (
              <button
                onClick={() => navigate("/profile")}
                className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs glow-primary"
              >
                {(user.name ?? user.email ?? "U")[0]?.toUpperCase()}
              </button>
            )}
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              className="h-8 w-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-fuchsia-50 transition-colors"
            >
              <span style={{display:"block",width:"1.1rem",height:"2px",borderRadius:"1px",background:"oklch(0.58 0.26 330)"}} />
              <span style={{display:"block",width:"0.75rem",height:"2px",borderRadius:"1px",background:"oklch(0.58 0.26 330)"}} />
              <span style={{display:"block",width:"1.1rem",height:"2px",borderRadius:"1px",background:"oklch(0.58 0.26 330)"}} />
            </button>
          </div>
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

        {/* Social proof */}
        <div className="mb-12">
          {/* Learner count bar */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex -space-x-2.5">
              {[
                { initial: "A", color: "oklch(0.72 0.22 330)", glow: "oklch(0.72 0.22 330 / 0.55)" },
                { initial: "M", color: "oklch(0.68 0.22 280)", glow: "oklch(0.68 0.22 280 / 0.50)" },
                { initial: "S", color: "oklch(0.65 0.20 220)", glow: "oklch(0.65 0.20 220 / 0.50)" },
                { initial: "J", color: "oklch(0.68 0.20 155)", glow: "oklch(0.68 0.20 155 / 0.50)" },
                { initial: "R", color: "oklch(0.70 0.20 40)",  glow: "oklch(0.70 0.20 40 / 0.50)"  },
              ].map(({ initial, color, glow }, i) => (
                <div
                  key={i}
                  className="avatar-bubble w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{
                    background: "white",
                    border: `2.5px solid ${color}`,
                    color: color,
                    boxShadow: `0 0 0 0 ${glow}`,
                    animationDelay: `${i * 0.4}s`,
                    zIndex: 5 - i,
                  }}
                >
                  {initial}
                </div>
              ))}
            </div>
            <p className="text-sm text-foreground/60">
              <span className="font-bold text-foreground">Join 200+ professionals</span> already mastering AI for business
            </p>
          </div>

          {/* Testimonials grid */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              {
                quote: "I used to spend 3 hours writing client proposals. After Module 3, I do it in 20 minutes with AI. The ROI on this course paid for itself in week one.",
                name: "Sarah K.",
                role: "Marketing Consultant",
                color: "oklch(0.72 0.18 310)",
              },
              {
                quote: "The sandbox is what sets this apart. You don't just read about prompting — you practice it with real AI feedback. My team's productivity is up 40%.",
                name: "James T.",
                role: "Operations Director",
                color: "oklch(0.68 0.20 250)",
              },
              {
                quote: "Lifetime access was the deciding factor. I've come back to Module 5 three times as my role evolved. Worth every penny.",
                name: "Priya M.",
                role: "Senior Business Analyst",
                color: "oklch(0.65 0.22 155)",
              },
            ].map(({ quote, name, role, color }) => (
              <div
                key={name}
                className="rounded-2xl border border-border/40 bg-white/70 lucite p-5 flex flex-col gap-3"
              >
                {/* Stars */}
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-3.5 h-3.5" viewBox="0 0 20 20" fill={color}>
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-foreground/75 leading-relaxed flex-1">&ldquo;{quote}&rdquo;</p>
                <div className="flex items-center gap-2 pt-1 border-t border-border/20">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                    style={{ background: color }}
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{name}</p>
                    <p className="text-xs text-foreground/45">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                <div className="w-full flex justify-center mb-6">
                  <stripe-buy-button
                    buy-button-id="buy_btn_1T43o2IOR2BacWbdfi01wKlq"
                    publishable-key="pk_live_51T40WtIOR2BacWbdaTbIP7L4fhyvJfiOTEWd1L7dFrCFMyQwm3oNkSJLH1dvIjn4r8DbQEPFSUbQguqPwMohQlBs007qoppT2I"
                  />
                </div>
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

              {/* Refund guarantee badge */}
              <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-800">7-Day Money-Back Guarantee</p>
                  <p className="text-xs text-emerald-700/80 mt-0.5 leading-snug">
                    Not satisfied within 7 days? Email us for a full refund — no questions asked.
                  </p>
                </div>
              </div>

              {/* Trust signals */}
              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-center gap-6 flex-wrap">
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
          {/* Fuchsia bordered container */}
          <div
            className="rounded-2xl p-7"
            style={{
              border: "2px solid oklch(0.72 0.22 330 / 0.55)",
              boxShadow: "0 0 32px 0 oklch(0.72 0.22 330 / 0.10), 0 4px 24px 0 oklch(0 0 0 / 0.07)",
              background: "oklch(1 0 0 / 0.70)",
            }}
          >
            {/* Fuchsia header */}
            <h2
              className="text-2xl font-black text-center mb-6"
              style={{ color: "oklch(0.58 0.26 330)" }}
            >
              Frequently Asked Questions
            </h2>

            <div className="space-y-3">
              {[
                {
                  q: "Is this really a one-time payment?",
                  a: "Yes. You pay $675 once and have access to E-Quipped: Work forever — including every new module we add in the future. There are no subscriptions, no renewals, and no hidden fees.",
                },
                {
                  q: "What happens after I pay?",
                  a: "Your account is upgraded instantly. All 7 modules and 36 lessons unlock immediately, and your progress is tracked from your very first lesson. You'll see the change as soon as you return to the Courses page.",
                },
                {
                  q: "Can I get a refund?",
                  a: "Absolutely. If you're not satisfied within 7 days of purchase, email us at equippedbyxixvi@gmail.com for a full refund — no questions asked. We stand behind the quality of the content.",
                },
                {
                  q: "Do I need a subscription to keep my access?",
                  a: "No. Lifetime Access means exactly that — no renewals, no recurring charges, no expiry date. Pay once and the course is yours indefinitely.",
                },
                {
                  q: "What's included in the AI Sandbox?",
                  a: "The AI Sandbox is a live practice environment built into every lesson. You submit prompts, receive instant AI feedback scored on relevance, specificity, and business application, and unlock the quiz only after hitting a quality threshold. Your conversation history is saved so you can revisit and improve past submissions.",
                },
                {
                  q: "Will new modules be added?",
                  a: "Yes. We're actively building additional modules covering advanced AI workflows, industry-specific applications, and emerging tools. All future modules are included in your Lifetime Access at no extra cost.",
                },
              ].map(({ q, a }, idx) => (
                <div
                  key={idx}
                  className="rounded-xl overflow-hidden"
                  style={{
                    boxShadow: "0 2px 12px 0 oklch(0 0 0 / 0.09), 0 1px 3px 0 oklch(0 0 0 / 0.06)",
                    border: "1px solid oklch(0.72 0.22 330 / 0.18)",
                    background: "white",
                  }}
                >
                  {/* Question row — clickable */}
                  <button
                    className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left group"
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    aria-expanded={openFaq === idx}
                  >
                    <span
                      className="font-semibold text-sm leading-snug"
                      style={{ color: openFaq === idx ? "oklch(0.58 0.26 330)" : "oklch(0.20 0 0)" }}
                    >
                      {q}
                    </span>
                    <ChevronDown
                      className="shrink-0 w-4 h-4 transition-transform duration-300"
                      style={{
                        color: "oklch(0.72 0.22 330)",
                        transform: openFaq === idx ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>

                  {/* Answer — animated slide */}
                  <div
                    style={{
                      maxHeight: openFaq === idx ? "300px" : "0px",
                      overflow: "hidden",
                      transition: "max-height 0.35s cubic-bezier(0.4,0,0.2,1)",
                    }}
                  >
                    <p
                      className="px-5 pb-4 text-sm leading-relaxed"
                      style={{ color: "oklch(0.38 0 0)" }}
                    >
                      {a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
