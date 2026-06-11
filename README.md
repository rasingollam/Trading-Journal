# Trading Journal

A self-hosted trading journal for tracking strategies with screenshot storage, R-based performance metrics, and visual equity curves.

## Stack

- **Frontend:** React 18, TypeScript, Vite, React Router, Axios
- **Backend:** Node.js, Express, TypeScript, Drizzle ORM, PostgreSQL
- **Storage:** MinIO (S3-compatible object storage)
- **Infrastructure:** Docker Compose, Nginx

## Quick Start

```bash
docker compose up -d
```

Then open **http://localhost** in your browser.

### Services

| Service     | URL                        |
| ----------- | -------------------------- |
| Frontend    | http://localhost:80        |
| Backend API | http://localhost:3000      |
| MinIO Admin | http://localhost:9001      |
| PostgreSQL  | localhost:5432             |

### Default Credentials

| Service    | User         | Password     |
| ---------- | ------------ | ------------ |
| PostgreSQL | `tj_user`    | `tj_pass`    |
| MinIO      | `minioadmin` | `minioadmin` |

## Features

- **Strategies** — Create, edit, delete trading strategies
- **Trades** — Log trades with R-multiple result, notes, and screenshots
- **Screenshots** — Upload open/close screenshots; view in full-screen overlay
- **Metrics** — Win rate, profit factor, drawdown, Sharpe ratio per strategy
- **Equity Curve** — Cumulative R sparkline on each strategy card
- **Dark Theme** — Star Wars inspired dark UI

## Development

### Backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Database

```bash
cd backend
npm run db:generate   # Generate migration files
npm run db:push       # Push schema to database
```

## Project Structure

```
trading-journal/
├── backend/
│   ├── src/
│   │   ├── config.ts
│   │   ├── index.ts
│   │   ├── db/
│   │   │   ├── connection.ts
│   │   │   └── schema.ts
│   │   ├── routes/
│   │   │   ├── strategies.ts
│   │   │   └── trades.ts
│   │   ├── services/
│   │   │   ├── metrics.ts
│   │   │   ├── storage.ts
│   │   │   └── trades.ts
│   │   └── middleware/
│   │       ├── error-handler.ts
│   │       └── upload.ts
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   ├── index.css
│   │   ├── api/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── types/
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
└── README.md
```
