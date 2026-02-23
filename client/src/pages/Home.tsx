import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Brain,
  ChevronRight,
  FileText,
  FlaskConical,
  GraduationCap,
  Mic,
  Presentation,
  Shield,
  Sparkles,
  Trophy,
  Wand2,
  Zap,
  MessageSquare,
  BarChart3,
  Mail,
  Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// ─── Rotating skill showcase ─────────────────────────────────────────────────
const skills = [
  { label: "Prompt Engineering",    color: "text-fuchsia-600",  bg: "bg-fuchsia-100" },
  { label: "Presentation Creation", color: "text-violet-600",   bg: "bg-violet-100" },
  { label: "Meeting Transcription", color: "text-cyan-600",     bg: "bg-cyan-100" },
  { label: "Business Writing",      color: "text-emerald-600",  bg: "bg-emerald-100" },
  { label: "Data Analysis",         color: "text-blue-600",     bg: "bg-blue-100" },
  { label: "Email Automation",      color: "text-rose-600",     bg: "bg-rose-100" },
  { label: "Research & Summaries",  color: "text-amber-600",    bg: "bg-amber-100" },
  { label: "AI-Powered Workflows",  color: "text-teal-600",     bg: "bg-teal-100" },
];

// ─── Feature cards ────────────────────────────────────────────────────────────
const features = [
  {
    icon: Brain,
    title: "Full AI Business Curriculum",
    desc: "From prompt fundamentals to advanced business applications — presentations, transcription, research, writing, and workflow automation.",
    gradient: "from-fuchsia-400/20 to-violet-400/20",
    border: "border-fuchsia-300/40",
    iconBg: "bg-fuchsia-500/15",
    iconColor: "text-fuchsia-600",
  },
  {
    icon: Presentation,
    title: "Presentation & Slide Mastery",
    desc: "Use AI to build compelling decks, executive summaries, and pitch materials in a fraction of the time.",
    gradient: "from-violet-400/20 to-blue-400/20",
    border: "border-violet-300/40",
    iconBg: "bg-violet-500/15",
    iconColor: "text-violet-600",
  },
  {
    icon: Mic,
    title: "Meeting Transcription & Summaries",
    desc: "Capture, transcribe, and distil meetings into action items, decisions, and follow-up emails automatically.",
    gradient: "from-cyan-400/20 to-sky-400/20",
    border: "border-cyan-300/40",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-600",
  },
  {
    icon: FlaskConical,
    title: "Live AI Sandbox",
    desc: "Experiment with multiple AI models in real-time. Test, iterate, and refine prompts with full control.",
    gradient: "from-emerald-400/20 to-teal-400/20",
    border: "border-emerald-300/40",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
  },
  {
    icon: Trophy,
    title: "XP & Level System",
    desc: "Earn XP for every lesson completed. Build daily streaks, level up, and track your mastery progress.",
    gradient: "from-amber-400/20 to-orange-400/20",
    border: "border-amber-300/40",
    iconBg: "bg-amber-500/15",
    iconColor: "text-amber-600",
  },
  {
    icon: Shield,
    title: "Verified Access",
    desc: "Premium content is gated behind verified accounts. Admins approve access to ensure quality cohorts.",
    gradient: "from-rose-400/20 to-pink-400/20",
    border: "border-rose-300/40",
    iconBg: "bg-rose-500/15",
    iconColor: "text-rose-600",
  },
];

// ─── Business use-case tiles ──────────────────────────────────────────────────
const useCases = [
  { icon: Presentation, label: "Presentations",     color: "text-violet-500" },
  { icon: Mic,          label: "Transcription",     color: "text-cyan-500" },
  { icon: FileText,     label: "Business Writing",  color: "text-emerald-500" },
  { icon: BarChart3,    label: "Data Analysis",     color: "text-blue-500" },
  { icon: Mail,         label: "Email Automation",  color: "text-rose-500" },
  { icon: Search,       label: "Research",          color: "text-amber-500" },
  { icon: MessageSquare,label: "Client Comms",      color: "text-teal-500" },
  { icon: Wand2,        label: "Workflow AI",       color: "text-fuchsia-500" },
];

const stats = [
  { value: "10+", label: "Modules" },
  { value: "50+", label: "Lessons" },
  { value: "8+",  label: "Skills" },
  { value: "3",   label: "AI Models" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: courses } = trpc.courses.list.useQuery();

  // Rotating skill index
  const [skillIdx, setSkillIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSkillIdx((i) => (i + 1) % skills.length);
        setFade(true);
      }, 300);
    }, 2600);
    return () => clearInterval(interval);
  }, []);

  const currentSkill = skills[skillIdx];

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 lucite border-b">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 font-bold text-lg"
          >
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white font-black text-sm glow-primary">
              E
            </div>
            <span className="text-gradient font-extrabold">E-Quipped</span>
          </button>
          <div className="flex items-center gap-2">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground" onClick={() => setLocation("/courses")}>
                      Courses
                    </Button>
                    <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground" onClick={() => setLocation("/sandbox")}>
                      Sandbox
                    </Button>
                    {(user.role === "admin" || user.role === "editor") && (
                      <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground" onClick={() => setLocation("/editor")}>
                        Editor
                      </Button>
                    )}
                    {user.role === "admin" && (
                      <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground" onClick={() => setLocation("/admin")}>
                        Admin
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="gradient-primary text-white border-0 glow-primary"
                      onClick={() => setLocation("/profile")}
                    >
                      {user.name?.split(" ")[0] ?? "Profile"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" className="text-foreground/70 hover:text-foreground" onClick={() => setLocation("/courses")}>
                      Explore
                    </Button>
                    <Button
                      size="sm"
                      className="gradient-primary text-white border-0 glow-primary"
                      onClick={() => (window.location.href = getLoginUrl())}
                    >
                      Sign In
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-24 px-4 relative overflow-hidden">
        {/* Layered spectrum background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-25"
            style={{ background: "radial-gradient(ellipse, oklch(0.85 0.12 330) 0%, transparent 70%)" }} />
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] rounded-full opacity-20"
            style={{ background: "radial-gradient(ellipse, oklch(0.80 0.14 270) 0%, transparent 70%)" }} />
          <div className="absolute top-32 left-1/4 w-[350px] h-[350px] rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, oklch(0.88 0.08 30) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px] rounded-full opacity-15"
            style={{ background: "radial-gradient(ellipse, oklch(0.85 0.10 200) 0%, transparent 70%)" }} />
        </div>

        <div className="container relative text-center max-w-5xl mx-auto">
          <Badge
            variant="outline"
            className="mb-6 border-fuchsia-300/60 text-fuchsia-700 bg-fuchsia-50/80 backdrop-blur px-4 py-1.5 lucite"
          >
            <Sparkles className="h-3 w-3 mr-1.5 text-fuchsia-500" />
            AI Business Mastery Platform
          </Badge>

          {/* Main headline with rotating skill */}
          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-4 text-foreground">
            Master AI for
            <br />
            <span
              className={`transition-all duration-300 ${currentSkill.color} ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
              style={{ display: "inline-block" }}
            >
              {currentSkill.label}
            </span>
          </h1>

          <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-4 leading-relaxed">
            E-Quipped teaches you to use AI across every dimension of modern business — from prompt engineering foundations to presentations, transcription, research, writing, and automated workflows.
          </p>

          {/* Skill pill strip */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {useCases.map((uc) => (
              <div
                key={uc.label}
                className="lucite rounded-full px-3 py-1.5 flex items-center gap-1.5 text-xs font-medium text-foreground/70 border border-border/60 card-lift"
              >
                <uc.icon className={`h-3.5 w-3.5 ${uc.color}`} />
                {uc.label}
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 glow-spectrum px-8 h-12 text-base font-semibold"
                  onClick={() => setLocation("/courses")}
                >
                  Continue Learning
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 text-base lucite border-fuchsia-200/60 text-foreground hover:border-fuchsia-400/60"
                  onClick={() => setLocation("/sandbox")}
                >
                  <FlaskConical className="mr-2 h-5 w-5 text-fuchsia-500" />
                  Open Sandbox
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 glow-spectrum px-8 h-12 text-base font-semibold"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Start Learning Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 text-base lucite border-fuchsia-200/60 text-foreground hover:border-fuchsia-400/60"
                  onClick={() => setLocation("/courses")}
                >
                  <BookOpen className="mr-2 h-5 w-5 text-fuchsia-500" />
                  Browse Courses
                </Button>
              </>
            )}
          </div>

          {/* Stats — lucite pills */}
          <div className="grid grid-cols-4 gap-4 mt-16 max-w-lg mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="lucite rounded-xl py-3 px-2 text-center card-lift">
                <div className="text-2xl font-black text-gradient">{s.value}</div>
                <div className="text-xs text-foreground/50 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── What you'll learn ── */}
      <section className="py-16 px-4 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, oklch(0.93 0.025 20 / 0.25) 50%, transparent 100%)" }} />
        <div className="container max-w-5xl mx-auto relative">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3 text-foreground">
              One platform.{" "}
              <span className="text-gradient">Every AI skill.</span>
            </h2>
            <p className="text-foreground/55 text-lg max-w-xl mx-auto">
              Courses are structured so each skill builds on the last — starting with prompt engineering and expanding into the full spectrum of AI-powered business work.
            </p>
          </div>

          {/* Skill progression path */}
          <div className="relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-fuchsia-300/40 via-cyan-300/40 to-emerald-300/40 -translate-y-1/2 z-0" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 relative z-10">
              {[
                { step: "01", title: "Prompt Engineering", sub: "Foundation of all AI interaction", icon: Brain, color: "border-fuchsia-300/60 bg-fuchsia-50/80", iconColor: "text-fuchsia-600" },
                { step: "02", title: "Business Writing & Email", sub: "Drafts, replies, proposals", icon: Mail, color: "border-violet-300/60 bg-violet-50/80", iconColor: "text-violet-600" },
                { step: "03", title: "Presentations & Reports", sub: "Decks, summaries, pitches", icon: Presentation, color: "border-cyan-300/60 bg-cyan-50/80", iconColor: "text-cyan-600" },
                { step: "04", title: "Advanced Workflows", sub: "Automation, research, analysis", icon: Wand2, color: "border-emerald-300/60 bg-emerald-50/80", iconColor: "text-emerald-600" },
              ].map((item) => (
                <div key={item.step} className={`lucite rounded-2xl p-5 border ${item.color} card-lift text-center`}>
                  <div className="text-xs font-bold text-foreground/30 mb-2 tracking-widest">{item.step}</div>
                  <item.icon className={`h-7 w-7 mx-auto mb-3 ${item.iconColor}`} />
                  <div className="font-semibold text-sm text-foreground mb-1">{item.title}</div>
                  <div className="text-xs text-foreground/50">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 relative">
        <div className="container max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Everything you need to{" "}
              <span className="text-gradient">master AI</span>
            </h2>
            <p className="text-foreground/55 text-lg max-w-xl mx-auto">
              A complete learning ecosystem built for the AI era of business.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className={`lucite-spectrum rounded-2xl p-6 card-lift border ${f.border}`}
              >
                <div className={`h-10 w-10 rounded-xl ${f.iconBg} flex items-center justify-center mb-4`}>
                  <f.icon className={`h-5 w-5 ${f.iconColor}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-foreground/55 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses Preview ── */}
      {courses && courses.length > 0 && (
        <section className="py-20 px-4">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-foreground">Featured Courses</h2>
                <p className="text-foreground/55">Start your AI mastery journey today.</p>
              </div>
              <Button
                variant="outline"
                className="lucite border-fuchsia-200/60 hover:border-fuchsia-400/60"
                onClick={() => setLocation("/courses")}
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {courses.slice(0, 3).map((course) => (
                <div
                  key={course.id}
                  className="lucite rounded-2xl overflow-hidden cursor-pointer card-lift border border-fuchsia-200/40 group"
                  onClick={() => setLocation(`/courses/${course.slug}`)}
                >
                  <div className="h-32 gradient-spectrum flex items-center justify-center relative">
                    <GraduationCap className="h-12 w-12 text-white/90" />
                  </div>
                  <div className="p-5">
                    <Badge className="mb-3 text-xs capitalize bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200">
                      {course.difficulty}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-fuchsia-600 transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-foreground/55 line-clamp-2">
                      {course.description ?? "Learn to use AI across every dimension of modern business."}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-foreground/50">
                      <Zap className="h-3 w-3 text-amber-500" />
                      <span>{course.totalXp} XP</span>
                      {course.isPremium && (
                        <Badge className="ml-auto text-xs bg-amber-100 text-amber-700 border-amber-200">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="p-px rounded-3xl shimmer-spectrum">
            <div className="lucite-flesh rounded-3xl p-12">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 glow-primary">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Ready to become an AI-powered professional?
              </h2>
              <p className="text-foreground/60 mb-3 text-lg">
                Join E-Quipped and master AI across every skill that matters in modern business — from prompt engineering to presentations, transcription, research, and beyond.
              </p>
              <p className="text-foreground/45 mb-8 text-sm">
                Structured curriculum · Live AI sandbox · Gamified progress · Verified access
              </p>
              <Button
                size="lg"
                className="gradient-primary text-white border-0 glow-spectrum px-10 h-12 text-base font-semibold"
                onClick={() =>
                  user ? setLocation("/courses") : (window.location.href = getLoginUrl())
                }
              >
                {user ? "Go to Courses" : "Get Started Free"}
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border py-8 px-4 lucite">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-foreground/50">
          <div className="flex items-center gap-2 font-semibold text-foreground/70">
            <div className="h-6 w-6 rounded gradient-primary flex items-center justify-center text-white font-black text-xs">
              E
            </div>
            E-Quipped
          </div>
          <p>© {new Date().getFullYear()} E-Quipped. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
