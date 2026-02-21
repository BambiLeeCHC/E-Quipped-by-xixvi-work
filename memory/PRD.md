# E-Quipped AI Mastery Platform - Product Requirements Document

## Overview
E-Quipped is a full-stack AI learning platform designed to help users master AI tools and prompt engineering techniques through structured courses, interactive lessons, and an AI sandbox environment.

## Original Problem Statement
Build a complete AI Mastery Platform with:
- Full-stack React frontend + FastAPI backend + MongoDB
- User authentication (JWT + Google OAuth)
- Module/Lesson based learning with progression tracking
- AI Sandbox with multiple LLM integrations (OpenAI, Claude, Gemini)
- Master Editor role for course content management
- Paywall/Trial system with admin verification
- Screenshot/Screen recording detection and alerts
- Responsive design with cyber-organic aesthetic

## User Personas
1. **Learner (Trial)** - New users exploring the platform, limited to Lesson 1
2. **Learner (Verified)** - Paid users with full course access
3. **Admin** - Can view analytics and manage user verification
4. **Master Editor** - Can edit course content and has all admin privileges

## Architecture

### Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI (Python), Pydantic
- **Database:** MongoDB
- **Authentication:** JWT (email/password), Emergent Google OAuth
- **AI Integrations:** OpenAI GPT-5.2, Anthropic Claude 4.5, Google Gemini 3

### Code Structure
```
/app
├── backend/
│   ├── .env                    # Environment variables
│   ├── requirements.txt        # Python dependencies
│   ├── server.py              # FastAPI main application
│   └── tests/
│       └── test_equipped_api.py  # Pytest test suite
├── frontend/
│   ├── .env                    # Frontend env vars
│   ├── package.json           
│   ├── tailwind.config.js     # Theme configuration
│   ├── src/
│   │   ├── App.js             # Main React application
│   │   ├── App.css            # Component styles
│   │   ├── index.css          # Global styles
│   │   ├── AuthProvider.js    # Auth context
│   │   └── axiosConfig.js     # API configuration
│   └── components/ui/         # Shadcn UI components
└── memory/
    └── PRD.md                 # This file
```

### Key API Endpoints
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | User registration |
| `/api/auth/login` | POST | User login |
| `/api/auth/session` | GET | Google OAuth session |
| `/api/modules` | GET | Get all modules with lessons |
| `/api/lessons/{id}` | GET | Get lesson details |
| `/api/progress` | POST | Update lesson progress |
| `/api/chat` | POST | AI sandbox chat |
| `/api/admin/users` | GET | List all users |
| `/api/admin/users/{id}/verify` | PUT | Grant/revoke user access |
| `/api/security/screenshot-attempt` | POST | Log screenshot attempt |
| `/api/admin/screenshot-alerts` | GET | Get screenshot alerts |

### Database Schema
```
users: {
  user_id, email, username, password_hash,
  first_name, last_name, xp_total, current_level,
  is_admin, is_master, is_verified, avatar, created_at
}

modules: {
  module_id, title, description, slug,
  order_index, is_published, difficulty, estimated_hours
}

lessons: {
  lesson_id, module_id, title, description,
  content, learning_objectives[], challenge_description,
  order_index, xp_reward, estimated_minutes
}

user_progress: {
  user_id, lesson_id, module_id, progress,
  score, completed, started_at, updated_at
}

screenshot_alerts: {
  user_id, user_email, user_name, type,
  page, lesson_id, timestamp, read
}
```

## Implemented Features (as of 2026-02-21)

### Core Features
- [x] User authentication (JWT + Google OAuth)
- [x] Module/Lesson viewing and navigation
- [x] Lesson content updates on navigation
- [x] Module unlocking based on progress
- [x] XP and level progression system
- [x] AI Sandbox with multiple models
- [x] Guided/Open mode toggle in Sandbox
- [x] Master Editor for course content
- [x] Responsive design (mobile/tablet/desktop)

### Paywall & Security
- [x] Trial user restrictions (Lesson 1 only)
- [x] is_verified field in user model
- [x] Admin User Access management UI
- [x] Grant/Revoke access functionality
- [x] Screenshot detection (keyboard shortcuts)
- [x] Screenshot alert logging and admin view
- [x] No pre-filled credentials on login

### Admin Dashboard
- [x] Analytics overview (users, sessions, completion rates)
- [x] User Access tab with verification controls
- [x] Security tab with screenshot alerts

## Test Credentials
- **Master User:** master@equipped.ai / master123
- **Admin User:** admin@equipped.ai / admin123

## Upcoming/Backlog Tasks
- [ ] Email notifications for screenshot alerts
- [ ] Community features
- [ ] Advanced analytics
- [ ] Certificate generation on course completion
- [ ] More sophisticated screen recording detection
- [ ] Refactor App.js into component hierarchy
- [ ] Refactor server.py into routers

## Recent Changes Log

### 2026-02-21
- Added `is_verified` field to user model for paywall control
- Implemented `/api/admin/users/{id}/verify` endpoint
- Implemented screenshot detection and alerts system
- Fixed MongoDB ObjectId serialization in register endpoint
- Added pytest test suite with 18 passing tests
- All P0 and P1 issues resolved
