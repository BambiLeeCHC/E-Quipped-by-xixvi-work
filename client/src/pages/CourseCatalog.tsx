import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { BookOpen, ChevronLeft, GraduationCap, Lock, Zap } from "lucide-react";
import { useLocation } from "wouter";

export default function CourseCatalog() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const { data: courses, isLoading } = trpc.courses.list.useQuery();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-semibold">Course Catalog</h1>
          <div className="ml-auto flex items-center gap-3">
            {user && (
              <Button size="sm" variant="outline" onClick={() => setLocation("/sandbox")}>
                AI Sandbox
              </Button>
            )}
            {!user && (
              <Button size="sm" onClick={() => (window.location.href = getLoginUrl())}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-5xl mx-auto">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">All Courses</h2>
          <p className="text-muted-foreground">
            Master prompt engineering from fundamentals to advanced techniques.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && (!courses || courses.length === 0) && (
          <div className="text-center py-20">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No courses yet</h3>
            <p className="text-muted-foreground text-sm">
              Courses will appear here once published by an editor.
            </p>
            {user && (user.role === "admin" || user.role === "editor") && (
              <Button className="mt-4" onClick={() => setLocation("/editor")}>
                Go to Editor
              </Button>
            )}
          </div>
        )}

        {courses && courses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                isAuthenticated={!!user}
                userStatus={user?.status}
                onClick={() => setLocation(`/courses/${course.slug}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CourseCard({
  course,
  isAuthenticated,
  userStatus,
  onClick,
}: {
  course: any;
  isAuthenticated: boolean;
  userStatus?: string;
  onClick: () => void;
}) {
  const isLocked = course.isPremium && (!isAuthenticated || userStatus === "trial");

  return (
    <Card
      className="bg-card border-border/50 hover:border-primary/30 transition-all cursor-pointer group hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="h-36 rounded-t-xl gradient-primary flex items-center justify-center relative overflow-hidden">
          <GraduationCap className="h-14 w-14 text-white/70" />
          {isLocked && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Lock className="h-8 w-8 text-white/80" />
            </div>
          )}
          {course.isPremium && (
            <Badge className="absolute top-3 right-3 bg-amber-500/90 text-white border-0 text-xs">
              Premium
            </Badge>
          )}
        </div>
        <div className="p-5">
          <Badge variant="outline" className="mb-3 text-xs capitalize border-border/50">
            {course.difficulty}
          </Badge>
          <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {course.description ?? "Learn prompt engineering fundamentals."}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Zap className="h-3 w-3 text-amber-400" />
            <span>{course.totalXp} XP</span>
            <BookOpen className="h-3 w-3 ml-2" />
            <span>Multiple lessons</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
