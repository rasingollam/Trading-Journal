# Themed header for the strategy journal page

## Current (lines 184–186)

```tsx
<Link to="/" style={styles.backLink}>&larr; Back</Link>
<span style={styles.title}>{strategy?.name || 'Journal'}</span>
```

## Proposed

```
(gold-to-cyan accent bar)
← TRADING JOURNAL          ← back link, cyan, small
Strategy Name              ← main title, gold, large
```

The "← TRADING JOURNAL" replaces the separate back link + system label into one inline navigation element. The strategy name sits below as the page title.

### Changes to `styles`

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
backLink: {
  display: 'inline-block',
  color: 'var(--accent-cyan)',
  fontFamily: 'var(--font-mono)',
  fontSize: '11px',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  marginBottom: '8px',
},
title: {
  color: 'var(--accent-gold)',
  fontFamily: 'var(--font-mono)',
  fontSize: '20px',
  letterSpacing: '1px',
  display: 'block',
},
```

Remove `headerRow`, `systemLabel`, `titleRow` styles — no longer needed.

### Render (lines 183–186 become)

```tsx
<div style={styles.header}>
  <div style={styles.accentBar} />
  <Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
  <span style={styles.title}>{strategy?.name || 'Journal'}</span>
</div>
```

### Loading skeleton (lines 143–160)

```tsx
<div className="skeleton" style={{ ...styles.accentBar }} />
<div className="skeleton" style={{ width: '180px', height: '11px', marginBottom: '8px' }} />
<div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '24px' }} />
```

### Not-found and error states

These can also use the same back link style for consistency:

```tsx
<Link to="/" style={styles.backLink}>&larr; TRADING JOURNAL</Link>
```

## Single file — `StrategyJournalPage.tsx` only
