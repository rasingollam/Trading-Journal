# Instant metrics update after trade mutations

## Problem

`StrategyJournalPage` has two separate hooks:
- `useTrades` — after create/update/delete, automatically calls `refresh()` internally
- `useMetrics` — fetches metrics only on mount, never refreshes after trade changes

So stats cards stay stale until manual page reload.

## Fix

Two small changes:

### 1. `frontend/src/hooks/useTrades.ts` — expose `refresh` from `useMetrics`

Currently returns `{ metrics, loading, error }`. Add `refresh` to the return value.

```ts
return { metrics, loading, error, refresh };
```

### 2. `frontend/src/pages/StrategyJournalPage.tsx` — refresh metrics after mutation

**Line 55:** destructure `refresh` (rename to `refreshMetrics`):
```ts
const { metrics, loading: metricsLoading, error: metricsError, refresh: refreshMetrics } = useMetrics(strategyId);
```

**In `handleFormSave` (lines 113–130):** call `refreshMetrics()` after a successful save:
```ts
const handleFormSave = async (formData: FormData) => {
  setFormSaving(true);
  setFormError(null);
  try {
    if (editingTrade) {
      await updateTrade(editingTrade.id, formData);
    } else {
      await createTrade(formData);
    }
    await refreshMetrics();        // <-- added
    setTrayOpen(false);
    setEditingTrade(null);
    setSelectedTrade(null);
  } catch (err: unknown) {
    setFormError(err instanceof Error ? err.message : 'Failed to save trade');
  } finally {
    setFormSaving(false);
  }
};
```

**In `handleDeleteTrade` (lines 132–139):** call `refreshMetrics()` after deletion:
```ts
const handleDeleteTrade = async () => {
  if (!deletingTrade || strategyId === undefined) return;
  await deleteTrade(deletingTrade.id);
  await refreshMetrics();          // <-- added
  setDeletingTrade(null);
  setTrayOpen(false);
  setSelectedTrade(null);
  setEditingTrade(null);
};
```

## No other files needed

These two files are the only ones that change. The `useMetrics` hook already has a valid `refresh` callback — it just wasn't exposed.
