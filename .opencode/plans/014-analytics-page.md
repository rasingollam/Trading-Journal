# 014 — Analytics Page

Add an analytics tab to the strategy journal page with charts and statistics in a single-viewport layout.

## Layout

```
┌─────────────────────────────────────────────────────────┐
│  ← Back                                                 │
│  Strategy Title              [ Journal | Analytics ]     │
├─────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│ │Win R │ │PF    │ │Max DD│ │Sharpe│ │Tr    │ │Net R │ │
│ │60%   │ │ 1.5  │ │ 12%  │ │ 0.8  │ │ 15   │ │+3.2  │ │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ │
├─────────────────────┬──────────────────────────────────┤
│  Equity Curve       │  R-Multiple Distribution          │
│  (line chart)       │  (bar histogram)                  │
│                     │                                   │
├─────────────────────┴──────────────────────────────────┤
│ AvgW:+1.5R │ AvgL:-0.8R │ W/L Ratio:2.1 │ Best:+3.2R │ Worst:-2.1R │ ConW:5 │ ConL:3 │
└─────────────────────────────────────────────────────────┘
```

## Steps

### 1. Add Recharts dependency

```bash
cd frontend
npm install recharts
```

### 2. Add tab state to StrategyJournalPage

- Add `activeTab: 'journal' | 'analytics'` state
- Move the title row to flex layout: title on left, pill tabs on right
- Add tab switcher showing "Journal" and "Analytics" — only when the strategy is loaded
- Swap content: journal tab shows TradeTable; analytics tab shows AnalyticsPanel

### 3. Build AnalyticsPanel component

File: `frontend/src/components/AnalyticsPanel.tsx`

Props:
```ts
interface AnalyticsPanelProps {
  trades: Trade[];
  metrics: Metrics | null;
  equity: EquityPoint[];
  strategyId: number;
}
```

Three sections:

#### a) Compact Metrics Bar
- 6 inline stat cards reused from existing metrics data
- Each: label (uppercase) + value, monospace
- Compact styling (no borders, smaller padding)

#### b) Charts Row (2-column grid)
- **Equity Curve** — line chart from equity endpoint data, gold/green line, dark background
- **R-Distribution** — bar histogram: group trades by R-value buckets (-3, -2, -1, 0, +1, +2, +3+), colored green/red per bar

#### c) Stats Bar (single row)
- Avg Win, Avg Loss, Best Trade, Worst Trade, W/L Ratio, Consecutive Wins, Consecutive Losses
- Computed client-side from the trades list
- Compact inline pills, monospace font

### 4. Compute statistics client-side

No backend changes needed. Compute from `trades` array:
- `avgWin` — mean of positive resultR values
- `avgLoss` — mean of negative resultR values
- `bestTrade` — max resultR
- `worstTrade` — min resultR
- `winLossRatio` — avgWin / |avgLoss|
- `consecutiveWins` — longest streak of positive resultR
- `consecutiveLosses` — longest streak of negative resultR
- `rDistribution` — bucket counts for histogram

### 5. Wire into StrategyJournalPage

- Import AnalyticsPanel
- Import/getEquity in the hook or pass from existing state
- Add conditional rendering based on activeTab

### 6. Style tabs

- Pill-style buttons: `border-radius: 16px`, padding, active state with gold bg
- Dark theme consistent with existing CSS custom properties

## Files to modify

| File | Change |
|------|--------|
| `frontend/package.json` | Add `recharts` dependency |
| `frontend/src/pages/StrategyJournalPage.tsx` | Add tab state, flex title row, conditional rendering |
| `frontend/src/components/AnalyticsPanel.tsx` | New file: charts + stats |
| `frontend/src/hooks/useTrades.ts` | Ensure `getEquity` export is available |

## No backend changes needed

All data is available from existing endpoints:
- `GET /api/strategies/:id/trades/metrics` — aggregated metrics
- `GET /api/strategies/:id/trades` — trade list for client-side stats computation
- `GET /api/strategies/:id/trades/equity` — equity curve data
