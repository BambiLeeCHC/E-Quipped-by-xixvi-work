import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Edit2,
  FileEdit,
  GraduationCap,
  Layers,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type View = "courses" | "modules" | "lessons";

export default function EditorDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [view, setView] = useState<View>("courses");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  // Dialogs
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showModuleDialog, setShowModuleDialog] = useState(false);
  const [showLessonDialog, setShowLessonDialog] = useState(false);

  const { data: courses, refetch: refetchCourses } = trpc.courses.list.useQuery({ all: true });
  const { data: modules, refetch: refetchModules } = trpc.modules.byCourse.useQuery(
    { courseId: selectedCourseId ?? 0, all: true },
    { enabled: !!selectedCourseId }
  );
  const { data: lessons, refetch: refetchLessons } = trpc.lessons.byModule.useQuery(
    { moduleId: selectedModuleId ?? 0, all: true },
    { enabled: !!selectedModuleId }
  );

  const createCourseMutation = trpc.courses.create.useMutation({
    onSuccess: () => { toast.success("Course created"); refetchCourses(); setShowCourseDialog(false); },
  });
  const updateCourseMutation = trpc.courses.update.useMutation({
    onSuccess: () => { toast.success("Course updated"); refetchCourses(); },
  });
  const deleteCourseMutation = trpc.courses.delete.useMutation({
    onSuccess: () => { toast.success("Course deleted"); refetchCourses(); },
  });

  const createModuleMutation = trpc.modules.create.useMutation({
    onSuccess: () => { toast.success("Module created"); refetchModules(); setShowModuleDialog(false); },
  });
  const updateModuleMutation = trpc.modules.update.useMutation({
    onSuccess: () => { toast.success("Module updated"); refetchModules(); },
  });
  const deleteModuleMutation = trpc.modules.delete.useMutation({
    onSuccess: () => { toast.success("Module deleted"); refetchModules(); },
  });

  const createLessonMutation = trpc.lessons.create.useMutation({
    onSuccess: () => { toast.success("Lesson created"); refetchLessons(); setShowLessonDialog(false); },
  });
  const updateLessonMutation = trpc.lessons.update.useMutation({
    onSuccess: () => { toast.success("Lesson updated"); refetchLessons(); },
  });
  const deleteLessonMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => { toast.success("Lesson deleted"); refetchLessons(); },
  });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" /></div>;
  }

  if (!user || (user.role !== "admin" && user.role !== "editor")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Editor Access Required</h2>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const selectedCourse = courses?.find((c) => c.id === selectedCourseId);
  const selectedModule = modules?.find((m) => m.id === selectedModuleId);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-2 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
          <div className="h-4 w-px bg-border" />
          {/* Breadcrumb */}
          <button
            className={`text-sm font-medium ${view === "courses" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            onClick={() => setView("courses")}
          >
            Courses
          </button>
          {selectedCourse && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <button
                className={`text-sm font-medium ${view === "modules" ? "text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setView("modules")}
              >
                {selectedCourse.title}
              </button>
            </>
          )}
          {selectedModule && (
            <>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
              <span className={`text-sm font-medium ${view === "lessons" ? "text-foreground" : "text-muted-foreground"}`}>
                {selectedModule.title}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="container py-8 max-w-5xl mx-auto">
        {/* Courses View */}
        {view === "courses" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Courses</h2>
                <p className="text-muted-foreground text-sm">Manage your course catalog</p>
              </div>
              <Button onClick={() => setShowCourseDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Course
              </Button>
            </div>
            <div className="space-y-3">
              {courses?.map((course) => (
                <Card key={course.id} className="bg-card border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <GraduationCap className="h-8 w-8 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{course.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">{course.difficulty}</Badge>
                        {course.isPublished ? (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>
                        )}
                        {course.isPremium && (
                          <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{course.description ?? "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateCourseMutation.mutate({ id: course.id, isPublished: !course.isPublished })}
                      >
                        {course.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedCourseId(course.id); setView("modules"); }}
                      >
                        <Layers className="h-4 w-4 mr-1" /> Modules
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteCourseMutation.mutate({ id: course.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!courses || courses.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  <GraduationCap className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No courses yet. Create your first course.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Modules View */}
        {view === "modules" && selectedCourseId && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Modules</h2>
                <p className="text-muted-foreground text-sm">in {selectedCourse?.title}</p>
              </div>
              <Button onClick={() => setShowModuleDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Module
              </Button>
            </div>
            <div className="space-y-3">
              {modules?.map((mod, idx) => (
                <Card key={mod.id} className="bg-card border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{mod.title}</span>
                        {mod.isPublished ? (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{mod.description ?? "No description"}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateModuleMutation.mutate({ id: mod.id, isPublished: !mod.isPublished })}
                      >
                        {mod.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => { setSelectedModuleId(mod.id); setView("lessons"); }}
                      >
                        <BookOpen className="h-4 w-4 mr-1" /> Lessons
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteModuleMutation.mutate({ id: mod.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!modules || modules.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  <Layers className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No modules yet. Add the first module.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Lessons View */}
        {view === "lessons" && selectedModuleId && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Lessons</h2>
                <p className="text-muted-foreground text-sm">in {selectedModule?.title}</p>
              </div>
              <Button onClick={() => setShowLessonDialog(true)}>
                <Plus className="h-4 w-4 mr-1" /> New Lesson
              </Button>
            </div>
            <div className="space-y-3">
              {lessons?.map((lesson, idx) => (
                <Card key={lesson.id} className="bg-card border-border/50 hover:border-primary/30 transition-all">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-sm shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold">{lesson.title}</span>
                        <Badge variant="outline" className="text-xs capitalize">{lesson.type}</Badge>
                        {lesson.isPublished ? (
                          <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">Published</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground">Draft</Badge>
                        )}
                        {lesson.isPremium && (
                          <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">Premium</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{lesson.estimatedMinutes}m · {lesson.xpReward} XP</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="gradient-primary text-white border-0 text-xs"
                        onClick={() => setLocation(`/editor/lessons/${lesson.id}`)}
                      >
                        <FileEdit className="h-3.5 w-3.5 mr-1" />
                        Edit Content
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => updateLessonMutation.mutate({ id: lesson.id, isPublished: !lesson.isPublished })}
                      >
                        {lesson.isPublished ? "Unpublish" : "Publish"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => deleteLessonMutation.mutate({ id: lesson.id })}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {(!lessons || lessons.length === 0) && (
                <div className="text-center py-16 text-muted-foreground">
                  <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-30" />
                  <p>No lessons yet. Add the first lesson.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create Course Dialog */}
      <CreateCourseDialog
        open={showCourseDialog}
        onClose={() => setShowCourseDialog(false)}
        onSubmit={(data: any) => createCourseMutation.mutate(data)}
        loading={createCourseMutation.isPending}
      />

      {/* Create Module Dialog */}
      <CreateModuleDialog
        open={showModuleDialog}
        onClose={() => setShowModuleDialog(false)}
        courseId={selectedCourseId ?? 0}
        onSubmit={(data: any) => createModuleMutation.mutate(data)}
        loading={createModuleMutation.isPending}
      />

      {/* Create Lesson Dialog */}
      <CreateLessonDialog
        open={showLessonDialog}
        onClose={() => setShowLessonDialog(false)}
        moduleId={selectedModuleId ?? 0}
        onSubmit={(data: any) => createLessonMutation.mutate(data)}
        loading={createLessonMutation.isPending}
      />
    </div>
  );
}

function CreateCourseDialog({ open, onClose, onSubmit, loading }: any) {
  const [form, setForm] = useState({ slug: "", title: "", description: "", difficulty: "beginner" as const });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader><DialogTitle>Create Course</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} placeholder="Prompt Engineering 101" /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="prompt-engineering-101" /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={(v: any) => setForm({ ...form, difficulty: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="beginner">Beginner</SelectItem><SelectItem value="intermediate">Intermediate</SelectItem><SelectItem value="advanced">Advanced</SelectItem></SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(form)} disabled={loading || !form.title || !form.slug}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateModuleDialog({ open, onClose, courseId, onSubmit, loading }: any) {
  const [form, setForm] = useState({ slug: "", title: "", description: "", order: 0 });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader><DialogTitle>Create Module</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} placeholder="Introduction to Prompting" /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit({ ...form, courseId })} disabled={loading || !form.title || !form.slug}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function CreateLessonDialog({ open, onClose, moduleId, onSubmit, loading }: any) {
  const [form, setForm] = useState({ slug: "", title: "", type: "text" as const, xpReward: 25, estimatedMinutes: 5, order: 0 });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border/50">
        <DialogHeader><DialogTitle>Create Lesson</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Title</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} placeholder="What is a Prompt?" /></div>
          <div><Label>Slug</Label><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
          <div><Label>Type</Label>
            <Select value={form.type} onValueChange={(v: any) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="text">Text</SelectItem><SelectItem value="video">Video</SelectItem><SelectItem value="interactive">Interactive</SelectItem><SelectItem value="quiz">Quiz</SelectItem></SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label>XP Reward</Label><Input type="number" value={form.xpReward} onChange={(e) => setForm({ ...form, xpReward: parseInt(e.target.value) || 25 })} /></div>
            <div><Label>Est. Minutes</Label><Input type="number" value={form.estimatedMinutes} onChange={(e) => setForm({ ...form, estimatedMinutes: parseInt(e.target.value) || 5 })} /></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit({ ...form, moduleId })} disabled={loading || !form.title || !form.slug}>Create</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
