<p align="center">
  <img src="public/logo.png" alt="boardlyX logo" width="80" />
</p>

<h1 align="center">boardlyX</h1>

<p align="center">
  <b>Open-source, AI-powered task management dashboard for modern teams</b>
</p>

<p align="center">
  <img src="public/og-preview.png" alt="boardlyX preview" width="600" />
</p>

<p align="center">
  <a href="https://boardlyx.21coders.xyz">Live Demo</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#contributing">Contributing</a>
</p>

---

## Features

🗂️ **Kanban Board** — Drag-and-drop task management with columns, priorities, and due dates  
👥 **Teams** — Create teams, invite members via email, and collaborate in shared workspaces  
💬 **Real-time Chat** — Team group chats + private DMs with typing indicators and media sharing  
📊 **Analytics** — Visual dashboards with charts and productivity insights  
🔔 **Notifications** — Real-time alerts for invitations, task updates, and team events  
🎨 **Dark Glassmorphism UI** — Premium design with smooth animations and responsive layout  
📎 **Media Sharing** — Share images and videos (up to 2MB) directly in chat  

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Zustand, Recharts, Lucide Icons |
| **Backend** | Express.js, Socket.io, JWT Auth, Zod validation |
| **Database** | PostgreSQL (Neon serverless compatible) |
| **Styling** | Tailwind CSS, Custom CSS, DM Sans typography |
| **Real-time** | Socket.io (WebSocket + polling fallback) |

---

## Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v18+ or [Bun](https://bun.sh/)
- [PostgreSQL](https://www.postgresql.org/) database (or a free [Neon](https://neon.tech/) account)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/boardlyX.git
cd boardlyX
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
DATABASE_URL=postgresql://user:password@host:5432/boardlyx
JWT_SECRET=your-secret-key-here
PORT=4000
```

Install dependencies and start:

```bash
npm install    # or: bun install
npm run dev    # Starts backend on http://localhost:4000
```

The backend will automatically create all required database tables on first run.

### 3. Set up the frontend

Open a new terminal:

```bash
# In the project root
cp .env.example .env.local
```

Edit `.env.local`:

```env
VITE_API_URL=http://localhost:4000
```

Install and start:

```bash
npm install    # or: bun install
npm run dev    # Starts frontend on http://localhost:3000
```

### 4. Open the app

Navigate to **http://localhost:3000**, create an account, and start managing tasks!

---

## Project Structure

```
boardlyX/
├── backend/
│   └── src/
│       ├── index.ts              # Express server + Socket.io init
│       ├── db.ts                 # PostgreSQL schema & connection
│       ├── socket.ts             # Real-time WebSocket handlers
│       ├── middleware/            # Auth, rate-limiting, error handling
│       ├── repositories/         # Database query layer
│       └── routes/               # REST API endpoints
├── components/
│   ├── auth/                     # Login & registration
│   ├── dashboard/                # All page components
│   │   ├── OverviewPage.tsx
│   │   ├── TasksPage.tsx
│   │   ├── TeamsPage.tsx
│   │   ├── ChatPage.tsx
│   │   ├── AnalyticsPage.tsx
│   │   └── Sidebar.tsx
│   └── ui/                       # Reusable UI primitives
├── src/
│   ├── hooks/                    # Custom hooks (socket, tasks)
│   └── services/                 # API client functions
├── store/                        # Zustand global state
├── App.tsx                       # Main app component
├── index.html                    # Entry HTML with SEO meta tags
└── vite.config.ts
```

---

## Environment Variables

### Frontend (`.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:4000` |

### Backend (`.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Secret key for JWT tokens | ✅ |
| `PORT` | Server port | No (default: `4000`) |

---

## Deployment

### Backend → [Render](https://render.com/)

1. Create a new **Web Service** on Render
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add environment variables (`DATABASE_URL`, `JWT_SECRET`)

### Frontend → [Vercel](https://vercel.com/)

1. Import your GitHub repo on Vercel
2. Framework preset: **Vite**
3. Add environment variable: `VITE_API_URL=https://your-backend.onrender.com`
4. Deploy

### Database → [Neon](https://neon.tech/)

1. Create a free Neon project
2. Copy the connection string into your backend's `DATABASE_URL`
3. Tables are auto-created on first server start

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/register` | Create account |
| `POST` | `/api/auth/login` | Sign in |
| `GET` | `/api/tasks` | List tasks |
| `POST` | `/api/tasks` | Create task |
| `PUT` | `/api/tasks/:id` | Update task |
| `GET` | `/api/teams` | List teams |
| `POST` | `/api/teams` | Create team |
| `POST` | `/api/teams/:id/invite` | Invite member |
| `GET` | `/api/chat/conversations` | List chats |
| `POST` | `/api/chat/dm` | Start DM |
| `POST` | `/api/chat/conversations/:id/media` | Send image/video |

Full WebSocket events: `send_message`, `new_message`, `typing_start`, `typing_stop`, `new_conversation`

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Tips

- Backend auto-restarts on file changes with `bun run dev`
- Frontend uses Vite HMR for instant updates
- Database tables are auto-created — no manual migrations needed

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ by <a href="https://21coders.xyz">21Coders</a>
</p>
