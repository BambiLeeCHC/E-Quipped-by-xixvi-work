import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  BookOpen,
  ChevronLeft,
  Crown,
  CreditCard,
  Flame,
  LogOut,
  Shield,
  Star,
  Trophy,
  Zap,
} from "lucide-react";
import { useLocation } from "wouter";

function xpForLevel(level: number) {
  return level * level * 100;
}

export default function Profile() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { data: stats } = trpc.progress.myStats.useQuery(undefined, { enabled: !!user });
  const { data: prompts } = trpc.prompts.list.useQuery(undefined, { enabled: !!user });
  const { data: subscription } = trpc.stripe.mySubscription.useQuery(undefined, { enabled: !!user });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-sm">
          <h2 className="text-xl font-semibold mb-2">Sign in to view your profile</h2>
          <Button onClick={() => (window.location.href = getLoginUrl())}>Sign In</Button>
        </div>
      </div>
    );
  }

  const currentXp = stats?.xp ?? 0;
  const currentLevel = stats?.level ?? 1;
  const xpThisLevel = currentXp - xpForLevel(currentLevel - 1);
  const xpNeeded = xpForLevel(currentLevel) - xpForLevel(currentLevel - 1);
  const levelProgress = Math.min((xpThisLevel / xpNeeded) * 100, 100);

  const statusColors: Record<string, string> = {
    trial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    banned: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const roleColors: Record<string, string> = {
    user: "bg-muted text-muted-foreground",
    editor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    admin: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-40">
        <div className="container flex items-center gap-4 h-16">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/")}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Home
          </Button>
          <div className="h-4 w-px bg-border" />
          <h1 className="font-semibold">My Profile</h1>
          <div className="ml-auto">
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-1" /> Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container py-10 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Card */}
          <div className="md:col-span-1">
            <Card className="bg-card border-border/50">
              <CardContent className="p-6 text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4 border-2 border-primary/30">
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {user.name?.charAt(0).toUpperCase() ?? "U"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold mb-1">{user.name ?? "Anonymous"}</h2>
                <p className="text-sm text-muted-foreground mb-4">{user.email}</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge className={statusColors[user.status ?? "trial"] ?? ""}>
                    <Shield className="h-3 w-3 mr-1" />
                    {user.status ?? "trial"}
                  </Badge>
                  <Badge className={roleColors[user.role ?? "user"] ?? ""}>
                    {user.role ?? "user"}
                  </Badge>
                  {subscription?.isActive && (
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                      <Crown className="h-3 w-3 mr-1" />
                      Pro {subscription.plan}
                    </Badge>
                  )}
                </div>

                {user.status === "trial" && (
                  <div className="mt-4 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-xs text-yellow-400">
                    Your account is in trial mode. Contact an admin to get verified access to premium content.
                  </div>
                )}
                {!subscription?.isActive && (
                  <button
                    onClick={() => setLocation("/pricing")}
                    style={{
                      marginTop: "0.75rem",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      background: "linear-gradient(135deg, oklch(0.55 0.22 310), oklch(0.55 0.22 270))",
                      border: "none",
                      borderRadius: "0.6rem",
                      padding: "0.45rem 1rem",
                      color: "oklch(0.97 0.01 260)",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Upgrade to Pro
                  </button>
                )}
                {subscription?.isActive && subscription.periodEnd && (
                  <div className="mt-3 text-xs text-muted-foreground">
                    Renews {new Date(subscription.periodEnd).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Stats */}
          <div className="md:col-span-2 space-y-4">
            {/* Level & XP */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Star className="h-4 w-4 text-amber-400" />
                  Level & XP
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-lg">
                      {currentLevel}
                    </div>
                    <div>
                      <div className="font-semibold">Level {currentLevel}</div>
                      <div className="text-sm text-muted-foreground">{currentXp} total XP</div>
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div>{xpThisLevel} / {xpNeeded} XP</div>
                    <div className="text-xs">to Level {currentLevel + 1}</div>
                  </div>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 text-center">
                  <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.streak ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Day Streak</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 text-center">
                  <BookOpen className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{stats?.completedLessons ?? 0}</div>
                  <div className="text-xs text-muted-foreground">Lessons Done</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 text-center">
                  <Zap className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold">{currentXp}</div>
                  <div className="text-xs text-muted-foreground">Total XP</div>
                </CardContent>
              </Card>
            </div>

            {/* Saved Prompts */}
            <Card className="bg-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-primary" />
                    Saved Prompts
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocation("/sandbox")}
                    className="text-xs"
                  >
                    Open Sandbox
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!prompts || prompts.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No saved prompts yet. Use the AI Sandbox to create and save prompts.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {prompts.slice(0, 5).map((p) => (
                      <div
                        key={p.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/30"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">{p.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{p.userPrompt}</div>
                        </div>
                        <Badge variant="outline" className="text-xs ml-3 shrink-0">
                          {p.model}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
