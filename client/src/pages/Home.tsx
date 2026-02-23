import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  Brain,
  ChevronRight,
  Code2,
  FlaskConical,
  GraduationCap,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

// Rich Course Editor removed per design direction
const features = [
  {
    icon: Brain,
    title: "Structured AI Curriculum",
    desc: "Master prompt engineering through carefully sequenced modules — from fundamentals to advanced techniques.",
    gradient: "from-fuchsia-400/20 to-violet-400/20",
    border: "border-fuchsia-300/40",
    iconBg: "bg-fuchsia-500/15",
    iconColor: "text-fuchsia-600",
  },
  {
    icon: FlaskConical,
    title: "Live AI Sandbox",
    desc: "Experiment with GPT-4o in real-time. Test prompts with full system prompt and temperature control.",
    gradient: "from-cyan-400/20 to-blue-400/20",
    border: "border-cyan-300/40",
    iconBg: "bg-cyan-500/15",
    iconColor: "text-cyan-600",
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
    icon: Code2,
    title: "Prompt Library",
    desc: "Save, organise, and share your best prompts. Build a personal library of reusable prompt templates.",
    gradient: "from-emerald-400/20 to-teal-400/20",
    border: "border-emerald-300/40",
    iconBg: "bg-emerald-500/15",
    iconColor: "text-emerald-600",
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

const stats = [
  { value: "10+", label: "Modules" },
  { value: "50+", label: "Lessons" },
  { value: "3", label: "AI Models" },
  { value: "∞", label: "Prompts" },
];

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: courses } = trpc.courses.list.useQuery();

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
            AI Mastery Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 text-foreground">
            Master{" "}
            <span className="text-gradient-spectrum">Prompt Engineering</span>
            <br />
            <span className="text-foreground/80">from Zero to Expert</span>
          </h1>

          <p className="text-xl text-foreground/60 max-w-2xl mx-auto mb-10 leading-relaxed">
            Structured courses, live AI sandbox, and a gamified progress system — everything you need to become an AI power user.
          </p>

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

      {/* ── Features ── */}
      <section className="py-20 px-4 relative">
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(180deg, transparent 0%, oklch(0.93 0.025 20 / 0.3) 50%, transparent 100%)" }} />
        <div className="container max-w-6xl mx-auto relative">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Everything you need to{" "}
              <span className="text-gradient">master AI</span>
            </h2>
            <p className="text-foreground/55 text-lg max-w-xl mx-auto">
              A complete learning ecosystem built for the AI era.
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
                      {course.description ?? "Learn the fundamentals of prompt engineering."}
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
          {/* Spectrum shimmer border wrapper */}
          <div className="p-px rounded-3xl shimmer-spectrum">
            <div className="lucite-flesh rounded-3xl p-12">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center mx-auto mb-5 glow-primary">
                <Sparkles className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">
                Ready to become an AI expert?
              </h2>
              <p className="text-foreground/60 mb-8 text-lg">
                Join E-Quipped and start mastering prompt engineering with structured courses and a live AI sandbox.
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
