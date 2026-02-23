import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  Award,
  Calendar,
  ChevronDown,
  Crown,
  Mail,
  Search,
  Shield,
  ShieldCheck,
  Star,
  Trophy,
  User,
  UserX,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

// ── Role helpers ──────────────────────────────────────────────────────────────
const ROLE_META = {
  admin: { label: "Admin", icon: Crown, color: "text-amber-600", bg: "bg-amber-100", border: "border-amber-300/60" },
  editor: { label: "Master", icon: ShieldCheck, color: "text-violet-600", bg: "bg-violet-100", border: "border-violet-300/60" },
  user: { label: "User", icon: User, color: "text-sky-600", bg: "bg-sky-100", border: "border-sky-300/60" },
} as const;

const STATUS_META = {
  verified: { label: "Verified", color: "text-emerald-700", bg: "bg-emerald-100", border: "border-emerald-300/60" },
  trial: { label: "Trial", color: "text-amber-700", bg: "bg-amber-100", border: "border-amber-300/60" },
  banned: { label: "Banned", color: "text-red-700", bg: "bg-red-100", border: "border-red-300/60" },
} as const;

function xpToLevel(xp: number) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

function RoleBadge({ role }: { role: "admin" | "editor" | "user" }) {
  const m = ROLE_META[role];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${m.bg} ${m.color} ${m.border}`}>
      <m.icon className="h-3 w-3" />
      {m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: "trial" | "verified" | "banned" }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${m.bg} ${m.color} ${m.border}`}>
      {m.label}
    </span>
  );
}

// ── Profile Detail Dialog ─────────────────────────────────────────────────────
function ProfileDialog({
  userId,
  open,
  onClose,
}: {
  userId: number | null;
  open: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = trpc.admin.getUserProfile.useQuery(
    { userId: userId ?? 0 },
    { enabled: open && userId !== null }
  );

  const profile = data?.profile;
  const xpHistory = data?.xpHistory ?? [];

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg lucite border-border/60 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-gradient font-bold">User Profile</DialogTitle>
        </DialogHeader>

        {isLoading && (
          <div className="py-12 text-center text-foreground/50 text-sm">Loading profile…</div>
        )}

        {profile && (
          <div className="space-y-5">
            {/* Identity */}
            <div className="lucite-spectrum rounded-2xl p-5 flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center text-white font-black text-xl glow-primary shrink-0">
                {(profile.name ?? profile.email ?? "?")[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-foreground text-lg truncate">{profile.name ?? "—"}</p>
                <p className="text-sm text-foreground/55 truncate flex items-center gap-1">
                  <Mail className="h-3.5 w-3.5" />
                  {profile.email ?? "No email"}
                </p>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <RoleBadge role={profile.role} />
                  <StatusBadge status={profile.status} />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="lucite rounded-xl p-3 text-center">
                <Zap className="h-4 w-4 text-fuchsia-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{profile.xp.toLocaleString()}</p>
                <p className="text-xs text-foreground/50">XP</p>
              </div>
              <div className="lucite rounded-xl p-3 text-center">
                <Trophy className="h-4 w-4 text-amber-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{xpToLevel(profile.xp)}</p>
                <p className="text-xs text-foreground/50">Level</p>
              </div>
              <div className="lucite rounded-xl p-3 text-center">
                <Star className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                <p className="text-lg font-bold text-foreground">{profile.streak}</p>
                <p className="text-xs text-foreground/50">Streak</p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center justify-between text-foreground/60">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Joined</span>
                <span className="font-medium text-foreground">{new Date(profile.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-foreground/60">
                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />Last sign-in</span>
                <span className="font-medium text-foreground">{new Date(profile.lastSignedIn).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between text-foreground/60">
                <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Login method</span>
                <span className="font-medium text-foreground capitalize">{profile.loginMethod ?? "—"}</span>
              </div>
            </div>

            {/* XP History */}
            {xpHistory.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-foreground/50 uppercase tracking-wider mb-2">Recent XP Activity</p>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {xpHistory.map((ev) => (
                    <div key={ev.id} className="flex items-center justify-between text-sm lucite rounded-lg px-3 py-1.5">
                      <span className="text-foreground/70 truncate">{ev.reason}</span>
                      <span className="font-semibold text-fuchsia-600 shrink-0 ml-2">+{ev.amount} XP</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function AdminUsers() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "editor" | "user">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "trial" | "verified" | "banned">("all");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

  const { data: allUsers = [], refetch } = trpc.admin.users.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const setRoleMutation = trpc.admin.setUserRole.useMutation({
    onSuccess: () => { refetch(); toast.success("Role updated"); },
    onError: () => toast.error("Failed to update role"),
  });

  const setStatusMutation = trpc.admin.setUserStatus.useMutation({
    onSuccess: () => { refetch(); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const awardXpMutation = trpc.admin.awardXp.useMutation({
    onSuccess: () => { refetch(); toast.success("XP awarded"); },
    onError: () => toast.error("Failed to award XP"),
  });

  // Auth guard
  if (!loading && (!user || user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-amber-500 mx-auto mb-3" />
          <p className="text-foreground font-semibold">Admin access required</p>
          <Button className="mt-4 gradient-primary text-white border-0" onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Filter
  const filtered = allUsers.filter((u) => {
    const matchSearch =
      !search ||
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const adminCount = allUsers.filter((u) => u.role === "admin").length;
  const masterCount = allUsers.filter((u) => u.role === "editor").length;
  const verifiedCount = allUsers.filter((u) => u.status === "verified").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-40 lucite border-b border-border/60">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <button onClick={() => setLocation("/admin")} className="text-foreground/50 hover:text-foreground text-sm transition-colors">
              ← Admin
            </button>
            <span className="text-foreground/30">/</span>
            <span className="font-semibold text-foreground">User Management</span>
          </div>
          <Badge variant="outline" className="border-fuchsia-300/60 text-fuchsia-700 bg-fuchsia-50/80">
            {allUsers.length} users
          </Badge>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto py-8 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Users", value: allUsers.length, icon: User, color: "text-sky-600", bg: "from-sky-400/15 to-blue-400/15" },
            { label: "Admins", value: adminCount, icon: Crown, color: "text-amber-600", bg: "from-amber-400/15 to-orange-400/15" },
            { label: "Masters", value: masterCount, icon: ShieldCheck, color: "text-violet-600", bg: "from-violet-400/15 to-purple-400/15" },
            { label: "Verified", value: verifiedCount, icon: Award, color: "text-emerald-600", bg: "from-emerald-400/15 to-teal-400/15" },
          ].map((s) => (
            <Card key={s.label} className={`lucite-spectrum border-border/40 card-lift bg-gradient-to-br ${s.bg}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`h-9 w-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <s.icon className={`h-5 w-5 ${s.color}`} />
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-foreground/50">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
            <Input
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 lucite border-border/60"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {(["all", "admin", "editor", "user"] as const).map((r) => (
              <Button
                key={r}
                size="sm"
                variant={roleFilter === r ? "default" : "outline"}
                className={roleFilter === r ? "gradient-primary text-white border-0" : "lucite border-border/60 text-foreground/70"}
                onClick={() => setRoleFilter(r)}
              >
                {r === "editor" ? "Master" : r.charAt(0).toUpperCase() + r.slice(1)}
              </Button>
            ))}
            <span className="w-px bg-border/60 self-stretch hidden sm:block" />
            {(["all", "verified", "trial", "banned"] as const).map((s) => (
              <Button
                key={s}
                size="sm"
                variant={statusFilter === s ? "default" : "outline"}
                className={statusFilter === s ? "gradient-primary text-white border-0" : "lucite border-border/60 text-foreground/70"}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* User grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-foreground/40">
            <User className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No users match your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((u) => (
              <Card
                key={u.id}
                className="lucite border-border/40 card-lift cursor-pointer hover:border-fuchsia-300/50 transition-all"
                onClick={() => { setSelectedUserId(u.id); setProfileOpen(true); }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="h-11 w-11 rounded-xl gradient-primary flex items-center justify-center text-white font-black text-base glow-primary shrink-0">
                      {(u.name ?? u.email ?? "?")[0]?.toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-foreground truncate">{u.name ?? "Unnamed"}</p>
                      <p className="text-xs text-foreground/50 truncate">{u.email ?? "No email"}</p>
                    </div>
                    {/* Stop propagation on dropdown */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-foreground/40 hover:text-foreground">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="lucite border-border/60 w-44">
                          <DropdownMenuLabel className="text-xs text-foreground/50">Set Role</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => setRoleMutation.mutate({ userId: u.id, role: "admin" })}
                          >
                            <Crown className="h-3.5 w-3.5 text-amber-500" /> Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => setRoleMutation.mutate({ userId: u.id, role: "editor" })}
                          >
                            <ShieldCheck className="h-3.5 w-3.5 text-violet-500" /> Master
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => setRoleMutation.mutate({ userId: u.id, role: "user" })}
                          >
                            <User className="h-3.5 w-3.5 text-sky-500" /> User
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuLabel className="text-xs text-foreground/50">Set Status</DropdownMenuLabel>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => setStatusMutation.mutate({ userId: u.id, status: "verified" })}
                          >
                            <Award className="h-3.5 w-3.5 text-emerald-500" /> Verified
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => setStatusMutation.mutate({ userId: u.id, status: "trial" })}
                          >
                            <Zap className="h-3.5 w-3.5 text-amber-500" /> Trial
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-red-600"
                            onClick={() => setStatusMutation.mutate({ userId: u.id, status: "banned" })}
                          >
                            <UserX className="h-3.5 w-3.5" /> Ban
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-fuchsia-600"
                            onClick={() => awardXpMutation.mutate({ userId: u.id, amount: 100, reason: "Admin award" })}
                          >
                            <Trophy className="h-3.5 w-3.5" /> Award 100 XP
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-1.5 flex-wrap mb-3">
                    <RoleBadge role={u.role} />
                    <StatusBadge status={u.status} />
                  </div>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="lucite-spectrum rounded-lg py-1.5">
                      <p className="text-sm font-bold text-foreground">{u.xp.toLocaleString()}</p>
                      <p className="text-[10px] text-foreground/45">XP</p>
                    </div>
                    <div className="lucite-spectrum rounded-lg py-1.5">
                      <p className="text-sm font-bold text-foreground">Lv {xpToLevel(u.xp)}</p>
                      <p className="text-[10px] text-foreground/45">Level</p>
                    </div>
                    <div className="lucite-spectrum rounded-lg py-1.5">
                      <p className="text-sm font-bold text-foreground">{u.streak}d</p>
                      <p className="text-[10px] text-foreground/45">Streak</p>
                    </div>
                  </div>

                  <p className="text-[10px] text-foreground/35 mt-2 text-right">
                    Joined {new Date(u.createdAt).toLocaleDateString()}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Profile detail dialog */}
      <ProfileDialog
        userId={selectedUserId}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </div>
  );
}
