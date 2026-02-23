/**
 * client/src/components/MenuPanel.tsx
 *
 * Full-screen overlay navigation panel.
 * Entrance: staggered slide-up + fade with a lucite spectrum shimmer sweep.
 * Exit:     fast fade-down collapse.
 * "Work" in the branding loops through the spectrum colour palette.
 */
import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { X, BookOpen, CreditCard, User, Home, FileText, Shield, Cookie, RefreshCw, Eye } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Nav items ────────────────────────────────────────────────────────────────
const PRIMARY_LINKS = [
  { label: "Home",         href: "/",          icon: Home },
  { label: "Courses",      href: "/courses",   icon: BookOpen },
  { label: "Pricing",      href: "/pricing",   icon: CreditCard },
  { label: "Profile",      href: "/profile",   icon: User },
];

const POLICY_LINKS = [
  { label: "Privacy Policy",         href: "/privacy",       icon: Shield },
  { label: "Terms of Service",       href: "/terms",         icon: FileText },
  { label: "Refund Policy",          href: "/refund",        icon: RefreshCw },
  { label: "Cookie Policy",          href: "/cookies",       icon: Cookie },
  { label: "Accessibility",          href: "/accessibility", icon: Eye },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Props = {
  open: boolean;
  onClose: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function MenuPanel({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Lock body scroll while open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const go = (href: string) => {
    onClose();
    setTimeout(() => navigate(href), 220); // wait for exit animation
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className="fixed inset-0 z-50"
        style={{
          background: "oklch(0.08 0.02 265 / 0.7)",
          backdropFilter: "blur(8px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* ── Panel ── */}
      <div
        ref={overlayRef}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{
          background: "oklch(0.10 0.025 265)",
          transform: open ? "translateY(0)" : "translateY(-100%)",
          opacity: open ? 1 : 0,
          transition: open
            ? "transform 0.42s cubic-bezier(0.16,1,0.3,1), opacity 0.28s ease"
            : "transform 0.22s cubic-bezier(0.4,0,1,1), opacity 0.18s ease",
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Spectrum shimmer sweep — plays once on open */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.72 0.22 330 / 0.08) 0%, oklch(0.72 0.22 280 / 0.06) 25%, oklch(0.72 0.22 220 / 0.05) 50%, oklch(0.72 0.22 155 / 0.04) 75%, transparent 100%)",
            animation: open ? "menu-shimmer 0.9s ease forwards" : "none",
          }}
        />

        {/* ── Header row ── */}
        <div
          className="flex items-center justify-between px-6 py-5 shrink-0"
          style={{ borderBottom: "1px solid oklch(0.22 0.04 265)" }}
        >
          {/* Wordmark */}
          <button
            onClick={() => go("/")}
            className="flex items-center gap-2.5 font-black text-xl tracking-tight"
            style={{ color: "oklch(0.97 0.01 265)" }}
          >
            <div
              className="h-8 w-8 rounded-xl flex items-center justify-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg, oklch(0.65 0.25 330), oklch(0.60 0.25 280))" }}
            >
              E
            </div>
            E-Quipped:&nbsp;
            <span className="spectrum-word">Work</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            style={{
              background: "oklch(0.18 0.03 265)",
              color: "oklch(0.72 0.02 265)",
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-8">
          {/* User greeting */}
          {isAuthenticated && user && (
            <div
              className="mb-8 rounded-2xl px-5 py-4 flex items-center gap-4"
              style={{
                background: "oklch(0.16 0.04 265)",
                border: "1px solid oklch(0.26 0.06 265)",
              }}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                style={{
                  background: "linear-gradient(135deg, oklch(0.65 0.25 330), oklch(0.60 0.25 280))",
                  color: "oklch(0.98 0.005 330)",
                }}
              >
                {(user.name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate" style={{ color: "oklch(0.94 0.01 265)" }}>
                  {user.name ?? "Learner"}
                </p>
                <p className="text-xs truncate" style={{ color: "oklch(0.55 0.02 265)" }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Primary nav */}
          <nav aria-label="Primary navigation">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.45 0.04 265)" }}
            >
              Navigate
            </p>
            <ul className="space-y-1 mb-10">
              {PRIMARY_LINKS.map(({ label, href, icon: Icon }, i) => (
                <li
                  key={href}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.35s ease ${0.08 + i * 0.06}s, transform 0.35s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.06}s`,
                  }}
                >
                  <button
                    onClick={() => go(href)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left transition-colors group"
                    style={{ color: "oklch(0.85 0.01 265)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.18 0.04 265)";
                      (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.97 0.01 265)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.85 0.01 265)";
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "oklch(0.18 0.04 265)" }}
                    >
                      <Icon className="w-4.5 h-4.5" style={{ width: "1.1rem", height: "1.1rem" }} />
                    </span>
                    <span className="font-semibold text-base">{label}</span>
                  </button>
                </li>
              ))}

              {/* Auth CTA */}
              {!isAuthenticated && (
                <li
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(12px)",
                    transition: `opacity 0.35s ease 0.32s, transform 0.35s cubic-bezier(0.16,1,0.3,1) 0.32s`,
                  }}
                >
                  <a
                    href={getLoginUrl()}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-left font-semibold text-base"
                    style={{
                      background: "linear-gradient(135deg, oklch(0.55 0.25 330), oklch(0.50 0.25 280))",
                      color: "oklch(0.98 0.005 330)",
                    }}
                  >
                    <span
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: "oklch(0.98 0.005 330 / 0.15)" }}
                    >
                      <User style={{ width: "1.1rem", height: "1.1rem" }} />
                    </span>
                    Sign In / Register
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* Policies nav */}
          <nav aria-label="Legal policies">
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.45 0.04 265)" }}
            >
              Policies
            </p>
            <ul className="space-y-0.5">
              {POLICY_LINKS.map(({ label, href, icon: Icon }, i) => (
                <li
                  key={href}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateY(0)" : "translateY(8px)",
                    transition: `opacity 0.3s ease ${0.28 + i * 0.05}s, transform 0.3s cubic-bezier(0.16,1,0.3,1) ${0.28 + i * 0.05}s`,
                  }}
                >
                  <button
                    onClick={() => go(href)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm transition-colors"
                    style={{ color: "oklch(0.60 0.02 265)" }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.16 0.03 265)";
                      (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.82 0.01 265)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      (e.currentTarget as HTMLButtonElement).style.color = "oklch(0.60 0.02 265)";
                    }}
                  >
                    <Icon style={{ width: "0.9rem", height: "0.9rem", flexShrink: 0 }} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Footer strip ── */}
        <div
          className="px-6 py-4 shrink-0 flex items-center justify-between"
          style={{ borderTop: "1px solid oklch(0.18 0.03 265)" }}
        >
          <p className="text-xs" style={{ color: "oklch(0.38 0.02 265)" }}>
            © {new Date().getFullYear()} E-Quipped: Work
          </p>
          <p className="text-xs" style={{ color: "oklch(0.38 0.02 265)" }}>
            support@e-quipped.com
          </p>
        </div>
      </div>
    </>
  );
}
