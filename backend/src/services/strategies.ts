import { eq, desc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { strategies } from "../db/schema.js";

export async function listStrategies() {
  return db.select().from(strategies).orderBy(desc(strategies.createdAt));
}

export async function getStrategy(id: number) {
  const rows = await db.select().from(strategies).where(eq(strategies.id, id)).limit(1);
  return rows[0] || null;
}

export async function createStrategy(data: { name: string; description?: string }) {
  const rows = await db.insert(strategies).values(data).returning();
  return rows[0];
}

export async function updateStrategy(id: number, data: { name?: string; description?: string }) {
  const rows = await db.update(strategies).set({ ...data, updatedAt: new Date() }).where(eq(strategies.id, id)).returning();
  return rows[0] || null;
}

export async function deleteStrategy(id: number) {
  const rows = await db.delete(strategies).where(eq(strategies.id, id)).returning();
  return rows[0] || null;
}
