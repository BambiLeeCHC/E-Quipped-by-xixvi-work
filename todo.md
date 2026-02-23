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
- [ ] Save checkpoint and publish

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
