# Trade numbers, metrics count card, and strategy card counts

## Overview

Three related features:
1. Sequential trade numbering (#001, #002...) per strategy, auto-adjusting on delete
2. "Trades" count card in the MetricsPanel
3. Trade count on home page StrategyCards

---

## 1. Sequential trade numbering

**Approach:** Compute dynamically (not stored in DB). Oldest trade = #001. Numbers auto-adjust when trades are added or deleted.

### Backend

**`backend/src/services/trades.ts`** — Modify `listTrades`:
```typescript
import { asc } from "drizzle-orm";

export async function listTrades(strategyId: number) {
  const rows = await db.select().from(trades)
    .where(eq(trades.strategyId, strategyId))
    .orderBy(asc(trades.createdAt));

  return rows.map((row, index) => ({
    ...row,
    tradeNumber: index + 1,
  })).reverse();
}
```

This returns trades DESC (newest first) but numbered chronologically (oldest = 001). Deleting a trade renumbers automatically.

### Frontend

**`frontend/src/types/index.ts`** — Add `tradeNumber` to `Trade`:
```ts
export interface Trade {
  id: number;
  strategyId: number;
  // ...existing fields...
  tradeNumber: number;
  // ...
}
```

**`frontend/src/components/TradeTable.tsx`** — Add "#" column as first column:
- `<th>`: `#` (narrow width)
- `<td>`: `String(trade.tradeNumber).padStart(3, '0')` formatted as `#001`

**`frontend/src/components/TradeDetail.tsx`** — Show trade number in heading:
- Change heading to `"Trade #001"` or similar using `trade.tradeNumber`

---

## 2. Trade count card in MetricsPanel

### Backend

**`backend/src/services/metrics.ts`** — Add `tradeCount` to return value:
```typescript
return {
  winRate,
  profitFactor,
  drawdown: maxDrawdown,
  sharpeRatio,
  tradeCount: results.length,
};
```

### Frontend

**`frontend/src/types/index.ts`** — Add `tradeCount` to `Metrics`:
```ts
export interface Metrics {
  winRate: number;
  profitFactor: number | null;
  drawdown: number;
  sharpeRatio: number | null;
  tradeCount: number;
}
```

**`frontend/src/components/MetricsPanel.tsx`**:
- Change `gridTemplateColumns` from `repeat(4, 1fr)` to `repeat(5, 1fr)`
- Add a fifth card: label `"Trades"`, value `metrics.tradeCount`, color `var(--accent-cyan)`
- Update skeleton count from 4 to 5

---

## 3. Trade count on homepage StrategyCards

### Backend

**`backend/src/services/strategies.ts`** — Modify `listStrategies` to include trade counts:
```typescript
import { count, inArray } from "drizzle-orm";
import { trades } from "../db/schema.js";

export async function listStrategies() {
  const rows = await db.select().from(strategies).orderBy(desc(strategies.createdAt));

  const ids = rows.map((s) => s.id);
  const counts = ids.length > 0
    ? await db
        .select({ strategyId: trades.strategyId, count: count() })
        .from(trades)
        .where(inArray(trades.strategyId, ids))
        .groupBy(trades.strategyId)
    : [];
  const countMap = new Map(counts.map((c) => [c.strategyId, Number(c.count)]));

  return rows.map((s) => ({
    ...s,
    tradeCount: countMap.get(s.id) || 0,
  }));
}
```

No route changes needed — the existing `GET /api/strategies` returns whatever `listStrategies` returns.

### Frontend

**`frontend/src/types/index.ts`** — Add optional `tradeCount` to `Strategy`:
```ts
export interface Strategy {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tradeCount?: number;
}
```

**`frontend/src/pages/HomePage.tsx`** — Pass `tradeCount` to `StrategyCard`. Already passes `strategy={strategy}` so the card has access via `strategy.tradeCount`.

**`frontend/src/components/StrategyCard.tsx`** — Display trade count:
- The `styles.tradeCount` style block already exists in the file (lines 28-36) but is unused
- Add `tradeCount?: number` to the component props or read it from `strategy.tradeCount`
- Display it in the name row area, e.g. next to the strategy name or as a badge

---

## Order of implementation

1. Backend: `services/trades.ts` — add tradeNumber to listTrades
2. Frontend: `types/index.ts` — add tradeNumber to Trade, tradeCount to Metrics, tradeCount to Strategy
3. Frontend: `components/TradeTable.tsx` — add # column
4. Frontend: `components/TradeDetail.tsx` — show trade number in heading
5. Backend: `services/metrics.ts` — add tradeCount to response
6. Frontend: `components/MetricsPanel.tsx` — add Trades card (5 columns)
7. Backend: `services/strategies.ts` — add tradeCount to listStrategies
8. Frontend: `components/StrategyCard.tsx` — display tradeCount
9. Verify: create/delete trades, check numbering re-aligns, check metric cards, check home page
