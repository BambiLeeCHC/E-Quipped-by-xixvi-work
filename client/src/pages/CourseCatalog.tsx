import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
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
  Sparkles,
  TrendingUp,
  Zap,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";

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

const MODULE_COLORS: Record<string, { from: string; to: string; text: string }> = {
  "ai-writing-assistant":      { from: "from-fuchsia-400", to: "to-pink-400",    text: "text-fuchsia-600"  },
  "ai-meeting-communication":  { from: "from-violet-400",  to: "to-purple-400",  text: "text-violet-600"   },
  "ai-data-analysis":          { from: "from-sky-400",     to: "to-blue-400",    text: "text-sky-600"      },
  "ai-presentation-creation":  { from: "from-amber-400",   to: "to-orange-400",  text: "text-amber-600"    },
  "ai-research-summarization": { from: "from-emerald-400", to: "to-teal-400",    text: "text-emerald-600"  },
  "ai-workflow-automation":    { from: "from-rose-400",    to: "to-red-400",     text: "text-rose-600"     },
  "ai-client-communications":  { from: "from-indigo-400",  to: "to-blue-500",    text: "text-indigo-600"   },
};

const LESSON_TYPE_ICONS: Record<string, React.ElementType> = {
  text: BookOpen,
  video: Play,
  interactive: Sparkles,
  quiz: Zap,
};

function totalMinsLabel(lessons: { estimatedMinutes: number }[]) {
  const total = lessons.reduce((s, l) => s + l.estimatedMinutes, 0);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// ── Module Section ─────────────────────────────────────────────────────────────
function ModuleSection({
  module,
  index,
  isAuthenticated,
}: {
  module: { id: number; title: string; slug: string; description: string | null; xpReward: number };
  index: number;
  isAuthenticated: boolean;
}) {
  const [, setLocation] = useLocation();
  const { data: lessons = [] } = trpc.lessons.byModule.useQuery({ moduleId: module.id });
  const colors = MODULE_COLORS[module.slug] ?? MODULE_COLORS["ai-writing-assistant"];
  const Icon = MODULE_ICONS[module.slug] ?? BookOpen;

  return (
    <section id={`module-${module.id}`} className="scroll-mt-20">
      {/* Module header card */}
      <div className="lucite-spectrum border border-border/40 rounded-2xl p-5 mb-3 card-lift">
        <div className="flex items-start gap-4">
          <div
            className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shadow-lg shrink-0`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-xs font-semibold text-foreground/40 uppercase tracking-wider">
                Module {index + 1}
              </span>
              <Badge variant="outline" className="text-[10px] border-border/50 text-foreground/50 px-1.5 py-0">
                {lessons.length} lessons
              </Badge>
              {lessons.length > 0 && (
                <Badge variant="outline" className="text-[10px] border-border/50 text-foreground/50 px-1.5 py-0">
                  <Clock className="h-2.5 w-2.5 mr-0.5" />
                  {totalMinsLabel(lessons)}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-[10px] px-1.5 py-0 border-fuchsia-200/60 ${colors.text} bg-fuchsia-50/60`}
              >
                <Zap className="h-2.5 w-2.5 mr-0.5" />
                {module.xpReward} XP
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-foreground">{module.title}</h2>
            {module.description && (
              <p className="text-sm text-foreground/55 mt-0.5 leading-relaxed">{module.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Lesson rows */}
      <div className="space-y-1.5 pl-2 border-l-2 border-border/30 ml-6">
        {lessons.length === 0 && (
          <p className="py-4 text-sm text-foreground/40 pl-4">No lessons yet — check back soon.</p>
        )}
        {lessons.map((lesson, li) => {
          const LessonIcon = LESSON_TYPE_ICONS[lesson.type] ?? BookOpen;
          const isLocked = !isAuthenticated;

          return (
            <button
              key={lesson.id}
              onClick={() => {
                if (isAuthenticated) setLocation(`/lessons/${lesson.slug}`);
              }}
              className={`w-full text-left group flex items-center gap-3 px-4 py-3 rounded-xl transition-all
                ${isLocked
                  ? "lucite border border-border/30 opacity-60 cursor-not-allowed"
                  : "lucite border border-border/30 hover:border-fuchsia-300/50 hover:shadow-sm cursor-pointer card-lift"
                }`}
            >
              <span className="text-xs font-bold text-foreground/30 w-5 shrink-0 text-center">
                {li + 1}
              </span>
              <div
                className={`h-7 w-7 rounded-lg bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shrink-0 opacity-80 group-hover:opacity-100 transition-opacity`}
              >
                <LessonIcon className="h-3.5 w-3.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate group-hover:text-fuchsia-700 transition-colors">
                  {lesson.title}
                </p>
                {lesson.description && (
                  <p className="text-xs text-foreground/45 truncate mt-0.5">{lesson.description}</p>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {lesson.estimatedMinutes > 0 && (
                  <span className="text-[10px] text-foreground/40 hidden sm:flex items-center gap-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    {lesson.estimatedMinutes}m
                  </span>
                )}
                <span className={`text-[10px] font-semibold ${colors.text} hidden sm:block`}>
                  +{lesson.xpReward} XP
                </span>
                {isLocked ? (
                  <Lock className="h-3.5 w-3.5 text-foreground/30" />
                ) : (
                  <ChevronRight className="h-3.5 w-3.5 text-foreground/30 group-hover:text-fuchsia-500 group-hover:translate-x-0.5 transition-all" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function CourseCatalog() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data: courses = [], isLoading: coursesLoading } = trpc.courses.list.useQuery({});
  const course = courses[0];

  const { data: modules = [], isLoading: modulesLoading } = trpc.modules.byCourse.useQuery(
    { courseId: course?.id ?? 0 },
    { enabled: !!course }
  );

  // Scroll-spy for bookmark sidebar
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

  const isAuthenticated = !loading && !!user;

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <button
            onClick={() => setLocation("/")}
            className="font-bold text-fuchsia-600 hover:text-fuchsia-700 transition-colors text-sm"
          >
            E-Quipped: Work
          </button>
          {!isAuthenticated && (
            <Button
              size="sm"
              className="gradient-primary text-white border-0 glow-primary text-xs"
              onClick={() => setLocation("/")}
            >
              Sign In to Start
            </Button>
          )}
          {isAuthenticated && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setLocation("/sandbox")}
                className="text-xs text-foreground/50 hover:text-foreground transition-colors"
              >
                Sandbox
              </button>
              <button
                onClick={() => setLocation("/profile")}
                className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-xs glow-primary"
              >
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
            <span className="text-xs font-semibold text-fuchsia-600 uppercase tracking-wider">
              Full Course Outline
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2">
            {course?.title ?? "E-Quipped: Work"}
          </h1>
          <p className="text-foreground/55 max-w-2xl leading-relaxed">
            {course?.description ??
              "Master AI across every dimension of modern business — writing, meetings, data, presentations, research, workflows, and client communications."}
          </p>
          {course && (
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                <Layers className="h-4 w-4" />
                {modules.length} modules
              </span>
              <span className="flex items-center gap-1.5 text-sm text-foreground/50">
                <Zap className="h-4 w-4 text-fuchsia-500" />
                {course.totalXp.toLocaleString()} total XP
              </span>
              <Badge variant="outline" className="capitalize border-border/50 text-foreground/50">
                {course.difficulty}
              </Badge>
            </div>
          )}
        </div>

        <div className="flex gap-8 items-start">
          {/* Sticky bookmark sidebar */}
          <aside className="hidden lg:block w-56 shrink-0 sticky top-20">
            <div className="lucite border border-border/40 rounded-2xl p-4">
              <p className="text-xs font-semibold text-foreground/40 uppercase tracking-wider mb-3">
                Jump to Module
              </p>
              <nav className="space-y-1">
                {modules.map((m, i) => {
                  const colors = MODULE_COLORS[m.slug] ?? MODULE_COLORS["ai-writing-assistant"];
                  const Icon = MODULE_ICONS[m.slug] ?? BookOpen;
                  const isActive = activeModule === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() => scrollTo(m.id)}
                      className={`w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all
                        ${isActive
                          ? "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200/60"
                          : "text-foreground/55 hover:text-foreground hover:bg-foreground/5"
                        }`}
                    >
                      <div
                        className={`h-5 w-5 rounded-md bg-gradient-to-br ${colors.from} ${colors.to} flex items-center justify-center shrink-0`}
                      >
                        <Icon className="h-2.5 w-2.5 text-white" />
                      </div>
                      <span className="truncate">
                        {i + 1}. {m.title.replace("AI ", "")}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Module + lesson list */}
          <main className="flex-1 min-w-0 space-y-8">
            {(coursesLoading || modulesLoading) && (
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="lucite border border-border/30 rounded-2xl p-5 animate-pulse"
                  >
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

            {!coursesLoading &&
              !modulesLoading &&
              modules.map((m, i) => (
                <ModuleSection
                  key={m.id}
                  module={m}
                  index={i}
                  isAuthenticated={isAuthenticated}
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
