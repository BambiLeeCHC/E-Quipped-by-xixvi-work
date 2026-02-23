/**
 * FloatingSandbox — freely draggable floating AI window.
 *
 * Architecture
 * ────────────
 * 1. The sandbox itself is a `position:fixed` panel that follows the user's drag.
 * 2. A "ghost" placeholder div is kept inside `#app-layout-root` at the same
 *    viewport-relative position (converted to document coordinates). This ghost
 *    uses `float: right` (or `float: left` when the window is on the left half)
 *    so that the normal-flow page text reflows around it in real time.
 * 3. On every pointermove during drag, both the fixed panel and the ghost are
 *    updated synchronously so the reflow is instant.
 *
 * Lesson context
 * ──────────────
 * When on /lessons/:slug the lesson title is shown as a fuchsia pill in the
 * header. The quiz-unlock flow is handled by the global sandbox — the lesson's
 * built-in side panel has been removed.
 */
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  BookmarkPlus,
  BookOpen,
  FlaskConical,
  GripHorizontal,
  Maximize2,
  Minimize2,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type Message = { role: "system" | "user" | "assistant"; content: string };

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_W = 380;
const DEFAULT_H = 520;
const MIN_W = 300;
const MIN_H = 360;
const HEADER_H = 44; // drag handle height in px

// ─── Ghost placeholder helper ─────────────────────────────────────────────────
// Injects / updates a float placeholder in #app-layout-root so page text
// wraps around the floating window in real time.
function upsertGhost(
  ghostRef: React.MutableRefObject<HTMLDivElement | null>,
  x: number,   // fixed viewport x
  y: number,   // fixed viewport y
  w: number,
  h: number,
  visible: boolean
) {
  const root = document.getElementById("app-layout-root");
  if (!root) return;

  if (!ghostRef.current) {
    const el = document.createElement("div");
    el.id = "sandbox-float-ghost";
    el.style.cssText = [
      "pointer-events:none",
      "clear:none",
      "margin:0",
      "padding:0",
      "shape-outside:border-box",
    ].join(";");
    root.prepend(el);
    ghostRef.current = el;
  }

  const ghost = ghostRef.current;

  if (!visible) {
    ghost.style.display = "none";
    return;
  }

  // Convert viewport coords → document coords relative to root
  const rootRect = root.getBoundingClientRect();
  const docX = x - rootRect.left + root.scrollLeft;
  const docY = y - rootRect.top + root.scrollTop;

  const onRightHalf = x > window.innerWidth / 2;

  ghost.style.display = "block";
  ghost.style.width = `${w}px`;
  ghost.style.height = `${h}px`;
  ghost.style.float = onRightHalf ? "right" : "left";
  ghost.style.marginTop = `${Math.max(0, docY)}px`;
  ghost.style.marginLeft = onRightHalf ? "auto" : `${Math.max(0, docX)}px`;
  ghost.style.marginRight = onRightHalf ? `${Math.max(0, rootRect.width - docX - w)}px` : "auto";
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function FloatingSandbox() {
  const { user } = useAuth();
  const [location] = useLocation();

  // ── Visibility / size state ────────────────────────────────────────────────
  const [isOpen, setIsOpen] = useState(false);
  const [minimised, setMinimised] = useState(false);
  const [width, setWidth] = useState(DEFAULT_W);
  const [height, setHeight] = useState(DEFAULT_H);

  // ── Position state (viewport coords of top-left corner) ───────────────────
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  // Initialise position to bottom-right on first open
  const initPos = useCallback(() => {
    if (pos) return;
    setPos({
      x: window.innerWidth - DEFAULT_W - 24,
      y: window.innerHeight - DEFAULT_H - 24,
    });
  }, [pos]);

  // ── Chat state ─────────────────────────────────────────────────────────────
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Drag state ────────────────────────────────────────────────────────────
  const dragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement | null>(null);

  // ── Lesson context ─────────────────────────────────────────────────────────
  const lessonSlugMatch = location.match(/^\/lessons\/(.+)$/);
  const lessonSlug = lessonSlugMatch ? lessonSlugMatch[1] : null;
  const { data: lessonData } = trpc.lessons.bySlug.useQuery(
    { slug: lessonSlug ?? "" },
    { enabled: !!lessonSlug }
  );
  const lessonTitle = lessonData?.title ?? null;

  // ── Auto-scroll messages ───────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Ghost cleanup on unmount / close ──────────────────────────────────────
  useEffect(() => {
    return () => {
      ghostRef.current?.remove();
      ghostRef.current = null;
    };
  }, []);

  // ── Update ghost whenever position / size / open state changes ────────────
  useEffect(() => {
    if (!pos) return;
    const effectiveH = minimised ? HEADER_H : height;
    upsertGhost(ghostRef, pos.x, pos.y, width, effectiveH, isOpen && !minimised);
  }, [pos, width, height, isOpen, minimised]);

  // ── Drag handlers ─────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    // Only drag from the header handle
    if ((e.target as HTMLElement).closest("button")) return;
    e.preventDefault();
    dragging.current = true;
    const panel = panelRef.current!;
    const rect = panel.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    panel.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const newX = Math.max(0, Math.min(window.innerWidth - width, e.clientX - dragOffset.current.x));
    const newY = Math.max(0, Math.min(window.innerHeight - HEADER_H, e.clientY - dragOffset.current.y));
    setPos({ x: newX, y: newY });
    // Update ghost synchronously for smooth reflow
    const effectiveH = minimised ? HEADER_H : height;
    upsertGhost(ghostRef, newX, newY, width, effectiveH, isOpen && !minimised);
  }, [width, height, minimised, isOpen]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  // ── tRPC ──────────────────────────────────────────────────────────────────
  const chatMutation = trpc.sandbox.chat.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    },
    onError: (err) => toast.error("AI error: " + err.message),
  });

  const savePromptMutation = trpc.prompts.save.useMutation({
    onSuccess: () => {
      toast.success("Prompt saved!");
      setShowSave(false);
      setSaveTitle("");
    },
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [...messages, { role: "user", content: userInput.trim() }];
    setMessages(newMessages);
    setUserInput("");
    const allMessages: Message[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...newMessages]
      : newMessages;
    await chatMutation.mutateAsync({ messages: allMessages, temperature: temperature[0], maxTokens: maxTokens[0] });
  };

  const handleOpen = () => {
    initPos();
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    upsertGhost(ghostRef, pos?.x ?? 0, pos?.y ?? 0, width, height, false);
  };

  // ── Effective height (minimised collapses to header only) ─────────────────
  const effectiveH = minimised ? HEADER_H : height;

  // ── Styles ────────────────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    position: "fixed",
    left: pos?.x ?? window.innerWidth - DEFAULT_W - 24,
    top: pos?.y ?? window.innerHeight - DEFAULT_H - 24,
    width,
    height: effectiveH,
    zIndex: 9000,
    display: "flex",
    flexDirection: "column",
    borderRadius: "0.875rem",
    overflow: "hidden",
    background: "var(--background)",
    border: "1.5px solid oklch(0.82 0.04 265 / 0.5)",
    boxShadow: "0 8px 48px oklch(0.06 0.04 265 / 0.35), 0 2px 8px oklch(0.06 0.04 265 / 0.18)",
    transition: "height 0.22s cubic-bezier(0.16,1,0.3,1), opacity 0.18s ease",
    opacity: isOpen ? 1 : 0,
    pointerEvents: isOpen ? "auto" : "none",
    userSelect: "none",
  };

  return (
    <>
      {/* ── FAB (shown only when closed) ── */}
      {!isOpen && (
        <button
          onClick={handleOpen}
          aria-label="Open AI Sandbox"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            right: "1.5rem",
            zIndex: 9001,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0.625rem 1.1rem",
            borderRadius: "2rem",
            border: "none",
            background: "linear-gradient(135deg, oklch(0.58 0.26 330), oklch(0.55 0.22 280))",
            color: "#fff",
            fontWeight: 700,
            fontSize: "0.85rem",
            boxShadow: "0 4px 24px oklch(0.58 0.26 330 / 0.40)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          <FlaskConical style={{ width: "1rem", height: "1rem" }} />
          <span className="hidden sm:inline">AI Sandbox</span>
        </button>
      )}

      {/* ── Floating window ── */}
      <div ref={panelRef} style={panelStyle} aria-label="AI Sandbox" role="complementary">

        {/* ── Drag handle / header ── */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            height: HEADER_H,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            padding: "0 0.875rem",
            background: "var(--card)",
            borderBottom: minimised ? "none" : "1px solid oklch(0.82 0.04 265 / 0.4)",
            cursor: "grab",
          }}
        >
          {/* Drag grip icon */}
          <GripHorizontal style={{ width: "0.9rem", height: "0.9rem", opacity: 0.4, flexShrink: 0 }} />

          {/* Title */}
          <FlaskConical style={{ width: "0.85rem", height: "0.85rem", color: "oklch(0.58 0.26 330)", flexShrink: 0 }} />
          <span style={{ fontWeight: 700, fontSize: "0.82rem", color: "var(--foreground)", flexShrink: 0 }}>
            AI Sandbox
          </span>
          <Badge variant="outline" className="text-[10px] hidden sm:inline-flex shrink-0 py-0">GPT-4o</Badge>

          {/* Lesson context pill */}
          {lessonTitle && (
            <span
              title={`Lesson context: ${lessonTitle}`}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.2rem",
                padding: "0.15rem 0.45rem",
                borderRadius: "2rem",
                background: "oklch(0.58 0.26 330 / 0.12)",
                border: "1px solid oklch(0.58 0.26 330 / 0.35)",
                color: "oklch(0.52 0.26 330)",
                fontSize: "0.62rem",
                fontWeight: 600,
                maxWidth: "7rem",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 1,
              }}
            >
              <BookOpen style={{ width: "0.6rem", height: "0.6rem", flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{lessonTitle}</span>
            </span>
          )}

          {/* Spacer */}
          <div style={{ flex: 1 }} />

          {/* Window controls */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label="Settings"
              title="Settings"
              style={controlBtn(settingsOpen)}
            >
              <Settings2 style={{ width: "0.75rem", height: "0.75rem" }} />
            </button>
            <button
              onClick={() => setMinimised((v) => !v)}
              aria-label={minimised ? "Restore" : "Minimise"}
              title={minimised ? "Restore" : "Minimise"}
              style={controlBtn(false)}
            >
              {minimised
                ? <Maximize2 style={{ width: "0.75rem", height: "0.75rem" }} />
                : <Minimize2 style={{ width: "0.75rem", height: "0.75rem" }} />
              }
            </button>
            <button
              onClick={handleClose}
              aria-label="Close sandbox"
              title="Close"
              style={{ ...controlBtn(false), background: "oklch(0.55 0.22 25 / 0.15)", color: "oklch(0.65 0.22 25)" }}
            >
              <X style={{ width: "0.75rem", height: "0.75rem" }} />
            </button>
          </div>
        </div>

        {/* ── Body (hidden when minimised) ── */}
        {!minimised && (
          <>
            {/* ── Settings panel ── */}
            <div
              style={{
                overflow: "hidden",
                maxHeight: settingsOpen ? "300px" : "0",
                transition: "max-height 0.25s cubic-bezier(0.16,1,0.3,1)",
                flexShrink: 0,
                borderBottom: settingsOpen ? "1px solid oklch(0.82 0.04 265 / 0.35)" : "none",
                background: "var(--card)",
              }}
            >
              <div style={{ padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.875rem" }}>
                <div>
                  <Label style={labelStyle}>System Prompt</Label>
                  <Textarea
                    value={systemPrompt}
                    onChange={(e) => setSystemPrompt(e.target.value)}
                    placeholder="You are a helpful assistant..."
                    className="text-xs resize-none h-16 bg-muted/30 mt-1"
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.875rem" }}>
                  <div>
                    <Label style={labelStyle}>
                      Temp: <span style={{ color: "oklch(0.58 0.26 330)" }}>{temperature[0].toFixed(1)}</span>
                    </Label>
                    <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.1} className="mt-1.5" />
                  </div>
                  <div>
                    <Label style={labelStyle}>
                      Tokens: <span style={{ color: "oklch(0.58 0.26 330)" }}>{maxTokens[0]}</span>
                    </Label>
                    <Slider value={maxTokens} onValueChange={setMaxTokens} min={100} max={4000} step={100} className="mt-1.5" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <Button variant="outline" size="sm" className="flex-1 text-xs" onClick={() => { setShowSave(!showSave); setSettingsOpen(false); }} disabled={messages.length === 0}>
                    <BookmarkPlus className="h-3 w-3 mr-1" /> Save
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1 text-xs text-destructive hover:text-destructive" onClick={() => { setMessages([]); setSettingsOpen(false); }} disabled={messages.length === 0}>
                    <Trash2 className="h-3 w-3 mr-1" /> Clear
                  </Button>
                </div>
              </div>
            </div>

            {/* ── Not signed in ── */}
            {!user ? (
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", textAlign: "center" }}>
                <div>
                  <FlaskConical style={{ width: "2rem", height: "2rem", margin: "0 auto 0.5rem", opacity: 0.25 }} />
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", marginBottom: "0.35rem" }}>Sign in to use the AI Sandbox</p>
                  <p style={{ fontSize: "0.75rem", color: "oklch(0.55 0.02 265)" }}>Experiment with AI and save your best prompts.</p>
                </div>
              </div>
            ) : (
              <>
                {/* ── Messages ── */}
                <div style={{ flex: 1, overflowY: "auto", padding: "0.875rem 1rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                  {messages.length === 0 && (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "1.5rem 0.75rem", color: "oklch(0.55 0.02 265)" }}>
                      <FlaskConical style={{ width: "2rem", height: "2rem", marginBottom: "0.5rem", opacity: 0.2 }} />
                      <p style={{ fontWeight: 600, fontSize: "0.82rem", marginBottom: "0.3rem", color: "var(--foreground)" }}>Start experimenting</p>
                      <p style={{ fontSize: "0.75rem", lineHeight: 1.5 }}>
                        {lessonTitle
                          ? <>Practising <strong>{lessonTitle}</strong>? Type a prompt below.</>
                          : <>Type a prompt below. Open <strong>Settings</strong> to configure the system prompt.</>
                        }
                      </p>
                    </div>
                  )}

                  {messages.map((msg, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                      <div style={{
                        maxWidth: "88%",
                        padding: "0.5rem 0.75rem",
                        borderRadius: msg.role === "user" ? "0.875rem 0.875rem 0.2rem 0.875rem" : "0.875rem 0.875rem 0.875rem 0.2rem",
                        fontSize: "0.8rem",
                        lineHeight: 1.55,
                        whiteSpace: "pre-wrap",
                        background: msg.role === "user"
                          ? "linear-gradient(135deg, oklch(0.58 0.26 330), oklch(0.55 0.22 280))"
                          : "var(--card)",
                        color: msg.role === "user" ? "#fff" : "var(--foreground)",
                        border: msg.role === "user" ? "none" : "1px solid oklch(0.82 0.04 265 / 0.5)",
                      }}>
                        {msg.content}
                      </div>
                    </div>
                  ))}

                  {chatMutation.isPending && (
                    <div style={{ display: "flex", justifyContent: "flex-start" }}>
                      <div style={{ background: "var(--card)", border: "1px solid oklch(0.82 0.04 265 / 0.5)", borderRadius: "0.875rem 0.875rem 0.875rem 0.2rem", padding: "0.5rem 0.75rem" }}>
                        <div style={{ display: "flex", gap: "0.3rem" }}>
                          {[0, 150, 300].map((d) => (
                            <span key={d} style={{ width: "0.4rem", height: "0.4rem", borderRadius: "50%", background: "oklch(0.65 0.04 265)", display: "inline-block", animation: `bounce 1s ${d}ms infinite` }} />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* ── Save prompt row ── */}
                {showSave && (
                  <div style={{ padding: "0.5rem 0.875rem", borderTop: "1px solid oklch(0.82 0.04 265 / 0.35)", background: "var(--muted)", display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                    <input
                      type="text"
                      value={saveTitle}
                      onChange={(e) => setSaveTitle(e.target.value)}
                      placeholder="Prompt title…"
                      style={{ flex: 1, background: "var(--background)", borderRadius: "0.5rem", padding: "0.35rem 0.65rem", fontSize: "0.75rem", border: "1px solid oklch(0.82 0.04 265 / 0.5)", outline: "none", color: "var(--foreground)" }}
                    />
                    <Button size="sm" onClick={async () => {
                      if (!saveTitle.trim()) return;
                      await savePromptMutation.mutateAsync({
                        title: saveTitle,
                        systemPrompt,
                        userPrompt: messages.find((m) => m.role === "user")?.content ?? userInput,
                        temperature: temperature[0],
                      });
                    }} disabled={!saveTitle.trim() || savePromptMutation.isPending} className="text-xs shrink-0" style={{ background: "oklch(0.58 0.26 330)", color: "#fff", border: "none" }}>
                      Save
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setShowSave(false)} className="shrink-0 h-7 w-7">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}

                {/* ── Input ── */}
                <div style={{ padding: "0.75rem 0.875rem", borderTop: "1px solid oklch(0.82 0.04 265 / 0.4)", background: "var(--card)", flexShrink: 0 }}>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <Textarea
                      value={userInput}
                      onChange={(e) => setUserInput(e.target.value)}
                      placeholder="Type your prompt… (Enter to send)"
                      className="resize-none bg-muted/30 text-xs min-h-[40px] max-h-24"
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!userInput.trim() || chatMutation.isPending}
                      className="h-auto px-2.5 shrink-0"
                      style={{ background: "oklch(0.58 0.26 330)", color: "#fff", border: "none" }}
                      aria-label="Send"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Tiny style helpers ───────────────────────────────────────────────────────
function controlBtn(active: boolean): React.CSSProperties {
  return {
    width: "1.625rem",
    height: "1.625rem",
    borderRadius: "0.375rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: active ? "oklch(0.58 0.26 330 / 0.15)" : "oklch(0.92 0.01 265 / 0.6)",
    border: "none",
    cursor: "pointer",
    color: active ? "oklch(0.52 0.26 330)" : "oklch(0.45 0.02 265)",
    transition: "background 0.12s ease",
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: "0.65rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  color: "oklch(0.50 0.04 265)",
  display: "block",
};
