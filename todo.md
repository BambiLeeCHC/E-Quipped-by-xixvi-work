# E-Quipped — Project TODO

## Phase 1: Database Schema & Foundation
- [x] Define full database schema (users, courses, modules, lessons, content_blocks, progress, prompts, security_events)
- [x] Run migrations via webdev_execute_sql
- [x] Add all server-side db helpers in server/db.ts

## Phase 2: Auth, Routing & Design System
- [x] Global dark theme design system (index.css, fonts, color tokens)
- [x] App.tsx routing (public, protected, admin, editor routes)
- [x] Auth context and useAuth hook wiring (via Manus OAuth)

## Phase 3: Course Content Pages
- [x] Landing / Home page (hero, features, CTA)
- [x] Course catalog page (grid with lock/premium badges)
- [x] Course detail page (module accordion, lesson list, progress)
- [x] Lesson viewer (content blocks: text, code, callout, image, video, prompt_exercise)
- [x] Lesson completion flow (XP award, mark complete button)

## Phase 4: AI Sandbox
- [x] AI sandbox page with system prompt, temperature, max tokens controls
- [x] Multi-turn chat history with streaming-style rendering
- [x] Prompt library (save/load prompts)
- [x] tRPC backend procedures for LLM invocation

## Phase 5: Master Editor
- [x] Editor dashboard (course list, create/delete/publish)
- [x] Module editor (create, publish/unpublish)
- [x] Lesson editor (create, publish/unpublish)
- [ ] Rich text content block editor (in-lesson editing)
- [ ] Media upload in editor (images, videos)

## Phase 6: Progress Tracking
- [x] XP system (award on lesson completion)
- [x] Level calculation from XP
- [x] Daily streak tracking
- [x] Progress bar per module/lesson
- [x] User profile page (XP, level, streak, completed lessons, saved prompts)

## Phase 7: Admin Dashboard
- [x] Analytics overview (users, completions, security events)
- [x] User management table (verify, ban, set role)
- [x] Security events log

## Phase 8: Paywall & Security
- [x] Trial vs verified user role system
- [x] Paywall gate on premium lessons
- [x] Admin verification flow
- [x] Security event reporting to backend
- [ ] Screenshot detection (client-side PrintScreen listener)
- [ ] Content watermarking (user email overlay)

## Phase 9: File Upload (S3)
- [ ] File upload tRPC procedure with S3 storagePut
- [ ] Image upload in editor content blocks

## Phase 10: Tests, Polish & Publish
- [x] Vitest unit tests — 14 tests, 2 files, all passing
- [x] TypeScript — zero errors
- [x] Save checkpoint and publish

## Phase 11: Design Refresh & Editor Upgrade
- [x] Brighter lucite/spectrum color scheme with fuchsia accents and flesh tone hints
- [x] Layered translucent (lucite) UI elements with color spectrum shimmer
- [x] Remove course editor CTA from Home landing page
- [x] Full lesson content block editor (text/HTML, code, callout, image URL, video URL, audio, prompt exercise, quiz, divider)
- [x] Live HTML preview pane that renders content in real time from the editor
- [x] Wire LessonEditor into EditorDashboard lessons view

## Phase 12: Permissions & Messaging
- [x] Enforce editor/admin-only access on all editor routes (frontend guards)
- [x] Enforce editor/admin-only access on all backend tRPC procedures
- [x] Hide Editor/Admin nav links from regular users
- [x] Redirect unauthorized users away from /editor and /admin routes
- [x] Redesign landing page hero with full AI business mastery messaging
- [x] Add rotating skill showcase (prompt engineering → presentations → transcription → etc.)
- [x] Update features section to reflect full AI business skill curriculum

## Phase 13: Hero Cleanup
- [x] Remove stats pills (Modules, Lessons, Skills, AI Models) from hero
- [x] Replace unauthenticated CTAs (Start Learning Free / Browse Courses) with a single Sign In / Login button

## Phase 14: Rebrand to E-Quipped: Work
- [x] Update all user-facing "E-Quipped" references to "E-Quipped: Work"

## Phase 15: Inline Login on Landing Page
- [x] Embed inline login panel on the landing page (no external redirect)
- [x] Remove all window.location.href = getLoginUrl() calls from the landing page
- [x] Show login panel as a smooth in-page section when unauthenticated

## Phase 16: User Profile Management
- [x] Backend: list all users with progress/role data
- [x] Backend: update user role (admin/editor/user)
- [x] Backend: get individual user profile with full progress
- [x] Admin Dashboard: Users tab with searchable profile cards
- [x] Admin Dashboard: Role badge with promote/demote dropdown
- [x] Admin Dashboard: Profile detail drawer/modal

## Phase 17: Course Content Recovery & Catalogue Rebuild
- [x] Recover original modules/lessons from GitHub repo source files
- [x] Seed 1 course, 7 modules, 36 lessons into the database
- [x] Rebuild CourseCatalog as structured module/lesson outline with bookmark nav

## Phase 18: Comprehensive Gated AI Business Course

### Schema & Backend
- [x] Add quiz_questions table (lessonId, question, options JSON, correctIndex, explanation)
- [x] Add quiz_attempts table (userId, lessonId, score, passed, answers JSON, attemptedAt)
- [x] Add access_requests table (userId, status: pending/approved/denied, requestedAt, reviewedAt)
- [x] Add quizPassed flag to lesson_progress table
- [x] Backend: submitQuiz procedure (grade, record attempt, unlock next lesson if passed)
- [x] Backend: getLessonAccess procedure (check user approval + quiz gate chain)
- [x] Backend: admin.listAccessRequests and admin.approveAccess procedures
- [x] Backend: auto-request access on first login

### Content Seeding
- [x] Seed full lesson content for all 7 modules (learning section HTML + applied prompts)
- [x] Seed 5 quiz questions per lesson (35 lessons × 5 = 175 questions)
- [x] Mark lesson 1 of module 1 as free/public (no access gate)

### Frontend: Lesson Viewer
- [x] Learning section tab with rich HTML content rendering
- [x] Applied Learning tab with embedded sandbox (pre-filled prompt template)
- [x] End-of-lesson quiz (5 MCQ questions, must score 80%+ to pass)
- [x] Quiz result screen with pass/fail feedback and unlock animation
- [x] "Request Access" screen for locked users (triggers access_request)
- [x] Lesson navigation (prev/next) with lock indicators

### Frontend: Course Catalogue
- [x] Show lock state per module (locked until previous module quizzes all passed)
- [x] Show lock state per lesson (locked until previous lesson quiz passed)
- [x] Show "Free Preview" badge on Lesson 1 of Module 1
- [x] Show "Pending Approval" state for users awaiting admin access

### Frontend: Admin Panel
- [x] Access requests tab in Admin Dashboard (approve/deny with one click)
- [x] Notification badge on Admin nav when pending requests exist

### Tests & Polish
- [x] Vitest tests for quiz grading and access gating logic
- [x] Save checkpoint and publish

## Phase 19: Sandbox Side Panel & Quiz Gating
- [x] Redesign LessonViewer as two-column layout: lesson content left, sandbox side panel right
- [x] Sandbox side panel is collapsible (toggle button) and persists across Learn/Quiz sections
- [x] Applied section pre-fills sandbox with lesson prompt template
- [x] Track sandbox submission count per lesson (applied_completed flag)
- [x] Quiz tab/section only unlocks after user submits at least one sandbox response in Applied
- [x] Show clear "Complete the Applied exercise first" message when quiz is locked
- [x] Push all changes to GitHub

## Phase 20: Prompt History, Quality Gate & Navigation
- [x] DB: sandbox_messages table (userId, lessonId, role, content, qualityScore, qualityFeedback, qualityPassed, createdAt)
- [x] Backend: sandbox.saveMessage procedure (persist user+assistant messages)
- [x] Backend: sandbox.getLessonHistory procedure (load messages for a lesson)
- [x] Backend: sandbox.scoreQuality LLM procedure (scores prompt quality, returns pass/fail + feedback)
- [x] Backend: sandbox.qualityPassed query (check if user already passed quality gate for a lesson)
- [x] Backend: lessons.adjacent procedure (prev/next lesson with cross-module support)
- [x] LessonViewer: load and display previous sandbox messages on mount (history persists across sessions)
- [x] LessonViewer: quality gate — LLM scores each submission, unlock quiz only on quality pass (score >= 60)
- [x] LessonViewer: show quality feedback inline (score badge + improvement tip per message)
- [x] LessonViewer: prev/next lesson navigation arrows at bottom of Learn tab
- [x] LessonViewer: prev/next navigation arrows on Quiz tab too
- [x] LessonViewer: "Next Lesson" button on quiz completion card
- [x] 22 vitest tests passing, zero TypeScript errors

## Phase 21: Visual Lesson Layout Enhancement & Contrast Fixes
- [x] Audit all lesson canvas colors — identified low-contrast text-white/50 and text-white/60 on dark backgrounds
- [x] Add dedicated lesson-canvas CSS class (deep indigo-black bg, near-white text, WCAG AA compliant)
- [x] Add lesson-prose CSS class with full typographic overrides (h1-h4, p, ul, ol, code, pre, table, blockquote)
- [x] Add high-contrast callout variants (info, warning, success, tip) with distinct border+bg+text colors
- [x] Add lesson-code-block, lesson-code-header, lesson-code-content CSS classes
- [x] New block type: step_flow — numbered step cards with fuchsia number badges
- [x] New block type: flashcard_grid — flip-on-click term/definition cards
- [x] New block type: stat_grid — large-value stat cards with colored values
- [x] New block type: concept_diagram — center node + surrounding concept nodes
- [x] New block type: quote — styled blockquote with left border and author attribution
- [x] Extend content_blocks DB enum + apply migration
- [x] Rewrite LessonViewer to use lesson-canvas dark theme throughout (no more text-white/50 anti-patterns)
- [x] All inline styles use oklch() for precise, accessible color values
- [x] Seed 10 visual blocks across M1L1, M1L2, M2L1, M3L1
- [x] 22 vitest tests passing, zero TypeScript errors

## Phase 22: Stripe Payments & Subscriptions
- [x] DB: add stripeCustomerId, stripeSubscriptionId, subscriptionStatus, subscriptionPlan, subscriptionPeriodEnd to users table
- [x] DB: add stripe_payments table (userId, stripePaymentIntentId, stripeCustomerId, amount, currency, status, plan, createdAt)
- [x] Apply DB migration (0005_daily_squadron_supreme.sql)
- [x] server/stripe/client.ts — Stripe SDK singleton (API version 2026-01-28.clover)
- [x] server/stripe/products.ts — 3 plans: Monthly ($29/mo), Annual ($189/yr), Lifetime ($497 one-time)
- [x] server/stripe/webhook.ts — /api/stripe/webhook; handles checkout.session.completed, subscription.updated/deleted, invoice.paid; test event bypass
- [x] server/_core/index.ts — registerStripeWebhook before express.json()
- [x] server/routers.ts — stripe router: plans, mySubscription, createCheckout, createPortal, myPayments
- [x] Pricing page (/pricing) — 3-tier plan cards, checkout CTA, active subscription banner, portal link, test card instructions
- [x] Payment history page (/payments) — table with date/plan/amount/status
- [x] App.tsx — /pricing and /payments routes registered
- [x] Home.tsx — Pricing nav link in both authenticated and unauthenticated nav
- [x] Profile.tsx — Pro subscription badge (Crown), Upgrade to Pro CTA, renewal date
- [x] CourseCatalog.tsx — modules 2+ gated behind active Pro subscription; Crown icon; click redirects to /pricing
- [x] 22 vitest tests passing, zero TypeScript errors

## Phase 23: Subscription Grants Full Course Access
- [x] Backend: gating.courseAccess — active Pro subscription (subscriptionStatus active/trialing) sets isVerified=true; returns hasActiveSubscription flag
- [x] Backend: courseAccess now returns { modules, isVerified, hasActiveSubscription } — single source of truth
- [x] Frontend: CourseCatalog — hasProSubscription derived from courseAccess.hasActiveSubscription (no separate query needed)
- [x] Frontend: CourseCatalog — access banner redesigned: Upgrade to Pro CTA (instant access) + Request Admin Access (secondary)
- [x] Frontend: CourseCatalog — pending admin request banner now includes inline "upgrade to Pro" link
- [x] Frontend: CourseCatalog — unauthenticated banner updated to mention subscription
- [x] 22 vitest tests passing, zero TypeScript errors

## Phase 24: Single Lifetime Pricing at $675
- [x] server/stripe/products.ts — replaced 3 plans with single lifetime plan at $675 (one-time payment, mode: payment)
- [x] server/routers.ts — createCheckout now only accepts planId: "lifetime"; always uses mode: "payment"
- [x] server/routers.ts — removed subscription branch from checkout session creation
- [x] client/src/pages/Pricing.tsx — rewritten as single-plan hero layout: $675 price, 7 feature bullets, module list, FAQ, trust signals
- [x] Removed all monthly/annual plan references from Pricing.tsx and products.ts
- [x] 22 vitest tests passing, zero TypeScript errors

## Phase 25: Stripe Price Creation, Social Proof & Purchase Notifications
- [x] Created Stripe Product "E-Quipped: Work — Lifetime Access" (prod_U25JZyL2oQSBOZ)
- [x] Created Stripe Price $675 one-time USD (price_1T418U8sip4m1KcerxuWL85Q)
- [x] STRIPE_PRICE_LIFETIME env secret set to the real price ID
- [x] Pricing page: learner count bar (200+ professionals, 5 avatar bubbles)
- [x] Pricing page: 3 testimonial cards with star ratings, quote, name, role
- [x] Webhook: notifyOwner called on checkout.session.completed with buyer name, email, amount, payment intent ID
- [x] Webhook: notifyOwner failure is caught and logged (non-blocking)
- [x] scripts/create-stripe-price.mjs — reusable script for future price creation
- [x] 25 vitest tests passing (3 new Stripe tests), zero TypeScript errors

## Phase 26: Checkout Verification, Refund Badge, Live Indicator & More CTAs
- [ ] Verify Stripe sandbox: create test checkout session via API script and confirm price_1T418U8sip4m1KcerxuWL85Q resolves
- [ ] Pricing page: 7-day refund guarantee badge on the pricing card
- [ ] Pricing page: animated live purchase indicator ("Someone just enrolled")
- [ ] Homepage: "Get Lifetime Access" CTA section above footer
- [ ] CourseCatalog: upgrade CTA banner when user is not verified (replace plain text)
- [ ] LessonViewer: upgrade CTA overlay when lesson is locked (premium modules)
- [ ] 25 vitest tests passing, zero TypeScript errors

## Phase 27: Legal Policies, Hamburger Menu & Header Polish
- [x] Privacy Policy page (/privacy) — GDPR/CCPA compliant, 12 sections
- [x] Terms of Service page (/terms) — 14 sections covering purchase, IP, acceptable use, AI sandbox
- [x] Refund Policy page (/refund) — 7-day no-questions-asked guarantee
- [x] Cookie Policy page (/cookies) — 3 cookies documented, table format
- [x] Accessibility Statement page (/accessibility) — WCAG 2.1 AA, known limitations, testing approach
- [x] Shared PolicyLayout component — lucite header, spectrum hero, section renderer with inline bold + table support
- [x] Full-screen MenuPanel.tsx — dark lucite overlay, staggered slide-up entrance, fast fade-down exit, spectrum shimmer sweep on open
- [x] "Work" wordmark uses spectrum-word class — continuous 4s hue-loop animation (fuchsia → violet → indigo → cyan → mint → amber → fuchsia)
- [x] Hamburger button in Home.tsx header — always visible, opens MenuPanel
- [x] MenuPanel includes primary nav + policy links + user greeting card + auth CTA
- [x] Footer rebuilt — brand + tagline left, 5 policy links right, copyright + email bottom
- [x] All 5 policy routes registered in App.tsx
- [x] 25 vitest tests passing, zero TypeScript errors
