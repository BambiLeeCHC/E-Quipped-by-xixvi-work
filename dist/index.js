var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// drizzle/schema.ts
var schema_exports = {};
__export(schema_exports, {
  accessRequests: () => accessRequests,
  contentBlocks: () => contentBlocks,
  courses: () => courses,
  lessons: () => lessons,
  modules: () => modules,
  promptLibrary: () => promptLibrary,
  quizAttempts: () => quizAttempts,
  quizQuestions: () => quizQuestions,
  sandboxMessages: () => sandboxMessages,
  sandboxSessions: () => sandboxSessions,
  securityEvents: () => securityEvents,
  stripePayments: () => stripePayments,
  userProgress: () => userProgress,
  users: () => users,
  xpEvents: () => xpEvents
});
import {
  boolean,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  float
} from "drizzle-orm/mysql-core";
var users, courses, modules, lessons, contentBlocks, userProgress, xpEvents, promptLibrary, securityEvents, sandboxSessions, quizQuestions, quizAttempts, accessRequests, sandboxMessages, stripePayments;
var init_schema = __esm({
  "drizzle/schema.ts"() {
    "use strict";
    users = mysqlTable("users", {
      id: int("id").autoincrement().primaryKey(),
      openId: varchar("openId", { length: 64 }).notNull().unique(),
      name: text("name"),
      email: varchar("email", { length: 320 }),
      loginMethod: varchar("loginMethod", { length: 64 }),
      role: mysqlEnum("role", ["user", "admin", "editor"]).default("user").notNull(),
      status: mysqlEnum("status", ["trial", "verified", "banned"]).default("trial").notNull(),
      xp: int("xp").default(0).notNull(),
      level: int("level").default(1).notNull(),
      streak: int("streak").default(0).notNull(),
      lastActiveDate: varchar("lastActiveDate", { length: 10 }),
      avatarUrl: text("avatarUrl"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
      lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
      // Stripe
      stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
      stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 64 }),
      subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "trialing", "past_due", "canceled", "unpaid"]),
      subscriptionPlan: mysqlEnum("subscriptionPlan", ["monthly", "annual", "lifetime"]),
      subscriptionPeriodEnd: timestamp("subscriptionPeriodEnd")
    });
    courses = mysqlTable("courses", {
      id: int("id").autoincrement().primaryKey(),
      slug: varchar("slug", { length: 128 }).notNull().unique(),
      title: varchar("title", { length: 256 }).notNull(),
      description: text("description"),
      thumbnailUrl: text("thumbnailUrl"),
      difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
      isPublished: boolean("isPublished").default(false).notNull(),
      isPremium: boolean("isPremium").default(false).notNull(),
      totalXp: int("totalXp").default(0).notNull(),
      authorId: int("authorId"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    modules = mysqlTable("modules", {
      id: int("id").autoincrement().primaryKey(),
      courseId: int("courseId").notNull(),
      slug: varchar("slug", { length: 128 }).notNull(),
      title: varchar("title", { length: 256 }).notNull(),
      description: text("description"),
      order: int("order").default(0).notNull(),
      isPublished: boolean("isPublished").default(false).notNull(),
      xpReward: int("xpReward").default(50).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    lessons = mysqlTable("lessons", {
      id: int("id").autoincrement().primaryKey(),
      moduleId: int("moduleId").notNull(),
      slug: varchar("slug", { length: 128 }).notNull(),
      title: varchar("title", { length: 256 }).notNull(),
      description: text("description"),
      order: int("order").default(0).notNull(),
      type: mysqlEnum("type", ["text", "video", "interactive", "quiz"]).default("text").notNull(),
      isPremium: boolean("isPremium").default(false).notNull(),
      isPublished: boolean("isPublished").default(false).notNull(),
      xpReward: int("xpReward").default(25).notNull(),
      estimatedMinutes: int("estimatedMinutes").default(5).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    contentBlocks = mysqlTable("content_blocks", {
      id: int("id").autoincrement().primaryKey(),
      lessonId: int("lessonId").notNull(),
      type: mysqlEnum("type", ["text", "image", "video", "code", "quiz", "prompt_exercise", "callout", "step_flow", "flashcard_grid", "stat_grid", "concept_diagram", "quote", "divider"]).notNull(),
      order: int("order").default(0).notNull(),
      content: json("content").notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    userProgress = mysqlTable("user_progress", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      lessonId: int("lessonId").notNull(),
      status: mysqlEnum("status", ["started", "completed"]).default("started").notNull(),
      xpEarned: int("xpEarned").default(0).notNull(),
      completedAt: timestamp("completedAt"),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    xpEvents = mysqlTable("xp_events", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      amount: int("amount").notNull(),
      reason: varchar("reason", { length: 256 }).notNull(),
      referenceId: int("referenceId"),
      referenceType: varchar("referenceType", { length: 64 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    promptLibrary = mysqlTable("prompt_library", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      title: varchar("title", { length: 256 }).notNull(),
      systemPrompt: text("systemPrompt"),
      userPrompt: text("userPrompt").notNull(),
      model: varchar("model", { length: 64 }).default("gpt-4o").notNull(),
      temperature: float("temperature").default(0.7).notNull(),
      isPublic: boolean("isPublic").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    securityEvents = mysqlTable("security_events", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId"),
      type: mysqlEnum("type", ["screenshot", "print", "devtools", "copy", "suspicious"]).notNull(),
      details: text("details"),
      pageUrl: text("pageUrl"),
      ipAddress: varchar("ipAddress", { length: 64 }),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    sandboxSessions = mysqlTable("sandbox_sessions", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      model: varchar("model", { length: 64 }).notNull(),
      messages: json("messages").notNull(),
      totalTokens: int("totalTokens").default(0).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull(),
      updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
    });
    quizQuestions = mysqlTable("quiz_questions", {
      id: int("id").autoincrement().primaryKey(),
      lessonId: int("lessonId").notNull(),
      order: int("order").default(0).notNull(),
      question: text("question").notNull(),
      options: json("options").notNull(),
      // string[]
      correctIndex: int("correctIndex").notNull(),
      explanation: text("explanation"),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    quizAttempts = mysqlTable("quiz_attempts", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      lessonId: int("lessonId").notNull(),
      score: int("score").default(0).notNull(),
      // 0-100
      passed: boolean("passed").default(false).notNull(),
      answers: json("answers").notNull(),
      // number[] — chosen indices
      attemptedAt: timestamp("attemptedAt").defaultNow().notNull()
    });
    accessRequests = mysqlTable("access_requests", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      status: mysqlEnum("status", ["pending", "approved", "denied"]).default("pending").notNull(),
      message: text("message"),
      reviewedBy: int("reviewedBy"),
      requestedAt: timestamp("requestedAt").defaultNow().notNull(),
      reviewedAt: timestamp("reviewedAt")
    });
    sandboxMessages = mysqlTable("sandbox_messages", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      lessonId: int("lessonId").notNull(),
      role: mysqlEnum("role", ["user", "assistant"]).notNull(),
      content: text("content").notNull(),
      qualityScore: int("qualityScore"),
      // 0-100, null until scored
      qualityFeedback: text("qualityFeedback"),
      // LLM tip
      qualityPassed: boolean("qualityPassed").default(false).notNull(),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
    stripePayments = mysqlTable("stripe_payments", {
      id: int("id").autoincrement().primaryKey(),
      userId: int("userId").notNull(),
      stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 64 }).notNull(),
      stripeCustomerId: varchar("stripeCustomerId", { length: 64 }),
      amount: int("amount").notNull(),
      // in cents
      currency: varchar("currency", { length: 8 }).default("usd").notNull(),
      status: varchar("status", { length: 32 }).notNull(),
      plan: mysqlEnum("plan", ["monthly", "annual", "lifetime"]),
      createdAt: timestamp("createdAt").defaultNow().notNull()
    });
  }
});

// server/_core/env.ts
var ENV;
var init_env = __esm({
  "server/_core/env.ts"() {
    "use strict";
    ENV = {
      appId: process.env.VITE_APP_ID ?? "",
      cookieSecret: process.env.JWT_SECRET ?? "",
      databaseUrl: process.env.DATABASE_URL ?? "",
      oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
      ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
      isProduction: process.env.NODE_ENV === "production",
      forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
      forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? ""
    };
  }
});

// server/db.ts
var db_exports = {};
__export(db_exports, {
  addXpToUser: () => addXpToUser,
  completeLesson: () => completeLesson,
  createAccessRequest: () => createAccessRequest,
  createCourse: () => createCourse,
  createLesson: () => createLesson,
  createModule: () => createModule,
  deleteContentBlock: () => deleteContentBlock,
  deleteContentBlocksByLesson: () => deleteContentBlocksByLesson,
  deleteCourse: () => deleteCourse,
  deleteLesson: () => deleteLesson,
  deleteModule: () => deleteModule,
  deletePrompt: () => deletePrompt,
  getAccessRequestByUser: () => getAccessRequestByUser,
  getAdminAnalytics: () => getAdminAnalytics,
  getAllAccessRequests: () => getAllAccessRequests,
  getAllUsers: () => getAllUsers,
  getBestQuizAttempt: () => getBestQuizAttempt,
  getContentBlocksByLesson: () => getContentBlocksByLesson,
  getCourseBySlug: () => getCourseBySlug,
  getCourses: () => getCourses,
  getDb: () => getDb,
  getLessonById: () => getLessonById,
  getLessonBySlug: () => getLessonBySlug,
  getLessonQualityPassed: () => getLessonQualityPassed,
  getLessonsByModule: () => getLessonsByModule,
  getModuleById: () => getModuleById,
  getModulesByCourse: () => getModulesByCourse,
  getPassedLessonIds: () => getPassedLessonIds,
  getPromptsByUser: () => getPromptsByUser,
  getQuizQuestionsByLesson: () => getQuizQuestionsByLesson,
  getSandboxHistory: () => getSandboxHistory,
  getSandboxSessionsByUser: () => getSandboxSessionsByUser,
  getSecurityEvents: () => getSecurityEvents,
  getUserById: () => getUserById,
  getUserByOpenId: () => getUserByOpenId,
  getUserProfile: () => getUserProfile,
  getUserProgressForCourse: () => getUserProgressForCourse,
  getUserProgressForLesson: () => getUserProgressForLesson,
  getUserStats: () => getUserStats,
  getUserXpHistory: () => getUserXpHistory,
  logSecurityEvent: () => logSecurityEvent,
  reviewAccessRequest: () => reviewAccessRequest,
  savePrompt: () => savePrompt,
  saveSandboxMessage: () => saveSandboxMessage,
  saveSandboxSession: () => saveSandboxSession,
  submitQuizAttempt: () => submitQuizAttempt,
  updateCourse: () => updateCourse,
  updateLesson: () => updateLesson,
  updateModule: () => updateModule,
  updateStreak: () => updateStreak,
  updateUserRole: () => updateUserRole,
  updateUserStatus: () => updateUserStatus,
  upsertContentBlock: () => upsertContentBlock,
  upsertUser: () => upsertUser
});
import { and, desc, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values = { openId: user.openId };
  const updateSet = {};
  const textFields = ["name", "email", "loginMethod"];
  for (const field of textFields) {
    const value = user[field];
    if (value === void 0) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  values.lastSignedIn = /* @__PURE__ */ new Date();
  updateSet.lastSignedIn = /* @__PURE__ */ new Date();
  if (user.role !== void 0) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}
async function getUserById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result[0];
}
async function getAllUsers(limit = 100, offset = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(users).orderBy(desc(users.createdAt)).limit(limit).offset(offset);
}
async function updateUserStatus(userId, status) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ status }).where(eq(users.id, userId));
}
async function updateUserRole(userId, role) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set({ role }).where(eq(users.id, userId));
}
async function getUserProfile(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result[0] ?? null;
}
async function getUserXpHistory(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(xpEvents).where(eq(xpEvents.userId, userId)).orderBy(desc(xpEvents.createdAt)).limit(limit);
}
async function addXpToUser(userId, amount, reason, referenceId, referenceType) {
  const db = await getDb();
  if (!db) return;
  await db.insert(xpEvents).values({ userId, amount, reason, referenceId, referenceType });
  const user = await getUserById(userId);
  if (!user) return;
  const newXp = (user.xp ?? 0) + amount;
  const newLevel = Math.floor(Math.sqrt(newXp / 100)) + 1;
  await db.update(users).set({ xp: newXp, level: newLevel }).where(eq(users.id, userId));
}
async function updateStreak(userId) {
  const db = await getDb();
  if (!db) return;
  const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  const user = await getUserById(userId);
  if (!user) return;
  const lastActive = user.lastActiveDate;
  const yesterday = new Date(Date.now() - 864e5).toISOString().split("T")[0];
  let newStreak = 1;
  if (lastActive === today) return;
  if (lastActive === yesterday) newStreak = (user.streak ?? 0) + 1;
  await db.update(users).set({ streak: newStreak, lastActiveDate: today }).where(eq(users.id, userId));
}
async function getUserStats(userId) {
  const db = await getDb();
  if (!db) return null;
  const user = await getUserById(userId);
  if (!user) return null;
  const completedCount = await db.select({ count: sql`count(*)` }).from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.status, "completed")));
  return {
    xp: user.xp ?? 0,
    level: user.level ?? 1,
    streak: user.streak ?? 0,
    completedLessons: completedCount[0]?.count ?? 0
  };
}
async function getCourses(publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  if (publishedOnly) {
    return db.select().from(courses).where(eq(courses.isPublished, true)).orderBy(courses.id);
  }
  return db.select().from(courses).orderBy(courses.id);
}
async function getCourseBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(courses).where(eq(courses.slug, slug)).limit(1);
  return result[0];
}
async function createCourse(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(courses).values(data);
  return result[0];
}
async function updateCourse(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(courses).set(data).where(eq(courses.id, id));
}
async function deleteCourse(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(courses).where(eq(courses.id, id));
}
async function getModulesByCourse(courseId, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly ? and(eq(modules.courseId, courseId), eq(modules.isPublished, true)) : eq(modules.courseId, courseId);
  return db.select().from(modules).where(conditions).orderBy(modules.order);
}
async function createModule(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(modules).values(data);
  return result[0];
}
async function updateModule(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(modules).set(data).where(eq(modules.id, id));
}
async function deleteModule(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(modules).where(eq(modules.id, id));
}
async function getLessonsByModule(moduleId, publishedOnly = true) {
  const db = await getDb();
  if (!db) return [];
  const conditions = publishedOnly ? and(eq(lessons.moduleId, moduleId), eq(lessons.isPublished, true)) : eq(lessons.moduleId, moduleId);
  return db.select().from(lessons).where(conditions).orderBy(lessons.order);
}
async function getLessonBySlug(slug) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(lessons).where(eq(lessons.slug, slug)).limit(1);
  return result[0];
}
async function getLessonById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
  return result[0];
}
async function createLesson(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(lessons).values(data);
  return result[0];
}
async function updateLesson(id, data) {
  const db = await getDb();
  if (!db) return;
  await db.update(lessons).set(data).where(eq(lessons.id, id));
}
async function deleteLesson(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(lessons).where(eq(lessons.id, id));
}
async function getContentBlocksByLesson(lessonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentBlocks).where(eq(contentBlocks.lessonId, lessonId)).orderBy(contentBlocks.order);
}
async function upsertContentBlock(data) {
  const db = await getDb();
  if (!db) return;
  if (data.id) {
    await db.update(contentBlocks).set(data).where(eq(contentBlocks.id, data.id));
  } else {
    await db.insert(contentBlocks).values(data);
  }
}
async function deleteContentBlock(id) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentBlocks).where(eq(contentBlocks.id, id));
}
async function deleteContentBlocksByLesson(lessonId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(contentBlocks).where(eq(contentBlocks.lessonId, lessonId));
}
async function getUserProgressForLesson(userId, lessonId) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(userProgress).where(and(eq(userProgress.userId, userId), eq(userProgress.lessonId, lessonId))).limit(1);
  return result[0];
}
async function getUserProgressForCourse(userId, courseId) {
  const db = await getDb();
  if (!db) return [];
  const courseModules = await db.select().from(modules).where(eq(modules.courseId, courseId));
  const moduleIds = courseModules.map((m) => m.id);
  if (moduleIds.length === 0) return [];
  const courseLessons = await db.select().from(lessons).where(sql`${lessons.moduleId} IN (${sql.join(moduleIds.map((id) => sql`${id}`), sql`, `)})`);
  const lessonIds = courseLessons.map((l) => l.id);
  if (lessonIds.length === 0) return [];
  return db.select().from(userProgress).where(
    and(
      eq(userProgress.userId, userId),
      sql`${userProgress.lessonId} IN (${sql.join(lessonIds.map((id) => sql`${id}`), sql`, `)})`
    )
  );
}
async function completeLesson(userId, lessonId) {
  const db = await getDb();
  if (!db) return;
  const lesson = await getLessonById(lessonId);
  if (!lesson) return;
  const existing = await getUserProgressForLesson(userId, lessonId);
  if (existing?.status === "completed") return;
  const now = /* @__PURE__ */ new Date();
  if (existing) {
    await db.update(userProgress).set({ status: "completed", completedAt: now, xpEarned: lesson.xpReward }).where(eq(userProgress.id, existing.id));
  } else {
    await db.insert(userProgress).values({
      userId,
      lessonId,
      status: "completed",
      completedAt: now,
      xpEarned: lesson.xpReward
    });
  }
  await addXpToUser(userId, lesson.xpReward, `Completed lesson: ${lesson.title}`, lessonId, "lesson");
  await updateStreak(userId);
}
async function getPromptsByUser(userId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(promptLibrary).where(eq(promptLibrary.userId, userId)).orderBy(desc(promptLibrary.createdAt));
}
async function savePrompt(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(promptLibrary).values(data);
  return result[0];
}
async function deletePrompt(id, userId) {
  const db = await getDb();
  if (!db) return;
  await db.delete(promptLibrary).where(and(eq(promptLibrary.id, id), eq(promptLibrary.userId, userId)));
}
async function logSecurityEvent(data) {
  const db = await getDb();
  if (!db) return;
  await db.insert(securityEvents).values(data);
}
async function getSecurityEvents(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(securityEvents).orderBy(desc(securityEvents.createdAt)).limit(limit);
}
async function saveSandboxSession(data) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(sandboxSessions).values(data);
  return result[0];
}
async function getSandboxSessionsByUser(userId, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sandboxSessions).where(eq(sandboxSessions.userId, userId)).orderBy(desc(sandboxSessions.createdAt)).limit(limit);
}
async function getAdminAnalytics() {
  const db = await getDb();
  if (!db) return null;
  const totalUsers = await db.select({ count: sql`count(*)` }).from(users);
  const verifiedUsers = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.status, "verified"));
  const trialUsers = await db.select({ count: sql`count(*)` }).from(users).where(eq(users.status, "trial"));
  const totalCompletions = await db.select({ count: sql`count(*)` }).from(userProgress).where(eq(userProgress.status, "completed"));
  const totalSecurityEvents = await db.select({ count: sql`count(*)` }).from(securityEvents);
  const recentUsers = await db.select().from(users).orderBy(desc(users.createdAt)).limit(5);
  return {
    totalUsers: totalUsers[0]?.count ?? 0,
    verifiedUsers: verifiedUsers[0]?.count ?? 0,
    trialUsers: trialUsers[0]?.count ?? 0,
    totalCompletions: totalCompletions[0]?.count ?? 0,
    totalSecurityEvents: totalSecurityEvents[0]?.count ?? 0,
    recentUsers
  };
}
async function getQuizQuestionsByLesson(lessonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(quizQuestions).where(eq(quizQuestions.lessonId, lessonId)).orderBy(quizQuestions.order);
}
async function submitQuizAttempt(userId, lessonId, answers) {
  const db = await getDb();
  if (!db) throw new Error("DB unavailable");
  const questions = await getQuizQuestionsByLesson(lessonId);
  if (questions.length === 0) throw new Error("No quiz questions found");
  let correct = 0;
  for (let i = 0; i < questions.length; i++) {
    if (answers[i] === questions[i].correctIndex) correct++;
  }
  const score = Math.round(correct / questions.length * 100);
  const passed = score >= 70;
  await db.insert(quizAttempts).values({ userId, lessonId, score, passed, answers });
  if (passed) {
    await completeLesson(userId, lessonId);
  }
  return {
    score,
    passed,
    correct,
    total: questions.length,
    questions: questions.map((q, i) => ({
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex,
      chosenIndex: answers[i],
      explanation: q.explanation
    }))
  };
}
async function getBestQuizAttempt(userId, lessonId) {
  const db = await getDb();
  if (!db) return null;
  const attempts = await db.select().from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.lessonId, lessonId))).orderBy(desc(quizAttempts.score)).limit(1);
  return attempts[0] ?? null;
}
async function getPassedLessonIds(userId) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ lessonId: quizAttempts.lessonId }).from(quizAttempts).where(and(eq(quizAttempts.userId, userId), eq(quizAttempts.passed, true)));
  const ids = rows.map((r) => r.lessonId);
  return ids.filter((id, idx) => ids.indexOf(id) === idx);
}
async function createAccessRequest(userId, message) {
  const db = await getDb();
  if (!db) return null;
  const existing = await db.select().from(accessRequests).where(and(eq(accessRequests.userId, userId), eq(accessRequests.status, "pending"))).limit(1);
  if (existing.length > 0) return existing[0];
  const result = await db.insert(accessRequests).values({ userId, message });
  return result[0];
}
async function getAccessRequestByUser(userId) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(accessRequests).where(eq(accessRequests.userId, userId)).orderBy(desc(accessRequests.requestedAt)).limit(1);
  return result[0] ?? null;
}
async function getAllAccessRequests(status) {
  const db = await getDb();
  if (!db) return [];
  const cond = status ? eq(accessRequests.status, status) : void 0;
  const rows = await db.select({
    id: accessRequests.id,
    userId: accessRequests.userId,
    status: accessRequests.status,
    message: accessRequests.message,
    reviewedBy: accessRequests.reviewedBy,
    requestedAt: accessRequests.requestedAt,
    reviewedAt: accessRequests.reviewedAt,
    userName: users.name,
    userEmail: users.email,
    userOpenId: users.openId
  }).from(accessRequests).leftJoin(users, eq(accessRequests.userId, users.id)).where(cond).orderBy(desc(accessRequests.requestedAt)).limit(200);
  return rows;
}
async function reviewAccessRequest(requestId, reviewedBy, status) {
  const db = await getDb();
  if (!db) return;
  const req = await db.select().from(accessRequests).where(eq(accessRequests.id, requestId)).limit(1);
  if (!req[0]) return;
  await db.update(accessRequests).set({ status, reviewedBy, reviewedAt: /* @__PURE__ */ new Date() }).where(eq(accessRequests.id, requestId));
  if (status === "approved") {
    await updateUserStatus(req[0].userId, "verified");
  }
}
async function saveSandboxMessage(userId, lessonId, role, content, qualityScore, qualityFeedback, qualityPassed) {
  const db = await getDb();
  if (!db) return;
  await db.insert(sandboxMessages).values({
    userId,
    lessonId,
    role,
    content,
    qualityScore: qualityScore ?? null,
    qualityFeedback: qualityFeedback ?? null,
    qualityPassed: qualityPassed ?? false
  });
}
async function getSandboxHistory(userId, lessonId) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(sandboxMessages).where(
    and(
      eq(sandboxMessages.userId, userId),
      eq(sandboxMessages.lessonId, lessonId)
    )
  ).orderBy(sandboxMessages.createdAt);
}
async function getLessonQualityPassed(userId, lessonId) {
  const db = await getDb();
  if (!db) return false;
  const rows = await db.select({ qualityPassed: sandboxMessages.qualityPassed }).from(sandboxMessages).where(
    and(
      eq(sandboxMessages.userId, userId),
      eq(sandboxMessages.lessonId, lessonId),
      eq(sandboxMessages.role, "user"),
      eq(sandboxMessages.qualityPassed, true)
    )
  ).limit(1);
  return rows.length > 0;
}
async function getModuleById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(modules).where(eq(modules.id, id)).limit(1);
  return result[0];
}
var _db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    init_env();
    _db = null;
  }
});

// server/storage.ts
var storage_exports = {};
__export(storage_exports, {
  storageGet: () => storageGet,
  storagePut: () => storagePut
});
function getStorageConfig() {
  const baseUrl = ENV.forgeApiUrl;
  const apiKey = ENV.forgeApiKey;
  if (!baseUrl || !apiKey) {
    throw new Error(
      "Storage proxy credentials missing: set BUILT_IN_FORGE_API_URL and BUILT_IN_FORGE_API_KEY"
    );
  }
  return { baseUrl: baseUrl.replace(/\/+$/, ""), apiKey };
}
function buildUploadUrl(baseUrl, relKey) {
  const url = new URL("v1/storage/upload", ensureTrailingSlash(baseUrl));
  url.searchParams.set("path", normalizeKey(relKey));
  return url;
}
async function buildDownloadUrl(baseUrl, relKey, apiKey) {
  const downloadApiUrl = new URL(
    "v1/storage/downloadUrl",
    ensureTrailingSlash(baseUrl)
  );
  downloadApiUrl.searchParams.set("path", normalizeKey(relKey));
  const response = await fetch(downloadApiUrl, {
    method: "GET",
    headers: buildAuthHeaders(apiKey)
  });
  return (await response.json()).url;
}
function ensureTrailingSlash(value) {
  return value.endsWith("/") ? value : `${value}/`;
}
function normalizeKey(relKey) {
  return relKey.replace(/^\/+/, "");
}
function toFormData(data, contentType, fileName) {
  const blob = typeof data === "string" ? new Blob([data], { type: contentType }) : new Blob([data], { type: contentType });
  const form = new FormData();
  form.append("file", blob, fileName || "file");
  return form;
}
function buildAuthHeaders(apiKey) {
  return { Authorization: `Bearer ${apiKey}` };
}
async function storagePut(relKey, data, contentType = "application/octet-stream") {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  const uploadUrl = buildUploadUrl(baseUrl, key);
  const formData = toFormData(data, contentType, key.split("/").pop() ?? key);
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: buildAuthHeaders(apiKey),
    body: formData
  });
  if (!response.ok) {
    const message = await response.text().catch(() => response.statusText);
    throw new Error(
      `Storage upload failed (${response.status} ${response.statusText}): ${message}`
    );
  }
  const url = (await response.json()).url;
  return { key, url };
}
async function storageGet(relKey) {
  const { baseUrl, apiKey } = getStorageConfig();
  const key = normalizeKey(relKey);
  return {
    key,
    url: await buildDownloadUrl(baseUrl, key, apiKey)
  };
}
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_env();
  }
});

// server/_core/index.ts
import "dotenv/config";
import express3 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/_core/oauth.ts
init_db();

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
init_db();
init_env();
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";

// server/stripe/client.ts
import Stripe from "stripe";
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("[Stripe] STRIPE_SECRET_KEY is not set \u2014 payment features will be unavailable.");
}
var stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", {
  apiVersion: "2026-01-28.clover"
});

// server/stripe/products.ts
var PLANS = [
  {
    id: "lifetime",
    name: "Lifetime Access",
    description: "One payment. Permanent access to every module, lesson, and future update \u2014 forever.",
    priceId: process.env.STRIPE_PRICE_LIFETIME ?? "price_lifetime_placeholder",
    amount: 67500,
    // $675 one-time
    currency: "usd",
    mode: "payment",
    badge: "One-Time Payment",
    features: [
      "All 7 AI Business Modules (36 lessons)",
      "AI Sandbox \u2014 unlimited practice sessions",
      "Prompt Library \u2014 save, rate & reuse your best prompts",
      "Quiz & XP tracking with completion certificates",
      "All future modules included at no extra cost",
      "Lifetime certificate updates",
      "Priority support"
    ]
  }
];
function getPlanById(id) {
  return PLANS.find((p) => p.id === id);
}

// server/routers.ts
init_schema();
import { eq as eq2, desc as desc2 } from "drizzle-orm";
import { z as z2 } from "zod";

// server/_core/llm.ts
init_env();
var ensureArray = (value) => Array.isArray(value) ? value : [value];
var normalizeContentPart = (part) => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }
  if (part.type === "text") {
    return part;
  }
  if (part.type === "image_url") {
    return part;
  }
  if (part.type === "file_url") {
    return part;
  }
  throw new Error("Unsupported message content part");
};
var normalizeMessage = (message) => {
  const { role, name, tool_call_id } = message;
  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content).map((part) => typeof part === "string" ? part : JSON.stringify(part)).join("\n");
    return {
      role,
      name,
      tool_call_id,
      content
    };
  }
  const contentParts = ensureArray(message.content).map(normalizeContentPart);
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text
    };
  }
  return {
    role,
    name,
    content: contentParts
  };
};
var normalizeToolChoice = (toolChoice, tools) => {
  if (!toolChoice) return void 0;
  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }
  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }
    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }
    return {
      type: "function",
      function: { name: tools[0].function.name }
    };
  }
  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name }
    };
  }
  return toolChoice;
};
var resolveApiUrl = () => ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0 ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/chat/completions` : "https://forge.manus.im/v1/chat/completions";
var assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
};
var normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema
}) => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (explicitFormat.type === "json_schema" && !explicitFormat.json_schema?.schema) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }
  const schema = outputSchema || output_schema;
  if (!schema) return void 0;
  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }
  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...typeof schema.strict === "boolean" ? { strict: schema.strict } : {}
    }
  };
};
async function invokeLLM(params) {
  assertApiKey();
  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format
  } = params;
  const payload = {
    model: "gemini-2.5-flash",
    messages: messages.map(normalizeMessage)
  };
  if (tools && tools.length > 0) {
    payload.tools = tools;
  }
  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }
  payload.max_tokens = 32768;
  payload.thinking = {
    "budget_tokens": 128
  };
  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema
  });
  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }
  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} \u2013 ${errorText}`
    );
  }
  return await response.json();
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
init_env();
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
init_db();
function requireEditor(role) {
  if (role !== "admin" && role !== "editor") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Editor or admin role required" });
  }
}
function requireAdmin(role) {
  if (role !== "admin") {
    throw new TRPCError3({ code: "FORBIDDEN", message: "Admin role required" });
  }
}
var appRouter = router({
  system: systemRouter,
  // ── Auth ──────────────────────────────────────────────────────────────────
  auth: router({
    me: publicProcedure.query(async (opts) => {
      if (!opts.ctx.user) return null;
      const full = await getUserById(opts.ctx.user.id);
      return full ?? opts.ctx.user;
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  // ── Courses ───────────────────────────────────────────────────────────────
  courses: router({
    list: publicProcedure.input(z2.object({ all: z2.boolean().optional() }).optional()).query(({ input }) => getCourses(!input?.all)),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(({ input }) => getCourseBySlug(input.slug)),
    create: protectedProcedure.input(z2.object({
      slug: z2.string().min(2),
      title: z2.string().min(2),
      description: z2.string().optional(),
      difficulty: z2.enum(["beginner", "intermediate", "advanced"]).optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      return createCourse({ ...input, authorId: ctx.user.id });
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      difficulty: z2.enum(["beginner", "intermediate", "advanced"]).optional(),
      isPublished: z2.boolean().optional(),
      isPremium: z2.boolean().optional(),
      thumbnailUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      const { id, ...data } = input;
      await updateCourse(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await deleteCourse(input.id);
      return { success: true };
    })
  }),
  // ── Modules ───────────────────────────────────────────────────────────────
  modules: router({
    byCourse: publicProcedure.input(z2.object({ courseId: z2.number(), all: z2.boolean().optional() })).query(({ input }) => getModulesByCourse(input.courseId, !input.all)),
    create: protectedProcedure.input(z2.object({
      courseId: z2.number(),
      slug: z2.string().min(2),
      title: z2.string().min(2),
      description: z2.string().optional(),
      order: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      return createModule(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      order: z2.number().optional(),
      isPublished: z2.boolean().optional(),
      xpReward: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      const { id, ...data } = input;
      await updateModule(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await deleteModule(input.id);
      return { success: true };
    })
  }),
  // ── Lessons ───────────────────────────────────────────────────────────────
  lessons: router({
    byModule: publicProcedure.input(z2.object({ moduleId: z2.number(), all: z2.boolean().optional() })).query(({ input }) => getLessonsByModule(input.moduleId, !input.all)),
    bySlug: publicProcedure.input(z2.object({ slug: z2.string() })).query(({ input }) => getLessonBySlug(input.slug)),
    byId: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getLessonById(input.id)),
    create: protectedProcedure.input(z2.object({
      moduleId: z2.number(),
      slug: z2.string().min(2),
      title: z2.string().min(2),
      order: z2.number().optional(),
      type: z2.enum(["text", "video", "interactive", "quiz"]).optional(),
      xpReward: z2.number().optional(),
      estimatedMinutes: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      return createLesson(input);
    }),
    update: protectedProcedure.input(z2.object({
      id: z2.number(),
      title: z2.string().optional(),
      description: z2.string().optional(),
      order: z2.number().optional(),
      type: z2.enum(["text", "video", "interactive", "quiz"]).optional(),
      isPremium: z2.boolean().optional(),
      isPublished: z2.boolean().optional(),
      xpReward: z2.number().optional(),
      estimatedMinutes: z2.number().optional()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      const { id, ...data } = input;
      await updateLesson(id, data);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await deleteLesson(input.id);
      return { success: true };
    }),
    // ── Adjacent lesson navigation ─────────────────────────────────────────
    adjacent: publicProcedure.input(z2.object({ lessonId: z2.number() })).query(async ({ input }) => {
      const lesson = await getLessonById(input.lessonId);
      if (!lesson) return { prev: null, next: null };
      const currentMod = await getModuleById(lesson.moduleId);
      if (!currentMod) return { prev: null, next: null };
      const modLessons = await getLessonsByModule(lesson.moduleId, false);
      const idx = modLessons.findIndex((l) => l.id === lesson.id);
      let prev = null;
      let next = null;
      if (idx > 0) {
        const p = modLessons[idx - 1];
        prev = { id: p.id, slug: p.slug, title: p.title };
      } else {
        const allMods = await getModulesByCourse(currentMod.courseId, false);
        const modIdx = allMods.findIndex((m) => m.id === lesson.moduleId);
        if (modIdx > 0) {
          const prevMod = allMods[modIdx - 1];
          const prevModLessons = await getLessonsByModule(prevMod.id, false);
          if (prevModLessons.length > 0) {
            const p = prevModLessons[prevModLessons.length - 1];
            prev = { id: p.id, slug: p.slug, title: p.title };
          }
        }
      }
      if (idx < modLessons.length - 1) {
        const n = modLessons[idx + 1];
        next = { id: n.id, slug: n.slug, title: n.title };
      } else {
        const allMods = await getModulesByCourse(currentMod.courseId, false);
        const modIdx = allMods.findIndex((m) => m.id === lesson.moduleId);
        if (modIdx < allMods.length - 1) {
          const nextMod = allMods[modIdx + 1];
          const nextModLessons = await getLessonsByModule(nextMod.id, false);
          if (nextModLessons.length > 0) {
            const n = nextModLessons[0];
            next = { id: n.id, slug: n.slug, title: n.title };
          }
        }
      }
      return { prev, next };
    })
  }),
  // ── Content Blocks ────────────────────────────────────────────────────────
  content: router({
    byLesson: publicProcedure.input(z2.object({ lessonId: z2.number() })).query(({ input }) => getContentBlocksByLesson(input.lessonId)),
    saveBlocks: protectedProcedure.input(z2.object({
      lessonId: z2.number(),
      blocks: z2.array(z2.object({
        type: z2.enum(["text", "image", "video", "audio", "code", "quiz", "prompt_exercise", "callout", "divider"]),
        order: z2.number(),
        content: z2.any()
      }))
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await deleteContentBlocksByLesson(input.lessonId);
      for (const block of input.blocks) {
        await upsertContentBlock({
          lessonId: input.lessonId,
          type: block.type,
          order: block.order,
          content: block.content
        });
      }
      return { success: true };
    }),
    upsert: protectedProcedure.input(z2.object({
      id: z2.number().optional(),
      lessonId: z2.number(),
      type: z2.enum(["text", "image", "video", "audio", "code", "quiz", "prompt_exercise", "callout", "divider"]),
      order: z2.number().optional(),
      content: z2.any()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await upsertContentBlock(input);
      return { success: true };
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      await deleteContentBlock(input.id);
      return { success: true };
    })
  }),
  // ── Progress ──────────────────────────────────────────────────────────────
  progress: router({
    forLesson: protectedProcedure.input(z2.object({ lessonId: z2.number() })).query(({ ctx, input }) => getUserProgressForLesson(ctx.user.id, input.lessonId)),
    forCourse: protectedProcedure.input(z2.object({ courseId: z2.number() })).query(({ ctx, input }) => getUserProgressForCourse(ctx.user.id, input.courseId)),
    complete: protectedProcedure.input(z2.object({ lessonId: z2.number() })).mutation(async ({ ctx, input }) => {
      await completeLesson(ctx.user.id, input.lessonId);
      const stats = await getUserStats(ctx.user.id);
      return { success: true, stats };
    }),
    myStats: protectedProcedure.query(({ ctx }) => getUserStats(ctx.user.id))
  }),
  // ── AI Sandbox ────────────────────────────────────────────────────────────
  sandbox: router({
    chat: protectedProcedure.input(z2.object({
      messages: z2.array(z2.object({
        role: z2.enum(["system", "user", "assistant"]),
        content: z2.string()
      })),
      model: z2.string().default("gpt-4o"),
      temperature: z2.number().min(0).max(2).default(0.7),
      maxTokens: z2.number().min(1).max(4e3).default(1e3)
    })).mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: input.messages,
        max_tokens: input.maxTokens
      });
      const content = response.choices?.[0]?.message?.content ?? "";
      await saveSandboxSession({
        userId: ctx.user.id,
        model: input.model,
        messages: [...input.messages, { role: "assistant", content }],
        totalTokens: response.usage?.total_tokens ?? 0
      });
      return { content, usage: response.usage };
    }),
    history: protectedProcedure.query(({ ctx }) => getSandboxSessionsByUser(ctx.user.id)),
    // ── Lesson-scoped sandbox message history ──────────────────────────────
    saveMessage: protectedProcedure.input(z2.object({
      lessonId: z2.number(),
      role: z2.enum(["user", "assistant"]),
      content: z2.string(),
      qualityScore: z2.number().optional(),
      qualityFeedback: z2.string().optional(),
      qualityPassed: z2.boolean().optional()
    })).mutation(async ({ ctx, input }) => {
      await saveSandboxMessage(
        ctx.user.id,
        input.lessonId,
        input.role,
        input.content,
        input.qualityScore,
        input.qualityFeedback,
        input.qualityPassed
      );
      return { ok: true };
    }),
    getLessonHistory: protectedProcedure.input(z2.object({ lessonId: z2.number() })).query(({ ctx, input }) => getSandboxHistory(ctx.user.id, input.lessonId)),
    scoreQuality: protectedProcedure.input(z2.object({
      lessonId: z2.number(),
      lessonTitle: z2.string(),
      prompt: z2.string()
    })).mutation(async ({ ctx, input }) => {
      const scoringPrompt = `You are an AI learning quality assessor for a business AI mastery course.

Lesson: "${input.lessonTitle}"
Student prompt submitted: "${input.prompt}"

Score this prompt on a scale of 0-100 based on:
- Relevance to the lesson topic (0-40 points)
- Specificity and clarity (0-30 points)
- Practical business application (0-30 points)

Respond with ONLY valid JSON in this exact format:
{"score": <number 0-100>, "passed": <true if score >= 60>, "feedback": "<one sentence tip to improve>"}`;
      try {
        const response = await invokeLLM({
          messages: [{ role: "user", content: scoringPrompt }],
          max_tokens: 200
        });
        const rawContent = response.choices?.[0]?.message?.content ?? "";
        const raw = typeof rawContent === "string" ? rawContent : JSON.stringify(rawContent);
        const jsonMatch = raw.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON in response");
        const result = JSON.parse(jsonMatch[0]);
        await saveSandboxMessage(
          ctx.user.id,
          input.lessonId,
          "user",
          input.prompt,
          result.score,
          result.feedback,
          result.passed
        );
        return result;
      } catch {
        const wordCount = input.prompt.trim().split(/\s+/).length;
        const passed = wordCount >= 20;
        const score = Math.min(100, wordCount * 3);
        await saveSandboxMessage(
          ctx.user.id,
          input.lessonId,
          "user",
          input.prompt,
          score,
          passed ? "Good effort! Keep practising." : "Try to write a more detailed prompt (at least 20 words).",
          passed
        );
        return { score, passed, feedback: passed ? "Good effort!" : "Try a more detailed prompt." };
      }
    }),
    qualityPassed: protectedProcedure.input(z2.object({ lessonId: z2.number() })).query(({ ctx, input }) => getLessonQualityPassed(ctx.user.id, input.lessonId))
  }),
  // ── Prompt Library ────────────────────────────────────────────────────────
  prompts: router({
    list: protectedProcedure.query(({ ctx }) => getPromptsByUser(ctx.user.id)),
    save: protectedProcedure.input(z2.object({
      title: z2.string().min(1),
      systemPrompt: z2.string().optional(),
      userPrompt: z2.string().min(1),
      model: z2.string().default("gpt-4o"),
      temperature: z2.number().default(0.7)
    })).mutation(async ({ ctx, input }) => {
      return savePrompt({ ...input, userId: ctx.user.id });
    }),
    delete: protectedProcedure.input(z2.object({ id: z2.number() })).mutation(({ ctx, input }) => deletePrompt(input.id, ctx.user.id))
  }),
  // ── Security ──────────────────────────────────────────────────────────────
  security: router({
    report: publicProcedure.input(z2.object({
      type: z2.enum(["screenshot", "print", "devtools", "copy", "suspicious"]),
      details: z2.string().optional(),
      pageUrl: z2.string().optional()
    })).mutation(async ({ ctx, input }) => {
      await logSecurityEvent({
        userId: ctx.user?.id,
        type: input.type,
        details: input.details,
        pageUrl: input.pageUrl,
        ipAddress: ctx.req.headers["x-forwarded-for"] ?? void 0
      });
      return { success: true };
    }),
    events: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx.user.role);
      return getSecurityEvents(100);
    })
  }),
  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: router({
    analytics: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx.user.role);
      return getAdminAnalytics();
    }),
    users: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx.user.role);
      return getAllUsers(200);
    }),
    setUserStatus: protectedProcedure.input(z2.object({
      userId: z2.number(),
      status: z2.enum(["trial", "verified", "banned"])
    })).mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      await updateUserStatus(input.userId, input.status);
      return { success: true };
    }),
    setUserRole: protectedProcedure.input(z2.object({
      userId: z2.number(),
      role: z2.enum(["user", "admin", "editor"])
    })).mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      await updateUserRole(input.userId, input.role);
      return { success: true };
    }),
    awardXp: protectedProcedure.input(z2.object({
      userId: z2.number(),
      amount: z2.number(),
      reason: z2.string()
    })).mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      await addXpToUser(input.userId, input.amount, input.reason);
      return { success: true };
    }),
    getUserProfile: protectedProcedure.input(z2.object({ userId: z2.number() })).query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const profile = await getUserProfile(input.userId);
      const xpHistory = await getUserXpHistory(input.userId, 20);
      return { profile, xpHistory };
    }),
    deleteUser: protectedProcedure.input(z2.object({ userId: z2.number() })).mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      const db = await (await Promise.resolve().then(() => (init_db(), db_exports))).getDb();
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const { users: usersTable } = await Promise.resolve().then(() => (init_schema(), schema_exports));
      const { eq: eq4 } = await import("drizzle-orm");
      await db.delete(usersTable).where(eq4(usersTable.id, input.userId));
      return { success: true };
    })
  }),
  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: router({
    questions: publicProcedure.input(z2.object({ lessonId: z2.number() })).query(({ input }) => getQuizQuestionsByLesson(input.lessonId)),
    bestAttempt: protectedProcedure.input(z2.object({ lessonId: z2.number() })).query(({ ctx, input }) => getBestQuizAttempt(ctx.user.id, input.lessonId)),
    submit: protectedProcedure.input(z2.object({
      lessonId: z2.number(),
      answers: z2.array(z2.number())
    })).mutation(async ({ ctx, input }) => {
      return submitQuizAttempt(ctx.user.id, input.lessonId, input.answers);
    })
  }),
  // ── Gating ────────────────────────────────────────────────────────────────
  gating: router({
    // Returns which lesson IDs the current user has passed quizzes for
    passedLessons: protectedProcedure.query(({ ctx }) => getPassedLessonIds(ctx.user.id)),
    // Returns full course structure with lock status for each lesson
    courseAccess: protectedProcedure.input(z2.object({ courseId: z2.number() })).query(async ({ ctx, input }) => {
      const user = await getUserById(ctx.user.id);
      const hasActiveSubscription = user?.subscriptionStatus === "active" || user?.subscriptionStatus === "trialing";
      const isVerified = hasActiveSubscription || user?.status === "verified" || user?.role === "admin" || user?.role === "editor";
      const courseModules = await getModulesByCourse(input.courseId, false);
      const passedIds = await getPassedLessonIds(ctx.user.id);
      const passedSet = new Set(passedIds);
      const result = [];
      let prevModuleAllPassed = true;
      for (let mi = 0; mi < courseModules.length; mi++) {
        const mod = courseModules[mi];
        const modLessons = await getLessonsByModule(mod.id, false);
        const moduleLocked = mi > 0 && !prevModuleAllPassed;
        const lessonsWithAccess = modLessons.map((lesson, li) => {
          const isFreePreview = mi === 0 && li === 0;
          let locked = false;
          if (!isFreePreview) {
            if (!isVerified) {
              locked = true;
            } else if (moduleLocked) {
              locked = true;
            } else if (li > 0) {
              const prevLesson = modLessons[li - 1];
              locked = !passedSet.has(prevLesson.id);
            }
          }
          return { ...lesson, locked, isFreePreview };
        });
        const allPassed = modLessons.every((l) => passedSet.has(l.id));
        prevModuleAllPassed = allPassed;
        result.push({ ...mod, locked: moduleLocked, lessons: lessonsWithAccess });
      }
      return { modules: result, isVerified, hasActiveSubscription };
    })
  }),
  // ── Access Requests ───────────────────────────────────────────────────────
  access: router({
    myRequest: protectedProcedure.query(({ ctx }) => getAccessRequestByUser(ctx.user.id)),
    request: protectedProcedure.input(z2.object({ message: z2.string().optional() })).mutation(async ({ ctx, input }) => {
      return createAccessRequest(ctx.user.id, input.message);
    }),
    // Admin: list all requests
    list: protectedProcedure.input(z2.object({ status: z2.enum(["pending", "approved", "denied"]).optional() })).query(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      return getAllAccessRequests(input.status);
    }),
    // Admin: approve or deny
    review: protectedProcedure.input(z2.object({
      requestId: z2.number(),
      decision: z2.enum(["approved", "denied"])
    })).mutation(async ({ ctx, input }) => {
      requireAdmin(ctx.user.role);
      await reviewAccessRequest(input.requestId, ctx.user.id, input.decision);
      return { success: true };
    })
  }),
  // ── Stripe Payments ──────────────────────────────────────────────────────
  stripe: router({
    // List available plans (public)
    plans: publicProcedure.query(() => PLANS),
    // Get current user's subscription status
    mySubscription: protectedProcedure.query(async ({ ctx }) => {
      const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((m) => m.getDb());
      if (!db) return null;
      const [user] = await db.select().from(await Promise.resolve().then(() => (init_schema(), schema_exports)).then((m) => m.users)).where(eq2((await Promise.resolve().then(() => (init_schema(), schema_exports))).users.id, ctx.user.id));
      if (!user) return null;
      return {
        status: user.subscriptionStatus,
        plan: user.subscriptionPlan,
        periodEnd: user.subscriptionPeriodEnd,
        isActive: user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing"
      };
    }),
    // Create a Stripe Checkout session
    createCheckout: protectedProcedure.input(
      z2.object({
        planId: z2.enum(["lifetime"]),
        origin: z2.string().url()
      })
    ).mutation(async ({ ctx, input }) => {
      const plan = getPlanById(input.planId);
      if (!plan) throw new TRPCError3({ code: "BAD_REQUEST", message: "Invalid plan" });
      const commonParams = {
        line_items: [{ price: plan.priceId, quantity: 1 }],
        client_reference_id: ctx.user.id.toString(),
        customer_email: ctx.user.email ?? void 0,
        allow_promotion_codes: true,
        success_url: `${input.origin}/pricing?success=1&plan=${plan.id}`,
        cancel_url: `${input.origin}/pricing?canceled=1`,
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          plan: plan.id
        }
      };
      const session = await stripe.checkout.sessions.create({ ...commonParams, mode: "payment" });
      return { url: session.url };
    }),
    // Create a Stripe Customer Portal session (manage/cancel subscription)
    createPortal: protectedProcedure.input(z2.object({ origin: z2.string().url() })).mutation(async ({ ctx, input }) => {
      const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((m) => m.getDb());
      if (!db) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR" });
      const [user] = await db.select().from(await Promise.resolve().then(() => (init_schema(), schema_exports)).then((m) => m.users)).where(eq2((await Promise.resolve().then(() => (init_schema(), schema_exports))).users.id, ctx.user.id));
      if (!user?.stripeCustomerId) {
        throw new TRPCError3({
          code: "BAD_REQUEST",
          message: "No Stripe customer found. Please subscribe first."
        });
      }
      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripeCustomerId,
        return_url: `${input.origin}/profile`
      });
      return { url: session.url };
    }),
    // Payment history for current user
    myPayments: protectedProcedure.query(async ({ ctx }) => {
      const db = await Promise.resolve().then(() => (init_db(), db_exports)).then((m) => m.getDb());
      if (!db) return [];
      const payments = await db.select().from(stripePayments).where(eq2(stripePayments.userId, ctx.user.id)).orderBy(desc2(stripePayments.createdAt));
      return payments;
    })
  }),
  // ── File Upload ───────────────────────────────────────────────────────────
  upload: router({
    getPresignedUrl: protectedProcedure.input(z2.object({
      filename: z2.string(),
      contentType: z2.string()
    })).mutation(async ({ ctx, input }) => {
      requireEditor(ctx.user.role);
      const { storagePut: storagePut2 } = await Promise.resolve().then(() => (init_storage(), storage_exports));
      const key = `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`;
      return { key, uploadUrl: `/api/upload/${key}` };
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs2 from "fs";
import { nanoid } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var PROJECT_ROOT = import.meta.dirname;
var LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");
var MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
var TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);
function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}
function trimLogFile(logPath, maxSize) {
  try {
    if (!fs.existsSync(logPath) || fs.statSync(logPath).size <= maxSize) {
      return;
    }
    const lines = fs.readFileSync(logPath, "utf-8").split("\n");
    const keptLines = [];
    let keptBytes = 0;
    const targetSize = TRIM_TARGET_BYTES;
    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}
`, "utf-8");
      if (keptBytes + lineBytes > targetSize) break;
      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }
    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
  }
}
function writeToLogFile(source, entries) {
  if (entries.length === 0) return;
  ensureLogDir();
  const logPath = path.join(LOG_DIR, `${source}.log`);
  const lines = entries.map((entry) => {
    const ts = (/* @__PURE__ */ new Date()).toISOString();
    return `[${ts}] ${JSON.stringify(entry)}`;
  });
  fs.appendFileSync(logPath, `${lines.join("\n")}
`, "utf-8");
  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}
function vitePluginManusDebugCollector() {
  return {
    name: "manus-debug-collector",
    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }
      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true
            },
            injectTo: "head"
          }
        ]
      };
    },
    configureServer(server) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") {
          return next();
        }
        const handlePayload = (payload) => {
          if (payload.consoleLogs?.length > 0) {
            writeToLogFile("browserConsole", payload.consoleLogs);
          }
          if (payload.networkRequests?.length > 0) {
            writeToLogFile("networkRequests", payload.networkRequests);
          }
          if (payload.sessionEvents?.length > 0) {
            writeToLogFile("sessionReplay", payload.sessionEvents);
          }
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ success: true }));
        };
        const reqBody = req.body;
        if (reqBody && typeof reqBody === "object") {
          try {
            handlePayload(reqBody);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
          return;
        }
        let body = "";
        req.on("data", (chunk) => {
          body += chunk.toString();
        });
        req.on("end", () => {
          try {
            const payload = JSON.parse(body);
            handlePayload(payload);
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    }
  };
}
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime(), vitePluginManusDebugCollector()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/stripe/webhook.ts
import express2 from "express";
init_db();
init_schema();
import { eq as eq3 } from "drizzle-orm";
function registerStripeWebhook(app) {
  app.post(
    "/api/stripe/webhook",
    express2.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      let event;
      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          webhookSecret ?? ""
        );
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        console.error("[Webhook] Signature verification failed:", message);
        return res.status(400).send(`Webhook Error: ${message}`);
      }
      if (event.id.startsWith("evt_test_")) {
        console.log("[Webhook] Test event detected, returning verification response");
        return res.json({ verified: true });
      }
      console.log(`[Webhook] ${event.type} \u2014 ${event.id}`);
      try {
        switch (event.type) {
          // ── Checkout completed (subscription or one-time) ─────────────────
          case "checkout.session.completed": {
            const session = event.data.object;
            const userId = session.client_reference_id ? parseInt(session.client_reference_id) : null;
            if (!userId) break;
            const customerId = session.customer;
            const plan = session.metadata?.plan ?? "monthly";
            const db = await getDb();
            if (!db) break;
            if (customerId) {
              await db.update(users).set({ stripeCustomerId: customerId }).where(eq3(users.id, userId));
            }
            if (session.mode === "subscription" && session.subscription) {
              const sub = await stripe.subscriptions.retrieve(
                session.subscription
              );
              const periodEnd = sub.current_period_end;
              await db.update(users).set({
                stripeSubscriptionId: sub.id,
                subscriptionStatus: sub.status,
                subscriptionPlan: plan,
                subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1e3) : void 0,
                status: "verified"
              }).where(eq3(users.id, userId));
            }
            if (session.mode === "payment" && session.payment_intent) {
              await db.update(users).set({
                subscriptionStatus: "active",
                subscriptionPlan: "lifetime",
                subscriptionPeriodEnd: /* @__PURE__ */ new Date("2099-12-31"),
                status: "verified"
              }).where(eq3(users.id, userId));
              await db.insert(stripePayments).values({
                userId,
                stripePaymentIntentId: session.payment_intent,
                stripeCustomerId: customerId,
                amount: session.amount_total ?? 67500,
                currency: session.currency ?? "usd",
                status: "succeeded",
                plan: "lifetime"
              });
              const buyerName = session.metadata?.customer_name ?? "Unknown";
              const buyerEmail = session.metadata?.customer_email ?? "Unknown";
              const amountFormatted = `$${((session.amount_total ?? 67500) / 100).toFixed(2)}`;
              await notifyOwner({
                title: `\u{1F389} New Sale \u2014 E-Quipped Lifetime Access`,
                content: `A new Lifetime Access purchase has been completed.

**Buyer:** ${buyerName}
**Email:** ${buyerEmail}
**Amount:** ${amountFormatted} USD
**Plan:** Lifetime (one-time)
**Payment Intent:** ${session.payment_intent}

The user's account has been automatically upgraded to verified status with full course access.`
              }).catch((err) => {
                console.error("[Webhook] notifyOwner failed:", err);
              });
            }
            break;
          }
          // ── Subscription updated ──────────────────────────────────────────
          case "customer.subscription.updated": {
            const sub = event.data.object;
            const dbU = await getDb();
            if (!dbU) break;
            const [user] = await dbU.select().from(users).where(eq3(users.stripeSubscriptionId, sub.id));
            if (user) {
              await dbU.update(users).set({
                subscriptionStatus: sub.status,
                subscriptionPeriodEnd: new Date(sub.current_period_end * 1e3)
              }).where(eq3(users.id, user.id));
            }
            break;
          }
          // ── Subscription deleted / cancelled ──────────────────────────────
          case "customer.subscription.deleted": {
            const sub = event.data.object;
            const dbD = await getDb();
            if (!dbD) break;
            const [userD] = await dbD.select().from(users).where(eq3(users.stripeSubscriptionId, sub.id));
            if (userD) {
              await dbD.update(users).set({ subscriptionStatus: "canceled" }).where(eq3(users.id, userD.id));
            }
            break;
          }
          // ── Invoice paid (recurring renewal) ─────────────────────────────
          case "invoice.paid": {
            const invoice = event.data.object;
            if (invoice.subscription) {
              const sub = await stripe.subscriptions.retrieve(
                invoice.subscription
              );
              const periodEnd = sub.current_period_end;
              const dbI = await getDb();
              if (!dbI) break;
              const [userI] = await dbI.select().from(users).where(eq3(users.stripeSubscriptionId, sub.id));
              if (userI) {
                await dbI.update(users).set({
                  subscriptionStatus: "active",
                  subscriptionPeriodEnd: periodEnd ? new Date(periodEnd * 1e3) : void 0
                }).where(eq3(users.id, userI.id));
                if (invoice.payment_intent) {
                  await dbI.insert(stripePayments).values({
                    userId: userI.id,
                    stripePaymentIntentId: invoice.payment_intent,
                    stripeCustomerId: invoice.customer,
                    amount: invoice.amount_paid ?? 0,
                    currency: invoice.currency ?? "usd",
                    status: "succeeded",
                    plan: userI.subscriptionPlan ?? "monthly"
                  });
                }
              }
            }
            break;
          }
          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }
      } catch (err) {
        console.error("[Webhook] Handler error:", err);
        return res.status(500).json({ error: "Webhook handler failed" });
      }
      res.json({ received: true });
    }
  );
}

// server/_core/index.ts
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express3();
  const server = createServer(app);
  registerStripeWebhook(app);
  app.use(express3.json({ limit: "50mb" }));
  app.use(express3.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
