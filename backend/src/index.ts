import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import { db } from "./db/connection.js";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { ensureBucket } from "./services/storage.js";
import { errorHandler } from "./middleware/error-handler.js";
import strategiesRouter from "./routes/strategies.js";
import tradesRouter from "./routes/trades.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/strategies", strategiesRouter);
app.use("/api/strategies/:strategyId/trades", tradesRouter);

app.use(errorHandler);

const start = async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, "../db/migrations") });
    console.log("Migrations applied");
  } catch (err) {
    console.error("Migration error:", err);
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
