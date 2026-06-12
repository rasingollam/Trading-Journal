# Fix drawdown: absolute R-units with clear label

## Problem

Drawdown uses a percentage formula `(peak - cumulative) / peak * 100` with a `peak > 0` guard, so a single `-1R` trade returns `0` drawdown. The original plan specified absolute R drawdown (`peak - cumulative`).

## Changes

### 1. Backend — `backend/src/services/metrics.ts`

Replace the percentage calculation with absolute R drawdown:

**Before (line 31):**
```ts
const dd = peak > 0 ? ((peak - cumulative) / peak) * 100 : 0;
```

**After:**
```ts
const dd = peak - cumulative;
```

No guard needed — with a single `-1R`: `peak=0`, `cumulative=-1` → `dd = 0 - (-1) = 1`.

### 2. Frontend — `frontend/src/components/MetricsPanel.tsx`

Change label and remove `%` formatting:

| Change | Before | After |
|--------|--------|-------|
| Label | `'Drawdown'` | `'Max DD (R)'` |
| Value | `metrics.drawdown.toFixed(2)` | `metrics.drawdown.toFixed(2)` |

(No `%` suffix since it's R units. Also no green coloring — always red since any drawdown is bad.)

### 3. Frontend — `frontend/src/components/StrategyCard.tsx`

Same label + format change:

| Change | Before | After |
|--------|--------|-------|
| Label | `'Drawdown'` | `'Max DD (R)'` |
| Value | `` `${drawdown.toFixed(1)}%` `` | `` drawdown.toFixed(2) `` |

### Verification

| Scenario | Before | After |
|----------|--------|-------|
| Single `-1R` | `0` | `1.00` |
| Trades: `+2, -3` | `50%` | `1.00` (peak=2, cumulative=-1, dd=3... wait) |

Let me verify: trades `+2, -3`:
- After +2: cumulative=2, peak=2, dd=0
- After -3: cumulative=-1, peak=2, dd=2-(-1)=3

Max drawdown = 3. So with absolute R, a 2R gain followed by 3R loss = 3R drawdown. This is correct — you're 3R below your peak.

### Files changed

- `backend/src/services/metrics.ts` (1 line)
- `frontend/src/components/MetricsPanel.tsx` (2 lines)
- `frontend/src/components/StrategyCard.tsx` (2 lines)
