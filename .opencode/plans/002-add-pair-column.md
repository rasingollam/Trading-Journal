# Add `pair` column to trades

## Overview

Add an optional `pair` column to the trades table with a predefined dropdown of crypto pairs. The column appears in the trade table, form, and detail view.

## Changes

### 1. Database

**`backend/src/db/schema.ts`** — Add `pair` column to trades table:
```ts
pair: varchar("pair", { length: 20 }),
```

**`backend/src/index.ts`** — Add column to raw SQL CREATE TABLE:
```sql
pair VARCHAR(20)
```

No migration needed — restarting the dev server triggers `CREATE TABLE IF NOT EXISTS`, but existing DB needs an `ALTER TABLE` to add the column. Use `npm run db:push` (Drizzle Kit) to sync, or run manually:
```sql
ALTER TABLE trades ADD COLUMN pair VARCHAR(20);
```

### 2. Backend

**`backend/src/services/trades.ts`** — Accept `pair` in `createTrade` and `updateTrade` data, pass it to DB insert/update.

**`backend/src/routes/trades.ts`** — No changes needed (`resultR`, `notes`, `pair` all come from `req.body` via multipart; existing spread already forwards unknown fields like `pair`).

**`backend/src/services/metrics.ts`** — No changes (metrics only care about `result_r`).

### 3. Frontend

**`frontend/src/types/index.ts`** — Add `pair: string | null` to `Trade` interface.

**`frontend/src/components/TradeForm.tsx`**:
- Add pair dropdown as the first field (title position), before screenshots.
- Dropdown values: `""` (empty/none), `"BTC/USDT"`, `"ETH/USDT"`, `"BNB/USDT"`.
- Append `pair` to FormData on submit.
- On edit, prefill from `trade.pair`.

**`frontend/src/components/TradeTable.tsx`**:
- Add `<th>Pair</th>` after Date header.
- Add `<td>` showing `trade.pair` or `--` in the row, between Date and Result columns.

**`frontend/src/components/TradeDetail.tsx`**:
- Add pair display row after the screenshots, before Result.
- Label: "Pair", value: `trade.pair` or `"Not specified"`.

## Order of implementation

1. Update `backend/src/db/schema.ts`
2. Update `backend/src/index.ts` (raw SQL)
3. Run `npm run db:push` to sync existing DB
4. Update `backend/src/services/trades.ts`
5. Update `frontend/src/types/index.ts`
6. Update `frontend/src/components/TradeForm.tsx`
7. Update `frontend/src/components/TradeTable.tsx`
8. Update `frontend/src/components/TradeDetail.tsx`
9. Verify — create/edit/view trades with different pair selections
