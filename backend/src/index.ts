import express from "express";
import cors from "cors";
import { sql } from "drizzle-orm";
import { config } from "./config.js";
import { db } from "./db/connection.js";
import { minioClient, ensureBucket } from "./services/storage.js";
import { errorHandler } from "./middleware/error-handler.js";
import strategiesRouter from "./routes/strategies.js";
import tradesRouter from "./routes/trades.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/files/:objectName(*)", async (req, res) => {
  try {
    const objectName = req.params.objectName;
    const stat = await minioClient.statObject(config.minioBucket, objectName);
    const stream = await minioClient.getObject(config.minioBucket, objectName);
    const contentType = stat.metaData?.["content-type"] || "application/octet-stream";
    res.setHeader("Content-Type", contentType);
    res.setHeader("Cache-Control", "public, max-age=3600");
    stream.pipe(res);
  } catch {
    res.status(404).json({ error: "File not found" });
  }
});

app.use("/api/strategies", strategiesRouter);
app.use("/api/strategies/:strategyId/trades", tradesRouter);

app.use(errorHandler);

const start = async () => {
  try {
    await db.execute(sql.raw(`
      CREATE TABLE IF NOT EXISTS strategies (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS trades (
        id SERIAL PRIMARY KEY,
        strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
        open_screenshot_url TEXT NOT NULL,
        close_screenshot_url TEXT,
        result_r NUMERIC(10,2),
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `));
    console.log("Tables ensured");
  } catch (err) {
    console.error("Failed to create tables:", err);
    process.exit(1);
  }
  try {
    await ensureBucket();
  } catch (err) {
    console.error("Failed to ensure MinIO bucket:", err);
  }
  app.listen(config.port, () => {
    console.log(`Server running on port ${config.port}`);
  });
};

start();
