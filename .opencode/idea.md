# Trading Journal

A fully local trading journal that runs on Docker.

## Theme
- Star Wars dark theme

## Tech Stack
- **Backend:** Node.js + TypeScript
- **ORM:** Drizzle
- **Frontend:** Vite (SSR not needed — static build served by nginx)
- **Database:** PostgreSQL (Docker)
- **Object Storage:** MinIO (Docker)

## Requirements
- Fully local — DB & object storage run in Docker containers
- Run on any machine via Docker
- Production-ready Docker setup: multi-stage backend build, Vite static build served via nginx, Docker Compose orchestrating all services

## Pages & Features

### Home Page
- List of **strategies** — create, edit, delete
- Display **winning percentage** for each strategy

### Strategy Journal Page
- Navigate to a strategy's journal by clicking on it
- **Table view** of all trades for that strategy
- **Add Trade** button opens a side tray (right-side slide-out panel)
  - Trade form captures: open trading screenshot, close screenshot, and result (R:R in R)
- Clicking a trade in the table opens the side tray with **detailed trade data** — supports **edit** and **delete** actions
- Display per-strategy metrics (calculated per-strategy only, based on closed trade R sequence):
  - Winning percentage
  - Profit factor
  - Drawdown 
  - Sharpe ratio

## Data Model Notes
- **Result (R)** — only R:R multiples are tracked. No position size or $ value. This app is for strategy testing where R is the unit of measure.
- **Drawdown** — calculated per-strategy as peak-to-trough on the sequence of closed trade R values. No account/portfolio-level DD.

## Docker Setup

### Services
| Service   | Image                          | Purpose                              |
|-----------|--------------------------------|--------------------------------------|
| `db`      | postgres:16-alpine             | Primary database                     |
| `storage` | minio/minio                    | Object storage for trade screenshots |
| `backend` | Custom (multi-stage Node build)| API server                           |
| `frontend`| Custom (Vite build + nginx)    | Serves static frontend               |

### MinIO Setup
- Auto-create a `trades` bucket on first startup via an init script (entrypoint override or a dedicated `storage-init` service)
- Public bucket policy so screenshots are accessible without auth in the frontend (local only)

### Production Build
- **Backend**: multi-stage Dockerfile — `npm ci` + `tsc` build in stage 1, `node dist/index.js` in stage 2 (only production deps copied)
- **Frontend**: multi-stage Dockerfile — `npm ci` + `vite build` in stage 1, nginx-alpine serving `/usr/share/nginx/html` in stage 2
- **Docker Compose**: single `docker compose up` starts everything
