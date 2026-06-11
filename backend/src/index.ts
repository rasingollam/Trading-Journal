import express from "express";
import cors from "cors";
import { config } from "./config.js";
import { ensureBucket } from "./services/storage.js";
import { errorHandler } from "./middleware/error-handler.js";
import strategiesRouter from "./routes/strategies.js";
import tradesRouter from "./routes/trades.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/strategies", strategiesRouter);
app.use("/api/strategies/:strategyId/trades", tradesRouter);

app.use(errorHandler);

app.listen(config.port, async () => {
  try {
    await ensureBucket();
  } catch (err) {
    console.error("Failed to ensure MinIO bucket:", err);
  }
  console.log(`Server running on port ${config.port}`);
});
