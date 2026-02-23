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
- [ ] Redesign LessonViewer as two-column layout: lesson content left, sandbox side panel right
- [ ] Sandbox side panel is collapsible (toggle button) and persists across Learn/Quiz sections
- [ ] Applied section pre-fills sandbox with lesson prompt template
- [ ] Track sandbox submission count per lesson (applied_completed flag)
- [ ] Quiz tab/section only unlocks after user submits at least one sandbox response in Applied
- [ ] Show clear "Complete the Applied exercise first" message when quiz is locked
- [ ] Push all changes to GitHub
