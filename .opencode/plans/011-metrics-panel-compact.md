# Metrics panel — horizontal compact cards

## Single file

`frontend/src/components/MetricsPanel.tsx`

## Change: vertical → horizontal card layout

**Before (vertical centered):**
```
┌──────────────────────┐
│                      │
│      WIN RATE        │
│      75.0%           │
│                      │
└──────────────────────┘
```

**After (horizontal datapad):**
```
┌──────────────────────┐
│ WIN RATE      75.0%  │
└──────────────────────┘
```

Label on the left, value on the right — fills the horizontal space naturally.

### Style changes

```tsx
card: {
  background: 'var(--bg-card)',
  border: '1px solid var(--border)',
  borderRadius: '8px',
  padding: '12px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
},
```

- `padding: '12px 16px'` — 12px top/bottom, 16px left/right (fills width)
- `display: flex`, `alignItems: center`, `justifyContent: space-between` — label left, value right

```tsx
label: {
  color: 'var(--text-secondary)',
  fontSize: '11px',
  textTransform: 'uppercase' as const,
  letterSpacing: '1px',
  flexShrink: 0,           // prevent label from wrapping
},
```

Remove `marginBottom: '8px'` (no longer needed — flex alignment handles spacing).

```tsx
value: {
  fontFamily: 'var(--font-mono)',
  fontSize: '16px',         // reduced from 22px — sits inline with label
  fontWeight: 'bold',
},
```

```tsx
skeleton: {
  height: '48px',           // matches card height: 12+12 padding + ~24px content
},
```

### Render (no change needed)

The JSX stays exactly the same — `label` and `value` are already separate elements. The flexbox on the card container arranges them side by side automatically.
