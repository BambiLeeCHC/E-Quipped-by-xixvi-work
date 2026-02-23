/**
 * LessonEditor — full content block editor with live HTML preview
 *
 * Block types supported:
 *   text          — rich HTML input with live rendered preview
 *   code          — language + code body
 *   callout       — title + text (info/warning/tip variants)
 *   image         — URL + alt + caption
 *   video         — URL (YouTube embed or direct mp4)
 *   audio         — URL
 *   prompt_exercise — instructions + starter prompt + expected output
 *   quiz          — question + multiple choice options + correct answer
 *   divider       — visual separator
 */

import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { trpc } from "@/lib/trpc";
import {
  AlignLeft,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Code2,
  Eye,
  EyeOff,
  FlaskConical,
  GripVertical,
  HelpCircle,
  Image,
  Info,
  Mic,
  Minus,
  Plus,
  Save,
  Trash2,
  Video,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useParams } from "wouter";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
type BlockType =
  | "text"
  | "code"
  | "callout"
  | "image"
  | "video"
  | "audio"
  | "prompt_exercise"
  | "quiz"
  | "divider";

interface Block {
  id: string;
  type: BlockType;
  content: Record<string, any>;
}

const BLOCK_ICONS: Record<BlockType, React.ElementType> = {
  text: AlignLeft,
  code: Code2,
  callout: Info,
  image: Image,
  video: Video,
  audio: Mic,
  prompt_exercise: FlaskConical,
  quiz: HelpCircle,
  divider: Minus,
};

const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Text / HTML",
  code: "Code Block",
  callout: "Callout",
  image: "Image",
  video: "Video",
  audio: "Audio",
  prompt_exercise: "Prompt Exercise",
  quiz: "Quiz",
  divider: "Divider",
};

const DEFAULT_CONTENT: Record<BlockType, Record<string, any>> = {
  text: { html: "<p>Start writing here…</p>" },
  code: { language: "python", code: "# Your code here\nprint('Hello, world!')" },
  callout: { variant: "info", title: "Note", text: "Add your callout text here." },
  image: { url: "", alt: "", caption: "" },
  video: { url: "", caption: "" },
  audio: { url: "", caption: "" },
  prompt_exercise: {
    instructions: "Write a prompt that achieves the following goal:",
    starterPrompt: "You are a helpful assistant. ",
    expectedOutput: "",
  },
  quiz: {
    question: "What is the correct answer?",
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctIndex: 0,
    explanation: "",
  },
  divider: {},
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function LessonEditor() {
  const { lessonId: lessonIdStr } = useParams<{ lessonId: string }>();
  const lessonId = parseInt(lessonIdStr ?? "0");
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [showPreview, setShowPreview] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const { data: lesson } = trpc.lessons.byId.useQuery(
    { id: lessonId },
    { enabled: !!lessonId }
  );
  const { data: existingBlocks, refetch } = trpc.content.byLesson.useQuery(
    { lessonId },
    { enabled: !!lessonId }
  );

  const saveBlocksMutation = trpc.content.saveBlocks.useMutation({
    onSuccess: () => {
      toast.success("Content saved!");
      setDirty(false);
      refetch();
    },
    onError: (e) => toast.error("Save failed: " + e.message),
  });

  // Load existing blocks into state
  useEffect(() => {
    if (existingBlocks && existingBlocks.length > 0) {
      setBlocks(
        existingBlocks.map((b) => ({
          id: uid(),
          type: b.type as BlockType,
          content: b.content as Record<string, any>,
        }))
      );
    }
  }, [existingBlocks]);

  const addBlock = (type: BlockType) => {
    setBlocks((prev) => [
      ...prev,
      { id: uid(), type, content: { ...DEFAULT_CONTENT[type] } },
    ]);
    setDirty(true);
  };

  const updateBlock = useCallback((id: string, content: Record<string, any>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content } : b))
    );
    setDirty(true);
  }, []);

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    setDirty(true);
  };

  const moveBlock = (id: string, dir: "up" | "down") => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const swap = dir === "up" ? idx - 1 : idx + 1;
      if (swap < 0 || swap >= next.length) return prev;
      [next[idx], next[swap]] = [next[swap]!, next[idx]!];
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveBlocksMutation.mutateAsync({
        lessonId,
        blocks: blocks.map((b, i) => ({
          type: b.type,
          content: b.content,
          order: i,
        })),
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Header ── */}
      <div className="lucite border-b sticky top-0 z-40">
        <div className="container flex items-center gap-3 h-14">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/editor")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Editor
          </Button>
          <div className="h-4 w-px bg-border" />
          <div className="flex-1 min-w-0">
            <span className="font-semibold text-sm truncate">{lesson?.title ?? "Lesson"}</span>
            {dirty && (
              <Badge variant="outline" className="ml-2 text-xs text-amber-600 border-amber-300 bg-amber-50">
                Unsaved
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowPreview(!showPreview)}
            className="hidden md:flex"
          >
            {showPreview ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
          <Button
            size="sm"
            className="gradient-primary text-white border-0 glow-primary"
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            <Save className="h-4 w-4 mr-1" />
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className={`flex flex-1 overflow-hidden ${showPreview ? "md:grid md:grid-cols-2" : ""}`}>
        {/* ── Editor Panel ── */}
        <div className="flex flex-col overflow-y-auto border-r border-border/50 bg-background">
          {/* Add block toolbar */}
          <div className="p-4 border-b border-border/30 bg-muted/20">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-3">
              Add Block
            </p>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(BLOCK_LABELS) as BlockType[]).map((type) => {
                const Icon = BLOCK_ICONS[type];
                return (
                  <button
                    key={type}
                    onClick={() => addBlock(type)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium lucite border border-border/50 hover:border-fuchsia-300/60 hover:text-fuchsia-700 transition-all"
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {BLOCK_LABELS[type]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Blocks */}
          <div className="flex-1 p-4 space-y-4">
            {blocks.length === 0 && (
              <div className="text-center py-16 text-foreground/40">
                <Plus className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Add your first block above to start building this lesson.</p>
              </div>
            )}
            {blocks.map((block, idx) => (
              <BlockEditor
                key={block.id}
                block={block}
                index={idx}
                total={blocks.length}
                onChange={(content) => updateBlock(block.id, content)}
                onRemove={() => removeBlock(block.id)}
                onMoveUp={() => moveBlock(block.id, "up")}
                onMoveDown={() => moveBlock(block.id, "down")}
              />
            ))}
          </div>
        </div>

        {/* ── Live Preview Panel ── */}
        {showPreview && (
          <div className="hidden md:flex flex-col overflow-y-auto bg-white">
            <div className="px-6 py-3 border-b border-border/30 bg-muted/10 flex items-center gap-2">
              <Eye className="h-4 w-4 text-fuchsia-500" />
              <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider">
                Live Preview
              </span>
            </div>
            <div className="flex-1 p-8 max-w-2xl mx-auto w-full">
              {lesson && (
                <div className="mb-8">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                  {lesson.description && (
                    <p className="text-gray-500">{lesson.description}</p>
                  )}
                  <hr className="mt-4 border-gray-200" />
                </div>
              )}
              {blocks.length === 0 && (
                <p className="text-gray-400 text-sm italic">Your lesson preview will appear here as you add blocks.</p>
              )}
              {blocks.map((block) => (
                <PreviewBlock key={block.id} block={block} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Block Editor ─────────────────────────────────────────────────────────────
function BlockEditor({
  block,
  index,
  total,
  onChange,
  onRemove,
  onMoveUp,
  onMoveDown,
}: {
  block: Block;
  index: number;
  total: number;
  onChange: (content: Record<string, any>) => void;
  onRemove: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const Icon = BLOCK_ICONS[block.type];

  return (
    <Card className="lucite border border-border/40 shadow-sm">
      <CardContent className="p-0">
        {/* Block header */}
        <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/10 rounded-t-xl">
          <GripVertical className="h-4 w-4 text-foreground/30" />
          <Icon className="h-4 w-4 text-fuchsia-500" />
          <span className="text-xs font-semibold text-foreground/60 uppercase tracking-wider flex-1">
            {BLOCK_LABELS[block.type]}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={onMoveUp}
              disabled={index === 0}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              title="Move up"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={index === total - 1}
              className="p-1 rounded hover:bg-muted disabled:opacity-30 transition-colors"
              title="Move down"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onRemove}
              className="p-1 rounded hover:bg-red-50 hover:text-red-500 transition-colors"
              title="Remove block"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Block-specific fields */}
        <div className="p-4">
          {block.type === "text" && (
            <TextBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "code" && (
            <CodeBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "callout" && (
            <CalloutBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "image" && (
            <ImageBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "video" && (
            <VideoBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "audio" && (
            <AudioBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "prompt_exercise" && (
            <PromptExerciseEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "quiz" && (
            <QuizBlockEditor content={block.content} onChange={onChange} />
          )}
          {block.type === "divider" && (
            <p className="text-xs text-foreground/40 italic">Visual divider — no content needed.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Individual block editors ─────────────────────────────────────────────────

function TextBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">HTML Content</Label>
        <Textarea
          value={content.html ?? ""}
          onChange={(e) => onChange({ ...content, html: e.target.value })}
          placeholder="<p>Write your content here. You can use full HTML.</p>"
          className="font-mono text-sm min-h-[140px] resize-y bg-white border-border/60"
        />
        <p className="text-xs text-foreground/40 mt-1">
          Supports full HTML: &lt;p&gt;, &lt;h2&gt;–&lt;h4&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;a&gt;, &lt;blockquote&gt;, etc.
        </p>
      </div>
    </div>
  );
}

function CodeBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const languages = ["python", "javascript", "typescript", "bash", "json", "html", "css", "sql", "yaml", "rust", "go", "java", "c", "cpp"];
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Language</Label>
        <Select value={content.language ?? "python"} onValueChange={(v) => onChange({ ...content, language: v })}>
          <SelectTrigger className="w-40 bg-white border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((l) => (
              <SelectItem key={l} value={l}>{l}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Code</Label>
        <Textarea
          value={content.code ?? ""}
          onChange={(e) => onChange({ ...content, code: e.target.value })}
          placeholder="# Your code here"
          className="font-mono text-sm min-h-[160px] resize-y bg-gray-950 text-green-400 border-gray-700 placeholder:text-gray-600"
        />
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Caption (optional)</Label>
        <Input
          value={content.caption ?? ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="e.g. Example: basic prompt loop"
          className="bg-white border-border/60"
        />
      </div>
    </div>
  );
}

function CalloutBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Variant</Label>
        <Select value={content.variant ?? "info"} onValueChange={(v) => onChange({ ...content, variant: v })}>
          <SelectTrigger className="w-36 bg-white border-border/60">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warning">Warning</SelectItem>
            <SelectItem value="tip">Tip</SelectItem>
            <SelectItem value="danger">Danger</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Title</Label>
        <Input
          value={content.title ?? ""}
          onChange={(e) => onChange({ ...content, title: e.target.value })}
          placeholder="Note"
          className="bg-white border-border/60"
        />
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Body Text</Label>
        <Textarea
          value={content.text ?? ""}
          onChange={(e) => onChange({ ...content, text: e.target.value })}
          placeholder="Callout body text…"
          className="min-h-[80px] resize-y bg-white border-border/60"
        />
      </div>
    </div>
  );
}

function ImageBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Image URL</Label>
        <Input
          value={content.url ?? ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://example.com/image.png"
          className="bg-white border-border/60"
        />
      </div>
      {content.url && (
        <div className="rounded-lg overflow-hidden border border-border/40 max-h-48">
          <img src={content.url} alt={content.alt ?? ""} className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-foreground/60 mb-1 block">Alt Text</Label>
          <Input
            value={content.alt ?? ""}
            onChange={(e) => onChange({ ...content, alt: e.target.value })}
            placeholder="Describe the image"
            className="bg-white border-border/60"
          />
        </div>
        <div>
          <Label className="text-xs text-foreground/60 mb-1 block">Caption</Label>
          <Input
            value={content.caption ?? ""}
            onChange={(e) => onChange({ ...content, caption: e.target.value })}
            placeholder="Optional caption"
            className="bg-white border-border/60"
          />
        </div>
      </div>
    </div>
  );
}

function VideoBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const isYoutube = (url: string) =>
    url.includes("youtube.com") || url.includes("youtu.be");

  const getEmbedUrl = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Video URL</Label>
        <Input
          value={content.url ?? ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://youtube.com/watch?v=... or https://example.com/video.mp4"
          className="bg-white border-border/60"
        />
        <p className="text-xs text-foreground/40 mt-1">Supports YouTube links and direct .mp4 URLs.</p>
      </div>
      {content.url && (
        <div className="rounded-lg overflow-hidden border border-border/40 aspect-video bg-black">
          {isYoutube(content.url) ? (
            <iframe
              src={getEmbedUrl(content.url)}
              className="w-full h-full"
              allowFullScreen
              title="Video preview"
            />
          ) : (
            <video controls src={content.url} className="w-full h-full" />
          )}
        </div>
      )}
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Caption</Label>
        <Input
          value={content.caption ?? ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Optional caption"
          className="bg-white border-border/60"
        />
      </div>
    </div>
  );
}

function AudioBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Audio URL</Label>
        <Input
          value={content.url ?? ""}
          onChange={(e) => onChange({ ...content, url: e.target.value })}
          placeholder="https://example.com/audio.mp3"
          className="bg-white border-border/60"
        />
      </div>
      {content.url && (
        <audio controls src={content.url} className="w-full mt-2" />
      )}
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Caption</Label>
        <Input
          value={content.caption ?? ""}
          onChange={(e) => onChange({ ...content, caption: e.target.value })}
          placeholder="Optional caption"
          className="bg-white border-border/60"
        />
      </div>
    </div>
  );
}

function PromptExerciseEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Instructions</Label>
        <Textarea
          value={content.instructions ?? ""}
          onChange={(e) => onChange({ ...content, instructions: e.target.value })}
          placeholder="Describe what the learner should do…"
          className="min-h-[80px] resize-y bg-white border-border/60"
        />
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Starter Prompt</Label>
        <Textarea
          value={content.starterPrompt ?? ""}
          onChange={(e) => onChange({ ...content, starterPrompt: e.target.value })}
          placeholder="You are a helpful assistant. "
          className="font-mono text-sm min-h-[100px] resize-y bg-white border-border/60"
        />
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Expected Output (optional)</Label>
        <Textarea
          value={content.expectedOutput ?? ""}
          onChange={(e) => onChange({ ...content, expectedOutput: e.target.value })}
          placeholder="Describe what a good response looks like…"
          className="min-h-[80px] resize-y bg-white border-border/60"
        />
      </div>
    </div>
  );
}

function QuizBlockEditor({ content, onChange }: { content: any; onChange: (c: any) => void }) {
  const options: string[] = content.options ?? ["", "", "", ""];

  const updateOption = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    onChange({ ...content, options: next });
  };

  const addOption = () => onChange({ ...content, options: [...options, ""] });
  const removeOption = (i: number) => {
    const next = options.filter((_, idx) => idx !== i);
    onChange({ ...content, options: next, correctIndex: Math.min(content.correctIndex ?? 0, next.length - 1) });
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Question</Label>
        <Textarea
          value={content.question ?? ""}
          onChange={(e) => onChange({ ...content, question: e.target.value })}
          placeholder="What is the correct answer?"
          className="min-h-[70px] resize-y bg-white border-border/60"
        />
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-2 block">Answer Options</Label>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onChange({ ...content, correctIndex: i })}
                className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                  content.correctIndex === i
                    ? "border-fuchsia-500 bg-fuchsia-500"
                    : "border-border/60 hover:border-fuchsia-300"
                }`}
                title="Mark as correct"
              >
                {content.correctIndex === i && (
                  <div className="h-2 w-2 rounded-full bg-white" />
                )}
              </button>
              <Input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                placeholder={`Option ${String.fromCharCode(65 + i)}`}
                className="flex-1 bg-white border-border/60"
              />
              <button
                onClick={() => removeOption(i)}
                disabled={options.length <= 2}
                className="p-1 rounded hover:bg-red-50 hover:text-red-500 disabled:opacity-30 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={addOption}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Add Option
        </Button>
      </div>
      <div>
        <Label className="text-xs text-foreground/60 mb-1 block">Explanation (shown after answer)</Label>
        <Textarea
          value={content.explanation ?? ""}
          onChange={(e) => onChange({ ...content, explanation: e.target.value })}
          placeholder="Explain why the correct answer is correct…"
          className="min-h-[70px] resize-y bg-white border-border/60"
        />
      </div>
    </div>
  );
}

// ─── Live Preview Block ───────────────────────────────────────────────────────
function PreviewBlock({ block }: { block: Block }) {
  const c = block.content;

  const calloutStyles: Record<string, { bg: string; border: string; title: string }> = {
    info:    { bg: "bg-blue-50",   border: "border-blue-200",   title: "text-blue-700" },
    warning: { bg: "bg-amber-50",  border: "border-amber-200",  title: "text-amber-700" },
    tip:     { bg: "bg-emerald-50",border: "border-emerald-200",title: "text-emerald-700" },
    danger:  { bg: "bg-red-50",    border: "border-red-200",    title: "text-red-700" },
  };

  switch (block.type) {
    case "text":
      return (
        <div
          className="prose prose-sm max-w-none mb-6 text-gray-800"
          dangerouslySetInnerHTML={{ __html: c.html ?? "" }}
        />
      );

    case "code":
      return (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700">
            <span className="text-xs text-gray-400 font-mono">{c.language ?? "code"}</span>
          </div>
          <pre className="bg-gray-950 p-4 overflow-x-auto text-sm font-mono text-green-400 leading-relaxed">
            <code>{c.code ?? ""}</code>
          </pre>
          {c.caption && (
            <p className="text-xs text-gray-500 text-center py-2 bg-gray-50 border-t border-gray-200">{c.caption}</p>
          )}
        </div>
      );

    case "callout": {
      const style = calloutStyles[c.variant ?? "info"] ?? calloutStyles.info;
      return (
        <div className={`mb-6 rounded-xl border ${style.border} ${style.bg} p-5`}>
          {c.title && <div className={`font-semibold mb-1.5 ${style.title}`}>{c.title}</div>}
          <p className="text-sm text-gray-700">{c.text ?? ""}</p>
        </div>
      );
    }

    case "image":
      return c.url ? (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200">
          <img src={c.url} alt={c.alt ?? ""} className="w-full" />
          {c.caption && (
            <p className="text-xs text-gray-500 text-center py-2 px-4 bg-gray-50">{c.caption}</p>
          )}
        </div>
      ) : (
        <div className="mb-6 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Image URL not set
        </div>
      );

    case "video":
      return c.url ? (
        <div className="mb-6 rounded-xl overflow-hidden border border-gray-200 aspect-video bg-black">
          {c.url.includes("youtube") || c.url.includes("youtu.be") ? (
            <iframe
              src={c.url.replace("watch?v=", "embed/").replace("youtu.be/", "www.youtube.com/embed/")}
              className="w-full h-full"
              allowFullScreen
              title="Video"
            />
          ) : (
            <video controls src={c.url} className="w-full h-full" />
          )}
        </div>
      ) : (
        <div className="mb-6 h-32 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Video URL not set
        </div>
      );

    case "audio":
      return c.url ? (
        <div className="mb-6">
          <audio controls src={c.url} className="w-full" />
          {c.caption && <p className="text-xs text-gray-500 mt-1 text-center">{c.caption}</p>}
        </div>
      ) : (
        <div className="mb-6 h-16 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm">
          Audio URL not set
        </div>
      );

    case "prompt_exercise":
      return (
        <div className="mb-6 rounded-xl border border-fuchsia-200 bg-fuchsia-50 p-5">
          <div className="text-xs font-bold text-fuchsia-600 uppercase tracking-wider mb-2">
            Prompt Exercise
          </div>
          {c.instructions && <p className="text-sm text-gray-700 mb-3">{c.instructions}</p>}
          {c.starterPrompt && (
            <div className="rounded-lg bg-white border border-fuchsia-200 p-3 font-mono text-sm text-gray-800 mb-2">
              {c.starterPrompt}
            </div>
          )}
          {c.expectedOutput && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-gray-500 mb-1">Expected output:</div>
              <p className="text-sm text-gray-600 italic">{c.expectedOutput}</p>
            </div>
          )}
        </div>
      );

    case "quiz":
      return (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-5">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Quiz</div>
          <p className="font-medium text-gray-900 mb-4">{c.question ?? "Question"}</p>
          <div className="space-y-2">
            {(c.options ?? []).map((opt: string, i: number) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-3 rounded-lg border text-sm ${
                  i === c.correctIndex
                    ? "border-emerald-300 bg-emerald-50 text-emerald-800"
                    : "border-gray-200 text-gray-700"
                }`}
              >
                <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  i === c.correctIndex ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                }`}>
                  {i === c.correctIndex && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                </div>
                {opt || `Option ${String.fromCharCode(65 + i)}`}
              </div>
            ))}
          </div>
          {c.explanation && (
            <div className="mt-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
              <strong>Explanation:</strong> {c.explanation}
            </div>
          )}
        </div>
      );

    case "divider":
      return <hr className="my-6 border-gray-200" />;

    default:
      return null;
  }
}
