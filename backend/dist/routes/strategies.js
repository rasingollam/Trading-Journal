import { Router } from "express";
import * as strategiesService from "../services/strategies.js";
const router = Router();
router.get("/", async (_req, res, next) => {
    try {
        const rows = await strategiesService.listStrategies();
        res.json(rows);
    }
    catch (err) {
        next(err);
    }
});
router.post("/", async (req, res, next) => {
    try {
        const { name, description } = req.body;
        if (!name) {
            res.status(400).json({ error: "Name is required" });
            return;
        }
        const row = await strategiesService.createStrategy({ name, description });
        res.status(201).json(row);
    }
    catch (err) {
        next(err);
    }
});
router.put("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const { name, description } = req.body;
        const row = await strategiesService.updateStrategy(id, { name, description });
        if (!row) {
            res.status(404).json({ error: "Strategy not found" });
            return;
        }
        res.json(row);
    }
    catch (err) {
        next(err);
    }
});
router.delete("/:id", async (req, res, next) => {
    try {
        const id = parseInt(req.params.id, 10);
        if (isNaN(id)) {
            res.status(400).json({ error: "Invalid id" });
            return;
        }
        const row = await strategiesService.deleteStrategy(id);
        if (!row) {
            res.status(404).json({ error: "Strategy not found" });
            return;
        }
        res.json(row);
    }
    catch (err) {
        next(err);
    }
});
export default router;
//# sourceMappingURL=strategies.js.map