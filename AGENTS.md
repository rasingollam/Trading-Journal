# Trading Journal — AGENTS.md

# Development Instructions
- Answer concisely onto the point unless user asked otherwise.
- Always delegate tasks to sub agents.
- When user asked plan always ask questions to clarify and save the plan in '.opencode\plans' as next.
- When user asked implement the plan, implement the asked plan end to end, compile code and test for coding bugs, refine then docker build and up the project.
- when user asked implement plan 0** then search the '.opencode\plans' 0**-*
- DON'T run 'npm run build' for the backend and frontend only build in docker. use complings to check codes compling issues.

## Project structure

```
trading-journal/
├── backend/          # Express + TypeScript + Drizzle ORM + PostgreSQL
│   ├── src/
│   │   ├── index.ts              # Entrypoint: Express app, raw-SQL table creation
│   │   ├── config.ts             # dotenv env loader
│   │   ├── db/
│   │   │   ├── connection.ts     # Drizzle + pg Pool
│   │   │   └── schema.ts         # Drizzle schema (strategies, trades)
│   │   ├── routes/               # strategies.ts, trades.ts (mergeParams: true)
│   │   ├── services/             # strategies.ts, trades.ts, metrics.ts, storage.ts
│   │   └── middleware/           # error-handler.ts, upload.ts (multer, memoryStorage)
│   ├── drizzle.config.ts         # Drizzle Kit config (no migrations generated yet)
│   └── Dockerfile                # Multi-stage: build (tsc), run (node dist/index.js)
├── frontend/         # React 18 + Vite + TypeScript, served via nginx in prod
│   ├── src/
│   │   ├── main.tsx              # Entrypoint (React.StrictMode + BrowserRouter)
│   │   ├── App.tsx               # Routes: / and /strategies/:id
│   │   ├── api/client.ts         # Axios instance (baseURL: '')
│   │   ├── types/index.ts        # Strategy, Trade, Metrics, EquityPoint
│   │   ├── hooks/                # useStrategies, useTrades
│   │   └── index.css             # Star Wars dark theme (CSS custom properties)
│   ├── vite.config.ts            # Dev proxy: /api → localhost:3000
│   ├── nginx.conf                # Prod proxy: /api/ → backend:3000, client_max_body_size 10M
│   └── Dockerfile                # Multi-stage: build (vite build), serve (nginx)
└── docker-compose.yml            # db (postgres:16-alpine), storage (minio), backend, frontend
```

## Quick start

```bash
docker compose up -d
```

Open http://localhost.

For local dev without Docker:
```bash
# Terminal 1: start Postgres & MinIO manually, then
cd backend
cp .env.example .env
npm install
npm run dev          # tsx watch src/index.ts on :3000

# Terminal 2:
cd frontend
npm install
npm run dev          # vite on :5173, /api proxied to :3000
```

## Key developer commands

| Command | Location | Notes |
|---|---|---|
| `npm run dev` | backend | `tsx watch src/index.ts` — auto-restarts on change |
| `npm run build` | backend | `tsc` — compiles to `dist/` |
| `npm run dev` | frontend | `vite` — HMR dev server on :5173 |
| `npm run build` | frontend | `tsc -b && vite build` — typecheck then bundle |
| `npm run db:generate` | backend | `drizzle-kit generate` — outputs to `src/db/migrations/` |
| `npm run db:push` | backend | `drizzle-kit push` — push schema to DB |
| `npm run db:migrate` | backend | `drizzle-kit migrate` — run migrations |

## Architecture notes

- **Tables are created on startup** via raw SQL in `src/index.ts:37-54`. Drizzle Kit is only used for schema drift management, not initial setup.
- **Imports use `.js` extensions** (ESM module resolution: `from "../db/connection.js"`).
- **Screenshots** are stored in MinIO (bucket `trades`, public policy). Served through backend at `/api/files/:key` (proxy endpoint). Object keys: `trades/{strategyId}/{timestamp}_{open|close}.{ext}`.
- **Multer** uses `memoryStorage`, 10 MB limit, only JPEG/PNG/GIF/WebP allowed.
- **Metrics** are computed server-side per-strategy from `result_r` values (R-multiple only). Drawdown is percentage-based peak-to-trough on cumulative R. Sharpe uses population stddev (ddof=0).
- **No tests, no lint, no typecheck script, no CI/CD.** These do not exist in the repo.
- **Star Wars dark theme** via CSS custom properties in `frontend/src/index.css`.

## API routes

All under `/api`:
- `GET/POST/PUT/DELETE /api/strategies` and `/api/strategies/:id`
- `GET/POST/PUT/DELETE /api/strategies/:strategyId/trades` and `/:tradeId`
- `GET /api/strategies/:strategyId/trades/metrics` — returns { winRate, profitFactor, drawdown, sharpeRatio }
- `GET /api/strategies/:strategyId/trades/equity` — cumulative R array [{ index, value }]
- `GET /api/files/:key` — proxies MinIO object

Trade create/update use `multipart/form-data` (fields: `openScreenshot`, `closeScreenshot`, `resultR`, `notes`).

## Dependencies

Backend: express, cors, drizzle-orm, pg, minio, multer, dotenv. Dev: tsx, typescript, drizzle-kit, @types/*.
Frontend: react, react-dom, react-router-dom, axios. Dev: vite, @vitejs/plugin-react, typescript, @types/*.

No state management library, no CSS framework, no testing framework.
