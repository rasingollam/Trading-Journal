# Logo SVG + favicon + header placement

## Logo design

Approved concept: dark rounded square, gold lightsaber/candle body, three cyan journal-entry dashes.

```
┌──────────────────┐
│         ░░░░░    │  ← 3 cyan dashes (journal entries)
│   ██    ░░░░░    │  ← gold vertical bar (lightsaber / candlestick)
│   ██    ░░░░░    │
│   ██             │
└──────────────────┘
```

## Files to create

### 1. `frontend/public/logo.svg`

64×64 viewBox SVG:

```svg
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#1a1a2e" stroke="#ffd700" stroke-width="1.5"/>
  <rect x="22" y="14" width="8" height="36" rx="3" fill="#ffd700"/>
  <rect x="22" y="14" width="8" height="36" rx="3" fill="url(#g)" opacity="0.4"/>
  <line x1="38" y1="20" x2="50" y2="20" stroke="#00d4ff" stroke-width="3" stroke-linecap="round"/>
  <line x1="38" y1="32" x2="50" y2="32" stroke="#00d4ff" stroke-width="3" stroke-linecap="round"/>
  <line x1="38" y1="44" x2="50" y2="44" stroke="#00d4ff" stroke-width="3" stroke-linecap="round"/>
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffd700" stop-opacity="0.8"/>
      <stop offset="100%" stop-color="#ffd700" stop-opacity="0"/>
    </linearGradient>
  </defs>
</svg>
```

## Files to modify

### 2. `frontend/index.html` — favicon

Add inside `<head>`:

```html
<link rel="icon" type="image/svg+xml" href="/logo.svg" />
```

### 3. `frontend/src/pages/HomePage.tsx` — header logo

Replace the `■` bullet in the system label with the logo image:

**Before (line 95):**
```tsx
<div style={styles.systemLabel}>■ TRADING JOURNAL</div>
```

**After:**
```tsx
<div style={styles.systemLabel}>
  <img src="/logo.svg" alt="" style={styles.logo} />
  TRADING JOURNAL
</div>
```

Add a new style for the logo:

```tsx
logo: {
  width: '16px',
  height: '16px',
  verticalAlign: 'middle',
  marginRight: '6px',
},
```

(The `systemLabel` style may need `display: 'flex', alignItems: 'center'` to align the image with text vertically.)

### 4. `frontend/src/pages/StrategyJournalPage.tsx` — header logo

Replace the `← TRADING JOURNAL` back link with the logo + arrow + text:

**Before:**
```tsx
<Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
```

**After:**
```tsx
<Link to="/" style={styles.backLink}>
  <img src="/logo.svg" alt="" style={styles.logo} />
  &larr; TRADING JOURNAL
</Link>
```

Add same `logo` style and update `backLink` to use `display: 'flex', alignItems: 'center'`.

## Summary

| File | Action |
|------|--------|
| `frontend/public/logo.svg` | **Create** — SVG logo (16 lines) |
| `frontend/index.html` | **Edit** — add favicon `<link>` |
| `frontend/src/pages/HomePage.tsx` | **Edit** — add logo to system label |
| `frontend/src/pages/StrategyJournalPage.tsx` | **Edit** — add logo to back link |
