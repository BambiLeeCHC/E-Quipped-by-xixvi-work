import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  addXpToUser,
  completeLesson,
  createAccessRequest,
  createCourse,
  createLesson,
  createModule,
  deleteCourse,
  deleteContentBlock,
  deleteContentBlocksByLesson,
  deleteLesson,
  deleteModule,
  deletePrompt,
  getAccessRequestByUser,
  getAdminAnalytics,
  getAllAccessRequests,
  getAllUsers,
  getBestQuizAttempt,
  getUserProfile,
  getUserXpHistory,
  getContentBlocksByLesson,
  getCourseBySlug,
  getCourses,
  getLessonById,
  getLessonBySlug,
  getLessonsByModule,
  getModulesByCourse,
  getPassedLessonIds,
  getPromptsByUser,
  getQuizQuestionsByLesson,
  getSandboxSessionsByUser,
  getSecurityEvents,
  getUserById,
  getUserProgressForCourse,
  getUserProgressForLesson,
  getUserStats,
  logSecurityEvent,
  reviewAccessRequest,
  savePrompt,
  saveSandboxSession,
  submitQuizAttempt,
  updateCourse,
  updateLesson,
  updateModule,
  updateUserRole,
  updateUserStatus,
  upsertContentBlock,
} from "./db";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function requireEditor(role: string) {
  if (role !== "admin" && role !== "editor") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Editor or admin role required" });
  }
}
function requireAdmin(role: string) {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin role required" });
  }
}

// ─── Router ───────────────────────────────────────────────────────────────────
export const appRouter = router({
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
      return { success: true } as const;
    }),
  }),

  // ── Courses ───────────────────────────────────────────────────────────────
  courses: router({
    list: publicProcedure
      .input(z.object({ all: z.boolean().optional() }).optional())
      .query(({ input }) => getCourses(!input?.all)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getCourseBySlug(input.slug)),

    create: protectedProcedure
      .input(z.object({
        slug: z.string().min(2),
        title: z.string().min(2),
        description: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        return createCourse({ ...input, authorId: ctx.user.id });
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        isPublished: z.boolean().optional(),
        isPremium: z.boolean().optional(),
        thumbnailUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        const { id, ...data } = input;
        await updateCourse(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        await deleteCourse(input.id);
        return { success: true };
      }),
  }),

  // ── Modules ───────────────────────────────────────────────────────────────
  modules: router({
    byCourse: publicProcedure
      .input(z.object({ courseId: z.number(), all: z.boolean().optional() }))
      .query(({ input }) => getModulesByCourse(input.courseId, !input.all)),

    create: protectedProcedure
      .input(z.object({
        courseId: z.number(),
        slug: z.string().min(2),
        title: z.string().min(2),
        description: z.string().optional(),
        order: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        return createModule(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
        isPublished: z.boolean().optional(),
        xpReward: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        const { id, ...data } = input;
        await updateModule(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        await deleteModule(input.id);
        return { success: true };
      }),
  }),

  // ── Lessons ───────────────────────────────────────────────────────────────
  lessons: router({
    byModule: publicProcedure
      .input(z.object({ moduleId: z.number(), all: z.boolean().optional() }))
      .query(({ input }) => getLessonsByModule(input.moduleId, !input.all)),

    bySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getLessonBySlug(input.slug)),

    byId: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getLessonById(input.id)),

    create: protectedProcedure
      .input(z.object({
        moduleId: z.number(),
        slug: z.string().min(2),
        title: z.string().min(2),
        order: z.number().optional(),
        type: z.enum(["text", "video", "interactive", "quiz"]).optional(),
        xpReward: z.number().optional(),
        estimatedMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        return createLesson(input);
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        order: z.number().optional(),
        type: z.enum(["text", "video", "interactive", "quiz"]).optional(),
        isPremium: z.boolean().optional(),
        isPublished: z.boolean().optional(),
        xpReward: z.number().optional(),
        estimatedMinutes: z.number().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        const { id, ...data } = input;
        await updateLesson(id, data);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        await deleteLesson(input.id);
        return { success: true };
      }),
  }),

  // ── Content Blocks ────────────────────────────────────────────────────────
  content: router({
    byLesson: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(({ input }) => getContentBlocksByLesson(input.lessonId)),

    saveBlocks: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        blocks: z.array(z.object({
          type: z.enum(["text", "image", "video", "audio", "code", "quiz", "prompt_exercise", "callout", "divider"]),
          order: z.number(),
          content: z.any(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        // Delete all existing blocks for this lesson then re-insert
        await deleteContentBlocksByLesson(input.lessonId);
        for (const block of input.blocks) {
          await upsertContentBlock({
            lessonId: input.lessonId,
            type: block.type as any,
            order: block.order,
            content: block.content,
          });
        }
        return { success: true };
      }),
    upsert: protectedProcedure
      .input(z.object({
        id: z.number().optional(),
        lessonId: z.number(),
        type: z.enum(["text", "image", "video", "audio", "code", "quiz", "prompt_exercise", "callout", "divider"]),
        order: z.number().optional(),
        content: z.any(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        await upsertContentBlock(input as any);
        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        await deleteContentBlock(input.id);
        return { success: true };
      }),
  }),

  // ── Progress ──────────────────────────────────────────────────────────────
  progress: router({
    forLesson: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(({ ctx, input }) => getUserProgressForLesson(ctx.user.id, input.lessonId)),

    forCourse: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(({ ctx, input }) => getUserProgressForCourse(ctx.user.id, input.courseId)),

    complete: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await completeLesson(ctx.user.id, input.lessonId);
        const stats = await getUserStats(ctx.user.id);
        return { success: true, stats };
      }),

    myStats: protectedProcedure.query(({ ctx }) => getUserStats(ctx.user.id)),
  }),

  // ── AI Sandbox ────────────────────────────────────────────────────────────
  sandbox: router({
    chat: protectedProcedure
      .input(z.object({
        messages: z.array(z.object({
          role: z.enum(["system", "user", "assistant"]),
          content: z.string(),
        })),
        model: z.string().default("gpt-4o"),
        temperature: z.number().min(0).max(2).default(0.7),
        maxTokens: z.number().min(1).max(4000).default(1000),
      }))
      .mutation(async ({ ctx, input }) => {
        const response = await invokeLLM({
          messages: input.messages,
          max_tokens: input.maxTokens,
        });
        const content = response.choices?.[0]?.message?.content ?? "";
        // Save session
        await saveSandboxSession({
          userId: ctx.user.id,
          model: input.model,
          messages: [...input.messages, { role: "assistant", content }] as any,
          totalTokens: response.usage?.total_tokens ?? 0,
        });
        return { content, usage: response.usage };
      }),

    history: protectedProcedure.query(({ ctx }) => getSandboxSessionsByUser(ctx.user.id)),
  }),

  // ── Prompt Library ────────────────────────────────────────────────────────
  prompts: router({
    list: protectedProcedure.query(({ ctx }) => getPromptsByUser(ctx.user.id)),

    save: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        systemPrompt: z.string().optional(),
        userPrompt: z.string().min(1),
        model: z.string().default("gpt-4o"),
        temperature: z.number().default(0.7),
      }))
      .mutation(async ({ ctx, input }) => {
        return savePrompt({ ...input, userId: ctx.user.id });
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ ctx, input }) => deletePrompt(input.id, ctx.user.id)),
  }),

  // ── Security ──────────────────────────────────────────────────────────────
  security: router({
    report: publicProcedure
      .input(z.object({
        type: z.enum(["screenshot", "print", "devtools", "copy", "suspicious"]),
        details: z.string().optional(),
        pageUrl: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await logSecurityEvent({
          userId: ctx.user?.id,
          type: input.type,
          details: input.details,
          pageUrl: input.pageUrl,
          ipAddress: ctx.req.headers["x-forwarded-for"] as string ?? undefined,
        });
        return { success: true };
      }),

    events: protectedProcedure.query(async ({ ctx }) => {
      requireAdmin(ctx.user.role);
      return getSecurityEvents(100);
    }),
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

    setUserStatus: protectedProcedure
      .input(z.object({
        userId: z.number(),
        status: z.enum(["trial", "verified", "banned"]),
      }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        await updateUserStatus(input.userId, input.status);
        return { success: true };
      }),

    setUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["user", "admin", "editor"]),
      }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        await updateUserRole(input.userId, input.role);
        return { success: true };
      }),

    awardXp: protectedProcedure
      .input(z.object({
        userId: z.number(),
        amount: z.number(),
        reason: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        await addXpToUser(input.userId, input.amount, input.reason);
        return { success: true };
      }),
    getUserProfile: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .query(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        const profile = await getUserProfile(input.userId);
        const xpHistory = await getUserXpHistory(input.userId, 20);
        return { profile, xpHistory };
      }),
    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        const db = await (await import("./db")).getDb();
        if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        const { users: usersTable } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await db.delete(usersTable).where(eq(usersTable.id, input.userId));
        return { success: true };
      }),
  }),

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: router({
    questions: publicProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(({ input }) => getQuizQuestionsByLesson(input.lessonId)),

    bestAttempt: protectedProcedure
      .input(z.object({ lessonId: z.number() }))
      .query(({ ctx, input }) => getBestQuizAttempt(ctx.user.id, input.lessonId)),

    submit: protectedProcedure
      .input(z.object({
        lessonId: z.number(),
        answers: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        return submitQuizAttempt(ctx.user.id, input.lessonId, input.answers);
      }),
  }),

  // ── Gating ────────────────────────────────────────────────────────────────
  gating: router({
    // Returns which lesson IDs the current user has passed quizzes for
    passedLessons: protectedProcedure
      .query(({ ctx }) => getPassedLessonIds(ctx.user.id)),

    // Returns full course structure with lock status for each lesson
    courseAccess: protectedProcedure
      .input(z.object({ courseId: z.number() }))
      .query(async ({ ctx, input }) => {
        const user = await getUserById(ctx.user.id);
        const isVerified = user?.status === "verified" || user?.role === "admin" || user?.role === "editor";
        const courseModules = await getModulesByCourse(input.courseId, false);
        const passedIds = await getPassedLessonIds(ctx.user.id);
        const passedSet = new Set(passedIds);

        const result = [];
        let prevModuleAllPassed = true; // Module 1 is always accessible (with lesson 1 free)

        for (let mi = 0; mi < courseModules.length; mi++) {
          const mod = courseModules[mi];
          const modLessons = await getLessonsByModule(mod.id, false);
          const moduleLocked = mi > 0 && !prevModuleAllPassed;

          const lessonsWithAccess = modLessons.map((lesson, li) => {
            // Lesson 1 of Module 1 is always free
            const isFreePreview = mi === 0 && li === 0;
            // All other lessons require verified status and previous quiz passed
            let locked = false;
            if (!isFreePreview) {
              if (!isVerified) {
                locked = true; // needs admin approval
              } else if (moduleLocked) {
                locked = true; // previous module not completed
              } else if (li > 0) {
                // Need to have passed previous lesson quiz
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
        return { modules: result, isVerified };
      }),
  }),

  // ── Access Requests ───────────────────────────────────────────────────────
  access: router({
    myRequest: protectedProcedure
      .query(({ ctx }) => getAccessRequestByUser(ctx.user.id)),

    request: protectedProcedure
      .input(z.object({ message: z.string().optional() }))
      .mutation(async ({ ctx, input }) => {
        return createAccessRequest(ctx.user.id, input.message);
      }),

    // Admin: list all requests
    list: protectedProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "denied"]).optional() }))
      .query(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        return getAllAccessRequests(input.status);
      }),

    // Admin: approve or deny
    review: protectedProcedure
      .input(z.object({
        requestId: z.number(),
        decision: z.enum(["approved", "denied"]),
      }))
      .mutation(async ({ ctx, input }) => {
        requireAdmin(ctx.user.role);
        await reviewAccessRequest(input.requestId, ctx.user.id, input.decision);
        return { success: true };
      }),
  }),

  // ── File Upload ───────────────────────────────────────────────────────────
  upload: router({
    getPresignedUrl: protectedProcedure
      .input(z.object({
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        requireEditor(ctx.user.role);
        const { storagePut } = await import("./storage");
        const key = `uploads/${ctx.user.id}/${Date.now()}-${input.filename}`;
        // Return the key for client to use in subsequent upload
        return { key, uploadUrl: `/api/upload/${key}` };
      }),
  }),
});

export type AppRouter = typeof appRouter;
