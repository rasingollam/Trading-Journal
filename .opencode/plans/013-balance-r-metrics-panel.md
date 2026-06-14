# Plan 013 — Balance (R) in MetricsPanel

**Goal:** Add total cumulative R ("Balance (R)") as a card in the journal page MetricsPanel.

## Changes

### 1. `backend/src/services/metrics.ts`

- Add `balanceR` to the return object:
  - Compute `const balanceR = results.reduce((s, r) => s + r, 0);`
  - Include in both the empty-results case (`0`) and the normal return
- Return shape: `{ winRate, profitFactor, drawdown, sharpeRatio, tradeCount, balanceR }`

### 2. `frontend/src/types/index.ts`

- Add `balanceR: number` to the `Metrics` interface

### 3. `frontend/src/components/MetricsPanel.tsx`

- Change `gridTemplateColumns` from `repeat(5, 1fr)` to `repeat(6, 1fr)`
- Update skeleton count from `5` to `6`
- Add items entry:
  - label: `'Balance (R)'`
  - value: `metrics.balanceR.toFixed(2)`
  - color: `var(--success)` if positive, `var(--accent-red)` if negative, `var(--accent-gold)` if zero

### Not changing

- Home page StrategyCard (per user's choice)
- `/equity` endpoint (keeping separate)
- API route handler (data flows through automatically)

## Verification

- Backend compiles with `tsc --noEmit`
- Frontend compiles with `tsc -b`
- Docker build succeeds
