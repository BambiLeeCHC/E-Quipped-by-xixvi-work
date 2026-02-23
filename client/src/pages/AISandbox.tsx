/**
 * client/src/pages/AISandbox.tsx
 *
 * AI Sandbox — floating side-drawer layout.
 * The settings panel slides in from the right as an overlay.
 * The chat content always remains visible and fills the full width.
 * A prominent labelled toggle button opens/closes the settings drawer.
 */
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import MenuPanel from "@/components/MenuPanel";
import {
  BookmarkPlus,
  ChevronLeft,
  FlaskConical,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Settings2,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Message = { role: "system" | "user" | "assistant"; content: string };

export default function AISandbox() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSave, setShowSave] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Lock body scroll when settings drawer is open on mobile
  useEffect(() => {
    if (window.innerWidth < 768) {
      document.body.style.overflow = settingsOpen ? "hidden" : "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [settingsOpen]);

  const chatMutation = trpc.sandbox.chat.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    },
    onError: (err) => {
      toast.error("AI error: " + err.message);
    },
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

    await chatMutation.mutateAsync({
      messages: allMessages,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
    });
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleSavePrompt = async () => {
    if (!saveTitle.trim()) return;
    await savePromptMutation.mutateAsync({
      title: saveTitle,
      systemPrompt,
      userPrompt: messages.find((m) => m.role === "user")?.content ?? userInput,
      temperature: temperature[0],
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <FlaskConical className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to use the AI Sandbox</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Experiment with AI models and save your best prompts.
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col" style={{ position: "relative" }}>
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* ── Header ── */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-3 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
          <div className="h-4 w-px bg-border" />
          <FlaskConical className="h-4 w-4 text-primary shrink-0" />
          <h1 className="font-semibold">AI Sandbox</h1>
          <Badge variant="outline" className="ml-1 text-xs hidden sm:inline-flex">GPT-4o</Badge>

          <div className="ml-auto flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setShowSave(!showSave)} className="hidden sm:flex">
                  <BookmarkPlus className="h-4 w-4 mr-1" /> Save
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear} className="hidden sm:flex">
                  <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
              </>
            )}

            {/* Settings drawer toggle — prominent, labelled */}
            <button
              onClick={() => setSettingsOpen((v) => !v)}
              aria-label={settingsOpen ? "Close settings" : "Open settings"}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.375rem",
                padding: "0.375rem 0.75rem",
                borderRadius: "0.625rem",
                border: "1.5px solid",
                borderColor: settingsOpen ? "oklch(0.58 0.26 330)" : "oklch(0.82 0.04 265)",
                background: settingsOpen
                  ? "oklch(0.58 0.26 330 / 0.10)"
                  : "oklch(0.97 0.005 265 / 0.06)",
                color: settingsOpen ? "oklch(0.52 0.26 330)" : "oklch(0.40 0.02 265)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "all 0.18s ease",
                whiteSpace: "nowrap",
              }}
            >
              {settingsOpen
                ? <PanelRightClose style={{ width: "0.9rem", height: "0.9rem" }} />
                : <Settings2 style={{ width: "0.9rem", height: "0.9rem" }} />
              }
              <span className="hidden sm:inline">{settingsOpen ? "Close Settings" : "Settings"}</span>
            </button>

            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(true)} aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* ── Main layout: chat + floating settings drawer ── */}
      <div
        className="flex flex-1 overflow-hidden"
        style={{ position: "relative" }}
      >
        {/* ── Chat area — always full width, content wraps when drawer is open on desktop ── */}
        <div
          className="flex flex-col flex-1 overflow-hidden"
          style={{
            transition: "margin-right 0.32s cubic-bezier(0.16,1,0.3,1)",
            marginRight: settingsOpen ? "min(340px, 88vw)" : "0",
          }}
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                <FlaskConical className="h-14 w-14 mb-4 opacity-25" />
                <h3 className="text-lg font-semibold mb-2">Start experimenting</h3>
                <p className="text-sm max-w-sm leading-relaxed">
                  Open <strong>Settings</strong> (top right) to configure your system prompt and model parameters, then type a message below.
                </p>
                <button
                  onClick={() => setSettingsOpen(true)}
                  style={{
                    marginTop: "1.25rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.5rem 1.25rem",
                    borderRadius: "0.75rem",
                    border: "1.5px solid oklch(0.58 0.26 330 / 0.4)",
                    background: "oklch(0.58 0.26 330 / 0.08)",
                    color: "oklch(0.52 0.26 330)",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                  }}
                >
                  <Settings2 style={{ width: "1rem", height: "1rem" }} />
                  Open Settings
                </button>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile action bar when messages exist */}
          {messages.length > 0 && (
            <div className="flex sm:hidden items-center gap-2 px-4 py-2 border-t border-border/40 bg-card/20">
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => setShowSave(!showSave)}>
                <BookmarkPlus className="h-3.5 w-3.5 mr-1" /> Save Prompt
              </Button>
              <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={handleClear}>
                <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            </div>
          )}

          {/* Save prompt inline panel */}
          {showSave && (
            <div className="mx-4 mb-2 p-3 rounded-xl bg-muted/30 border border-border/50 flex gap-2 items-center">
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Prompt title..."
                className="flex-1 bg-muted rounded-lg px-3 py-2 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button
                size="sm"
                onClick={handleSavePrompt}
                disabled={!saveTitle.trim() || savePromptMutation.isPending}
                className="gradient-primary text-white border-0 shrink-0"
              >
                Save
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowSave(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="border-t border-border/50 p-4 bg-card/20">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your prompt… (Enter to send, Shift+Enter for new line)"
                className="resize-none bg-muted/30 text-sm min-h-[52px] max-h-40"
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
                className="h-auto px-4 gradient-primary text-white border-0 shrink-0"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Floating settings drawer ── */}
        {/* Backdrop (mobile only) */}
        <div
          aria-hidden="true"
          onClick={() => setSettingsOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 45,
            background: "oklch(0.06 0.02 265 / 0.45)",
            backdropFilter: "blur(4px)",
            opacity: settingsOpen ? 1 : 0,
            pointerEvents: settingsOpen ? "auto" : "none",
            transition: "opacity 0.22s ease",
            display: "block",
          }}
          className="md:hidden"
        />

        {/* Drawer panel */}
        <div
          role="complementary"
          aria-label="Sandbox settings"
          style={{
            position: "fixed",
            top: "64px", // below header
            right: 0,
            bottom: 0,
            zIndex: 46,
            width: "min(340px, 88vw)",
            background: "var(--card)",
            borderLeft: "1px solid oklch(0.82 0.04 265 / 0.6)",
            boxShadow: settingsOpen ? "-6px 0 32px oklch(0.06 0.04 265 / 0.18)" : "none",
            transform: settingsOpen ? "translateX(0)" : "translateX(100%)",
            transition: settingsOpen
              ? "transform 0.32s cubic-bezier(0.16,1,0.3,1)"
              : "transform 0.20s cubic-bezier(0.4,0,1,1)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Drawer header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem 1.25rem",
              borderBottom: "1px solid oklch(0.82 0.04 265 / 0.4)",
              flexShrink: 0,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Settings2 style={{ width: "1rem", height: "1rem", color: "oklch(0.58 0.26 330)" }} />
              <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--foreground)" }}>
                Configuration
              </span>
            </div>
            <button
              onClick={() => setSettingsOpen(false)}
              aria-label="Close settings"
              style={{
                width: "2rem",
                height: "2rem",
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
              <X style={{ width: "0.9rem", height: "0.9rem" }} />
            </button>
          </div>

          {/* Drawer body */}
          <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

              {/* System prompt */}
              <div>
                <Label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "oklch(0.50 0.04 265)",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  System Prompt
                </Label>
                <Textarea
                  value={systemPrompt}
                  onChange={(e) => setSystemPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  className="text-sm resize-none h-28 bg-muted/30"
                />
                <p style={{ fontSize: "0.7rem", color: "oklch(0.55 0.02 265)", marginTop: "0.375rem" }}>
                  Sets the AI's persona and context for the entire conversation.
                </p>
              </div>

              {/* Temperature */}
              <div>
                <Label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "oklch(0.50 0.04 265)",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Temperature: <span style={{ color: "oklch(0.58 0.26 330)", fontWeight: 800 }}>{temperature[0].toFixed(1)}</span>
                </Label>
                <Slider
                  value={temperature}
                  onValueChange={setTemperature}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.7rem",
                    color: "oklch(0.55 0.02 265)",
                    marginTop: "0.375rem",
                  }}
                >
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>

              {/* Max tokens */}
              <div>
                <Label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "oklch(0.50 0.04 265)",
                    display: "block",
                    marginBottom: "0.5rem",
                  }}
                >
                  Max Tokens: <span style={{ color: "oklch(0.58 0.26 330)", fontWeight: 800 }}>{maxTokens[0]}</span>
                </Label>
                <Slider
                  value={maxTokens}
                  onValueChange={setMaxTokens}
                  min={100}
                  max={4000}
                  step={100}
                />
                <p style={{ fontSize: "0.7rem", color: "oklch(0.55 0.02 265)", marginTop: "0.375rem" }}>
                  Maximum length of the AI's response.
                </p>
              </div>

              {/* Divider */}
              <div style={{ borderTop: "1px solid oklch(0.88 0.02 265 / 0.6)" }} />

              {/* Quick actions */}
              <div>
                <Label
                  style={{
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "oklch(0.50 0.04 265)",
                    display: "block",
                    marginBottom: "0.75rem",
                  }}
                >
                  Actions
                </Label>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => { setShowSave(!showSave); setSettingsOpen(false); }}
                    disabled={messages.length === 0}
                  >
                    <BookmarkPlus className="h-4 w-4 mr-2" /> Save Prompt to Library
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start text-sm text-destructive hover:text-destructive"
                    onClick={() => { handleClear(); setSettingsOpen(false); }}
                    disabled={messages.length === 0}
                  >
                    <Trash2 className="h-4 w-4 mr-2" /> Clear Conversation
                  </Button>
                </div>
              </div>

            </div>
          </div>

          {/* Drawer footer — collapse button */}
          <div
            style={{
              padding: "0.875rem 1.25rem",
              borderTop: "1px solid oklch(0.82 0.04 265 / 0.4)",
              flexShrink: 0,
            }}
          >
            <button
              onClick={() => setSettingsOpen(false)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.625rem",
                borderRadius: "0.75rem",
                border: "1.5px solid oklch(0.82 0.04 265 / 0.5)",
                background: "none",
                color: "oklch(0.45 0.02 265)",
                fontWeight: 600,
                fontSize: "0.8rem",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "oklch(0.92 0.01 265)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; }}
            >
              <PanelRightClose style={{ width: "0.9rem", height: "0.9rem" }} />
              Collapse Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
