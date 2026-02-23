import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function makeCtx(overrides: Partial<AuthenticatedUser> = {}): { ctx: TrpcContext; clearedCookies: Array<{ name: string; options: Record<string, unknown> }> } {
  const clearedCookies: Array<{ name: string; options: Record<string, unknown> }> = [];

  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user-openid",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    status: "trial",
    xp: 0,
    level: 1,
    streak: 0,
    lastActiveDate: null,
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
    ...overrides,
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: (name: string, options: Record<string, unknown>) => {
        clearedCookies.push({ name, options });
      },
    } as TrpcContext["res"],
  };

  return { ctx, clearedCookies };
}

function makeAdminCtx() {
  return makeCtx({ role: "admin", status: "verified" });
}

function makeEditorCtx() {
  return makeCtx({ role: "editor", status: "verified" });
}

function makeGuestCtx(): { ctx: TrpcContext } {
  const ctx: TrpcContext = {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: () => {} } as TrpcContext["res"],
  };
  return { ctx };
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
describe("auth.logout", () => {
  it("clears the session cookie and reports success", async () => {
    const { ctx, clearedCookies } = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
    expect(clearedCookies[0]?.options).toMatchObject({ maxAge: -1, httpOnly: true, path: "/" });
  });
});

describe("auth.me", () => {
  it("returns null for unauthenticated users", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toBeNull();
  });
});

// ─── Courses (public) ─────────────────────────────────────────────────────────
describe("courses.list", () => {
  it("returns an array (may be empty without DB)", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.courses.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

describe("courses.bySlug", () => {
  it("returns undefined for non-existent slug", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.courses.bySlug({ slug: "does-not-exist-xyz" });
    expect(result).toBeUndefined();
  });
});

// ─── Course mutations (editor required) ───────────────────────────────────────
describe("courses.create", () => {
  it("throws FORBIDDEN for regular users", async () => {
    const { ctx } = makeCtx({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.courses.create({ slug: "test-course", title: "Test Course" })
    ).rejects.toThrow("Editor or admin role required");
  });

  it("throws FORBIDDEN for unauthenticated users", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.courses.create({ slug: "test-course", title: "Test Course" })
    ).rejects.toThrow();
  });
});

// ─── Admin (admin required) ───────────────────────────────────────────────────
describe("admin.analytics", () => {
  it("throws FORBIDDEN for non-admin users", async () => {
    const { ctx } = makeCtx({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.analytics()).rejects.toThrow("Admin role required");
  });

  it("throws FORBIDDEN for editor users", async () => {
    const { ctx } = makeEditorCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.admin.analytics()).rejects.toThrow("Admin role required");
  });
});

describe("admin.setUserStatus", () => {
  it("throws FORBIDDEN for non-admin", async () => {
    const { ctx } = makeCtx({ role: "editor" });
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.admin.setUserStatus({ userId: 99, status: "verified" })
    ).rejects.toThrow("Admin role required");
  });
});

// ─── Security ─────────────────────────────────────────────────────────────────
describe("security.events", () => {
  it("throws FORBIDDEN for non-admin", async () => {
    const { ctx } = makeCtx({ role: "user" });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.security.events()).rejects.toThrow("Admin role required");
  });
});

// ─── Progress ─────────────────────────────────────────────────────────────────
describe("progress.myStats", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.progress.myStats()).rejects.toThrow();
  });
});

// ─── Sandbox ──────────────────────────────────────────────────────────────────
describe("sandbox.chat", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.sandbox.chat({ messages: [{ role: "user", content: "Hello" }] })
    ).rejects.toThrow();
  });
});

// ─── Prompts ──────────────────────────────────────────────────────────────────
describe("prompts.list", () => {
  it("throws UNAUTHORIZED for unauthenticated users", async () => {
    const { ctx } = makeGuestCtx();
    const caller = appRouter.createCaller(ctx);
    await expect(caller.prompts.list()).rejects.toThrow();
  });
});
