import client from './client';
import type { Strategy } from '../types';

export function listStrategies() {
  return client.get<Strategy[]>('/api/strategies').then((r) => r.data);
}

export function createStrategy(data: { name: string; description?: string }) {
  return client.post<Strategy>('/api/strategies', data).then((r) => r.data);
}

export function updateStrategy(id: number, data: { name: string; description?: string }) {
  return client.put<Strategy>(`/api/strategies/${id}`, data).then((r) => r.data);
}

export function deleteStrategy(id: number) {
  return client.delete<{ success: boolean }>(`/api/strategies/${id}`).then((r) => r.data);
}
