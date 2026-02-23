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
  Layers,
  Shield,
  Sparkles,
  Trophy,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

const features = [
  {
    icon: Brain,
    title: "Structured AI Curriculum",
    desc: "Master prompt engineering through carefully sequenced modules — from fundamentals to advanced techniques.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
  },
  {
    icon: FlaskConical,
    title: "Live AI Sandbox",
    desc: "Experiment with GPT-4o, Claude, and Gemini side-by-side. Test prompts in real-time with full parameter control.",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    icon: Trophy,
    title: "XP & Level System",
    desc: "Earn XP for every lesson completed. Build daily streaks, level up, and track your mastery progress.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  {
    icon: Code2,
    title: "Prompt Library",
    desc: "Save, organise, and share your best prompts. Build a personal library of reusable prompt templates.",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
  },
  {
    icon: Shield,
    title: "Verified Access",
    desc: "Premium content is gated behind verified accounts. Admins approve access to ensure quality cohorts.",
    color: "text-rose-400",
    bg: "bg-rose-500/10",
  },
  {
    icon: Layers,
    title: "Rich Course Editor",
    desc: "Editors build courses with text, images, video, code blocks, and interactive prompt exercises.",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
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
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <button
            onClick={() => setLocation("/")}
            className="flex items-center gap-2 font-bold text-lg"
          >
            <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center text-white font-black text-sm">
              E
            </div>
            <span className="text-gradient">E-Quipped</span>
          </button>
          <div className="flex items-center gap-3">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/courses")}>
                      Courses
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/sandbox")}>
                      Sandbox
                    </Button>
                    {(user.role === "admin" || user.role === "editor") && (
                      <Button variant="ghost" size="sm" onClick={() => setLocation("/editor")}>
                        Editor
                      </Button>
                    )}
                    {user.role === "admin" && (
                      <Button variant="ghost" size="sm" onClick={() => setLocation("/admin")}>
                        Admin
                      </Button>
                    )}
                    <Button size="sm" onClick={() => setLocation("/profile")}>
                      {user.name?.split(" ")[0] ?? "Profile"}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => setLocation("/courses")}>
                      Explore
                    </Button>
                    <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
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
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-accent/10 rounded-full blur-3xl pointer-events-none" />

        <div className="container relative text-center max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-6 border-primary/30 text-primary bg-primary/5 px-4 py-1.5">
            <Sparkles className="h-3 w-3 mr-1.5" />
            AI Mastery Platform
          </Badge>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            Master{" "}
            <span className="text-gradient">Prompt Engineering</span>
            <br />
            from Zero to Expert
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Structured courses, live AI sandbox, and a gamified progress system — everything you need to become an AI power user.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <>
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 glow-primary px-8 h-12 text-base font-semibold"
                  onClick={() => setLocation("/courses")}
                >
                  Continue Learning
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 text-base"
                  onClick={() => setLocation("/sandbox")}
                >
                  <FlaskConical className="mr-2 h-5 w-5" />
                  Open Sandbox
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="lg"
                  className="gradient-primary text-white border-0 glow-primary px-8 h-12 text-base font-semibold"
                  onClick={() => (window.location.href = getLoginUrl())}
                >
                  Start Learning Free
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="px-8 h-12 text-base"
                  onClick={() => setLocation("/courses")}
                >
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Courses
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mt-16 max-w-lg mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-black text-gradient">{s.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4">
        <div className="container max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to{" "}
              <span className="text-gradient">master AI</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A complete learning ecosystem built for the AI era.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <Card
                key={f.title}
                className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
              >
                <CardContent className="p-6">
                  <div className={`h-10 w-10 rounded-lg ${f.bg} flex items-center justify-center mb-4`}>
                    <f.icon className={`h-5 w-5 ${f.color}`} />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── Courses Preview ── */}
      {courses && courses.length > 0 && (
        <section className="py-20 px-4 bg-card/30">
          <div className="container max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold mb-2">Featured Courses</h2>
                <p className="text-muted-foreground">Start your AI mastery journey today.</p>
              </div>
              <Button variant="outline" onClick={() => setLocation("/courses")}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((course) => (
                <Card
                  key={course.id}
                  className="bg-card border-border/50 hover:border-primary/30 transition-all cursor-pointer group"
                  onClick={() => setLocation(`/courses/${course.slug}`)}
                >
                  <CardContent className="p-6">
                    <div className="h-32 rounded-lg gradient-primary mb-4 flex items-center justify-center">
                      <GraduationCap className="h-12 w-12 text-white/80" />
                    </div>
                    <Badge variant="outline" className="mb-3 text-xs capitalize">
                      {course.difficulty}
                    </Badge>
                    <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {course.description ?? "Learn the fundamentals of prompt engineering."}
                    </p>
                    <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
                      <Zap className="h-3 w-3 text-amber-400" />
                      <span>{course.totalXp} XP</span>
                      {course.isPremium && (
                        <Badge className="ml-auto text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                          Premium
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA ── */}
      <section className="py-24 px-4">
        <div className="container max-w-3xl mx-auto text-center">
          <div className="p-px rounded-2xl bg-gradient-to-r from-primary/50 via-accent/50 to-primary/50">
            <div className="bg-card rounded-2xl p-12">
              <Sparkles className="h-10 w-10 text-primary mx-auto mb-4" />
              <h2 className="text-3xl font-bold mb-4">
                Ready to become an AI expert?
              </h2>
              <p className="text-muted-foreground mb-8 text-lg">
                Join E-Quipped and start mastering prompt engineering with structured courses and a live AI sandbox.
              </p>
              <Button
                size="lg"
                className="gradient-primary text-white border-0 glow-primary px-10 h-12 text-base font-semibold"
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
      <footer className="border-t border-border/50 py-8 px-4">
        <div className="container flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 font-semibold text-foreground">
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
