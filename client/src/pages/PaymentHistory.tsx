import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  succeeded: "oklch(0.70 0.20 155)",
  pending: "oklch(0.80 0.18 80)",
  failed: "oklch(0.65 0.22 25)",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  succeeded: <CheckCircle2 className="w-4 h-4" />,
  pending: <Clock className="w-4 h-4" />,
  failed: <AlertCircle className="w-4 h-4" />,
};

const PLAN_LABELS: Record<string, string> = {
  monthly: "Pro Monthly",
  annual: "Pro Annual",
  lifetime: "Lifetime Access",
};

export default function PaymentHistory() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const { data: payments = [], isLoading } = trpc.stripe.myPayments.useQuery(undefined, {
    enabled: !!user,
  });

  if (!user) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "oklch(0.10 0.03 260)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "oklch(0.70 0.04 260)",
          fontSize: "1rem",
        }}
      >
        Please sign in to view your payment history.
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(160deg, oklch(0.10 0.04 260) 0%, oklch(0.08 0.02 280) 100%)",
        color: "oklch(0.94 0.01 260)",
        padding: "3rem 1.5rem",
      }}
    >
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.5rem" }}>
            <div
              style={{
                width: "2.5rem",
                height: "2.5rem",
                borderRadius: "0.75rem",
                background: "oklch(0.22 0.08 310 / 0.4)",
                border: "1px solid oklch(0.55 0.22 310 / 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "oklch(0.72 0.22 310)",
              }}
            >
              <CreditCard className="w-5 h-5" />
            </div>
            <h1
              style={{
                fontSize: "1.75rem",
                fontWeight: 800,
                color: "oklch(0.97 0.01 260)",
                margin: 0,
              }}
            >
              Payment History
            </h1>
          </div>
          <p style={{ color: "oklch(0.65 0.04 260)", fontSize: "0.9rem", margin: 0 }}>
            All charges made to your account.
          </p>
        </div>

        {/* Table */}
        {isLoading ? (
          <div
            style={{
              background: "oklch(0.14 0.03 260)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
              color: "oklch(0.60 0.04 260)",
            }}
          >
            Loading…
          </div>
        ) : payments.length === 0 ? (
          <div
            style={{
              background: "oklch(0.14 0.03 260)",
              border: "1px solid oklch(0.22 0.04 260)",
              borderRadius: "1rem",
              padding: "3rem",
              textAlign: "center",
              color: "oklch(0.60 0.04 260)",
            }}
          >
            <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ opacity: 0.4 }} />
            <div style={{ fontWeight: 600, marginBottom: "0.4rem", color: "oklch(0.75 0.04 260)" }}>
              No payments yet
            </div>
            <div style={{ fontSize: "0.85rem" }}>
              Your completed purchases will appear here.{" "}
              <button
                onClick={() => navigate("/pricing")}
                style={{
                  background: "none",
                  border: "none",
                  color: "oklch(0.72 0.22 310)",
                  cursor: "pointer",
                  textDecoration: "underline",
                  fontSize: "inherit",
                  padding: 0,
                }}
              >
                View pricing
              </button>
            </div>
          </div>
        ) : (
          <div
            style={{
              background: "oklch(0.14 0.03 260)",
              border: "1px solid oklch(0.22 0.04 260)",
              borderRadius: "1rem",
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                padding: "0.75rem 1.5rem",
                background: "oklch(0.17 0.04 260)",
                borderBottom: "1px solid oklch(0.22 0.04 260)",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "oklch(0.55 0.04 260)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              <span>Date</span>
              <span>Plan</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {/* Rows */}
            {payments.map((p, i) => {
              const statusColor = STATUS_COLORS[p.status] ?? "oklch(0.70 0.04 260)";
              const statusIcon = STATUS_ICONS[p.status];
              return (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    padding: "1rem 1.5rem",
                    borderBottom:
                      i < payments.length - 1
                        ? "1px solid oklch(0.20 0.03 260)"
                        : "none",
                    alignItems: "center",
                    fontSize: "0.875rem",
                  }}
                >
                  <span style={{ color: "oklch(0.75 0.04 260)" }}>
                    {new Date(p.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span style={{ color: "oklch(0.88 0.02 260)", fontWeight: 500 }}>
                    {p.plan ? PLAN_LABELS[p.plan] : "—"}
                  </span>
                  <span style={{ color: "oklch(0.94 0.01 260)", fontWeight: 600 }}>
                    ${(p.amount / 100).toFixed(2)}{" "}
                    <span style={{ fontSize: "0.75rem", color: "oklch(0.55 0.04 260)" }}>
                      {p.currency.toUpperCase()}
                    </span>
                  </span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      color: statusColor,
                      fontWeight: 500,
                      textTransform: "capitalize",
                    }}
                  >
                    {statusIcon}
                    {p.status}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button
            onClick={() => navigate("/pricing")}
            style={{
              background: "none",
              border: "none",
              color: "oklch(0.65 0.04 260)",
              cursor: "pointer",
              fontSize: "0.85rem",
              textDecoration: "underline",
            }}
          >
            ← Back to Pricing
          </button>
        </div>
      </div>
    </div>
  );
}
