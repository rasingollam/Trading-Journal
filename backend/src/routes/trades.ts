import { asc, eq } from "drizzle-orm";
import { Router } from "express";
import * as tradesService from "../services/trades.js";
import { calculateMetrics } from "../services/metrics.js";
import { upload } from "../middleware/upload.js";
import { db } from "../db/connection.js";
import { trades } from "../db/schema.js";

type TradeParams = { strategyId: string; tradeId: string };

const router = Router({ mergeParams: true });

router.get("/", async (req, res, next) => {
  try {
    const strategyId = parseInt((req.params as TradeParams).strategyId, 10);
    if (isNaN(strategyId)) {
      res.status(400).json({ error: "Invalid strategyId" });
      return;
    }
    const rows = await tradesService.listTrades(strategyId);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.get("/metrics", async (req, res, next) => {
  try {
    const strategyId = parseInt((req.params as TradeParams).strategyId, 10);
    if (isNaN(strategyId)) {
      res.status(400).json({ error: "Invalid strategyId" });
      return;
    }
    const metrics = await calculateMetrics(strategyId);
    res.json(metrics);
  } catch (err) {
    next(err);
  }
});

router.get("/equity", async (req, res, next) => {
  try {
    const strategyId = parseInt((req.params as TradeParams).strategyId, 10);
    if (isNaN(strategyId)) {
      res.status(400).json({ error: "Invalid strategyId" });
      return;
    }
    const rows = await db.select().from(trades)
      .where(eq(trades.strategyId, strategyId))
      .orderBy(asc(trades.createdAt));
    let cumR = 0;
    const equity: { index: number; value: number; date: string }[] = [];
    for (const t of rows) {
      if (t.resultR !== null) {
        const r = parseFloat(t.resultR);
        if (isNaN(r)) continue;
        cumR += r;
        const d = t.createdAt ? new Date(t.createdAt) : new Date();
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        equity.push({ index: equity.length + 1, value: Math.round(cumR * 100) / 100, date: dateStr });
      }
    }
    res.json(equity);
  } catch (err) {
    next(err);
  }
});

router.get("/:tradeId", async (req, res, next) => {
  try {
    const id = parseInt((req.params as TradeParams).tradeId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid tradeId" });
      return;
    }
    const row = await tradesService.getTrade(id);
    if (!row) {
      res.status(404).json({ error: "Trade not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.post("/", upload.fields([
  { name: "openScreenshot", maxCount: 1 },
  { name: "closeScreenshot", maxCount: 1 },
]), async (req, res, next) => {
  try {
    const strategyId = parseInt((req.params as TradeParams).strategyId, 10);
    if (isNaN(strategyId)) {
      res.status(400).json({ error: "Invalid strategyId" });
      return;
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const row = await tradesService.createTrade(
      strategyId,
      { resultR: req.body.resultR, notes: req.body.notes, pair: req.body.pair },
      {
        openScreenshot: files?.openScreenshot?.[0],
        closeScreenshot: files?.closeScreenshot?.[0],
      }
    );
    res.status(201).json(row);
  } catch (err) {
    next(err);
  }
});

router.put("/:tradeId", upload.fields([
  { name: "openScreenshot", maxCount: 1 },
  { name: "closeScreenshot", maxCount: 1 },
]), async (req, res, next) => {
  try {
    const id = parseInt((req.params as TradeParams).tradeId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid tradeId" });
      return;
    }
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    const row = await tradesService.updateTrade(
      id,
      { resultR: req.body.resultR, notes: req.body.notes, pair: req.body.pair },
      {
        openScreenshot: files?.openScreenshot?.[0],
        closeScreenshot: files?.closeScreenshot?.[0],
      }
    );
    if (!row) {
      res.status(404).json({ error: "Trade not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

router.delete("/:tradeId", async (req, res, next) => {
  try {
    const id = parseInt((req.params as TradeParams).tradeId, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid tradeId" });
      return;
    }
    const row = await tradesService.deleteTrade(id);
    if (!row) {
      res.status(404).json({ error: "Trade not found" });
      return;
    }
    res.json(row);
  } catch (err) {
    next(err);
  }
});

export default router;
