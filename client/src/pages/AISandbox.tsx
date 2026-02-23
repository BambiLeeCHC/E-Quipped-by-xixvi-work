import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ChevronLeft, FlaskConical, Send, Trash2, BookmarkPlus } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type Message = { role: "system" | "user" | "assistant"; content: string };

export default function AISandbox() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [systemPrompt, setSystemPrompt] = useState("You are a helpful AI assistant.");
  const [userInput, setUserInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [temperature, setTemperature] = useState([0.7]);
  const [maxTokens, setMaxTokens] = useState([1000]);
  const [saveTitle, setSaveTitle] = useState("");
  const [showSave, setShowSave] = useState(false);

  const chatMutation = trpc.sandbox.chat.useMutation({
    onSuccess: (data) => {
      const content = typeof data.content === "string" ? data.content : JSON.stringify(data.content);
      setMessages((prev) => [...prev, { role: "assistant", content }]);
    },
    onError: (err) => {
      toast.error("AI error: " + err.message);
    },
  });

  const savePromptMutation = trpc.prompts.save.useMutation({
    onSuccess: () => {
      toast.success("Prompt saved to library!");
      setShowSave(false);
      setSaveTitle("");
    },
  });

  const handleSend = async () => {
    if (!userInput.trim()) return;
    const newMessages: Message[] = [
      ...messages,
      { role: "user", content: userInput.trim() },
    ];
    setMessages(newMessages);
    setUserInput("");

    const allMessages: Message[] = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...newMessages]
      : newMessages;

    await chatMutation.mutateAsync({
      messages: allMessages,
      temperature: temperature[0],
      maxTokens: maxTokens[0],
    });
  };

  const handleClear = () => {
    setMessages([]);
  };

  const handleSavePrompt = async () => {
    if (!saveTitle.trim()) return;
    await savePromptMutation.mutateAsync({
      title: saveTitle,
      systemPrompt,
      userPrompt: messages.find((m) => m.role === "user")?.content ?? userInput,
      temperature: temperature[0],
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <FlaskConical className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Sign in to use the AI Sandbox</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Experiment with AI models and save your best prompts.
          </p>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
          <div className="h-4 w-px bg-border" />
          <FlaskConical className="h-4 w-4 text-primary" />
          <h1 className="font-semibold">AI Sandbox</h1>
          <Badge variant="outline" className="ml-2 text-xs">GPT-4o</Badge>
          <div className="ml-auto flex items-center gap-2">
            {messages.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSave(!showSave)}
                >
                  <BookmarkPlus className="h-4 w-4 mr-1" /> Save Prompt
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClear}>
                  <Trash2 className="h-4 w-4 mr-1" /> Clear
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Settings Panel */}
        <div className="w-72 border-r border-border/50 bg-card/20 p-4 overflow-y-auto hidden md:block">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Configuration
          </h3>

          <div className="space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">System Prompt</Label>
              <Textarea
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                placeholder="You are a helpful assistant..."
                className="text-sm resize-none h-24 bg-muted/30"
              />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Temperature: {temperature[0].toFixed(1)}
              </Label>
              <Slider
                value={temperature}
                onValueChange={setTemperature}
                min={0}
                max={2}
                step={0.1}
                className="mt-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Max Tokens: {maxTokens[0]}
              </Label>
              <Slider
                value={maxTokens}
                onValueChange={setMaxTokens}
                min={100}
                max={4000}
                step={100}
                className="mt-1"
              />
            </div>
          </div>

          {/* Save prompt panel */}
          {showSave && (
            <div className="mt-6 p-3 rounded-lg bg-muted/30 border border-border/50">
              <Label className="text-xs text-muted-foreground mb-2 block">Save as</Label>
              <input
                type="text"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Prompt title..."
                className="w-full bg-muted rounded-md px-3 py-2 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary mb-2"
              />
              <Button
                size="sm"
                className="w-full"
                onClick={handleSavePrompt}
                disabled={!saveTitle.trim() || savePromptMutation.isPending}
              >
                Save
              </Button>
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <FlaskConical className="h-14 w-14 mb-4 opacity-30" />
                <h3 className="text-lg font-medium mb-2">Start experimenting</h3>
                <p className="text-sm max-w-sm">
                  Configure your system prompt on the left, then type a message below to interact with the AI.
                </p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-2xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-card border border-border/50 text-foreground rounded-bl-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="flex justify-start">
                <div className="bg-card border border-border/50 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-border/50 p-4 bg-card/20">
            <div className="flex gap-3 max-w-4xl mx-auto">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your prompt..."
                className="resize-none bg-muted/30 text-sm min-h-[52px] max-h-40"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                onClick={handleSend}
                disabled={!userInput.trim() || chatMutation.isPending}
                className="h-auto px-4 gradient-primary text-white border-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
