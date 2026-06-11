# Trading Journal

A fully local trading journal that runs on Docker.

## Theme
- Star Wars dark theme

## Tech Stack
- **Backend:** Node.js + TypeScript
- **ORM:** Drizzle
- **Frontend:** Vite
- **Database:** PostgreSQL
- **Object Storage:** MinIO

## Requirements
- Fully local — DB & object storage run in Docker containers
- Run on any machine via Docker

## Pages & Features

### Home Page
- List of **strategies** — create, edit, delete
- Display **winning percentage** for each strategy

### Strategy Journal Page
- Navigate to a strategy's journal by clicking on it
- **Table view** of all trades for that strategy
- **Add Trade** button opens a side tray (right-side slide-out panel)
  - Trade form captures: open trading screenshot, close screenshot, and result (R:R in R)
- Clicking a trade in the table opens the side tray with **detailed trade data**
- Display per-strategy metrics:
  - Winning percentage
  - Profit factor
  - Drawdown
  - Sharpe ratio
