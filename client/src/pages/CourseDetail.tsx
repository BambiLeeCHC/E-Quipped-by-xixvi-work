import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { trpc } from "@/lib/trpc";
import { BookOpen, ChevronLeft, CheckCircle2, Clock, Lock, PlayCircle, Zap } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function CourseDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: course, isLoading } = trpc.courses.bySlug.useQuery({ slug: slug ?? "" });
  const { data: modules } = trpc.modules.byCourse.useQuery(
    { courseId: course?.id ?? 0 },
    { enabled: !!course?.id }
  );
  const { data: progress } = trpc.progress.forCourse.useQuery(
    { courseId: course?.id ?? 0 },
    { enabled: !!user && !!course?.id }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Course not found</h2>
          <Button onClick={() => setLocation("/courses")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const completedIds = new Set(
    progress?.filter((p) => p.status === "completed").map((p) => p.lessonId) ?? []
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/courses")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Courses
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-semibold truncate">{course.title}</h1>
        </div>
      </div>

      <div className="container py-10 max-w-4xl mx-auto">
        {/* Course Hero */}
        <div className="mb-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline" className="capitalize">{course.difficulty}</Badge>
            {course.isPremium && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>
            )}
          </div>
          <h2 className="text-4xl font-bold mb-4">{course.title}</h2>
          <p className="text-muted-foreground text-lg mb-6">
            {course.description ?? "Master prompt engineering with this comprehensive course."}
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber-400" />
              <span>{course.totalXp} XP available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-primary" />
              <span>{modules?.length ?? 0} modules</span>
            </div>
          </div>
        </div>

        {/* Modules */}
        {modules && modules.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-xl font-semibold mb-6">Course Content</h3>
            {modules.map((mod, idx) => (
              <ModuleAccordion
                key={mod.id}
                module={mod}
                index={idx + 1}
                user={user}
                completedIds={completedIds}
                onLessonClick={(lessonSlug) => setLocation(`/lessons/${lessonSlug}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No modules published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ModuleAccordion({
  module,
  index,
  user,
  completedIds,
  onLessonClick,
}: {
  module: any;
  index: number;
  user: any;
  completedIds: Set<number>;
  onLessonClick: (slug: string) => void;
}) {
  const { data: lessons } = trpc.lessons.byModule.useQuery({ moduleId: module.id });

  const completedInModule = lessons?.filter((l) => completedIds.has(l.id)).length ?? 0;
  const totalInModule = lessons?.length ?? 0;
  const progressPct = totalInModule > 0 ? (completedInModule / totalInModule) * 100 : 0;

  return (
    <Card className="bg-card border-border/50">
      <CardContent className="p-0">
        <div className="p-5 border-b border-border/30">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                {index}
              </div>
              <div>
                <h4 className="font-semibold">{module.title}</h4>
                {module.description && (
                  <p className="text-sm text-muted-foreground mt-0.5">{module.description}</p>
                )}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-muted-foreground mb-1">
                {completedInModule}/{totalInModule} lessons
              </div>
              <div className="flex items-center gap-1.5 text-xs text-amber-400">
                <Zap className="h-3 w-3" />
                {module.xpReward} XP
              </div>
            </div>
          </div>
          {user && totalInModule > 0 && (
            <div className="mt-3">
              <Progress value={progressPct} className="h-1.5" />
            </div>
          )}
        </div>

        {lessons && lessons.length > 0 && (
          <div className="divide-y divide-border/20">
            {lessons.map((lesson) => {
              const isCompleted = completedIds.has(lesson.id);
              const isLocked = lesson.isPremium && (!user || user.status === "trial");
              return (
                <button
                  key={lesson.id}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left group"
                  onClick={() => !isLocked && onLessonClick(lesson.slug)}
                  disabled={isLocked}
                >
                  <div className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : isLocked ? (
                      <Lock className="h-5 w-5 text-muted-foreground/50" />
                    ) : (
                      <PlayCircle className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className={`text-sm font-medium ${isLocked ? "text-muted-foreground/50" : "text-foreground"}`}>
                      {lesson.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lesson.estimatedMinutes}m
                    </span>
                    <span className="flex items-center gap-1 text-amber-400">
                      <Zap className="h-3 w-3" />
                      {lesson.xpReward}
                    </span>
                    {lesson.isPremium && (
                      <Badge className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/20 py-0">
                        Premium
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
