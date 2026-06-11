import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "3000", 10),
  databaseUrl: process.env.DATABASE_URL || "postgres://tj_user:tj_pass@localhost:5432/trading_journal",
  minioEndpoint: process.env.MINIO_ENDPOINT || "localhost:9000",
  minioAccessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
  minioSecretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
  minioBucket: process.env.MINIO_BUCKET || "trades",
  minioUseSSL: process.env.MINIO_USE_SSL === "true",
};
