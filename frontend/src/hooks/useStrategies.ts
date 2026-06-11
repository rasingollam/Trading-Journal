import { useState, useEffect, useCallback } from 'react';
import * as strategiesApi from '../api/strategies';
import type { Strategy } from '../types';

export function useStrategies() {
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError(null);
    strategiesApi
      .listStrategies()
      .then(setStrategies)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load strategies');
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createStrategy = useCallback(async (data: { name: string; description?: string }) => {
    await strategiesApi.createStrategy(data);
    await refresh();
  }, [refresh]);

  const updateStrategy = useCallback(async (id: number, data: { name: string; description?: string }) => {
    await strategiesApi.updateStrategy(id, data);
    await refresh();
  }, [refresh]);

  const deleteStrategy = useCallback(async (id: number) => {
    await strategiesApi.deleteStrategy(id);
    await refresh();
  }, [refresh]);

  return { strategies, loading, error, createStrategy, updateStrategy, deleteStrategy, refresh };
}
