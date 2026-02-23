import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import {
  AlertCircle,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Code2,
  Info,
  Lightbulb,
  Loader2,
  Lock,
  MessageSquare,
  Menu,
  PanelRightClose,
  PanelRightOpen,
  Quote,
  Send,
  Star,
  Trophy,
  TriangleAlert,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";
import MenuPanel from "@/components/MenuPanel";

// ─── Types ────────────────────────────────────────────────────────────────────
type ContentBlock = {
  id: number;
  type: string;
  order: number;
  content: Record<string, unknown>;
};

type QuizQuestion = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string | null;
};

type QuizResult = {
  score: number;
  passed: boolean;
  correct: number;
  total: number;
  questions: {
    question: string;
    options: string[];
    correctIndex: number;
    chosenIndex: number;
    explanation?: string | null;
  }[];
};

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  qualityScore?: number | null;
  qualityFeedback?: string | null;
  qualityPassed?: boolean | null;
};

// ─── Callout icons ────────────────────────────────────────────────────────────
const CALLOUT_META: Record<string, { cssClass: string; icon: React.ReactNode; label: string }> = {
  info: {
    cssClass: "lesson-callout-info",
    icon: <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "oklch(0.72 0.18 230)" }} />,
    label: "Note",
  },
  warning: {
    cssClass: "lesson-callout-warning",
    icon: <TriangleAlert className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "oklch(0.82 0.18 65)" }} />,
    label: "Warning",
  },
  success: {
    cssClass: "lesson-callout-success",
    icon: <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "oklch(0.75 0.18 155)" }} />,
    label: "Success",
  },
  tip: {
    cssClass: "lesson-callout-tip",
    icon: <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "oklch(0.78 0.22 320)" }} />,
    label: "Tip",
  },
};

// ─── Content Block Renderer ───────────────────────────────────────────────────
function BlockRenderer({ block }: { block: ContentBlock }) {
  const c = block.content as Record<string, unknown>;

  switch (block.type) {
    // ── Text / HTML ──────────────────────────────────────────────────────────
    case "text":
      return (
        <div
          className="lesson-prose"
          dangerouslySetInnerHTML={{ __html: (c.html as string) || (c.text as string) || "" }}
        />
      );

    // ── Callout ──────────────────────────────────────────────────────────────
    case "callout": {
      const variant = (c.variant as string) || "info";
      const meta = CALLOUT_META[variant] || CALLOUT_META.info;
      return (
        <div className={`rounded-xl p-4 flex gap-3 ${meta.cssClass}`}>
          {meta.icon}
          <div className="min-w-0">
            {!!c.title && (
              <p className="callout-title font-bold text-sm mb-1">{String(c.title)}</p>
            )}
            <p className="text-sm leading-relaxed">
              {String((c.body as string) || (c.text as string) || "")}
            </p>
          </div>
        </div>
      );
    }

    // ── Code ─────────────────────────────────────────────────────────────────
    case "code":
      return (
        <div className="rounded-xl overflow-hidden lesson-code-block">
          <div className="flex items-center gap-2 px-4 py-2.5 lesson-code-header">
            <Code2 className="w-4 h-4" style={{ color: "oklch(0.72 0.22 330)" }} />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider">
              {(c.language as string) || "text"}
            </span>
            {!!c.title && (
              <span className="ml-auto text-xs opacity-70">{String(c.title)}</span>
            )}
          </div>
          <pre className="p-5 text-sm font-mono lesson-code-content overflow-x-auto leading-relaxed">
            <code>{c.code as string}</code>
          </pre>
        </div>
      );

    // ── Image ─────────────────────────────────────────────────────────────────
    case "image":
      return (
        <figure className="rounded-xl overflow-hidden" style={{ border: "1px solid oklch(0.28 0.05 265)" }}>
          <img
            src={c.url as string}
            alt={(c.alt as string) || ""}
            className="w-full object-cover"
          />
          {!!c.caption && (
            <figcaption
              className="text-center text-sm py-2.5 px-4"
              style={{ color: "oklch(0.72 0.02 265)", background: "oklch(0.15 0.03 265)" }}
            >
              {String(c.caption)}
            </figcaption>
          )}
        </figure>
      );

    // ── Video ─────────────────────────────────────────────────────────────────
    case "video":
      return (
        <div
          className="rounded-xl overflow-hidden aspect-video"
          style={{ border: "1px solid oklch(0.28 0.05 265)" }}
        >
          <iframe
            src={c.url as string}
            className="w-full h-full"
            allowFullScreen
            title={(c.title as string) || "Video"}
          />
        </div>
      );

    // ── Quote ─────────────────────────────────────────────────────────────────
    case "quote":
      return (
        <blockquote className="lesson-quote">
          <Quote
            className="w-5 h-5 mb-2 opacity-50"
            style={{ color: "oklch(0.72 0.22 330)" }}
          />
          <p>{String(c.text || c.body || "")}</p>
          {!!c.author && <cite>{String(c.author)}</cite>}
        </blockquote>
      );

    // ── Divider ───────────────────────────────────────────────────────────────
    case "divider":
      return <hr className="lesson-divider" />;

    // ── Step Flow ─────────────────────────────────────────────────────────────
    case "step_flow": {
      const steps = (c.steps as Array<{ title: string; body?: string; detail?: string }>) || [];
      const title = c.title as string | undefined;
      return (
        <div className="lesson-step-flow space-y-3">
          {!!title && (
            <h4
              className="text-sm font-bold uppercase tracking-widest mb-3"
              style={{ color: "oklch(0.72 0.22 330)" }}
            >
              {title}
            </h4>
          )}
          {steps.map((step, i) => (
            <div key={i} className="lesson-step rounded-xl p-4 flex gap-4 items-start">
              <div className="lesson-step-number">{i + 1}</div>
              <div className="min-w-0">
                <p className="lesson-step-title">{step.title}</p>
                {!!(step.body || step.detail) && (
                  <p className="lesson-step-body mt-1">{step.body || step.detail}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // ── Flashcard Grid ────────────────────────────────────────────────────────
    case "flashcard_grid": {
      const cards = (c.cards as Array<{ term: string; definition: string }>) || [];
      const title = c.title as string | undefined;
      return (
        <div className="space-y-3">
          {!!title && (
            <h4
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.22 330)" }}
            >
              {title}
            </h4>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 lesson-flashcard-grid">
            {cards.map((card, i) => (
              <FlashCard key={i} term={card.term} definition={card.definition} />
            ))}
          </div>
        </div>
      );
    }

    // ── Stat Grid ─────────────────────────────────────────────────────────────
    case "stat_grid": {
      const stats = (c.stats as Array<{ value: string; label: string; color?: string }>) || [];
      const title = c.title as string | undefined;
      return (
        <div className="space-y-3">
          {!!title && (
            <h4
              className="text-sm font-bold uppercase tracking-widest"
              style={{ color: "oklch(0.72 0.22 330)" }}
            >
              {title}
            </h4>
          )}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <div key={i} className="lesson-stat-card">
                <div
                  className="lesson-stat-value"
                  style={{ color: stat.color || "oklch(0.78 0.22 330)" }}
                >
                  {stat.value}
                </div>
                <div className="lesson-stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    // ── Concept Diagram ───────────────────────────────────────────────────────
    case "concept_diagram": {
      const center = c.center as string | undefined;
      const nodes = (c.nodes as string[]) || [];
      const title = c.title as string | undefined;
      return (
        <div className="lesson-concept-diagram">
          {!!title && (
            <h4
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: "oklch(0.72 0.22 330)" }}
            >
              {title}
            </h4>
          )}
          <div className="flex flex-col items-center gap-4">
            {!!center && (
              <div className="lesson-concept-center">{center}</div>
            )}
            {nodes.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full">
                {nodes.map((node, i) => (
                  <div key={i} className="lesson-concept-node">{node}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    default:
      return null;
  }
}

// ─── Flashcard component with flip animation ──────────────────────────────────
function FlashCard({ term, definition }: { term: string; definition: string }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <button
      onClick={() => setFlipped((v) => !v)}
      className="lesson-flashcard text-left w-full"
      title="Click to flip"
    >
      {!flipped ? (
        <>
          <p className="lesson-flashcard-term">{term}</p>
          <p className="text-[10px] mt-2" style={{ color: "oklch(0.55 0.04 265)" }}>
            Click to reveal definition →
          </p>
        </>
      ) : (
        <>
          <p
            className="text-[10px] font-semibold uppercase tracking-wider mb-1.5"
            style={{ color: "oklch(0.55 0.04 265)" }}
          >
            {term}
          </p>
          <p className="lesson-flashcard-def">{definition}</p>
        </>
      )}
    </button>
  );
}

// ─── Sandbox Side Panel ───────────────────────────────────────────────────────
function SandboxPanel({
  lessonId,
  lessonTitle,
  exercises,
  isAuthenticated,
  onQualityPassed,
  initialMessages,
}: {
  lessonId: number;
  lessonTitle: string;
  exercises: ContentBlock[];
  isAuthenticated: boolean;
  onQualityPassed: () => void;
  initialMessages: ChatMessage[];
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [qualityUnlocked, setQualityUnlocked] = useState(
    initialMessages.some((m) => m.role === "user" && m.qualityPassed === true)
  );
  const chatMutation = trpc.sandbox.chat.useMutation();
  const saveMessageMutation = trpc.sandbox.saveMessage.useMutation();
  const scoreQualityMutation = trpc.sandbox.scoreQuality.useMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const [initialized, setInitialized] = useState(false);
  useEffect(() => {
    if (!initialized && initialMessages.length > 0) {
      setMessages(initialMessages);
      const alreadyPassed = initialMessages.some((m) => m.role === "user" && m.qualityPassed === true);
      if (alreadyPassed) setQualityUnlocked(true);
      setInitialized(true);
    }
  }, [initialMessages, initialized]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeExercise = exercises[0];
  const exerciseContent = activeExercise?.content as Record<string, unknown> | undefined;

  const handleSend = async () => {
    if (!prompt.trim() || isLoading || isScoring) return;
    const userMsg = prompt.trim();
    setPrompt("");
    const userChatMsg: ChatMessage = { role: "user", content: userMsg };
    setMessages((prev) => [...prev, userChatMsg]);
    setIsLoading(true);

    try {
      const systemPrompt =
        (exerciseContent?.systemPrompt as string) ||
        `You are an AI business assistant helping a learner practice skills from the lesson: "${lessonTitle}". Provide helpful, constructive feedback on their prompts and demonstrate good AI usage in a business context.`;

      const res = await chatMutation.mutateAsync({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.map((m) => ({ role: m.role, content: m.content })),
          { role: "user", content: userMsg },
        ],
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 800,
      });

      const assistantContent =
        typeof res.content === "string" ? res.content : JSON.stringify(res.content);
      const assistantMsg: ChatMessage = { role: "assistant", content: assistantContent };
      setMessages((prev) => [...prev, assistantMsg]);
      saveMessageMutation.mutate({ lessonId, role: "assistant", content: assistantContent });

      if (!qualityUnlocked) {
        setIsScoring(true);
        try {
          const scoreResult = await scoreQualityMutation.mutateAsync({
            lessonId,
            lessonTitle,
            prompt: userMsg,
          });
          setMessages((prev) =>
            prev.map((m, i) =>
              i === prev.length - 2 && m.role === "user" && m.content === userMsg
                ? { ...m, qualityScore: scoreResult.score, qualityFeedback: scoreResult.feedback, qualityPassed: scoreResult.passed }
                : m
            )
          );
          if (scoreResult.passed) {
            setQualityUnlocked(true);
            onQualityPassed();
            toast.success("Great prompt! Quiz unlocked.", { duration: 3000 });
          } else {
            toast.info(`Quality score: ${scoreResult.score}/100 — ${scoreResult.feedback}`, { duration: 5000 });
          }
        } catch {
          saveMessageMutation.mutate({ lessonId, role: "user", content: userMsg });
        } finally {
          setIsScoring(false);
        }
      } else {
        saveMessageMutation.mutate({ lessonId, role: "user", content: userMsg });
      }
    } catch {
      toast.error("Failed to get AI response. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Lock className="w-10 h-10 mb-3" style={{ color: "oklch(0.40 0.04 265)" }} />
        <p className="text-sm" style={{ color: "oklch(0.60 0.02 265)" }}>Sign in to use the AI sandbox</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {!!exerciseContent?.instructions && (
        <div
          className="p-3 border-b shrink-0"
          style={{ background: "oklch(0.18 0.06 310)", borderColor: "oklch(0.30 0.08 310)" }}
        >
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5" style={{ color: "oklch(0.78 0.22 320)" }} />
            <span className="text-xs font-semibold" style={{ color: "oklch(0.82 0.18 320)" }}>
              Applied Exercise
            </span>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: "oklch(0.82 0.04 265)" }}>
            {String(exerciseContent.instructions ?? "")}
          </p>
          {!!exerciseContent.starterPrompt && (
            <button
              className="mt-2 text-xs underline underline-offset-2"
              style={{ color: "oklch(0.78 0.22 320)" }}
              onClick={() => setPrompt(String(exerciseContent!.starterPrompt))}
            >
              Use starter prompt →
            </button>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full py-8" style={{ color: "oklch(0.45 0.02 265)" }}>
            <MessageSquare className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-xs text-center">Practice your skills with the AI assistant</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
            <div
              className="max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed"
              style={
                msg.role === "user"
                  ? { background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }
                  : { background: "oklch(0.20 0.04 265)", color: "oklch(0.90 0.012 265)" }
              }
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
            {msg.role === "user" && msg.qualityScore != null && (
              <div
                className="mt-1 flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                style={
                  msg.qualityPassed
                    ? { background: "oklch(0.20 0.08 155)", color: "oklch(0.82 0.18 155)" }
                    : { background: "oklch(0.20 0.08 60)", color: "oklch(0.85 0.18 65)" }
                }
              >
                {msg.qualityPassed ? (
                  <CheckCircle2 className="w-2.5 h-2.5" />
                ) : (
                  <AlertCircle className="w-2.5 h-2.5" />
                )}
                <span>
                  Score {msg.qualityScore}/100
                  {msg.qualityFeedback ? ` — ${msg.qualityFeedback}` : ""}
                </span>
              </div>
            )}
          </div>
        ))}
        {(isLoading || isScoring) && (
          <div className="flex justify-start">
            <div
              className="rounded-xl px-3 py-2"
              style={{ background: "oklch(0.20 0.04 265)" }}
            >
              {isScoring ? (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.78 0.22 320)" }}>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Scoring your prompt…</span>
                </div>
              ) : (
                <div className="flex gap-1">
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="w-1.5 h-1.5 rounded-full animate-bounce"
                      style={{ background: "oklch(0.72 0.22 330)", animationDelay: `${delay}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div
        className="p-3 border-t space-y-2 shrink-0"
        style={{ borderColor: "oklch(0.25 0.04 265)" }}
      >
        {qualityUnlocked && (
          <div className="flex items-center gap-1.5 text-xs" style={{ color: "oklch(0.78 0.18 155)" }}>
            <CheckCircle2 className="w-3 h-3" />
            <span>Applied exercise complete — quiz unlocked!</span>
          </div>
        )}
        {!qualityUnlocked && (
          <p className="text-[10px]" style={{ color: "oklch(0.55 0.02 265)" }}>
            Submit a quality prompt (60+ score) to unlock the quiz
          </p>
        )}
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt… (Ctrl+Enter to send)"
            className="resize-none text-xs"
            style={{
              background: "oklch(0.18 0.03 265)",
              border: "1px solid oklch(0.30 0.05 265)",
              color: "oklch(0.92 0.01 265)",
            }}
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading || isScoring}
            size="sm"
            className="self-end shrink-0"
            style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Quiz Section ─────────────────────────────────────────────────────────────
function QuizSection({
  lessonId,
  questions,
  appliedCompleted,
  onPass,
}: {
  lessonId: number;
  questions: QuizQuestion[];
  appliedCompleted: boolean;
  onPass: () => void;
}) {
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null));
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const submitMutation = trpc.quiz.submit.useMutation();
  const allAnswered = answers.every((a) => a !== null);

  if (!appliedCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center"
          style={{ background: "oklch(0.20 0.08 60)", border: "1px solid oklch(0.45 0.18 60)" }}
        >
          <Lock className="w-7 h-7" style={{ color: "oklch(0.82 0.18 65)" }} />
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1" style={{ color: "oklch(0.97 0.01 265)" }}>
            Complete the Applied Exercise First
          </h3>
          <p className="text-sm max-w-sm" style={{ color: "oklch(0.72 0.02 265)" }}>
            Submit a quality prompt (score 60+) in the AI sandbox to demonstrate comprehension before taking the quiz.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs mt-2" style={{ color: "oklch(0.55 0.04 265)" }}>
          <Brain className="w-4 h-4" style={{ color: "oklch(0.65 0.18 320)" }} />
          <span>Open the sandbox panel on the right and practice the lesson exercise</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!allAnswered) return;
    try {
      const res = await submitMutation.mutateAsync({ lessonId, answers: answers as number[] });
      setResult(res as QuizResult);
      setSubmitted(true);
      if (res.passed) {
        toast.success(`Quiz passed! ${res.score}% — Next lesson unlocked!`);
        setTimeout(onPass, 1500);
      } else {
        toast.error(`${res.score}% — You need 70% to pass. Review and try again.`);
      }
    } catch {
      toast.error("Failed to submit quiz. Please try again.");
    }
  };

  const handleRetry = () => {
    setAnswers(Array(questions.length).fill(null));
    setResult(null);
    setSubmitted(false);
  };

  if (submitted && result) {
    return (
      <div className="space-y-6">
        <div
          className="rounded-2xl p-6 text-center"
          style={
            result.passed
              ? { background: "oklch(0.17 0.06 155)", border: "1px solid oklch(0.45 0.18 155)" }
              : { background: "oklch(0.17 0.06 25)", border: "1px solid oklch(0.45 0.18 25)" }
          }
        >
          <div className="flex justify-center mb-3">
            {result.passed ? (
              <Trophy className="w-12 h-12" style={{ color: "oklch(0.82 0.18 80)" }} />
            ) : (
              <AlertCircle className="w-12 h-12" style={{ color: "oklch(0.72 0.22 25)" }} />
            )}
          </div>
          <h3
            className="text-2xl font-bold mb-1"
            style={{ color: result.passed ? "oklch(0.88 0.18 155)" : "oklch(0.82 0.22 25)" }}
          >
            {result.passed ? "Quiz Passed!" : "Not Quite Yet"}
          </h3>
          <p className="mb-3" style={{ color: "oklch(0.78 0.02 265)" }}>
            {result.correct} of {result.total} correct — {result.score}%
          </p>
          <Progress value={result.score} className="h-3 max-w-xs mx-auto" />
        </div>

        <div className="space-y-4">
          {result.questions.map((q, i) => {
            const correct = q.chosenIndex === q.correctIndex;
            return (
              <div
                key={i}
                className="rounded-xl p-4"
                style={
                  correct
                    ? { background: "oklch(0.17 0.05 155)", border: "1px solid oklch(0.40 0.14 155)" }
                    : { background: "oklch(0.17 0.05 25)", border: "1px solid oklch(0.40 0.14 25)" }
                }
              >
                <div className="flex items-start gap-2 mb-3">
                  {correct ? (
                    <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "oklch(0.75 0.18 155)" }} />
                  ) : (
                    <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" style={{ color: "oklch(0.72 0.22 25)" }} />
                  )}
                  <p className="font-medium" style={{ color: "oklch(0.95 0.01 265)" }}>{q.question}</p>
                </div>
                <div className="space-y-1 ml-7">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className="text-sm px-3 py-1.5 rounded-lg"
                      style={
                        oi === q.correctIndex
                          ? { background: "oklch(0.22 0.08 155)", color: "oklch(0.88 0.18 155)" }
                          : oi === q.chosenIndex && !correct
                          ? { background: "oklch(0.22 0.08 25)", color: "oklch(0.88 0.18 25)" }
                          : { color: "oklch(0.60 0.02 265)" }
                      }
                    >
                      {oi === q.correctIndex && "✓ "}
                      {oi === q.chosenIndex && !correct && "✗ "}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-2 ml-7 text-sm italic" style={{ color: "oklch(0.65 0.02 265)" }}>
                    {q.explanation}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <Button
            onClick={handleRetry}
            className="w-full"
            style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
          >
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "oklch(0.72 0.02 265)" }}>
        <Star className="w-4 h-4" style={{ color: "oklch(0.82 0.18 80)" }} />
        <span>Score 70% or higher to unlock the next lesson</span>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium" style={{ color: "oklch(0.95 0.01 265)" }}>
            <span className="mr-2" style={{ color: "oklch(0.72 0.22 330)" }}>{qi + 1}.</span>
            {q.question}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => (
              <button
                key={oi}
                onClick={() => {
                  const next = [...answers];
                  next[qi] = oi;
                  setAnswers(next);
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm transition-all"
                style={
                  answers[qi] === oi
                    ? { border: "1px solid oklch(0.65 0.22 330)", background: "oklch(0.22 0.08 330)", color: "oklch(0.97 0.01 265)" }
                    : { border: "1px solid oklch(0.28 0.04 265)", background: "oklch(0.18 0.03 265)", color: "oklch(0.82 0.01 265)" }
                }
              >
                <span className="font-mono mr-2" style={{ color: "oklch(0.72 0.22 330)" }}>
                  {String.fromCharCode(65 + oi)}.
                </span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || submitMutation.isPending}
        className="w-full disabled:opacity-40"
        style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
      >
        {submitMutation.isPending ? "Submitting…" : "Submit Quiz"}
      </Button>
    </div>
  );
}

// ─── Main LessonViewer ────────────────────────────────────────────────────────
export default function LessonViewer() {
  const { slug } = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [sandboxOpen, setSandboxOpen] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [appliedCompleted, setAppliedCompleted] = useState(false);

  const { data: lesson, isLoading: lessonLoading } = trpc.lessons.bySlug.useQuery({ slug: slug ?? "" });
  const { data: blocks = [], isLoading: blocksLoading } = trpc.content.byLesson.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: !!lesson?.id }
  );
  const { data: quizQuestions = [] } = trpc.quiz.questions.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: !!lesson?.id }
  );
  const { data: bestAttempt } = trpc.quiz.bestAttempt.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: isAuthenticated && !!lesson?.id }
  );
  const { data: sandboxHistory = [] } = trpc.sandbox.getLessonHistory.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: isAuthenticated && !!lesson?.id }
  );
  const { data: qualityAlreadyPassed } = trpc.sandbox.qualityPassed.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: isAuthenticated && !!lesson?.id }
  );
  const { data: adjacent } = trpc.lessons.adjacent.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: !!lesson?.id }
  );

  const learningBlocks = blocks.filter((b) => b.type !== "prompt_exercise");
  const exerciseBlocks = blocks.filter((b) => b.type === "prompt_exercise");

  const historyMessages: ChatMessage[] = sandboxHistory.map((row) => ({
    role: row.role as "user" | "assistant",
    content: row.content,
    qualityScore: row.qualityScore,
    qualityFeedback: row.qualityFeedback,
    qualityPassed: row.qualityPassed,
  }));

  useEffect(() => {
    if (bestAttempt?.passed) {
      setQuizPassed(true);
      setAppliedCompleted(true);
    }
  }, [bestAttempt]);

  useEffect(() => {
    if (qualityAlreadyPassed) setAppliedCompleted(true);
  }, [qualityAlreadyPassed]);

  // ── Loading ──
  if (lessonLoading || blocksLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center lesson-canvas"
      >
        <div
          className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "oklch(0.72 0.22 330)", borderTopColor: "transparent" }}
        />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center lesson-canvas">
        <div className="text-center">
          <p className="mb-4" style={{ color: "oklch(0.70 0.02 265)" }}>Lesson not found.</p>
          <Button
            onClick={() => navigate("/courses")}
            variant="outline"
            style={{ borderColor: "oklch(0.35 0.05 265)", color: "oklch(0.88 0.01 265)" }}
          >
            Back to Courses
          </Button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "learn" as const, label: "Learn", icon: BookOpen },
    { id: "quiz" as const, label: "Quiz", icon: Star },
  ];

  return (
    <div className="min-h-screen lesson-canvas flex flex-col">
      <MenuPanel open={menuOpen} onClose={() => setMenuOpen(false)} />
      {/* ── Sticky Header ── */}
      <div
        className="sticky top-0 z-40 shrink-0 backdrop-blur-xl"
        style={{
          background: "oklch(0.13 0.025 265 / 0.95)",
          borderBottom: "1px solid oklch(0.25 0.04 265)",
        }}
      >
        <div className="px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/courses")}
            style={{ color: "oklch(0.72 0.04 265)" }}
            className="hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Courses
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold truncate" style={{ color: "oklch(0.97 0.01 265)" }}>
              {lesson.title}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-xs" style={{ color: "oklch(0.60 0.02 265)" }}>
              <Clock className="w-3 h-3" />
              <span>{lesson.estimatedMinutes}m</span>
              <Zap className="w-3 h-3" style={{ color: "oklch(0.82 0.18 80)" }} />
              <span style={{ color: "oklch(0.82 0.18 80)" }}>{lesson.xpReward} XP</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSandboxOpen((v) => !v)}
              className="text-xs gap-1.5"
              style={{ color: sandboxOpen ? "oklch(0.78 0.22 320)" : "oklch(0.60 0.02 265)" }}
              title={sandboxOpen ? "Hide sandbox" : "Show sandbox"}
            >
              {sandboxOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
              <span className="hidden sm:inline">Sandbox</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              style={{ color: "oklch(0.60 0.02 265)", width: "2rem", height: "2rem" }}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="px-4 flex gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            const isQuizLocked = tab.id === "quiz" && !appliedCompleted && !quizPassed && !bestAttempt?.passed;
            const isQuizDone = tab.id === "quiz" && (quizPassed || bestAttempt?.passed);
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
                style={
                  isActive
                    ? { borderColor: "oklch(0.72 0.22 330)", color: "oklch(0.82 0.22 330)" }
                    : { borderColor: "transparent", color: "oklch(0.58 0.02 265)" }
                }
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isQuizLocked && <Lock className="w-3 h-3" style={{ color: "oklch(0.82 0.18 65)" }} />}
                {isQuizDone && <CheckCircle2 className="w-3 h-3" style={{ color: "oklch(0.75 0.18 155)" }} />}
              </button>
            );
          })}

          <div className="ml-auto flex items-center gap-1.5 text-xs pb-2 self-end">
            {appliedCompleted ? (
              <span className="flex items-center gap-1" style={{ color: "oklch(0.75 0.18 155)" }}>
                <CheckCircle2 className="w-3 h-3" />
                Applied done
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: "oklch(0.72 0.12 65)" }}>
                <Brain className="w-3 h-3" />
                Practice in sandbox to unlock quiz
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── Two-column body ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main content */}
        <div className={`flex-1 overflow-y-auto transition-all duration-300 ${sandboxOpen ? "w-0" : "w-full"}`}>
          <div className="max-w-3xl mx-auto px-4 py-8">

            {/* ── Learn Tab ── */}
            {activeTab === "learn" && (
              <div className="space-y-6">
                {lesson.description && (
                  <p className="text-lg leading-relaxed" style={{ color: "oklch(0.75 0.02 265)" }}>
                    {lesson.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge
                    variant="outline"
                    className="capitalize"
                    style={{ borderColor: "oklch(0.35 0.05 265)", color: "oklch(0.72 0.02 265)" }}
                  >
                    {lesson.type}
                  </Badge>
                  {lesson.isPremium && (
                    <Badge style={{ background: "oklch(0.22 0.08 60)", color: "oklch(0.88 0.18 65)", border: "1px solid oklch(0.45 0.18 60)" }}>
                      Premium
                    </Badge>
                  )}
                </div>

                {learningBlocks.length === 0 ? (
                  <div className="text-center py-16" style={{ color: "oklch(0.45 0.02 265)" }}>
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Lesson content is being prepared.</p>
                  </div>
                ) : (
                  learningBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block as ContentBlock} />
                  ))
                )}

                {/* ── Navigation + Quiz CTA ── */}
                <div
                  className="pt-6 space-y-4"
                  style={{ borderTop: "1px solid oklch(0.25 0.04 265)" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    {adjacent?.prev ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/lessons/${adjacent.prev!.slug}`)}
                        className="flex items-center gap-1.5 max-w-[45%]"
                        style={{ borderColor: "oklch(0.30 0.05 265)", color: "oklch(0.78 0.02 265)" }}
                      >
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                        <span className="truncate text-xs">{adjacent.prev.title}</span>
                      </Button>
                    ) : <div />}
                    {adjacent?.next ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/lessons/${adjacent.next!.slug}`)}
                        className="flex items-center gap-1.5 max-w-[45%] ml-auto"
                        style={{ borderColor: "oklch(0.30 0.05 265)", color: "oklch(0.78 0.02 265)" }}
                      >
                        <span className="truncate text-xs">{adjacent.next.title}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </Button>
                    ) : <div />}
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: "oklch(0.55 0.02 265)" }}>
                      {appliedCompleted
                        ? "Applied exercise complete — take the quiz when ready."
                        : "Practice in the sandbox panel to unlock the quiz."}
                    </p>
                    <Button
                      onClick={() => setActiveTab("quiz")}
                      style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
                    >
                      Go to Quiz
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* ── Quiz Tab ── */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ background: "oklch(0.17 0.03 265)", border: "1px solid oklch(0.28 0.05 265)" }}
                  >
                    <Lock className="w-10 h-10 mx-auto mb-3" style={{ color: "oklch(0.45 0.04 265)" }} />
                    <p className="mb-4" style={{ color: "oklch(0.72 0.02 265)" }}>
                      Sign in to take the quiz and unlock the next lesson
                    </p>
                    <Button
                      onClick={() => navigate("/")}
                      style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
                    >
                      Sign In
                    </Button>
                  </div>
                ) : quizPassed || bestAttempt?.passed ? (
                  <div
                    className="rounded-2xl p-8 text-center"
                    style={{ background: "oklch(0.17 0.06 155)", border: "1px solid oklch(0.45 0.18 155)" }}
                  >
                    <Trophy className="w-12 h-12 mx-auto mb-3" style={{ color: "oklch(0.82 0.18 80)" }} />
                    <h3 className="text-xl font-bold mb-1" style={{ color: "oklch(0.88 0.18 155)" }}>
                      Quiz Completed!
                    </h3>
                    <p style={{ color: "oklch(0.75 0.02 265)" }}>
                      Best score: {bestAttempt?.score ?? 100}% — Next lesson unlocked
                    </p>
                    <div className="flex items-center justify-center gap-3 mt-4">
                      {adjacent?.next && (
                        <Button
                          onClick={() => navigate(`/lessons/${adjacent.next!.slug}`)}
                          style={{ background: "oklch(0.55 0.22 330)", color: "oklch(0.98 0.005 330)" }}
                        >
                          Next Lesson
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      )}
                      <Button
                        onClick={() => navigate("/courses")}
                        variant="outline"
                        style={{ borderColor: "oklch(0.35 0.05 265)", color: "oklch(0.78 0.02 265)" }}
                      >
                        Course Outline
                      </Button>
                    </div>
                  </div>
                ) : quizQuestions.length === 0 ? (
                  <div className="text-center py-16" style={{ color: "oklch(0.45 0.02 265)" }}>
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p>Quiz questions are being prepared.</p>
                  </div>
                ) : (
                  <div
                    className="rounded-2xl p-6"
                    style={{ background: "oklch(0.17 0.03 265)", border: "1px solid oklch(0.28 0.05 265)" }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <Star className="w-5 h-5" style={{ color: "oklch(0.82 0.18 80)" }} />
                      <h2 className="font-bold text-lg" style={{ color: "oklch(0.97 0.01 265)" }}>
                        Lesson Quiz
                      </h2>
                      <span
                        className="ml-auto text-xs px-2 py-0.5 rounded-full"
                        style={{ background: "oklch(0.22 0.04 265)", color: "oklch(0.72 0.02 265)" }}
                      >
                        {quizQuestions.length} questions
                      </span>
                    </div>
                    <QuizSection
                      lessonId={lesson.id}
                      questions={quizQuestions as QuizQuestion[]}
                      appliedCompleted={appliedCompleted}
                      onPass={() => setQuizPassed(true)}
                    />
                  </div>
                )}

                {(adjacent?.prev || adjacent?.next) && (
                  <div className="flex items-center justify-between gap-3 pt-2">
                    {adjacent?.prev ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/lessons/${adjacent.prev!.slug}`)}
                        className="flex items-center gap-1.5 max-w-[45%]"
                        style={{ color: "oklch(0.62 0.02 265)" }}
                      >
                        <ChevronLeft className="w-4 h-4 shrink-0" />
                        <span className="truncate text-xs">{adjacent.prev.title}</span>
                      </Button>
                    ) : <div />}
                    {adjacent?.next ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(`/lessons/${adjacent.next!.slug}`)}
                        className="flex items-center gap-1.5 max-w-[45%] ml-auto"
                        style={{ color: "oklch(0.62 0.02 265)" }}
                      >
                        <span className="truncate text-xs">{adjacent.next.title}</span>
                        <ChevronRight className="w-4 h-4 shrink-0" />
                      </Button>
                    ) : <div />}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Sandbox Side Panel ── */}
        {sandboxOpen && (
          <div
            className="w-80 xl:w-96 shrink-0 flex flex-col overflow-hidden"
            style={{ borderLeft: "1px solid oklch(0.25 0.04 265)", background: "oklch(0.11 0.02 265)" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2 shrink-0"
              style={{ borderBottom: "1px solid oklch(0.25 0.04 265)" }}
            >
              <Brain className="w-4 h-4" style={{ color: "oklch(0.72 0.22 320)" }} />
              <span className="text-sm font-semibold" style={{ color: "oklch(0.97 0.01 265)" }}>
                AI Sandbox
              </span>
              {historyMessages.length > 0 && (
                <span className="text-[10px] ml-1" style={{ color: "oklch(0.50 0.02 265)" }}>
                  ({historyMessages.length} msg{historyMessages.length !== 1 ? "s" : ""})
                </span>
              )}
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={
                  appliedCompleted
                    ? { background: "oklch(0.20 0.08 155)", color: "oklch(0.82 0.18 155)" }
                    : { background: "oklch(0.20 0.08 60)", color: "oklch(0.85 0.18 65)" }
                }
              >
                {appliedCompleted ? "Complete" : "Required"}
              </span>
            </div>

            {lesson && (
              <SandboxPanel
                lessonId={lesson.id}
                lessonTitle={lesson.title}
                exercises={exerciseBlocks as ContentBlock[]}
                isAuthenticated={isAuthenticated}
                onQualityPassed={() => setAppliedCompleted(true)}
                initialMessages={historyMessages}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
