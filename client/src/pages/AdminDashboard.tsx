import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  Clock,
  MessageSquare,
  MoreVertical,
  Shield,
  ShieldCheck,
  ShieldX,
  Users,
  XCircle,
  Zap,
  BookOpen,
  Activity,
} from "lucide-react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  const { data: analytics, refetch: refetchAnalytics } = trpc.admin.analytics.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );
  const { data: users, refetch: refetchUsers } = trpc.admin.users.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );
  const { data: securityEvents } = trpc.security.events.useQuery(
    undefined,
    { enabled: !!user && user.role === "admin" }
  );

  const setStatusMutation = trpc.admin.setUserStatus.useMutation({
    onSuccess: () => {
      toast.success("User status updated");
      refetchUsers();
      refetchAnalytics();
    },
  });

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => {
      toast.success("User role updated");
      refetchUsers();
    },
  });

  const { data: accessRequests = [], refetch: refetchRequests } = trpc.access.list.useQuery(
    { status: "pending" },
    { enabled: !!user && user.role === "admin" }
  );

  const reviewMutation = trpc.access.review.useMutation({
    onSuccess: (_, vars) => {
      toast.success(`Request ${vars.decision === "approved" ? "approved" : "denied"}.`);
      refetchRequests();
      refetchUsers();
    },
    onError: () => toast.error("Failed to update request."),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Admin Access Required</h2>
          <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  const statCards = [
    { icon: Users, label: "Total Users", value: analytics?.totalUsers ?? 0, color: "text-blue-400" },
    { icon: ShieldCheck, label: "Verified", value: analytics?.verifiedUsers ?? 0, color: "text-emerald-400" },
    { icon: Shield, label: "Trial", value: analytics?.trialUsers ?? 0, color: "text-yellow-400" },
    { icon: BookOpen, label: "Completions", value: analytics?.totalCompletions ?? 0, color: "text-violet-400" },
    { icon: AlertTriangle, label: "Security Events", value: analytics?.totalSecurityEvents ?? 0, color: "text-rose-400" },
  ];

  const statusColors: Record<string, string> = {
    trial: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    verified: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    banned: "bg-red-500/20 text-red-400 border-red-500/30",
  };

  const roleColors: Record<string, string> = {
    user: "bg-muted/50 text-muted-foreground border-border/50",
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
          <Shield className="h-4 w-4 text-primary" />
          <h1 className="font-semibold">Admin Dashboard</h1>
        </div>
      </div>

      <div className="container py-8 max-w-6xl mx-auto space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {statCards.map((s) => (
            <Card key={s.label} className="bg-card border-border/50">
              <CardContent className="p-4">
                <s.icon className={`h-5 w-5 ${s.color} mb-2`} />
                <div className="text-2xl font-bold">{s.value}</div>
                <div className="text-xs text-muted-foreground">{s.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                User Management
              </span>
              <button
                onClick={() => setLocation("/admin/users")}
                className="text-xs font-medium text-fuchsia-600 hover:text-fuchsia-700 transition-colors px-3 py-1 rounded-lg border border-fuchsia-200/60 hover:border-fuchsia-400/60 bg-fuchsia-50/60"
              >
                View All Profiles →
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">User</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Status</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Role</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">XP</th>
                    <th className="text-left px-4 py-3 text-muted-foreground font-medium">Joined</th>
                    <th className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users?.map((u) => (
                    <tr key={u.id} className="border-b border-border/20 hover:bg-muted/10">
                      <td className="px-4 py-3">
                        <div className="font-medium">{u.name ?? "—"}</div>
                        <div className="text-xs text-muted-foreground">{u.email ?? u.openId}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${statusColors[u.status ?? "trial"]}`}>
                          {u.status ?? "trial"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={`text-xs ${roleColors[u.role ?? "user"]}`}>
                          {u.role ?? "user"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1 text-amber-400">
                          <Zap className="h-3 w-3" />
                          {u.xp ?? 0}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.id !== user.id && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => setStatusMutation.mutate({ userId: u.id, status: "verified" })}
                                className="text-emerald-400"
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" /> Verify
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setStatusMutation.mutate({ userId: u.id, status: "trial" })}
                              >
                                <Shield className="h-4 w-4 mr-2" /> Set Trial
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setStatusMutation.mutate({ userId: u.id, status: "banned" })}
                                className="text-destructive"
                              >
                                <ShieldX className="h-4 w-4 mr-2" /> Ban
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRoleMutation.mutate({ userId: u.id, role: "editor" })}
                                className="text-blue-400"
                              >
                                <Activity className="h-4 w-4 mr-2" /> Make Editor
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setRoleMutation.mutate({ userId: u.id, role: "user" })}
                              >
                                <Users className="h-4 w-4 mr-2" /> Set User
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!users || users.length === 0) && (
                <div className="text-center py-10 text-muted-foreground text-sm">No users found.</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Access Requests */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-fuchsia-400" />
              Access Requests
              {accessRequests.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold">
                  {accessRequests.length}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {accessRequests.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground text-sm">No pending access requests.</div>
            ) : (
              <div className="divide-y divide-border/30">
                {accessRequests.map((req) => (
                  <div key={req.id} className="flex items-start gap-4 px-4 py-4 hover:bg-muted/10">
                    <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {(req.userName ?? req.userEmail ?? "U")[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{req.userName ?? "Unknown"}</span>
                        <span className="text-xs text-muted-foreground">{req.userEmail ?? req.userOpenId}</span>
                      </div>
                      {req.message && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{req.message}</p>
                      )}
                      <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {new Date(req.requestedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30 text-xs"
                        onClick={() => reviewMutation.mutate({ requestId: req.id, decision: "approved" })}
                        disabled={reviewMutation.isPending}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-rose-400 border-rose-500/30 hover:bg-rose-500/10 text-xs"
                        onClick={() => reviewMutation.mutate({ requestId: req.id, decision: "denied" })}
                        disabled={reviewMutation.isPending}
                      >
                        <XCircle className="h-3.5 w-3.5 mr-1" />Deny
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Security Events */}
        {securityEvents && securityEvents.length > 0 && (
          <Card className="bg-card border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-rose-400" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/50">
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Type</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Details</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Page</th>
                      <th className="text-left px-4 py-3 text-muted-foreground font-medium">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {securityEvents.slice(0, 20).map((e) => (
                      <tr key={e.id} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="px-4 py-3">
                          <Badge className="bg-rose-500/20 text-rose-400 border-rose-500/30 text-xs">
                            {e.type}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                          {e.details ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-xs truncate">
                          {e.pageUrl ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">
                          {new Date(e.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
