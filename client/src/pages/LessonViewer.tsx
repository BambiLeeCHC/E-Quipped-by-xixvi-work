import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, ChevronLeft, Clock, Zap } from "lucide-react";
import { useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

export default function LessonViewer() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [completing, setCompleting] = useState(false);

  const { data: lesson, isLoading } = trpc.lessons.bySlug.useQuery({ slug: slug ?? "" });
  const { data: blocks } = trpc.content.byLesson.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: !!lesson?.id }
  );
  const { data: progress } = trpc.progress.forLesson.useQuery(
    { lessonId: lesson?.id ?? 0 },
    { enabled: !!user && !!lesson?.id }
  );

  const utils = trpc.useUtils();
  const completeMutation = trpc.progress.complete.useMutation({
    onSuccess: (data) => {
      utils.progress.forLesson.invalidate();
      utils.auth.me.invalidate();
      toast.success(`Lesson complete! +${lesson?.xpReward ?? 0} XP earned`);
    },
  });

  const handleComplete = async () => {
    if (!lesson || completing) return;
    setCompleting(true);
    try {
      await completeMutation.mutateAsync({ lessonId: lesson.id });
    } finally {
      setCompleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Lesson not found</h2>
          <Button onClick={() => setLocation("/courses")}>Back to Courses</Button>
        </div>
      </div>
    );
  }

  const isCompleted = progress?.status === "completed";

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/courses")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Courses
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-semibold truncate flex-1">{lesson.title}</h1>
          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3" /> {lesson.estimatedMinutes}m
            </span>
            <span className="text-xs text-amber-400 flex items-center gap-1">
              <Zap className="h-3 w-3" /> {lesson.xpReward} XP
            </span>
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-3xl mx-auto">
        {/* Lesson meta */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className="capitalize">{lesson.type}</Badge>
            {lesson.isPremium && (
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>
            )}
            {isCompleted && (
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" /> Completed
              </Badge>
            )}
          </div>
          <h2 className="text-3xl font-bold mb-3">{lesson.title}</h2>
          {lesson.description && (
            <p className="text-muted-foreground text-lg">{lesson.description}</p>
          )}
        </div>

        {/* Content blocks */}
        <div className="space-y-6 mb-10">
          {blocks && blocks.length > 0 ? (
            blocks.map((block) => <ContentBlock key={block.id} block={block} />)
          ) : (
            <Card className="bg-card border-border/50">
              <CardContent className="p-8 text-center text-muted-foreground">
                <p>Content for this lesson is being prepared.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Complete button */}
        {user && !isCompleted && (
          <div className="flex justify-center">
            <Button
              size="lg"
              className="gradient-primary text-white border-0 px-10 h-12"
              onClick={handleComplete}
              disabled={completing}
            >
              {completing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white" />
                  Completing...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  Mark as Complete (+{lesson.xpReward} XP)
                </span>
              )}
            </Button>
          </div>
        )}

        {isCompleted && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-6 py-3">
              <CheckCircle2 className="h-5 w-5" />
              <span className="font-medium">Lesson completed!</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ContentBlock({ block }: { block: any }) {
  const content = block.content as any;

  switch (block.type) {
    case "text":
      return (
        <div className="prose prose-invert max-w-none">
          <div
            className="text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: content?.html ?? content?.text ?? "" }}
          />
        </div>
      );

    case "code":
      return (
        <div className="rounded-xl bg-muted border border-border/50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 border-b border-border/30 bg-muted/50">
            <span className="text-xs text-muted-foreground font-mono">
              {content?.language ?? "code"}
            </span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-foreground">
            <code>{content?.code ?? ""}</code>
          </pre>
        </div>
      );

    case "callout":
      return (
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
          {content?.title && (
            <div className="font-semibold text-primary mb-2">{content.title}</div>
          )}
          <p className="text-sm text-foreground/80">{content?.text ?? ""}</p>
        </div>
      );

    case "image":
      return content?.url ? (
        <div className="rounded-xl overflow-hidden border border-border/50">
          <img src={content.url} alt={content?.alt ?? ""} className="w-full" />
          {content?.caption && (
            <p className="text-xs text-muted-foreground text-center py-2 px-4">{content.caption}</p>
          )}
        </div>
      ) : null;

    case "video":
      return content?.url ? (
        <div className="rounded-xl overflow-hidden border border-border/50 aspect-video">
          <video controls className="w-full h-full" src={content.url} />
        </div>
      ) : null;

    case "prompt_exercise":
      return (
        <Card className="bg-card border-primary/20">
          <CardContent className="p-6">
            <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
              Prompt Exercise
            </div>
            {content?.instructions && (
              <p className="text-sm text-muted-foreground mb-4">{content.instructions}</p>
            )}
            {content?.starterPrompt && (
              <div className="rounded-lg bg-muted p-4 font-mono text-sm text-foreground">
                {content.starterPrompt}
              </div>
            )}
          </CardContent>
        </Card>
      );

    default:
      return null;
  }
}
