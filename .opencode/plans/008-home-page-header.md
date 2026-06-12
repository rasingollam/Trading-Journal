# Themed header for the home page

## Location

Only `frontend/src/pages/HomePage.tsx` is modified. `Layout.tsx` and `App.tsx` stay untouched — the header is part of the page content, not a global wrapper.

## Current state

```tsx
<div style={styles.header}>
  <h1 style={styles.title}>Strategies</h1>
</div>
```

A plain gold heading with a simple flex container. No decoration, no hierarchy.

## Proposed design

Replace the heading area with a two-line header:

```
┌──────────────────────────────────────────────┐
│  ▓ TRADING JOURNAL        (thin gold accent)  │
│  STRATEGIES               (large gold title)  │
└──────────────────────────────────────────────┘
```

### Visual breakdown

1. **Thin gold top accent bar** — a 2px gold line spanning the width (like a status bar on a starship console)
2. **System label** — "TRADING JOURNAL" in small caps (11px), muted `var(--text-secondary)`, monospace, with a tiny cyan square `■` bullet prefix
3. **Main title** — "Strategies" in the current style (gold, 28px, monospace, 2px letter-spacing)
4. **No spacing change** — the header block keeps `marginBottom: '24px'` as before

### Style additions to `styles` object

```tsx
header: {
  marginBottom: '24px',
},
accentBar: {
  height: '2px',
  background: 'linear-gradient(90deg, var(--accent-gold), var(--accent-cyan))',
  marginBottom: '16px',
  borderRadius: '1px',
},
systemLabel: {
  color: 'var(--text-secondary)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  marginBottom: '4px',
},
title: {
  color: 'var(--accent-gold)',
  fontFamily: 'var(--font-mono)',
  fontSize: '28px',
  letterSpacing: '2px',
},
```

### Render

```tsx
<div style={styles.header}>
  <div style={styles.accentBar} />
  <div style={styles.systemLabel}>■ TRADING JOURNAL</div>
  <h1 style={styles.title}>Strategies</h1>
</div>
```

Remove the old inline `styles.header` (which was `display: flex; justify-content: space-between`) — the new header is block layout, not flex.

## Single file, ~12 lines changed
