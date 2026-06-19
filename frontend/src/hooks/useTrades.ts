import { useState, useEffect, useCallback } from 'react';
import * as tradesApi from '../api/trades';
import type { Trade, Metrics, EquityPoint } from '../types';

export function useTrades(strategyId: number | undefined) {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (strategyId === undefined) return;
    setLoading(true);
    setError(null);
    tradesApi
      .listTrades(strategyId)
      .then(setTrades)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load trades');
      })
      .finally(() => setLoading(false));
  }, [strategyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const createTrade = useCallback(async (formData: FormData) => {
    if (strategyId === undefined) throw new Error('No strategy selected');
    await tradesApi.createTrade(strategyId, formData);
    await refresh();
  }, [strategyId, refresh]);

  const updateTrade = useCallback(async (tradeId: number, formData: FormData) => {
    if (strategyId === undefined) throw new Error('No strategy selected');
    await tradesApi.updateTrade(strategyId, tradeId, formData);
    await refresh();
  }, [strategyId, refresh]);

  const deleteTrade = useCallback(async (tradeId: number) => {
    if (strategyId === undefined) throw new Error('No strategy selected');
    await tradesApi.deleteTrade(strategyId, tradeId);
    await refresh();
  }, [strategyId, refresh]);

  return { trades, loading, error, createTrade, updateTrade, deleteTrade, refresh };
}

export function useMetrics(strategyId: number | undefined) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (strategyId === undefined) return;
    setLoading(true);
    setError(null);
    tradesApi
      .getMetrics(strategyId)
      .then(setMetrics)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load metrics');
      })
      .finally(() => setLoading(false));
  }, [strategyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { metrics, loading, error, refresh };
}

export function useEquity(strategyId: number | undefined) {
  const [equity, setEquity] = useState<EquityPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(() => {
    if (strategyId === undefined) return;
    setLoading(true);
    setError(null);
    tradesApi
      .getEquity(strategyId)
      .then(setEquity)
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load equity');
      })
      .finally(() => setLoading(false));
  }, [strategyId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { equity, loading, error, refresh };
}
