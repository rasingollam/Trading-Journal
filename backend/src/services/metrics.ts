import { eq, asc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { trades } from "../db/schema.js";

export async function calculateMetrics(strategyId: number) {
  const rows = await db.select().from(trades)
    .where(eq(trades.strategyId, strategyId))
    .orderBy(asc(trades.createdAt));

  const results: number[] = rows
    .map((r: { resultR: string | null }) => r.resultR ? parseFloat(r.resultR.toString()) : null)
    .filter((r: number | null): r is number => r !== null);

  if (results.length === 0) {
    return { winRate: 0, profitFactor: null, drawdown: 0, sharpeRatio: null, tradeCount: 0, balanceR: 0 };
  }

  const wins = results.filter((r: number) => r > 0).length;
  const winRate = (wins / results.length) * 100;

  const grossProfit = results.filter((r: number) => r > 0).reduce((s: number, r: number) => s + r, 0);
  const grossLoss = results.filter((r: number) => r < 0).reduce((s: number, r: number) => s + r, 0);
  const profitFactor = grossLoss < 0 ? grossProfit / Math.abs(grossLoss) : null;

  let cumulative = 0;
  let peak = 0;
  let maxDrawdown = 0;
  for (const r of results) {
    cumulative += r;
    if (cumulative > peak) peak = cumulative;
    const dd = peak - cumulative;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  const balanceR = results.reduce((s: number, r: number) => s + r, 0);
  const mean = balanceR / results.length;
  const variance = results.reduce((s: number, r: number) => s + (r - mean) ** 2, 0) / results.length;
  const std = Math.sqrt(variance);
  const sharpeRatio = std > 0 ? mean / std : null;

  return { winRate, profitFactor, drawdown: maxDrawdown, sharpeRatio, tradeCount: results.length, balanceR };
}
