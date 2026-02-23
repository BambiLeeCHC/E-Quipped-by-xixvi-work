/**
 * client/src/pages/policies/PolicyLayout.tsx
 * Shared layout for all legal policy pages — lucite aesthetic, high contrast.
 */
import { useLocation } from "wouter";
import { ChevronLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PolicySection = {
  title: string;
  body: string; // supports **bold** markdown inline
};

type Props = {
  title: string;
  subtitle: string;
  lastUpdated: string;
  sections: PolicySection[];
};

/** Render inline **bold** markdown in a string as React nodes */
function renderBody(text: string) {
  const lines = text.split("\n");
  return lines.map((line, li) => {
    if (line.trim() === "") return <br key={li} />;

    // Table row detection
    if (line.startsWith("|")) {
      return null; // handled separately below
    }

    // Render **bold** spans
    const parts = line.split(/(\*\*[^*]+\*\*)/g);
    return (
      <p key={li} className="mb-2 leading-relaxed text-foreground/75 text-sm">
        {parts.map((part, pi) =>
          part.startsWith("**") && part.endsWith("**") ? (
            <strong key={pi} className="font-semibold text-foreground/90">
              {part.slice(2, -2)}
            </strong>
          ) : (
            part
          )
        )}
      </p>
    );
  });
}

/** Parse a simple markdown table into a JSX table */
function parseTable(text: string) {
  const lines = text.split("\n").filter((l) => l.startsWith("|"));
  if (lines.length < 3) return null;
  const headers = lines[0].split("|").filter(Boolean).map((h) => h.trim());
  const rows = lines.slice(2).map((l) =>
    l.split("|").filter(Boolean).map((c) => c.trim())
  );
  return (
    <div className="overflow-x-auto my-4">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border/40">
            {headers.map((h) => (
              <th
                key={h}
                className="text-left py-2 px-3 font-semibold text-foreground/80 bg-muted/40"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className="border-b border-border/20 hover:bg-muted/20">
              {row.map((cell, ci) => (
                <td key={ci} className="py-2 px-3 text-foreground/70">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SectionBody({ body }: { body: string }) {
  // Split on table blocks
  const tableRegex = /(\|.+\|[\s\S]*?\|.+\|)/g;
  const parts: Array<{ type: "text" | "table"; content: string }> = [];
  let last = 0;
  let match;
  while ((match = tableRegex.exec(body)) !== null) {
    if (match.index > last) {
      parts.push({ type: "text", content: body.slice(last, match.index) });
    }
    parts.push({ type: "table", content: match[0] });
    last = match.index + match[0].length;
  }
  if (last < body.length) {
    parts.push({ type: "text", content: body.slice(last) });
  }

  return (
    <div>
      {parts.map((part, i) =>
        part.type === "table" ? (
          <div key={i}>{parseTable(part.content)}</div>
        ) : (
          <div key={i}>{renderBody(part.content)}</div>
        )
      )}
    </div>
  );
}

export default function PolicyLayout({ title, subtitle, lastUpdated, sections }: Props) {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 font-black text-lg tracking-tight text-foreground/90 hover:text-foreground transition-colors"
          >
            <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center text-white font-black text-sm">
              E
            </div>
            E-Quipped:&nbsp;
            <span className="spectrum-word">Work</span>
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="text-foreground/60 hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="border-b border-border/40 bg-gradient-to-br from-fuchsia-50/60 via-violet-50/40 to-background py-12 px-4">
        <div className="container max-w-3xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{title}</h1>
              <p className="text-sm text-foreground/55">{subtitle}</p>
            </div>
          </div>
          <p className="text-xs text-foreground/40 mt-2">Last updated: {lastUpdated}</p>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="container max-w-3xl py-12 px-4">
        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-base font-bold text-foreground mb-3 pb-2 border-b border-border/30">
                {section.title}
              </h2>
              <SectionBody body={section.body} />
            </section>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-border/30 text-center">
          <p className="text-xs text-foreground/35">
            Questions? Email us at{" "}
            <a href="mailto:support@e-quipped.com" className="underline hover:text-foreground/60">
              support@e-quipped.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
