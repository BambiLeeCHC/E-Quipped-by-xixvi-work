import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  FileText,
  Layers,
  Lock,
  MessageSquare,
  Mic,
  Play,
  Search,
  Send,
  Sparkles,
  Star,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ── Module icon / color map ────────────────────────────────────────────────────
const MODULE_ICONS: Record<string, React.ElementType> = {
  "ai-writing-assistant": FileText,
  "ai-meeting-communication": Mic,
  "ai-data-analysis": TrendingUp,
  "ai-presentation-creation": Layers,
  "ai-research-summarization": Search,
  "ai-workflow-automation": Cpu,
  "ai-client-communications": MessageSquare,
};

const MODULE_COLORS = [
  { from: "from-fuchsia-400", to: "to-pink-400", text: "text-fuchsia-600", border: "border-fuchsia-200/60", active: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200/60" },
  { from: "from-violet-400",  to: "to-purple-400", text: "text-violet-600", border: "border-violet-200/60", active: "bg-violet-50 text-violet-700 border-violet-200/60" },
  { from: "from-sky-400",     to: "to-blue-400", text: "text-sky-600", border: "border-sky-200/60", active: "bg-sky-50 text-sky-700 border-sky-200/60" },
  { from: "from-amber-400",   to: "to-orange-400", text: "text-amber-600", border: "border-amber-200/60", active: "bg-amber-50 text-amber-700 border-amber-200/60" },
  { from: "from-emerald-400", to: "to-teal-400", text: "text-emerald-600", border: "border-emerald-200/60", active: "bg-emerald-50 text-emerald-700 border-emerald-200/60" },
  { from: "from-rose-400",    to: "to-red-400", text: "text-rose-600", border: "border-rose-200/60", active: "bg-rose-50 text-rose-700 border-rose-200/60" },
  { from: "from-indigo-400",  to: "to-blue-500", text: "text-indigo-600", border: "border-indigo-200/60", active: "bg-indigo-50 text-indigo-700 border-indigo-200/60" },
];

// ── Access Request Card ────────────────────────────────────────────────────────
function AccessRequestCard({ onRequested }: { onRequested: () => void }) {
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const requestMutation = trpc.access.request.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      onRequested();
      toast.success("Access request submitted! An admin will review it shortly.");
    },
    onError: () => toast.error("Failed to submit request. Please try again."),
  });

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-300/60 bg-green-50 p-6 text-center">
        <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <h3 className="font-semibold text-green-700 mb-1">Request Submitted</h3>
        <p className="text-sm text-green-600/80">An admin will review your request and grant access shortly.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-fuchsia-200/60 bg-fuchsia-50/60 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lock className="w-6 h-6 text-fuchsia-500" />
        <div>
          <h3 className="font-semibold text-foreground">Full Access Required</h3>
          <p className="text-sm text-foreground/55">Request admin approval to unlock all modules and lessons</p>
        </div>
      </div>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Optional: tell us about yourself and why you'd like access…"
        className="resize-none bg-white border-border/60 focus:border-fuchsia-400 mb-3"
        rows={3}
      />
      <Button
        onClick={() => requestMutation.mutate({ message: message || undefined })}
        disabled={requestMutation.isPending}
        className="w-full gradient-primary text-white border-0 glow-primary"
      >
        <Send className="w-4 h-4 mr-2" />
        {requestMutation.isPending ? "Submitting…" : "Request Full Access"}
      </Button>
    </div>
  );
}

// ── Lesson Row ─────────────────────────────────────────────────────────────────
function LessonRow({
  lesson,
  lessonIndex,
  colors,
  passedLessonIds,
  isVerified,
  isFreePreview,
}: {
  lesson: { id: number; title: string; slug: string; type: string; estimatedMinutes: number; xpReward: number; isPremium: boolean; description: string | null };
  lessonIndex: number;
  colors: typeof MODULE_COLORS[0];
  passedLessonIds: number[];
  isVerified: boolean;
  isFreePreview: boolean;
}) {
  const [, navigate] = useLocation();
  const isPassed = passedLessonIds.includes(lesson.id);
  const isLocked = !isFreePreview && !isVerified;

  return (
    <button
      onClick={() => { if (!isLocked) navigate(`/lessons/${lesson.slug}`); }}
      disabled={isLocked}
      className={`w-full text-left group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
        ${isLocked
          ? "lucite border border-border/30 opacity-50 cursor-not-allowed"
          : "lucite border border-border/30 hover:border-fuchsia-300/50 hover:shadow-sm cursor-pointer card-lift"
        }`}
    >
      <span className="text-xs font-bold text-foreground/30 w-5 shrink-0 text-center">{lessonIndex + 1}</span>

      {/* Status icon */}
      <div className="shrink-0">
        {isLocked ? (
          <div className="w-7 h-7 rounded-full bg-foreground/5 border border-border/40 flex items-center justify-center">
            <Lock className="w-3 h-3 text-foreground/25" />
          </div>
        ) : isPassed ? (
          <div className="w-7 h-7 rounded-full bg-green-100 border border-green-300/60 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          </div>
        ) : (
          <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}>
            <BookOpen className="h-3.5 w-3.5 text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={`text-sm font-semibold truncate ${isLocked ? "text-foreground/40" : "text-foreground group-hover:text-fuchsia-700 transition-colors"}`}>
            {lesson.title}
          </p>
          {isFreePreview && (
            <Badge className="text-[10px] bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200/60 px-1.5 py-0">
              Free Preview
            </Badge>
          )}
          {isPassed && (
            <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200/60 px-1.5 py-0">
              Passed
            </Badge>
          )}
        </div>
        {lesson.description && (
          <p className="text-xs text-foreground/45 truncate mt-0.5">{lesson.description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {lesson.estimatedMinutes > 0 && (
          <span className="text-[10px] text-foreground/40 hidden sm:flex items-center gap-0.5">
            <Clock className="h-2.5 w-2.5" />{lesson.estimatedMinutes}m
          </span>
        )}
        <span className={`text-[10px] font-semibold ${colors.text} hidden sm:block`}>+{lesson.xpReward} XP</span>
        {!isLocked && (
          <ChevronRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-fuchsia-500 group-hover:translate-x-0.5 transition-all" />
        )}
      </div>
    </button>
  );
}

// ── Module Section ─────────────────────────────────────────────────────────────
function ModuleSection({
  module,
  moduleIndex,
  isVerified,
  isModuleLocked,
  passedLessonIds,
  isExpanded,
  onToggle,
}: {
  module: { id: number; title: string; slug: string; description: string | null; xpReward: number };
  moduleIndex: number;
  isVerified: boolean;
  isModuleLocked: boolean;
  passedLessonIds: number[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const { data: lessons = [] } = trpc.lessons.byModule.useQuery({ moduleId: module.id });
  const colors = MODULE_COLORS[moduleIndex % MODULE_COLORS.length];
  const Icon = MODULE_ICONS[module.slug] ?? BookOpen;

  const passedCount = lessons.filter((l) => passedLessonIds.includes(l.id)).length;
  const totalCount = lessons.length;
  const progressPct = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

  return (
    <section id={`module-${module.id}`} className="scroll-mt-20">
      {/* Module header */}
      <button
        onClick={onToggle}
        className={`w-full text-left lucite-spectrum border rounded-2xl p-5 mb-3 card-lift transition-all ${
          isModuleLocked ? "border-border/30 opacity-60" : "border-border/40"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shadow-lg shrink-0 ${isModuleLocked ? "opacity-40" : ""}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">Module {moduleIndex + 1}</span>
              {isModuleLocked && (
                <Badge variant="outline" className="text-[10px] border-border/50 text-foreground/40 px-1.5 py-0">
                  <Lock className="h-2.5 w-2.5 mr-0.5" />Locked
                </Badge>
              )}
              {passedCount === totalCount && totalCount > 0 && (
                <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200/60 px-1.5 py-0">
                  <Trophy className="h-2.5 w-2.5 mr-0.5" />Complete
                </Badge>
              )}
              <Badge variant="outline" className="text-[10px] border-border/50 text-foreground/50 px-1.5 py-0">
                {totalCount} lessons
              </Badge>
              <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${colors.border} ${colors.text} bg-white/60`}>
                <Zap className="h-2.5 w-2.5 mr-0.5" />{module.xpReward} XP
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">{module.title}</h2>
            {module.description && (
              <p className="text-sm text-foreground/55 mt-0.5 leading-relaxed line-clamp-2">{module.description}</p>
            )}
          </div>
          <div className="shrink-0 flex flex-col items-end gap-2">
            <div className="text-xs text-foreground/40">{passedCount}/{totalCount}</div>
            <div className="w-20 h-1.5 bg-foreground/10 rounded-full overflow-hidden">
              <div className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} rounded-full transition-all`} style={{ width: `${progressPct}%` }} />
            </div>
            <ChevronRight className={`w-4 h-4 text-foreground/30 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
          </div>
        </div>
      </button>

      {/* Lessons */}
      {isExpanded && (
        <div className="space-y-1.5 pl-2 border-l-2 border-border/30 ml-6 mb-4">
          {lessons.length === 0 && (
            <p className="py-4 text-sm text-foreground/40 pl-4">No lessons yet — check back soon.</p>
          )}
          {lessons.map((lesson, li) => (
            <LessonRow
              key={lesson.id}
              lesson={lesson}
              lessonIndex={li}
              colors={colors}
              passedLessonIds={passedLessonIds}
              isVerified={isVerified}
              isFreePreview={moduleIndex === 0 && li === 0}
            />
          ))}
        </div>
      )}
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourseCatalog() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [accessRequested, setAccessRequested] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const isAuthenticated = !loading && !!user;

  const { data: courses = [], isLoading: coursesLoading } = trpc.courses.list.useQuery({});
  const course = courses[0];

  const { data: modules = [], isLoading: modulesLoading } = trpc.modules.byCourse.useQuery(
    { courseId: course?.id ?? 0 },
    { enabled: !!course }
  );

  // Gating data (only for authenticated users)
  const { data: accessData, refetch: refetchAccess } = trpc.gating.courseAccess.useQuery(
    { courseId: course?.id ?? 1 },
    { enabled: isAuthenticated && !!course?.id }
  );

  const { data: passedLessonIds = [] } = trpc.gating.passedLessons.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const { data: myRequest } = trpc.access.myRequest.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const isVerified = (accessData as { isVerified?: boolean } | undefined)?.isVerified ?? false;
  const hasPendingRequest = myRequest?.status === "pending";

  // Compute which modules are locked based on quiz completion
  const getModuleLocked = (moduleIndex: number): boolean => {
    if (!isAuthenticated) return moduleIndex > 0;
    if (!isVerified) return moduleIndex > 0;
    if (moduleIndex === 0) return false;
    // Module N is locked if any lesson in module N-1 hasn't been passed
    const prevModule = modules[moduleIndex - 1];
    if (!prevModule) return false;
    // We don't have per-module lesson data here — rely on accessData if available
    const gatedModules = (accessData as { modules?: { id: number; locked: boolean }[] } | undefined)?.modules;
    if (gatedModules) {
      const gm = gatedModules.find((m: { id: number; locked: boolean }) => m.id === modules[moduleIndex]?.id);
      return gm?.locked ?? false;
    }
    return false;
  };

  const toggleModule = (index: number) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  // Scroll-spy
  useEffect(() => {
    if (modules.length === 0) return;
    observerRef.current?.disconnect();
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = parseInt(e.target.id.replace("module-", ""));
            setActiveModule(id);
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );
    modules.forEach((m) => {
      const el = document.getElementById(`module-${m.id}`);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, [modules]);

  const scrollTo = (id: number) => {
    document.getElementById(`module-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <button onClick={() => setLocation("/")} className="font-bold text-fuchsia-600 hover:text-fuchsia-700 transition-colors text-sm">
            E-Quipped: Work
          </button>
          {!isAuthenticated && (
            <Button size="sm" className="gradient-primary text-white border-0 glow-primary text-xs" onClick={() => setLocation("/")}>
              Sign In to Start
            </Button>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button onClick={() => setLocation("/sandbox")} className="text-xs text-foreground/50 hover:text-foreground transition-colors">Sandbox</button>
              <button onClick={() => setLocation("/profile")} className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs glow-primary">
                {(user.name ?? user.email ?? "U")[0]?.toUpperCase()}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-8">
        {/* Course header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-fuchsia-500" />
            <span className="text-xs font-semibold text-fuchsia-600 uppercase tracking-wider">Full Course Outline</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
            {course?.title ?? "E-Quipped: Work"}
          </h1>
          <p className="text-foreground/55 max-w-2xl leading-relaxed">
            {course?.description ?? "Master AI across every dimension of modern business — writing, meetings, data, presentations, research, workflows, and client communications."}
          </p>
          {course && (
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-foreground/50"><Layers className="h-4 w-4" />{modules.length} modules</span>
              <span className="flex items-center gap-1.5 text-sm text-foreground/50"><Zap className="h-4 w-4 text-fuchsia-500" />{course.totalXp.toLocaleString()} total XP</span>
              <Badge variant="outline" className="capitalize border-border/50 text-foreground/50">{course.difficulty}</Badge>
            </div>
          )}
        </div>

        {/* Access banners */}
        {isAuthenticated && !isVerified && !hasPendingRequest && !accessRequested && (
          <div className="mb-8">
            <AccessRequestCard onRequested={() => { setAccessRequested(true); void refetchAccess(); }} />
          </div>
        )}
        {isAuthenticated && (hasPendingRequest || accessRequested) && !isVerified && (
          <div className="mb-8 rounded-2xl border border-yellow-300/60 bg-yellow-50 p-4 flex items-center gap-3">
            <Star className="w-5 h-5 text-yellow-500 shrink-0" />
            <div>
              <p className="font-medium text-yellow-700">Access Request Pending</p>
              <p className="text-sm text-yellow-600/80">An admin will review your request and grant access shortly.</p>
            </div>
          </div>
        )}
        {!isAuthenticated && (
          <div className="mb-8 rounded-2xl border border-fuchsia-200/60 bg-fuchsia-50/60 p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-fuchsia-500 shrink-0" />
            <div className="flex-1">
              <p className="font-medium text-fuchsia-700">Sign in to track your progress</p>
              <p className="text-sm text-foreground/55">Lesson 1 is free — sign in to request full access.</p>
            </div>
            <Button size="sm" className="gradient-primary text-white border-0 glow-primary shrink-0" onClick={() => setLocation("/")}>Sign In</Button>
          </div>
        )}

        <div className="flex gap-8 items-start">
          {/* Sticky bookmark sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-20">
            <div className="lucite border border-border/40 rounded-2xl p-4">
              <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">Jump to Module</p>
              <nav className="space-y-1">
                {modules.map((m, i) => {
                  const colors = MODULE_COLORS[i % MODULE_COLORS.length];
                  const Icon = MODULE_ICONS[m.slug] ?? BookOpen;
                  const isActive = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => { scrollTo(m.id); if (!expandedModules.has(i)) toggleModule(i); }}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${isActive ? colors.active + " border" : "text-foreground/55 hover:text-foreground hover:bg-foreground/5"}`}
                    >
                      <div className={`h-5 w-5 rounded-md bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shrink-0`}>
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="truncate">{i + 1}. {m.title.replace("AI ", "")}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Module + lesson list */}
          <main className="flex-1 min-w-0">
            {(coursesLoading || modulesLoading) && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="lucite border border-border/30 rounded-2xl p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-foreground/10" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-foreground/10 rounded w-1/3" />
                        <div className="h-5 bg-foreground/10 rounded w-2/3" />
                        <div className="h-3 bg-foreground/10 rounded w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!coursesLoading && !modulesLoading && modules.map((m, i) => (
              <ModuleSection
                key={m.id}
                module={m}
                moduleIndex={i}
                isVerified={isVerified}
                isModuleLocked={getModuleLocked(i)}
                passedLessonIds={passedLessonIds}
                isExpanded={expandedModules.has(i)}
                onToggle={() => toggleModule(i)}
              />
            ))}

            {!coursesLoading && !modulesLoading && modules.length === 0 && (
              <div className="text-center py-20 text-foreground/40">
                <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p className="font-medium">Course content is being prepared.</p>
                <p className="text-sm mt-1">Check back soon.</p>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
