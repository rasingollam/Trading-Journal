import client from './client';
import type { Trade, Metrics } from '../types';

export function listTrades(strategyId: number) {
  return client.get<Trade[]>(`/api/strategies/${strategyId}/trades`).then((r) => r.data);
}

export function getTrade(strategyId: number, tradeId: number) {
  return client.get<Trade>(`/api/strategies/${strategyId}/trades/${tradeId}`).then((r) => r.data);
}

export function createTrade(strategyId: number, formData: FormData) {
  return client.post<Trade>(`/api/strategies/${strategyId}/trades`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
}

export function updateTrade(strategyId: number, tradeId: number, formData: FormData) {
  return client.put<Trade>(`/api/strategies/${strategyId}/trades/${tradeId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then((r) => r.data);
}

export function deleteTrade(strategyId: number, tradeId: number) {
  return client.delete<{ success: boolean }>(`/api/strategies/${strategyId}/trades/${tradeId}`).then((r) => r.data);
}

export function getMetrics(strategyId: number) {
  return client.get<Metrics>(`/api/strategies/${strategyId}/metrics`).then((r) => r.data);
}
