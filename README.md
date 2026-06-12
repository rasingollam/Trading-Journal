# Trading Journal

A self-hosted trading journal with Star Wars dark theme, R-based performance metrics, screenshot storage, and full Docker Compose deployment.

## Features

- **Strategies** — Create, edit, delete trading strategies with full-text descriptions
- **Trades** — Log trades with R-multiple result, notes, screenshots, and optional trading pair (BTC/USDT, ETHUSDT, BNBUSDT)
- **Trade Numbering** — Oldest trade = #001, auto-adjusted on delete, computed dynamically (not stored)
- **Pair Tracking** — Optional per-trade pair selector with dropdown
- **Screenshots** — Upload open/close screenshots (JPEG/PNG/GIF/WebP); view in full-screen overlay
- **Metrics Panel** — Compact horizontal cards showing Win Rate, Profit Factor, Max DD (R), Sharpe Ratio, and trade count
- **Drawdown** — Absolute R units (peak minus cumulative R), labelled "Max DD (R)"
- **Instant Refresh** — Metrics update immediately after trade add/edit/delete
- **Equity Curve** — Cumulative R data available via API for charting
- **Dark Theme** — Star Wars inspired UI with gold/cyan custom properties
- **Docker Compose** — Single command to deploy PostgreSQL, MinIO, backend, and frontend

## Stack

| Layer | Technology |
| ----- | ---------- |
| Frontend | React 18, TypeScript, Vite, React Router, Axios |
| Backend | Node.js, Express, TypeScript, Drizzle ORM |
| Database | PostgreSQL 16 |
| Storage | MinIO (S3-compatible, public bucket) |
| Proxy | Nginx (frontend → backend `/api/`) |
| Infrastructure | Docker Compose |

## Quick Start

```bash
docker compose up -d
```

Open **http://localhost** in your browser.

### Services

| Service | URL | Notes |
| ------- | --- | ----- |
| Frontend | http://localhost:80 | Served via Nginx |
| Backend API | http://localhost:3000 | Direct access |
| MinIO Console | http://localhost:9001 | Admin UI |
| PostgreSQL | localhost:5432 | Direct access |

### Default Credentials

| Service | User | Password |
| ------- | ---- | -------- |
| PostgreSQL | `tj_user` | `tj_pass` |
| MinIO | `minioadmin` | `minioadmin` |

## Development

### Prerequisites

- Node.js 20+
- PostgreSQL 16 (or Docker for `db` service)
- MinIO (or Docker for `storage` service)

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev          # tsx watch on :3000
```

### Frontend

```bash
cd frontend
npm install
npm run dev          # Vite on :5173, /api proxied to :3000
```

### Database Migrations

Tables are created automatically on backend startup via raw SQL. For schema drift management:

```bash
cd backend
npm run db:generate   # Generate migration files via Drizzle Kit
npm run db:push       # Push schema to database
npm run db:migrate    # Run pending migrations
```

### Build for Production

```bash
cd backend && npm run build    # tsc → dist/
cd frontend && npm run build   # tsc -b && vite build
```

## API Routes

All routes are prefixed with `/api`.

| Method | Path | Description |
| ------ | ---- | ----------- |
| GET | `/api/strategies` | List all strategies (includes `tradeCount`) |
| POST | `/api/strategies` | Create strategy (`name`, `description`) |
| GET | `/api/strategies/:id` | Get single strategy |
| PUT | `/api/strategies/:id` | Update strategy |
| DELETE | `/api/strategies/:id` | Delete strategy |
| GET | `/api/strategies/:strategyId/trades` | List trades (includes `tradeNumber`) |
| POST | `/api/strategies/:strategyId/trades` | Create trade (`multipart/form-data`) |
| GET | `/api/strategies/:strategyId/trades/metrics` | Get computed metrics |
| GET | `/api/strategies/:strategyId/trades/equity` | Get cumulative R curve |
| PUT | `/api/strategies/:strategyId/trades/:tradeId` | Update trade |
| DELETE | `/api/strategies/:strategyId/trades/:tradeId` | Delete trade |
| GET | `/api/files/:key` | Proxy MinIO object (screenshot) |

## Project Structure

```
trading-journal/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express app, raw-SQL table creation
│   │   ├── config.ts             # Environment config (dotenv)
│   │   ├── db/
│   │   │   ├── connection.ts     # Drizzle ORM + pg Pool
│   │   │   └── schema.ts         # Drizzle schema (strategies, trades)
│   │   ├── routes/
│   │   │   ├── strategies.ts     # Strategy CRUD routes
│   │   │   └── trades.ts         # Trade CRUD + metrics/equity routes
│   │   ├── services/
│   │   │   ├── strategies.ts     # Strategy queries
│   │   │   ├── trades.ts         # Trade CRUD + trade number computation
│   │   │   ├── metrics.ts        # Win rate, profit factor, drawdown, Sharpe
│   │   │   └── storage.ts        # MinIO screenshot upload/proxy
│   │   └── middleware/
│   │       ├── error-handler.ts  # Global error handler
│   │       └── upload.ts         # Multer memoryStorage (10 MB, images only)
│   ├── drizzle.config.ts         # Drizzle Kit config
│   ├── Dockerfile                # Multi-stage (tsc → dist/)
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── logo.svg              # Star Wars themed logo
│   ├── src/
│   │   ├── main.tsx              # Entrypoint (StrictMode + BrowserRouter)
│   │   ├── App.tsx               # Routes: / and /strategies/:id
│   │   ├── index.css             # Star Wars dark theme (CSS custom properties)
│   │   ├── api/
│   │   │   ├── client.ts         # Axios instance (baseURL: '')
│   │   │   ├── strategies.ts     # Strategy API calls
│   │   │   └── trades.ts         # Trade + metrics API calls
│   │   ├── components/
│   │   │   ├── Header.tsx        # Reusable page header (logo, back link, title)
│   │   │   ├── StrategyCard.tsx  # Strategy card (stats, description, icon buttons)
│   │   │   ├── MetricsPanel.tsx  # Horizontal compact metrics cards
│   │   │   ├── TradeTable.tsx    # Trade list with #, pair, R, date, screenshots
│   │   │   ├── TradeForm.tsx     # Add/edit trade form (multipart)
│   │   │   ├── TradeDetail.tsx   # Full trade detail with screenshots
│   │   │   ├── TradeDialog.tsx   # Form dialog wrapper
│   │   │   └── Overlay.tsx       # Full-screen screenshot overlay
│   │   ├── hooks/
│   │   │   ├── useStrategies.ts  # Strategy list CRUD
│   │   │   └── useTrades.ts      # Trades + metrics + equity hooks (useTrades, useMetrics, useEquity)
│   │   ├── pages/
│   │   │   ├── HomePage.tsx      # Strategy list with create dialog
│   │   │   └── StrategyJournalPage.tsx  # Single strategy journal with trades + metrics
│   │   └── types/
│   │       └── index.ts          # Strategy, Trade, Metrics, EquityPoint
│   ├── nginx.conf                # Prod proxy /api/ → backend:3000, 10 MB upload
│   ├── vite.config.ts            # Dev proxy /api → localhost:3000
│   ├── Dockerfile                # Multi-stage (vite build → nginx)
│   └── package.json
└── docker-compose.yml            # db, storage, storage-init, backend, frontend
```

## Architecture Notes

- **ESM imports** — Backend uses `.js` extensions (e.g. `from "../db/connection.js"`)
- **Table creation** — Tables are created via raw SQL in `backend/src/index.ts` on startup, not through migrations. Drizzle Kit (`db:push`/`db:generate`/`db:migrate`) is available for schema drift management.
- **Trade numbers** — Computed dynamically in `listTrades` (oldest = #001), not stored in the database. Deleting a trade renumbers the rest.
- **Drawdown** — Computed as `peak - cumulative R` (absolute units, not percentage). Label displayed as "Max DD (R)".
- **Screenshots** — Stored in MinIO under `trades/{strategyId}/{timestamp}_{open|close}.{ext}`. Bucket has public read policy. Backend proxies via `/api/files/:key`.
- **File upload** — Multer with `memoryStorage`, 10 MB limit, only JPEG/PNG/GIF/WebP allowed.
- **No state management library, CSS framework, or testing framework** — The project uses React hooks for state, raw CSS custom properties for theming, and has no test infrastructure.
