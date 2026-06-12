# Strategy card layout: reorder sections, sticky icon footer

## Changes — only `frontend/src/components/StrategyCard.tsx`

### Current order

```
Name + tradeCount
Description (variable height pushes everything below)
───────── divider ─────────
Metrics grid (win rate, PF, DD, sharpe)
Sparkline
[Edit] [Delete] (text buttons)
```

### Problem

Description length varies, which shifts the metrics grid, chart, and buttons up/down. Buttons should stay pinned at the bottom regardless of description height.

### Desired order

```
Name + tradeCount
───────── divider ─────────
Metrics grid (fixed height)
Description (scrollable if long, or natural height between stats and footer)
Sparkline
[✎] [✕] (icon buttons, always at card bottom)
```

### 1. Reorder sections

Move the description block after the metrics grid (before sparkline).

**Before:**
```tsx
<div style={styles.nameRow}>...</div>
{strategy.description && <div style={styles.description}>{strategy.description}</div>}
<div style={styles.divider} />
<div style={styles.metricsGrid}>...</div>
{equity && ... <Sparkline ... />}
<div style={styles.footer}>...</div>
```

**After:**
```tsx
<div style={styles.nameRow}>...</div>
<div style={styles.divider} />
<div style={styles.metricsGrid}>...</div>
{strategy.description && <div style={styles.description}>{strategy.description}</div>}
{equity && ... <Sparkline ... />}
<div style={styles.footer}>...</div>
```

### 2. Sticky footer with `marginTop: auto`

Remove `gap: '14px'` from `card` style (it interferes with `marginTop: auto`). Instead, add margins to individual sections for spacing. Footer gets `marginTop: 'auto'` to always sit at the bottom.

Updated style changes:
- **card**: Remove `gap: '14px'`
- **nameRow**: Add `marginBottom: '14px'`
- **metricsGrid**: Keep as-is (natural height)
- **description**: Add `marginTop: '12px'` so it has space from the metrics grid
- **chartRow**: Add `marginTop: '4px'`
- **footer**: Change to `marginTop: 'auto'`, keep `paddingTop: '12px'`

### 3. Icon buttons

Replace text buttons with icon-only buttons using inline SVGs. Make them round/square with centered icons.

New `iconBtn` style:
```tsx
iconBtn: {
  width: '36px',
  height: '36px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '8px',
  border: '1px solid var(--border)',
  background: 'var(--bg-surface)',
  color: 'var(--text-secondary)',
  cursor: 'pointer',
  fontSize: '16px',
  lineHeight: '1',
  transition: 'all 0.2s ease',
  padding: 0,
},
```

Inline SVG icons for Edit (pencil) and Delete (trash), or simple Unicode characters if preferred. Hover effects use the same color pattern as current (gold for edit, red for delete).

Remove `actionBtn` style (no longer needed), or keep skeleton styles. Also clean up hover handlers on buttons — move to CSS `:hover` in inline style or keep the existing `onMouseEnter`/`onMouseLeave` pattern.

### Single file, no other changes

Only `StrategyCard.tsx` is modified. No new dependencies, no backend changes.
