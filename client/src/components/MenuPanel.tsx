/**
 * client/src/components/MenuPanel.tsx
 *
 * Right-side slide-in navigation drawer.
 * Works identically on mobile and desktop.
 * Entrance: slides in from the right with a lucite spectrum shimmer.
 * Exit:     slides back out to the right.
 * "Work" in the branding loops through the spectrum colour palette.
 */
import { useEffect } from "react";
import { useLocation } from "wouter";
import {
  X, BookOpen, CreditCard, User, Home,
  FileText, Shield, Cookie, RefreshCw, Eye, Zap,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

// ─── Nav items ────────────────────────────────────────────────────────────────
const PRIMARY_LINKS = [
  { label: "Home",     href: "/",        icon: Home },
  { label: "Courses",  href: "/courses", icon: BookOpen },
  { label: "Sandbox",  href: "/sandbox", icon: Zap },
  { label: "Pricing",  href: "/pricing", icon: CreditCard },
  { label: "Profile",  href: "/profile", icon: User },
];

const POLICY_LINKS = [
  { label: "Privacy Policy",   href: "/privacy",       icon: Shield },
  { label: "Terms of Service", href: "/terms",         icon: FileText },
  { label: "Refund Policy",    href: "/refund",        icon: RefreshCw },
  { label: "Cookie Policy",    href: "/cookies",       icon: Cookie },
  { label: "Accessibility",    href: "/accessibility", icon: Eye },
];

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MenuPanel({ open, onClose }: Props) {
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
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
    setTimeout(() => navigate(href), 200);
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        aria-hidden="true"
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 60,
          background: "oklch(0.06 0.02 265 / 0.65)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
      />

      {/* ── Drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 61,
          width: "min(360px, 88vw)",
          display: "flex",
          flexDirection: "column",
          background: "oklch(0.10 0.025 265)",
          boxShadow: open ? "-8px 0 48px oklch(0.06 0.04 265 / 0.6)" : "none",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: open
            ? "transform 0.38s cubic-bezier(0.16,1,0.3,1), box-shadow 0.38s ease"
            : "transform 0.22s cubic-bezier(0.4,0,1,1), box-shadow 0.22s ease",
          pointerEvents: open ? "auto" : "none",
          overflowY: "auto",
          overflowX: "hidden",
        }}
      >
        {/* Spectrum shimmer sweep */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background:
              "linear-gradient(135deg, oklch(0.72 0.22 330 / 0.07) 0%, oklch(0.72 0.22 280 / 0.05) 30%, oklch(0.72 0.22 220 / 0.04) 60%, transparent 100%)",
            animation: open ? "menu-shimmer 0.9s ease forwards" : "none",
          }}
        />

        {/* ── Header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "1.25rem 1.5rem",
            borderBottom: "1px solid oklch(0.20 0.04 265)",
            flexShrink: 0,
          }}
        >
          {/* Wordmark */}
          <button
            onClick={() => go("/")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.625rem",
              fontWeight: 900,
              fontSize: "1.1rem",
              letterSpacing: "-0.02em",
              color: "oklch(0.97 0.01 265)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <div
              style={{
                height: "2rem",
                width: "2rem",
                borderRadius: "0.625rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, oklch(0.65 0.25 330), oklch(0.60 0.25 280))",
                color: "white",
                fontWeight: 900,
                fontSize: "0.875rem",
                flexShrink: 0,
              }}
            >
              E
            </div>
            E-Quipped:&nbsp;<span className="spectrum-word">Work</span>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Close menu"
            style={{
              width: "2.25rem",
              height: "2.25rem",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "oklch(0.18 0.03 265)",
              color: "oklch(0.72 0.02 265)",
              border: "none",
              cursor: "pointer",
              flexShrink: 0,
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.24 0.05 265)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.18 0.03 265)"; }}
          >
            <X style={{ width: "1.1rem", height: "1.1rem" }} />
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, padding: "1.75rem 1.5rem", overflowY: "auto" }}>

          {/* User greeting card */}
          {isAuthenticated && user && (
            <div
              style={{
                marginBottom: "1.75rem",
                borderRadius: "1rem",
                padding: "1rem 1.25rem",
                display: "flex",
                alignItems: "center",
                gap: "0.875rem",
                background: "oklch(0.16 0.04 265)",
                border: "1px solid oklch(0.26 0.06 265)",
              }}
            >
              <div
                style={{
                  width: "2.5rem",
                  height: "2.5rem",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 700,
                  fontSize: "0.875rem",
                  flexShrink: 0,
                  background: "linear-gradient(135deg, oklch(0.65 0.25 330), oklch(0.60 0.25 280))",
                  color: "oklch(0.98 0.005 330)",
                }}
              >
                {(user.name ?? user.email ?? "U")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 600, color: "oklch(0.94 0.01 265)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.name ?? "Learner"}
                </p>
                <p style={{ fontSize: "0.75rem", color: "oklch(0.55 0.02 265)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user.email}
                </p>
              </div>
            </div>
          )}

          {/* Primary nav */}
          <nav aria-label="Primary navigation">
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(0.42 0.04 265)", marginBottom: "0.625rem" }}>
              Navigate
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0, marginBottom: "2rem" }}>
              {PRIMARY_LINKS.map(({ label, href, icon: Icon }, i) => (
                <li
                  key={href}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 0.32s ease ${0.06 + i * 0.055}s, transform 0.32s cubic-bezier(0.16,1,0.3,1) ${0.06 + i * 0.055}s`,
                  }}
                >
                  <button
                    onClick={() => go(href)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.75rem 0.875rem",
                      borderRadius: "0.875rem",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "oklch(0.84 0.01 265)",
                      fontWeight: 600,
                      fontSize: "1rem",
                      transition: "background 0.14s, color 0.14s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "oklch(0.18 0.04 265)";
                      el.style.color = "oklch(0.97 0.01 265)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "none";
                      el.style.color = "oklch(0.84 0.01 265)";
                    }}
                  >
                    <span
                      style={{
                        width: "2.1rem",
                        height: "2.1rem",
                        borderRadius: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "oklch(0.18 0.04 265)",
                        flexShrink: 0,
                        color: "oklch(0.72 0.12 330)",
                      }}
                    >
                      <Icon style={{ width: "1rem", height: "1rem" }} />
                    </span>
                    {label}
                  </button>
                </li>
              ))}

              {/* Auth CTA for unauthenticated users */}
              {!isAuthenticated && (
                <li
                  style={{
                    marginTop: "0.5rem",
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(16px)",
                    transition: `opacity 0.32s ease 0.34s, transform 0.32s cubic-bezier(0.16,1,0.3,1) 0.34s`,
                  }}
                >
                  <a
                    href={getLoginUrl()}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.875rem",
                      padding: "0.875rem 1rem",
                      borderRadius: "0.875rem",
                      fontWeight: 700,
                      fontSize: "1rem",
                      background: "linear-gradient(135deg, oklch(0.55 0.25 330), oklch(0.50 0.25 280))",
                      color: "oklch(0.98 0.005 330)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        width: "2.1rem",
                        height: "2.1rem",
                        borderRadius: "0.625rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "oklch(0.98 0.005 330 / 0.18)",
                        flexShrink: 0,
                      }}
                    >
                      <User style={{ width: "1rem", height: "1rem" }} />
                    </span>
                    Sign In / Register
                  </a>
                </li>
              )}
            </ul>
          </nav>

          {/* Policies nav */}
          <nav aria-label="Legal policies">
            <p style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "oklch(0.42 0.04 265)", marginBottom: "0.5rem" }}>
              Policies
            </p>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {POLICY_LINKS.map(({ label, href, icon: Icon }, i) => (
                <li
                  key={href}
                  style={{
                    opacity: open ? 1 : 0,
                    transform: open ? "translateX(0)" : "translateX(10px)",
                    transition: `opacity 0.28s ease ${0.26 + i * 0.045}s, transform 0.28s cubic-bezier(0.16,1,0.3,1) ${0.26 + i * 0.045}s`,
                  }}
                >
                  <button
                    onClick={() => go(href)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.6rem 0.75rem",
                      borderRadius: "0.625rem",
                      textAlign: "left",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "oklch(0.58 0.02 265)",
                      fontSize: "0.875rem",
                      transition: "background 0.14s, color 0.14s",
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "oklch(0.16 0.03 265)";
                      el.style.color = "oklch(0.80 0.01 265)";
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget as HTMLButtonElement;
                      el.style.background = "none";
                      el.style.color = "oklch(0.58 0.02 265)";
                    }}
                  >
                    <Icon style={{ width: "0.875rem", height: "0.875rem", flexShrink: 0 }} />
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* ── Footer ── */}
        <div
          style={{
            padding: "1rem 1.5rem",
            borderTop: "1px solid oklch(0.18 0.03 265)",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ fontSize: "0.7rem", color: "oklch(0.36 0.02 265)", margin: 0 }}>
            © {new Date().getFullYear()} E-Quipped: Work
          </p>
          <p style={{ fontSize: "0.7rem", color: "oklch(0.36 0.02 265)", margin: 0 }}>
            support@e-quipped.com
          </p>
        </div>
      </div>
    </>
  );
}
