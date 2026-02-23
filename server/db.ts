import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  contentBlocks,
  courses,
  InsertUser,
  lessons,
  modules,
  promptLibrary,
  sandboxSessions,
  securityEvents,
  userProgress,
  users,
  xpEvents,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};

  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }

  values.lastSignedIn = new Date();
  updateSet.lastSignedIn = new Date();

  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}

export async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}

export async function updateUserStatus(userId: number, status: "trial" | "verified" | "banned") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ status }).where(eq(users.id, userId));
}

export async function updateUserRole(userId: number, role: "user" | "admin" | "editor") {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}

export async function addXpToUser(userId: number, amount: number, reason: string, referenceId?: number, referenceType?: string) {
  const db = await getDb();
  if (!db) return;

  // Log the XP event
  await db.insert(xpEvents).values({ userId, amount, reason, referenceId, referenceType });

  // Update user XP and recalculate level
  const user = await getUserById(userId);
  if (!user) return;
  const newXp = (user.xp ?? 0) + amount;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
  await db.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));
}

export async function updateStreak(userId: number) {
  const db = await getDb();
  if (!db) return;
  const today = new Date().toISOString().split("T")[0];
  const user = await getUserById(userId);
  if (!user) return;

  const lastActive = user.lastActiveDate;
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  let newStreak = 1;
  if (lastActive === today) return; // already counted today
  if (lastActive === yesterday) newStreak = (user.streak ?? 0) + 1;

  await db.update(users).set({ streak: newStreak, lastActiveDate: today }).where(eq(users.id, userId));
}

export async function getUserStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const user = await getUserById(userId);
  if (!user) return null;

  const completedCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.status, "completed")));

  return {
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    streak: user.streak ?? 0,
    completedLessons: completedCount[0]?.count ?? 0,
  };
}

// ─── Courses ──────────────────────────────────────────────────────────────────
export async function getCourses(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(courses.id);
  }
  return db.select().from(courses).orderBy(courses.id);
}

export async function getCourseBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return result[0];
}

export async function createCourse(data: { slug: string; title: string; description?: string; difficulty?: "beginner" | "intermediate" | "advanced"; authorId?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(courses).values(data);
  return result[0];
}

export async function updateCourse(id: number, data: Partial<typeof courses.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set(data).where(eq(courses.id, id));
}

export async function deleteCourse(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}

// ─── Modules ──────────────────────────────────────────────────────────────────
export async function getModulesByCourse(courseId: number, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly
    ? and(eq(modules.courseId, courseId), eq(modules.isPublished, true))
    : eq(modules.courseId, courseId);
  return db.select().from(modules).where(conditions).orderBy(modules.order);
}

export async function createModule(data: { courseId: number; slug: string; title: string; description?: string; order?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(modules).values(data);
  return result[0];
}

export async function updateModule(id: number, data: Partial<typeof modules.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(modules).set(data).where(eq(modules.id, id));
}

export async function deleteModule(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(modules).where(eq(modules.id, id));
}

// ─── Lessons ──────────────────────────────────────────────────────────────────
export async function getLessonsByModule(moduleId: number, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly
    ? and(eq(lessons.moduleId, moduleId), eq(lessons.isPublished, true))
    : eq(lessons.moduleId, moduleId);
  return db.select().from(lessons).where(conditions).orderBy(lessons.order);
}

export async function getLessonBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
  return result[0];
}

export async function getLessonById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0];
}

export async function createLesson(data: { moduleId: number; slug: string; title: string; order?: number; type?: "text" | "video" | "interactive" | "quiz"; xpReward?: number }) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(lessons).values(data);
  return result[0];
}

export async function updateLesson(id: number, data: Partial<typeof lessons.$inferInsert>) {
  const db = await getDb();
  if (!db) return;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}

export async function deleteLesson(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessons).where(eq(lessons.id, id));
}

// ─── Content Blocks ───────────────────────────────────────────────────────────
export async function getContentBlocksByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentBlocks).where(eq(contentBlocks.lessonId, lessonId)).orderBy(contentBlocks.order);
}

export async function upsertContentBlock(data: typeof contentBlocks.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(contentBlocks).set(data).where(eq(contentBlocks.id, data.id));
  } else {
    await db.insert(contentBlocks).values(data);
  }
}

export async function deleteContentBlock(id: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
}
export async function deleteContentBlocksByLesson(lessonId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentBlocks).where(eq(contentBlocks.lessonId, lessonId));
}

// ─── Progress ─────────────────────────────────────────────────────────────────
export async function getUserProgressForLesson(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db
    .select()
    .from(userProgress)
    .where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId)))
    .limit(1);
  return result[0];
}

export async function getUserProgressForCourse(userId: number, courseId: number) {
  const db = await getDb();
  if (!db) return [];
  // Get all lesson IDs for this course
  const courseModules = await db.select().from(modules).where(eq(modules.courseId, courseId));
  const moduleIds = courseModules.map((m) => m.id);
  if (moduleIds.length === 0) return [];

  const courseLessons = await db
    .select()
    .from(lessons)
    .where(sql`${lessons.moduleId} IN (${sql.join(moduleIds.map((id) => sql`${id}`), sql`, `)})`);
  const lessonIds = courseLessons.map((l) => l.id);
  if (lessonIds.length === 0) return [];

  return db
    .select()
    .from(userProgress)
    .where(
      and(
        eq(userProgress.userId, userId),
        sql`${userProgress.lessonId} IN (${sql.join(lessonIds.map((id) => sql`${id}`), sql`, `)})`
      )
    );
}

export async function completeLesson(userId: number, lessonId: number) {
  const db = await getDb();
  if (!db) return;

  const lesson = await getLessonById(lessonId);
  if (!lesson) return;

  const existing = await getUserProgressForLesson(userId, lessonId);
  if (existing?.status === "completed") return; // already done

  const now = new Date();
  if (existing) {
    await db
      .update(userProgress)
      .set({ status: "completed", completedAt: now, xpEarned: lesson.xpReward })
      .where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({
      userId,
      lessonId,
      status: "completed",
      completedAt: now,
      xpEarned: lesson.xpReward,
    });
  }

  await addXpToUser(userId, lesson.xpReward, `Completed lesson: ${lesson.title}`, lessonId, "lesson");
  await updateStreak(userId);
}

// ─── Prompt Library ───────────────────────────────────────────────────────────
export async function getPromptsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promptLibrary).where(eq(promptLibrary.userId, userId)).orderBy(desc(promptLibrary.createdAt));
}

export async function savePrompt(data: typeof promptLibrary.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(promptLibrary).values(data);
  return result[0];
}

export async function deletePrompt(id: number, userId: number) {
  const db = await getDb();
  if (!db) return;
  await db.delete(promptLibrary).where(and(eq(promptLibrary.id, id), eq(promptLibrary.userId, userId)));
}

// ─── Security Events ──────────────────────────────────────────────────────────
export async function logSecurityEvent(data: typeof securityEvents.$inferInsert) {
  const db = await getDb();
  if (!db) return;
  await db.insert(securityEvents).values(data);
}

export async function getSecurityEvents(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(limit);
}

// ─── Sandbox Sessions ─────────────────────────────────────────────────────────
export async function saveSandboxSession(data: typeof sandboxSessions.$inferInsert) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sandboxSessions).values(data);
  return result[0];
}

export async function getSandboxSessionsByUser(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sandboxSessions)
    .where(eq(sandboxSessions.userId, userId))
    .orderBy(desc(sandboxSessions.createdAt))
    .limit(limit);
}

// ─── Analytics ────────────────────────────────────────────────────────────────
export async function getAdminAnalytics() {
  const db = await getDb();
  if (!db) return null;

  const totalUsers = await db.select({ count: sql<number>`count(*)` }).from(users);
  const verifiedUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "verified"));
  const trialUsers = await db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.status, "trial"));
  const totalCompletions = await db.select({ count: sql<number>`count(*)` }).from(userProgress).where(eq(userProgress.status, "completed"));
  const totalSecurityEvents = await db.select({ count: sql<number>`count(*)` }).from(securityEvents);
  const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(5);

  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    verifiedUsers: verifiedUsers[0]?.count ?? 0,
    trialUsers: trialUsers[0]?.count ?? 0,
    totalCompletions: totalCompletions[0]?.count ?? 0,
    totalSecurityEvents: totalSecurityEvents[0]?.count ?? 0,
    recentUsers,
  };
}
