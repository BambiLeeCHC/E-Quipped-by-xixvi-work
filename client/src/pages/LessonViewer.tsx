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
  Lock,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  Send,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

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

// ─── Content Block Renderer ───────────────────────────────────────────────────
function BlockRenderer({ block }: { block: ContentBlock }) {
  const c = block.content as Record<string, unknown>;

  switch (block.type) {
    case "text":
      return (
        <div
          className="prose prose-invert max-w-none text-foreground leading-relaxed"
          dangerouslySetInnerHTML={{ __html: (c.html as string) || (c.text as string) || "" }}
        />
      );

    case "callout": {
      const variant = (c.variant as string) || "info";
      const colors: Record<string, string> = {
        info: "border-blue-400/40 bg-blue-500/10 text-blue-200",
        warning: "border-yellow-400/40 bg-yellow-500/10 text-yellow-200",
        success: "border-green-400/40 bg-green-500/10 text-green-200",
        tip: "border-fuchsia-400/40 bg-fuchsia-500/10 text-fuchsia-200",
      };
      return (
        <div className={`rounded-xl border p-4 ${colors[variant] || colors.info}`}>
          {!!c.title && <p className="font-semibold mb-1">{String(c.title)}</p>}
          <p className="text-sm opacity-90">{String((c.body as string) || (c.text as string) || "")}</p>
        </div>
      );
    }

    case "code":
      return (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/10">
            <Code2 className="w-4 h-4 text-fuchsia-400" />
            <span className="text-xs text-white/60 font-mono">{(c.language as string) || "text"}</span>
          </div>
          <pre className="p-4 text-sm font-mono text-green-300 overflow-x-auto bg-black/30">
            <code>{c.code as string}</code>
          </pre>
        </div>
      );

    case "image":
      return (
        <div className="rounded-xl overflow-hidden border border-white/10">
          <img src={c.url as string} alt={(c.alt as string) || ""} className="w-full object-cover" />
          {!!c.caption && <p className="text-center text-sm text-white/50 py-2 px-4">{String(c.caption)}</p>}
        </div>
      );

    case "video":
      return (
        <div className="rounded-xl overflow-hidden border border-white/10 aspect-video">
          <iframe
            src={c.url as string}
            className="w-full h-full"
            allowFullScreen
            title={(c.title as string) || "Video"}
          />
        </div>
      );

    case "divider":
      return <hr className="border-white/10 my-2" />;

    default:
      return null;
  }
}

// ─── Sandbox Side Panel ───────────────────────────────────────────────────────
function SandboxPanel({
  lessonTitle,
  exercises,
  isAuthenticated,
  onFirstSubmit,
}: {
  lessonTitle: string;
  exercises: ContentBlock[];
  isAuthenticated: boolean;
  onFirstSubmit: () => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; content: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const chatMutation = trpc.sandbox.chat.useMutation();
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeExercise = exercises[0];
  const exerciseContent = activeExercise?.content as Record<string, unknown> | undefined;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!prompt.trim() || isLoading) return;
    const userMsg = prompt.trim();
    setPrompt("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsLoading(true);
    try {
      const systemPrompt =
        (exerciseContent?.systemPrompt as string) ||
        `You are an AI business assistant helping a learner practice skills from the lesson: "${lessonTitle}". Provide helpful, constructive feedback on their prompts and demonstrate good AI usage in a business context.`;
      const res = await chatMutation.mutateAsync({
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
          { role: "user", content: userMsg },
        ],
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 800,
      });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant" as const,
          content: typeof res.content === "string" ? res.content : JSON.stringify(res.content),
        },
      ]);
      if (!hasSubmitted) {
        setHasSubmitted(true);
        onFirstSubmit();
      }
    } catch {
      toast.error("Failed to get AI response. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <Lock className="w-10 h-10 text-white/20 mb-3" />
        <p className="text-white/50 text-sm">Sign in to use the AI sandbox</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Exercise instructions */}
      {!!exerciseContent?.instructions && (
        <div className="p-3 border-b border-white/10 bg-fuchsia-500/5">
          <div className="flex items-center gap-1.5 mb-1">
            <Brain className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-xs font-semibold text-fuchsia-300">Applied Exercise</span>
          </div>
          <p className="text-xs text-white/70 leading-relaxed">{String(exerciseContent.instructions ?? "")}</p>
          {!!exerciseContent.starterPrompt && (
            <button
              className="mt-2 text-xs text-fuchsia-400 hover:text-fuchsia-300 underline underline-offset-2"
              onClick={() => setPrompt(String(exerciseContent!.starterPrompt))}
            >
              Use starter prompt →
            </button>
          )}
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-white/25 py-8">
            <MessageSquare className="w-8 h-8 mb-2" />
            <p className="text-xs text-center">Practice your skills with the AI assistant</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[90%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                msg.role === "user"
                  ? "bg-fuchsia-600/80 text-white"
                  : "bg-white/10 text-white/90"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white/10 rounded-xl px-3 py-2">
              <div className="flex gap-1">
                {[0, 150, 300].map((delay) => (
                  <span
                    key={delay}
                    className="w-1.5 h-1.5 bg-fuchsia-400 rounded-full animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-white/10 space-y-2">
        {hasSubmitted && (
          <div className="flex items-center gap-1.5 text-xs text-green-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>Applied exercise complete — quiz unlocked!</span>
          </div>
        )}
        <div className="flex gap-2">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt… (Ctrl+Enter to send)"
            className="resize-none bg-white/5 border-white/20 text-white placeholder:text-white/30 focus:border-fuchsia-400 text-xs"
            rows={3}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSend();
            }}
          />
          <Button
            onClick={handleSend}
            disabled={!prompt.trim() || isLoading}
            size="sm"
            className="self-end bg-fuchsia-600 hover:bg-fuchsia-500 text-white shrink-0"
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

  // Gate: quiz locked until applied exercise completed
  if (!appliedCompleted) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-400/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-1">Complete the Applied Exercise First</h3>
          <p className="text-white/50 text-sm max-w-sm">
            You must demonstrate comprehension by submitting at least one response in the AI sandbox before the quiz unlocks.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-white/30 mt-2">
          <Brain className="w-4 h-4 text-fuchsia-400/60" />
          <span>Open the sandbox panel on the right and practice the lesson exercise</span>
        </div>
      </div>
    );
  }

  const handleSubmit = async () => {
    if (!allAnswered) return;
    try {
      const res = await submitMutation.mutateAsync({
        lessonId,
        answers: answers as number[],
      });
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
          className={`rounded-2xl p-6 text-center border ${
            result.passed ? "border-green-400/40 bg-green-500/10" : "border-red-400/40 bg-red-500/10"
          }`}
        >
          <div className="flex justify-center mb-3">
            {result.passed ? (
              <Trophy className="w-12 h-12 text-yellow-400" />
            ) : (
              <AlertCircle className="w-12 h-12 text-red-400" />
            )}
          </div>
          <h3 className={`text-2xl font-bold mb-1 ${result.passed ? "text-green-300" : "text-red-300"}`}>
            {result.passed ? "Quiz Passed!" : "Not Quite Yet"}
          </h3>
          <p className="text-white/60 mb-3">
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
                className={`rounded-xl border p-4 ${
                  correct ? "border-green-400/30 bg-green-500/5" : "border-red-400/30 bg-red-500/5"
                }`}
              >
                <div className="flex items-start gap-2 mb-3">
                  {correct ? (
                    <CheckCircle2 className="w-5 h-5 text-green-400 mt-0.5 shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                  )}
                  <p className="font-medium text-white/90">{q.question}</p>
                </div>
                <div className="space-y-1 ml-7">
                  {q.options.map((opt, oi) => (
                    <div
                      key={oi}
                      className={`text-sm px-3 py-1.5 rounded-lg ${
                        oi === q.correctIndex
                          ? "bg-green-500/20 text-green-300"
                          : oi === q.chosenIndex && !correct
                          ? "bg-red-500/20 text-red-300"
                          : "text-white/40"
                      }`}
                    >
                      {oi === q.correctIndex && "✓ "}
                      {oi === q.chosenIndex && !correct && "✗ "}
                      {opt}
                    </div>
                  ))}
                </div>
                {q.explanation && (
                  <p className="mt-2 ml-7 text-sm text-white/50 italic">{q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>

        {!result.passed && (
          <Button onClick={handleRetry} className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
            Try Again
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/60 text-sm">
        <Star className="w-4 h-4 text-yellow-400" />
        <span>Score 70% or higher to unlock the next lesson</span>
      </div>

      {questions.map((q, qi) => (
        <div key={q.id} className="space-y-3">
          <p className="font-medium text-white/90">
            <span className="text-fuchsia-400 mr-2">{qi + 1}.</span>
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
                className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all ${
                  answers[qi] === oi
                    ? "border-fuchsia-400 bg-fuchsia-500/20 text-white"
                    : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                }`}
              >
                <span className="font-mono text-fuchsia-400 mr-2">{String.fromCharCode(65 + oi)}.</span>
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}

      <Button
        onClick={handleSubmit}
        disabled={!allAnswered || submitMutation.isPending}
        className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white disabled:opacity-40"
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

  const learningBlocks = blocks.filter((b) => b.type !== "prompt_exercise");
  const exerciseBlocks = blocks.filter((b) => b.type === "prompt_exercise");

  useEffect(() => {
    if (bestAttempt?.passed) {
      setQuizPassed(true);
      setAppliedCompleted(true); // already passed means applied was done before
    }
  }, [bestAttempt]);

  if (lessonLoading || blocksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-white/60 mb-4">Lesson not found.</p>
          <Button onClick={() => navigate("/courses")} variant="outline">
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-40 border-b border-white/10 bg-background/90 backdrop-blur-xl shrink-0">
        <div className="px-4 py-3 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/courses")}
            className="text-white/60 hover:text-white"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Courses
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-semibold text-white truncate">{lesson.title}</h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 text-white/40 text-xs">
              <Clock className="w-3 h-3" />
              <span>{lesson.estimatedMinutes}m</span>
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-yellow-400">{lesson.xpReward} XP</span>
            </div>
            {/* Sandbox toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSandboxOpen((v) => !v)}
              className={`text-xs gap-1.5 ${sandboxOpen ? "text-fuchsia-300" : "text-white/50 hover:text-white"}`}
              title={sandboxOpen ? "Hide sandbox" : "Show sandbox"}
            >
              {sandboxOpen ? (
                <PanelRightClose className="w-4 h-4" />
              ) : (
                <PanelRightOpen className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Sandbox</span>
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
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  isActive
                    ? "border-fuchsia-400 text-fuchsia-300"
                    : "border-transparent text-white/50 hover:text-white/80"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {isQuizLocked && <Lock className="w-3 h-3 text-amber-400" />}
                {isQuizDone && <CheckCircle2 className="w-3 h-3 text-green-400" />}
              </button>
            );
          })}

          {/* Applied completion indicator in header */}
          <div className="ml-auto flex items-center gap-1.5 text-xs pb-2 self-end">
            {appliedCompleted ? (
              <span className="flex items-center gap-1 text-green-400">
                <CheckCircle2 className="w-3 h-3" />
                Applied done
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400/70">
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
        <div
          className={`flex-1 overflow-y-auto transition-all duration-300 ${
            sandboxOpen ? "w-0" : "w-full"
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 py-8">
            {/* ── Learn Tab ── */}
            {activeTab === "learn" && (
              <div className="space-y-6">
                {lesson.description && (
                  <p className="text-white/60 text-lg leading-relaxed">{lesson.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className="capitalize border-white/20 text-white/60">
                    {lesson.type}
                  </Badge>
                  {lesson.isPremium && (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>
                  )}
                </div>

                {learningBlocks.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Lesson content is being prepared.</p>
                  </div>
                ) : (
                  learningBlocks.map((block) => (
                    <BlockRenderer key={block.id} block={block as ContentBlock} />
                  ))
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10">
                  <p className="text-sm text-white/40">
                    {appliedCompleted
                      ? "Applied exercise complete — take the quiz when ready."
                      : "Practice in the sandbox panel to unlock the quiz."}
                  </p>
                  <Button
                    onClick={() => setActiveTab("quiz")}
                    className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                  >
                    Go to Quiz
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Quiz Tab ── */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {!isAuthenticated ? (
                  <Card className="border-white/10 bg-white/5">
                    <CardContent className="pt-6 text-center">
                      <Lock className="w-10 h-10 text-white/30 mx-auto mb-3" />
                      <p className="text-white/60 mb-4">Sign in to take the quiz and unlock the next lesson</p>
                      <Button onClick={() => navigate("/")} className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white">
                        Sign In
                      </Button>
                    </CardContent>
                  </Card>
                ) : quizPassed || bestAttempt?.passed ? (
                  <Card className="border-green-400/30 bg-green-500/10">
                    <CardContent className="pt-6 text-center">
                      <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                      <h3 className="text-xl font-bold text-green-300 mb-1">Quiz Completed!</h3>
                      <p className="text-white/60">
                        Best score: {bestAttempt?.score ?? 100}% — Next lesson unlocked
                      </p>
                      <Button
                        onClick={() => navigate("/courses")}
                        className="mt-4 bg-fuchsia-600 hover:bg-fuchsia-500 text-white"
                      >
                        Back to Course Outline
                      </Button>
                    </CardContent>
                  </Card>
                ) : quizQuestions.length === 0 ? (
                  <div className="text-center py-16 text-white/30">
                    <Star className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Quiz questions are being prepared.</p>
                  </div>
                ) : (
                  <Card className="border-white/10 bg-white/5">
                    <CardHeader>
                      <CardTitle className="text-white flex items-center gap-2">
                        <Star className="w-5 h-5 text-yellow-400" />
                        Lesson Quiz
                        <Badge variant="outline" className="ml-auto text-white/60 border-white/20">
                          {quizQuestions.length} questions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <QuizSection
                        lessonId={lesson.id}
                        questions={quizQuestions as QuizQuestion[]}
                        appliedCompleted={appliedCompleted}
                        onPass={() => setQuizPassed(true)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Sandbox Side Panel ── */}
        {sandboxOpen && (
          <div className="w-80 xl:w-96 shrink-0 border-l border-white/10 bg-black/20 flex flex-col overflow-hidden">
            {/* Panel header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2 shrink-0">
              <Brain className="w-4 h-4 text-fuchsia-400" />
              <span className="text-sm font-semibold text-white">AI Sandbox</span>
              <Badge
                variant="outline"
                className={`ml-auto text-xs ${
                  appliedCompleted
                    ? "border-green-400/40 text-green-400"
                    : "border-amber-400/40 text-amber-400"
                }`}
              >
                {appliedCompleted ? "Complete" : "Required"}
              </Badge>
            </div>

            <SandboxPanel
              lessonTitle={lesson.title}
              exercises={exerciseBlocks as ContentBlock[]}
              isAuthenticated={isAuthenticated}
              onFirstSubmit={() => setAppliedCompleted(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
