import { pgTable, serial, varchar, text, timestamp, numeric, integer } from "drizzle-orm/pg-core";

export const strategies = pgTable("strategies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const trades = pgTable("trades", {
  id: serial("id").primaryKey(),
  strategyId: integer("strategy_id").notNull().references(() => strategies.id, { onDelete: "cascade" }),
  openScreenshotUrl: text("open_screenshot_url").notNull(),
  closeScreenshotUrl: text("close_screenshot_url"),
  resultR: numeric("result_r", { precision: 10, scale: 2 }),
  notes: text("notes"),
  pair: varchar("pair", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
