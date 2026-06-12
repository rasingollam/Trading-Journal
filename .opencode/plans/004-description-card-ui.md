# Strategy card description — full display with notes formatting

## Goal

The strategy card's description is the primary place to store strategy notes. It should display the full text (no truncation), preserve newlines, and look like a proper notes section.

## Changes — only `frontend/src/components/StrategyCard.tsx`

### 1. Remove truncation

Delete the length check and slice — always render the full description.

**Current:**
```tsx
{strategy.description.length > 120
  ? strategy.description.slice(0, 120) + '...'
  : strategy.description}
```

**New:**
```tsx
{strategy.description}
```

### 2. Preserve newlines

Add `whiteSpace: 'pre-wrap'` to the `description` style block so multi-line text entered in the dialog textarea renders faithfully.

### 3. Style the description as a notes card

Give the description area a distinct visual identity — a subtle surface background, inner padding, and a faint border — so it reads as a "notes" section rather than a subtitle.

Updated `description` style:
```tsx
description: {
  color: 'var(--text-primary)',
  fontSize: '13px',
  lineHeight: '1.6',
  whiteSpace: 'pre-wrap' as const,
  background: 'var(--bg-surface)',
  padding: '12px',
  borderRadius: '6px',
  border: '1px solid var(--border)',
  marginTop: '-4px',
  maxHeight: 'none' as const,
  overflowY: 'visible' as const,
}
```

### 4. Single file, no other changes

This affects only `StrategyCard.tsx`. No backend, no type changes, no new props — the description field already comes from the API.
