/**
 * client/src/components/FloatingSandbox.tsx
 *
 * Global floating AI Sandbox widget.
 * Renders on every page via App.tsx (suppressed on /sandbox).
 *
 * Reflow strategy: Instead of padding body (which leaves fixed headers misaligned),
 * we inject a CSS rule on #app-layout-root that transitions its margin-right to
 * match the drawer width. All page content (including sticky headers) reflows
 * naturally because they are children of that div.
 *
 * Lesson context: When the user is on /lessons/:slug, we fetch the lesson title
 * and display it as a context pill in the drawer header. A "Use Lesson Prompt"
 * button pre-fills the system prompt with the lesson's applied prompt template.
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
  PanelRightClose,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Message = { role: "system" | "user" | "assistant"; content: string };

const DRAWER_W_PX = 420;
const DRAWER_WIDTH = `min(${DRAWER_W_PX}px, 92vw)`;

export default function FloatingSandbox() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Detect lesson context ──────────────────────────────────────────────────
  const lessonSlugMatch = location.match(/^\/lessons\/(.+)$/);
  const lessonSlug = lessonSlugMatch ? lessonSlugMatch[1] : null;

  const { data: lessonData } = trpc.lessons.bySlug.useQuery(
    { slug: lessonSlug ?? "" },
    { enabled: !!lessonSlug }
  );

  const lessonTitle = lessonData?.title ?? null;
  // promptTemplate column does not exist in DB yet — lesson context is display-only
  const lessonPromptTemplate: string | null = null;

  // ── Auto-scroll ────────────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Reflow: shift #app-layout-root margin-right on desktop ────────────────
  useEffect(() => {
    const root = document.getElementById("app-layout-root");
    if (!root) return;
    const isMobile = window.innerWidth < 768;
    if (isMobile) return;
    root.style.transition = "margin-right 0.32s cubic-bezier(0.16,1,0.3,1)";
    root.style.marginRight = isOpen ? DRAWER_WIDTH : "0";
    return () => {
      root.style.marginRight = "0";
    };
  }, [isOpen]);

  // ── Lock body scroll on mobile when drawer is open ────────────────────────
  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.style.overflow = isOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  // ── tRPC mutations ─────────────────────────────────────────────────────────
  const chatMutation = trpc.sandbox.chat.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    },
    onError: (err) => toast.error("AI error: " + err.message),
  });

  const savePromptMutation = trpc.prompts.save.useMutation({
    onSuccess: () => {
      toast.success("Prompt saved to library!");
      setShowSave(false);
      setSaveTitle("");
    },
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userInput.trim() },
    ];
    setMessages(newMessages);
    setUserInput("");
    const allMessages: Message[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...newMessages]
      : newMessages;
    await chatMutation.mutateAsync({ messages: allMessages, temperature: temperature[0], maxTokens: maxTokens[0] });
  };

  const handleClear = () => setMessages([]);

  const handleSavePrompt = async () => {
    if (!saveTitle.trim()) return;
    await savePromptMutation.mutateAsync({
      title: saveTitle,
      systemPrompt,
      userPrompt: messages.find((m) => m.role === "user")?.content ?? userInput,
      temperature: temperature[0],
    });
  };

  const handleUseLessonPrompt = () => {
    if (lessonPromptTemplate) {
      setSystemPrompt(lessonPromptTemplate);
      setSettingsOpen(true);
      toast.success("Lesson prompt loaded into Settings");
    }
  };

  return (
    <>
      {/* ── FAB ── */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close AI Sandbox" : "Open AI Sandbox"}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 60,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.625rem 1.1rem",
          borderRadius: "2rem",
          border: "none",
          background: isOpen
            ? "oklch(0.40 0.02 265)"
            : "linear-gradient(135deg, oklch(0.58 0.26 330), oklch(0.55 0.22 280))",
          color: "#fff",
          fontWeight: 700,
          fontSize: "0.85rem",
          boxShadow: "0 4px 24px oklch(0.58 0.26 330 / 0.35)",
          cursor: "pointer",
          transition: "all 0.32s cubic-bezier(0.16,1,0.3,1)",
          whiteSpace: "nowrap",
        }}
      >
        {isOpen
          ? <X style={{ width: "1rem", height: "1rem" }} />
          : <FlaskConical style={{ width: "1rem", height: "1rem" }} />
        }
        <span className="hidden sm:inline">{isOpen ? "Close Sandbox" : "AI Sandbox"}</span>
      </button>

      {/* ── Mobile backdrop ── */}
      <div
        aria-hidden="true"
        onClick={() => setIsOpen(false)}
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 55,
          background: "oklch(0.06 0.02 265 / 0.50)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.22s ease",
        }}
        className="md:hidden"
      />

      {/* ── Sandbox drawer ── */}
      <div
        role="complementary"
        aria-label="AI Sandbox"
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          zIndex: 56,
          width: DRAWER_WIDTH,
          background: "var(--background)",
          borderLeft: "1.5px solid oklch(0.82 0.04 265 / 0.55)",
          boxShadow: isOpen ? "-8px 0 40px oklch(0.06 0.04 265 / 0.22)" : "none",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: isOpen
            ? "transform 0.32s cubic-bezier(0.16,1,0.3,1)"
            : "transform 0.22s cubic-bezier(0.4,0,1,1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* ── Drawer header ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.875rem 1.25rem",
            borderBottom: "1px solid oklch(0.82 0.04 265 / 0.4)",
            background: "var(--card)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", minWidth: 0 }}>
            <FlaskConical style={{ width: "1rem", height: "1rem", color: "oklch(0.58 0.26 330)", flexShrink: 0 }} />
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)", flexShrink: 0 }}>
              AI Sandbox
            </span>
            <Badge variant="outline" className="text-xs hidden sm:inline-flex shrink-0">GPT-4o</Badge>
            {/* Lesson context pill */}
            {lessonTitle && (
              <span
                title={`Lesson context: ${lessonTitle}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "2rem",
                  background: "oklch(0.58 0.26 330 / 0.12)",
                  border: "1px solid oklch(0.58 0.26 330 / 0.35)",
                  color: "oklch(0.52 0.26 330)",
                  fontSize: "0.68rem",
                  fontWeight: 600,
                  maxWidth: "9rem",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  flexShrink: 1,
                  cursor: lessonPromptTemplate ? "pointer" : "default",
                }}
                onClick={lessonPromptTemplate ? handleUseLessonPrompt : undefined}
              >
                <BookOpen style={{ width: "0.65rem", height: "0.65rem", flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{lessonTitle}</span>
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
            {/* Settings toggle */}
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label={settingsOpen ? "Hide settings" : "Show settings"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.3rem 0.65rem",
                borderRadius: "0.5rem",
                border: "1.5px solid",
                borderColor: settingsOpen ? "oklch(0.58 0.26 330)" : "oklch(0.82 0.04 265)",
                background: settingsOpen ? "oklch(0.58 0.26 330 / 0.10)" : "transparent",
                color: settingsOpen ? "oklch(0.52 0.26 330)" : "oklch(0.45 0.02 265)",
                fontWeight: 600,
                fontSize: "0.75rem",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Settings2 style={{ width: "0.85rem", height: "0.85rem" }} />
              <span>{settingsOpen ? "Hide" : "Settings"}</span>
            </button>
            {/* Close drawer */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close sandbox"
              style={{
                width: "1.875rem",
                height: "1.875rem",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "oklch(0.92 0.01 265)",
                border: "none",
                cursor: "pointer",
                color: "oklch(0.40 0.02 265)",
              }}
            >
              <X style={{ width: "0.85rem", height: "0.85rem" }} />
            </button>
          </div>
        </div>

        {/* ── Lesson context action bar ── */}
        {lessonTitle && lessonPromptTemplate && (
          <div
            style={{
              padding: "0.5rem 1.25rem",
              borderBottom: "1px solid oklch(0.82 0.04 265 / 0.3)",
              background: "oklch(0.58 0.26 330 / 0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.75rem",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", minWidth: 0 }}>
              <BookOpen style={{ width: "0.8rem", height: "0.8rem", color: "oklch(0.58 0.26 330)", flexShrink: 0 }} />
              <span style={{ fontSize: "0.75rem", color: "oklch(0.45 0.04 265)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                Lesson context active
              </span>
            </div>
            <button
              onClick={handleUseLessonPrompt}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
                padding: "0.25rem 0.65rem",
                borderRadius: "0.5rem",
                border: "1.5px solid oklch(0.58 0.26 330 / 0.5)",
                background: "oklch(0.58 0.26 330 / 0.10)",
                color: "oklch(0.52 0.26 330)",
                fontWeight: 600,
                fontSize: "0.72rem",
                cursor: "pointer",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              <BookmarkPlus style={{ width: "0.72rem", height: "0.72rem" }} />
              Use Lesson Prompt
            </button>
          </div>
        )}

        {/* ── Settings panel (collapsible) ── */}
        <div
          style={{
            overflow: "hidden",
            maxHeight: settingsOpen ? "340px" : "0",
            transition: "max-height 0.30s cubic-bezier(0.16,1,0.3,1)",
            flexShrink: 0,
            borderBottom: settingsOpen ? "1px solid oklch(0.82 0.04 265 / 0.35)" : "none",
            background: "var(--card)",
          }}
        >
          <div style={{ padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <Label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(0.50 0.04 265)", display: "block", marginBottom: "0.4rem" }}>
                System Prompt
              </Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="text-sm resize-none h-20 bg-muted/30"
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <Label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(0.50 0.04 265)", display: "block", marginBottom: "0.4rem" }}>
                  Temp: <span style={{ color: "oklch(0.58 0.26 330)" }}>{temperature[0].toFixed(1)}</span>
                </Label>
                <Slider value={temperature} onValueChange={setTemperature} min={0} max={2} step={0.1} />
              </div>
              <div>
                <Label style={{ fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(0.50 0.04 265)", display: "block", marginBottom: "0.4rem" }}>
                  Tokens: <span style={{ color: "oklch(0.58 0.26 330)" }}>{maxTokens[0]}</span>
                </Label>
                <Slider value={maxTokens} onValueChange={setMaxTokens} min={100} max={4000} step={100} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <Button variant="outline" size="sm" className="flex-1 text-xs justify-start" onClick={() => { setShowSave(!showSave); setSettingsOpen(false); }} disabled={messages.length === 0}>
                <BookmarkPlus className="h-3.5 w-3.5 mr-1" /> Save
              </Button>
              <Button variant="outline" size="sm" className="flex-1 text-xs justify-start text-destructive hover:text-destructive" onClick={() => { handleClear(); setSettingsOpen(false); }} disabled={messages.length === 0}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          </div>
        </div>

        {/* ── Not signed in ── */}
        {!user ? (
          <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", textAlign: "center" }}>
            <div>
              <FlaskConical style={{ width: "2.5rem", height: "2.5rem", margin: "0 auto 0.75rem", opacity: 0.3 }} />
              <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Sign in to use the AI Sandbox</p>
              <p style={{ fontSize: "0.8rem", color: "oklch(0.55 0.02 265)", marginBottom: "1rem" }}>
                Experiment with AI models and save your best prompts.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* ── Messages ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {messages.length === 0 && (
                <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "2rem 1rem", color: "oklch(0.55 0.02 265)" }}>
                  <FlaskConical style={{ width: "2.5rem", height: "2.5rem", marginBottom: "0.75rem", opacity: 0.25 }} />
                  <p style={{ fontWeight: 600, marginBottom: "0.4rem", color: "var(--foreground)" }}>Start experimenting</p>
                  <p style={{ fontSize: "0.8rem", lineHeight: 1.5 }}>
                    Type a prompt below.{lessonTitle ? <> The <strong>{lessonTitle}</strong> lesson prompt is ready to load.</> : <> Open <strong>Settings</strong> to configure the system prompt.</>}
                  </p>
                  {lessonTitle && lessonPromptTemplate && (
                    <button
                      onClick={handleUseLessonPrompt}
                      style={{
                        marginTop: "1rem",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        padding: "0.5rem 1rem",
                        borderRadius: "0.75rem",
                        border: "1.5px solid oklch(0.58 0.26 330 / 0.5)",
                        background: "oklch(0.58 0.26 330 / 0.10)",
                        color: "oklch(0.52 0.26 330)",
                        fontWeight: 600,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                      }}
                    >
                      <BookOpen style={{ width: "0.85rem", height: "0.85rem" }} />
                      Load Lesson Prompt
                    </button>
                  )}
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "88%",
                      padding: "0.625rem 0.875rem",
                      borderRadius: msg.role === "user" ? "1rem 1rem 0.25rem 1rem" : "1rem 1rem 1rem 0.25rem",
                      fontSize: "0.85rem",
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                      background: msg.role === "user"
                        ? "linear-gradient(135deg, oklch(0.58 0.26 330), oklch(0.55 0.22 280))"
                        : "var(--card)",
                      color: msg.role === "user" ? "#fff" : "var(--foreground)",
                      border: msg.role === "user" ? "none" : "1px solid oklch(0.82 0.04 265 / 0.5)",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {chatMutation.isPending && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ background: "var(--card)", border: "1px solid oklch(0.82 0.04 265 / 0.5)", borderRadius: "1rem 1rem 1rem 0.25rem", padding: "0.625rem 0.875rem" }}>
                    <div style={{ display: "flex", gap: "0.3rem" }}>
                      {[0, 150, 300].map((delay) => (
                        <span key={delay} style={{ width: "0.45rem", height: "0.45rem", borderRadius: "50%", background: "oklch(0.65 0.04 265)", animation: `bounce 1s ${delay}ms infinite` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Save prompt panel ── */}
            {showSave && (
              <div style={{ padding: "0.625rem 1rem", borderTop: "1px solid oklch(0.82 0.04 265 / 0.35)", background: "var(--muted)", display: "flex", gap: "0.5rem", alignItems: "center", flexShrink: 0 }}>
                <input
                  type="text"
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Prompt title..."
                  style={{ flex: 1, background: "var(--background)", borderRadius: "0.5rem", padding: "0.4rem 0.75rem", fontSize: "0.8rem", border: "1px solid oklch(0.82 0.04 265 / 0.5)", outline: "none" }}
                />
                <Button size="sm" onClick={handleSavePrompt} disabled={!saveTitle.trim() || savePromptMutation.isPending} className="gradient-primary text-white border-0 shrink-0 text-xs">
                  Save
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setShowSave(false)} className="shrink-0 h-8 w-8">
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}

            {/* ── Input ── */}
            <div style={{ padding: "0.875rem 1rem", borderTop: "1px solid oklch(0.82 0.04 265 / 0.4)", background: "var(--card)", flexShrink: 0 }}>
              <div style={{ display: "flex", gap: "0.625rem" }}>
                <Textarea
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Type your prompt… (Enter to send)"
                  className="resize-none bg-muted/30 text-sm min-h-[48px] max-h-32"
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
                  className="h-auto px-3 gradient-primary text-white border-0 shrink-0"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* ── Collapse footer ── */}
            <div style={{ padding: "0.625rem 1rem", borderTop: "1px solid oklch(0.82 0.04 265 / 0.3)", flexShrink: 0 }}>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.4rem",
                  padding: "0.5rem",
                  borderRadius: "0.625rem",
                  border: "1.5px solid oklch(0.82 0.04 265 / 0.5)",
                  background: "none",
                  color: "oklch(0.45 0.02 265)",
                  fontWeight: 600,
                  fontSize: "0.78rem",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.01 265)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
              >
                <PanelRightClose style={{ width: "0.85rem", height: "0.85rem" }} />
                Close Sandbox
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
