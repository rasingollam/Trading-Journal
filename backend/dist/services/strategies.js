import { eq, desc, count, inArray } from "drizzle-orm";
import { db } from "../db/connection.js";
import { strategies, trades } from "../db/schema.js";
export async function listStrategies() {
    const rows = await db.select().from(strategies).orderBy(desc(strategies.createdAt));
    const ids = rows.map((s) => s.id);
    const counts = ids.length > 0
        ? await db
            .select({ strategyId: trades.strategyId, count: count() })
            .from(trades)
            .where(inArray(trades.strategyId, ids))
            .groupBy(trades.strategyId)
        : [];
    const countMap = new Map(counts.map((c) => [c.strategyId, Number(c.count)]));
    return rows.map((s) => ({
        ...s,
        tradeCount: countMap.get(s.id) || 0,
    }));
}
export async function getStrategy(id) {
    const rows = await db.select().from(strategies).where(eq(strategies.id, id)).limit(1);
    return rows[0] || null;
}
export async function createStrategy(data) {
    const rows = await db.insert(strategies).values(data).returning();
    return rows[0];
}
export async function updateStrategy(id, data) {
    const rows = await db.update(strategies).set({ ...data, updatedAt: new Date() }).where(eq(strategies.id, id)).returning();
    return rows[0] || null;
}
export async function deleteStrategy(id) {
    const rows = await db.delete(strategies).where(eq(strategies.id, id)).returning();
    return rows[0] || null;
}
//# sourceMappingURL=strategies.js.map