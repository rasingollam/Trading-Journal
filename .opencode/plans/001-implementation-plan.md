# Implementation Plan — Trading Journal

Based on [idea.md](../idea.md).

---

## 1. Project Structure

```
trading-journal/
├── backend/
│   ├── src/
│   │   ├── index.ts                  # Express app entry
│   │   ├── config.ts                 # Env config loader
│   │   ├── db/
│   │   │   ├── connection.ts         # Drizzle + Postgres connection
│   │   │   └── schema.ts             # Drizzle schema definitions
│   │   ├── routes/
│   │   │   ├── strategies.ts         # CRUD for strategies
│   │   │   └── trades.ts             # CRUD for trades + metrics
│   │   ├── services/
│   │   │   ├── strategies.ts         # Strategy business logic
│   │   │   ├── trades.ts             # Trade business logic
│   │   │   ├── metrics.ts            # Win%, profit factor, DD, Sharpe
│   │   │   └── storage.ts            # MinIO client & operations
│   │   └── middleware/
│   │       ├── error-handler.ts
│   │       └── upload.ts             # Multer config for file uploads
│   ├── drizzle.config.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.tsx
│   │   ├── App.tsx                   # Router setup
│   │   ├── api/
│   │   │   ├── client.ts             # Axios instance
│   │   │   ├── strategies.ts
│   │   │   └── trades.ts
│   │   ├── pages/
│   │   │   ├── HomePage.tsx          # Strategy list
│   │   │   └── StrategyJournalPage.tsx # Trade table + metrics + side tray
│   │   ├── components/
│   │   │   ├── Layout.tsx            # App shell (Star Wars dark theme)
│   │   │   ├── StrategyCard.tsx      # Card with name + win %
│   │   │   ├── StrategyDialog.tsx    # Create/edit strategy modal
│   │   │   ├── TradeTable.tsx        # Tabular view of trades
│   │   │   ├── TradeForm.tsx         # Add/edit trade form
│   │   │   ├── TradeDetail.tsx       # Read-only detail view
│   │   │   ├── SideTray.tsx          # Right slide-out panel wrapper
│   │   │   ├── MetricsPanel.tsx      # Win%, PF, DD, Sharpe display
│   │   │   └── ConfirmDialog.tsx     # Delete confirmation
│   │   ├── hooks/
│   │   │   ├── useStrategies.ts
│   │   │   └── useTrades.ts
│   │   └── types/
│   │       └── index.ts
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── nginx.conf                    # Production nginx config
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 2. Database Schema

### Table: `strategies`
| Column       | Type         | Constraints              |
|-------------|-------------|--------------------------|
| id          | serial       | primary key              |
| name        | varchar(255) | not null                 |
| description | text         | nullable                 |
| created_at  | timestamp    | default now()            |
| updated_at  | timestamp    | default now(), on update |

### Table: `trades`
| Column                | Type         | Constraints                            |
|----------------------|-------------|----------------------------------------|
| id                   | serial       | primary key                            |
| strategy_id          | integer      | not null, references strategies(id) ON DELETE CASCADE |
| open_screenshot_url  | text         | not null (MinIO object key)            |
| close_screenshot_url | text         | nullable (can be added after close)    |
| result_r             | numeric(10,2)| nullable (can be added after close)    |
| notes                | text         | nullable                               |
| created_at           | timestamp    | default now()                          |
| updated_at           | timestamp    | default now(), on update               |

**Index:** `trades_strategy_id_idx` on `trades(strategy_id)`.

---

## 3. API Routes

### Strategies
| Method | Path                  | Description                |
|--------|-----------------------|----------------------------|
| GET    | /api/strategies       | List all strategies        |
| POST   | /api/strategies       | Create strategy (body: { name, description? }) |
| PUT    | /api/strategies/:id   | Update strategy            |
| DELETE | /api/strategies/:id   | Delete strategy (cascade deletes trades + orphan screenshots from MinIO) |

### Trades
| Method | Path                                        | Description                                  |
|--------|---------------------------------------------|----------------------------------------------|
| GET    | /api/strategies/:strategyId/trades          | List trades for strategy                     |
| GET    | /api/strategies/:strategyId/trades/:id      | Single trade detail                          |
| POST   | /api/strategies/:strategyId/trades          | Create trade (multipart: openScreenshot, closeScreenshot?, resultR?, notes?) |
| PUT    | /api/strategies/:strategyId/trades/:id      | Update trade (multipart, same fields)        |
| DELETE | /api/strategies/:strategyId/trades/:id      | Delete trade + remove screenshots from MinIO |

### Metrics
| Method | Path                                    | Description                            |
|--------|-----------------------------------------|----------------------------------------|
| GET    | /api/strategies/:strategyId/metrics     | Returns { winRate, profitFactor, drawdown, sharpeRatio } |

### Static / Screenshots
| Method | Path                     | Description                                |
|--------|--------------------------|--------------------------------------------|
| GET    | /api/screenshots/:key    | Proxies / fetches from MinIO for private bucket mode |

**Alternative:** Make the MinIO bucket publicly readable (since it's local) and serve screenshots directly from MinIO URL. Simpler and avoids a proxy endpoint.

---

## 4. Metrics Calculations

All metrics are computed server-side from the `trades` table for a given `strategy_id`, using only trades where `result_r IS NOT NULL`.

### Winning Percentage
```
winningTrades = count where result_r > 0
totalTrades = count where result_r IS NOT NULL
winRate = (winningTrades / totalTrades) * 100
```

### Profit Factor
```
grossProfit = sum(result_r where result_r > 0)
grossLoss = abs(sum(result_r where result_r < 0))
profitFactor = grossLoss > 0 ? grossProfit / grossLoss : null (or grossProfit if no losses)
```

### Drawdown
```
cumulative = 0
peak = 0
maxDrawdown = 0
for each trade ordered by created_at ASC:
  cumulative += result_r
  if cumulative > peak: peak = cumulative
  drawdown = peak - cumulative
  if drawdown > maxDrawdown: maxDrawdown = drawdown
return maxDrawdown
```

### Sharpe Ratio
```
results = array of result_r values
mean = average(results)
std = population standard deviation of results (ddof=0)
sharpeRatio = std > 0 ? mean / std : null
(Risk-free rate is 0 because R is already risk-adjusted per trade.)
```

---

## 5. Frontend Routes

| Path                      | Page                    | Description                       |
|---------------------------|-------------------------|-----------------------------------|
| `/`                       | HomePage                | Strategy list                     |
| `/strategies/:id`         | StrategyJournalPage     | Trade table + metrics + side tray |

---

## 6. Frontend Component Tree & States

### HomePage
```
HomePage
├── Header (app title + Star Wars themed)
├── StrategyGrid
│   ├── StrategyCard (loading skeleton × N)    → loading
│   ├── StrategyCard (name + win %)            → loaded
│   │   ├── onClick → navigate to journal
│   │   ├── Edit button → StrategyDialog (prefilled)
│   │   └── Delete button → ConfirmDialog
│   └── EmptyState ("No strategies yet")        → empty
├── FloatingActionButton (Add Strategy) → StrategyDialog (empty)
└── StrategyDialog (modal, create/edit)
    ├── Open (form visible)                     → idle
    ├── Submitting... (disabled, spinner)        → saving
    └── Error alert                              → error
```

### StrategyJournalPage
```
StrategyJournalPage
├── BackLink ("← Strategies")
├── Header (strategy name)
├── MetricsPanel
│   └── MetricCards (win%, PF, DD, Sharpe)
│       ├── Skeleton placeholders               → loading
│       ├── Numeric values (colored green/red)  → loaded
│       └── "--" placeholders                   → no trades / no results
├── TradeTable
│   ├── Skeleton rows × 5                       → loading
│   ├── Table rows (date, result R, thumbnail)  → loaded
│   │   ├── onClick → open SideTray with TradeDetail
│   │   └── Empty row indicator                 → empty table
│   └── EmptyState ("No trades yet")            → empty
├── FloatingActionButton (Add Trade) → SideTray with TradeForm
└── SideTray (right panel)
    ├── Closed state (hidden)
    └── Open state:
        ├── TradeForm (add mode)                → idle / saving / error
        │   ├── Image upload (open screenshot)  → idle / uploading / preview
        │   ├── Image upload (close screenshot) → idle / uploading / preview
        │   ├── Result R input (number)
        │   ├── Notes textarea
        │   └── Submit / Cancel buttons
        ├── TradeDetail (view mode)              → loaded / error
        │   ├── Screenshots (open + close)
        │   ├── Result R value
        │   ├── Notes
        │   ├── Edit button → switches to TradeForm (edit mode)
        │   └── Delete button → ConfirmDialog
        └── ConfirmDialog (delete confirmation)
```

### Global States
- **404 page** for invalid strategy IDs
- **Error boundary** wrapping each page
- **Toast/notification** for success/error feedback after mutations

---

## 7. Docker Setup

### docker-compose.yml Services

```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: trading_journal
      POSTGRES_USER: tj_user
      POSTGRES_PASSWORD: tj_pass
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U tj_user -d trading_journal"]
      interval: 5s

  storage:
    image: minio/minio
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"   # S3 API
      - "9001:9001"   # Console (dev only)

  storage-init:
    image: minio/mc
    depends_on:
      storage: { condition: service_started }
    entrypoint: >
      /bin/sh -c "
      until mc alias set local http://storage:9000 minioadmin minioadmin; do sleep 1; done;
      mc mb local/trades --ignore-existing;
      mc anonymous set public local/trades;
      "

  backend:
    build: ./backend
    depends_on:
      db: { condition: service_healthy }
      storage: { condition: service_started }
      storage-init: { condition: service_completed_successfully }
    environment:
      DATABASE_URL: postgres://tj_user:tj_pass@db:5432/trading_journal
      MINIO_ENDPOINT: storage:9000
      MINIO_ACCESS_KEY: minioadmin
      MINIO_SECRET_KEY: minioadmin
      MINIO_BUCKET: trades
      PORT: 3000
    ports:
      - "3000:3000"

  frontend:
    build: ./frontend
    depends_on:
      - backend
    ports:
      - "80:80"

volumes:
  pgdata:
  minio_data:
```

### Backend Dockerfile (multi-stage)
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx tsc

# Stage 2: run
FROM node:20-alpine AS runner
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Frontend Dockerfile (multi-stage with nginx)
```dockerfile
# Stage 1: build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: serve
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### nginx.conf
```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    location /api/ {
        proxy_pass http://backend:3000;
        proxy_set_header Host $host;
        client_max_body_size 10M;
    }

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 8. Implementation Phases

### Phase 1 — Project Scaffolding
- [ ] Initialize `backend/` with `npm init`, install express, drizzle-orm, pg, multer, minio, cors, dotenv, typescript, tsx, @types/*
- [ ] Create `backend/tsconfig.json` with strict settings
- [ ] Setup `backend/drizzle.config.ts`
- [ ] Initialize `frontend/` with `npm create vite@latest` (React + TypeScript)
- [ ] Install frontend deps: react-router-dom, axios, @tanstack/react-query (optional)
- [ ] Create `.env.example` with all env vars
- [ ] Create `docker-compose.yml` with db + storage + storage-init
- [ ] Verify `docker compose up` starts Postgres and MinIO

### Phase 2 — Database & Storage Layer
- [ ] Define Drizzle schema in `backend/src/db/schema.ts` (strategies + trades tables)
- [ ] Run first migration: `npx drizzle-kit push` or generate SQL
- [ ] Implement `backend/src/db/connection.ts`
- [ ] Implement `backend/src/services/storage.ts` (MinIO client, upload, delete, getUrl)

### Phase 3 — Backend API
- [ ] Implement `backend/src/config.ts` (env loading)
- [ ] Implement `backend/src/index.ts` (Express app with CORS, JSON body parser, error handler)
- [ ] Implement **strategies routes**: GET / POST / PUT / DELETE
- [ ] Implement **trades routes**: GET list / GET single / POST (multipart upload) / PUT / DELETE
- [ ] Implement **metrics service** with all four calculations
- [ ] Implement metrics endpoint
- [ ] Test all endpoints with curl or Postman

### Phase 4 — Frontend
- [ ] Setup `App.tsx` with react-router and Layout shell
- [ ] Create Star Wars dark theme CSS variables/theme
- [ ] Implement **HomePage**: strategy list, create/edit/delete modals
- [ ] Implement **SideTray** component (animated right panel)
- [ ] Implement **TradeForm** (image upload + R input)
- [ ] Implement **TradeDetail** (view + edit + delete)
- [ ] Implement **TradeTable** (sortable, clickable rows)
- [ ] Implement **MetricsPanel**
- [ ] Wire up API calls with loading/empty/error states
- [ ] Implement **ConfirmDialog** for deletes

### Phase 5 — Docker Production Setup
- [ ] Create `backend/Dockerfile` (multi-stage)
- [ ] Create `frontend/Dockerfile` (multi-stage + nginx)
- [ ] Create `frontend/nginx.conf`
- [ ] Update `docker-compose.yml` with backend + frontend services
- [ ] Test full `docker compose up` flow end-to-end
- [ ] Test screenshot upload + display through MinIO

---

## 9. Key Considerations

### Image Handling
- Use `multer` with memory storage in backend
- Upload to MinIO with unique keys: `{strategyId}/{tradeId}/open-{timestamp}.{ext}` and `close-{timestamp}.{ext}`
- Store only the MinIO object key in DB, construct full URL at render time
- On delete trade, remove both screenshot objects from MinIO

### Concurrent Modifications
- No high-concurrency concern (local single user). Optimistic patterns OK.
- Use `updated_at` field for basic conflict detection if desired.

### CORS
- Backend must allow `http://localhost` origins (or use nginx proxy in prod, which avoids CORS entirely)

### Star Wars Dark Theme
- CSS custom properties for colors (dark background, yellow/gold accents, blue/cyan highlights, monospace font for data)
- Consider using a CSS-in-JS approach or plain CSS modules

---

## 10. Future Considerations (Out of Scope for v1)

- Import/export trades (CSV/JSON)
- Tags/labels for trades
- Multiple user accounts (maybe not needed for local)
- Equity curve chart
- Trade replay mode
- Dark/Light theme toggle (v1 is dark-only)
