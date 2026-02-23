# E-Quipped — AI Mastery Platform

**E-Quipped** is a full-stack AI learning platform that helps users master AI tools and prompt engineering through structured courses, interactive lessons, and a live AI sandbox environment.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Tailwind CSS, Framer Motion, CRACO |
| Backend | FastAPI (Python 3.11), Pydantic v2 |
| Database | MongoDB (via Motor async driver) |
| Auth | JWT (email/password) + Emergent Google OAuth |
| AI Sandbox | OpenAI GPT, Anthropic Claude, Google Gemini |

---

## Project Structure

```
/
├── backend/
│   ├── .env.example        # Environment variable template
│   ├── requirements.txt    # Python dependencies
│   ├── server.py           # FastAPI application
│   └── tests/
├── frontend/
│   ├── .env.example        # Frontend env var template
│   ├── package.json
│   ├── craco.config.js
│   └── src/
│       ├── App.js
│       └── components/ui/
├── .github/workflows/webpack.yml
└── memory/PRD.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+ and Yarn 1.x
- Python 3.11+
- MongoDB instance (local or Atlas)

### 1. Clone the repository

```bash
git clone https://github.com/BambiLeeCHC/E-Quipped-by-xixvi-work.git
cd E-Quipped-by-xixvi-work
```

### 2. Configure environment variables

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit both files with your values
```

### 3. Install dependencies

```bash
cd frontend && yarn install && cd ..
pip install -r backend/requirements.txt
```

### 4. Run in development

```bash
# Terminal 1 — Backend (port 8001)
cd backend && python3 -m uvicorn server:app --host localhost --port 8001 --reload

# Terminal 2 — Frontend (port 5000, proxies /api to 8001)
cd frontend && yarn start
```

---

## Production Build

```bash
cd frontend && yarn build
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `MONGO_URL` | Yes | MongoDB connection string |
| `DB_NAME` | No | Database name (default: `equipped_ai`) |
| `JWT_SECRET` | Yes | Secret key for JWT signing |
| `EMERGENT_LLM_KEY` | Yes | API key for AI sandbox features |
| `CORS_ORIGINS` | No | Comma-separated allowed origins (default: `*`) |

### Frontend (`frontend/.env`)

| Variable | Required | Description |
|---|---|---|
| `REACT_APP_BACKEND_URL` | No | Backend base URL. Leave empty in development. Set to your production URL in production. |

---

## CI/CD

The GitHub Actions workflow runs on every push to `main` and tests the build across Node.js 18, 20, and 22. Set the `REACT_APP_BACKEND_URL` secret in your GitHub repository settings.

---

## Default Credentials (Seed Data)

| Role | Email | Password |
|---|---|---|
| Master Editor | `master@equipped.ai` | `master123` |
| Admin | `admin@equipped.ai` | `admin123` |

> **Change these credentials before deploying to production.**

---

## License

MIT
