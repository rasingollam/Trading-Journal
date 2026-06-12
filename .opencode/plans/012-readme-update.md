# Update root README.md

## Changes

### 1. Add logo at the top

```markdown
<picture>
  <img src="./frontend/public/logo.svg" width="64" height="64" alt="Trading Journal logo">
</picture>

# Trading Journal
```

### 2. Update feature list with current capabilities

**Current:**
- Strategies — Create, edit, delete
- Trades — Log trades with R-multiple result, notes, screenshots
- Screenshots — Upload open/close; full-screen overlay
- Metrics — Win rate, profit factor, drawdown, Sharpe per strategy
- Equity curve — Cumulative R sparkline
- Dark theme — Star Wars inspired

**Add:**
- Sequential trade numbering (#001, #002...) — auto-adjusts on delete
- Pair tracking — BTC/USDT, ETH/USDT, BNB/USDT dropdown
- Trade count — displayed on strategy cards and metrics panel
- Strategy notes — rich text area with full display on cards
- Persistent description — strategy description stored as notes

### 3. Add prerequisites section

```markdown
## Prerequisites

- **Docker** and **Docker Compose** (for production mode)
- **Node.js 20+** and **npm** (for local development)
```

### 4. Improve Development section

Split into two clear paths:

#### Docker (recommended)
```bash
docker compose up -d
```

#### Local dev (two terminals)
```
Terminal 1 — Backend:
  cd backend
  cp .env.example .env
  npm install
  npm run dev              # tsx watch on :3000
  # Requires Postgres + MinIO running locally

Terminal 2 — Frontend:
  cd frontend
  npm install
  npm run dev              # Vite on :5173, /api proxied to :3000
```

### 5. Add API documentation

```markdown
## API

Base: `http://localhost:3000/api` (proxied through nginx in prod)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET/POST | /strategies | List / create strategies |
| PUT/DELETE | /strategies/:id | Update / delete strategy |
| GET/POST | /strategies/:id/trades | List / create trades |
| PUT/DELETE | /strategies/:id/trades/:id | Update / delete trade |
| GET | /strategies/:id/trades/metrics | Win rate, PF, DD, Sharpe, count |
| GET | /strategies/:id/trades/equity | Cumulative R array |
| GET | /files/:key | Proxy for MinIO screenshots |

Trade create/update uses `multipart/form-data`.
```

### 6. Update project structure to match current reality

Reflect actual layout including `public/logo.svg`, `.opencode/`, AGENTS.md files, etc.

### 7. Add Docker Compose services table

```markdown
| Service | Image | Port |
|---------|-------|------|
| db | postgres:16-alpine | 5432 |
| storage | minio/minio | 9000, 9001 |
| backend | custom Node.js | 3000 |
| frontend | custom nginx | 80 |
```

## Single file

`README.md` — rewrite prose, update all sections.
