export interface Strategy {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  tradeCount?: number;
}

export interface Trade {
  id: number;
  strategyId: number;
  openScreenshotUrl: string;
  closeScreenshotUrl: string | null;
  resultR: string | null;
  notes: string | null;
  pair: string | null;
  tradeNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface Metrics {
  winRate: number;
  profitFactor: number | null;
  drawdown: number;
  sharpeRatio: number | null;
  tradeCount: number;
  balanceR: number;
}

export interface EquityPoint {
  index: number;
  value: number;
}
