import { eq, asc } from "drizzle-orm";
import { db } from "../db/connection.js";
import { trades } from "../db/schema.js";
import { uploadFile, deleteFile, getFileUrl } from "./storage.js";
export async function listTrades(strategyId) {
    const rows = await db.select().from(trades)
        .where(eq(trades.strategyId, strategyId))
        .orderBy(asc(trades.createdAt));
    return rows.map((row, index) => ({
        ...row,
        tradeNumber: index + 1,
    })).reverse();
}
export async function getTrade(id) {
    const rows = await db.select().from(trades).where(eq(trades.id, id)).limit(1);
    return rows[0] || null;
}
export async function createTrade(strategyId, data, files) {
    let openKey;
    let closeKey;
    if (files?.openScreenshot) {
        const ext = files.openScreenshot.originalname.split(".").pop() || "png";
        openKey = `trades/${strategyId}/${Date.now()}_open.${ext}`;
        await uploadFile(files.openScreenshot.buffer, openKey, files.openScreenshot.mimetype);
    }
    if (files?.closeScreenshot) {
        const ext = files.closeScreenshot.originalname.split(".").pop() || "png";
        closeKey = `trades/${strategyId}/${Date.now()}_close.${ext}`;
        await uploadFile(files.closeScreenshot.buffer, closeKey, files.closeScreenshot.mimetype);
    }
    const rows = await db.insert(trades).values({
        strategyId,
        openScreenshotUrl: getFileUrl(openKey || ""),
        closeScreenshotUrl: closeKey ? getFileUrl(closeKey) : null,
        resultR: data.resultR || null,
        notes: data.notes || null,
        pair: data.pair || null,
    }).returning();
    return rows[0];
}
export async function updateTrade(id, data, files) {
    const existing = await getTrade(id);
    if (!existing)
        return null;
    let openKey;
    let closeKey;
    if (files?.openScreenshot) {
        const ext = files.openScreenshot.originalname.split(".").pop() || "png";
        openKey = `trades/${existing.strategyId}/${Date.now()}_open.${ext}`;
        await uploadFile(files.openScreenshot.buffer, openKey, files.openScreenshot.mimetype);
    }
    if (files?.closeScreenshot) {
        const ext = files.closeScreenshot.originalname.split(".").pop() || "png";
        closeKey = `trades/${existing.strategyId}/${Date.now()}_close.${ext}`;
        await uploadFile(files.closeScreenshot.buffer, closeKey, files.closeScreenshot.mimetype);
    }
    const updateData = { updatedAt: new Date() };
    if (openKey) {
        updateData.openScreenshotUrl = getFileUrl(openKey);
    }
    if (closeKey) {
        updateData.closeScreenshotUrl = getFileUrl(closeKey);
    }
    if (data.resultR !== undefined) {
        updateData.resultR = data.resultR;
    }
    if (data.notes !== undefined) {
        updateData.notes = data.notes;
    }
    if (data.pair !== undefined) {
        updateData.pair = data.pair;
    }
    const rows = await db.update(trades).set(updateData).where(eq(trades.id, id)).returning();
    const updated = rows[0];
    if (updated && openKey && existing.openScreenshotUrl) {
        const oldKey = existing.openScreenshotUrl.replace("/api/files/", "");
        await deleteFile(oldKey);
    }
    if (updated && closeKey && existing.closeScreenshotUrl) {
        const oldKey = existing.closeScreenshotUrl.replace("/api/files/", "");
        await deleteFile(oldKey);
    }
    return updated || null;
}
export async function deleteTrade(id) {
    const existing = await getTrade(id);
    if (!existing)
        return null;
    const rows = await db.delete(trades).where(eq(trades.id, id)).returning();
    if (existing.openScreenshotUrl) {
        const key = existing.openScreenshotUrl.replace("/api/files/", "");
        await deleteFile(key);
    }
    if (existing.closeScreenshotUrl) {
        const key = existing.closeScreenshotUrl.replace("/api/files/", "");
        await deleteFile(key);
    }
    return rows[0] || null;
}
//# sourceMappingURL=trades.js.map