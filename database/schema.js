import { bigint } from "drizzle-orm/gel-core";
import {
  uuid,
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";
import { numeric } from "drizzle-orm/sqlite-core";

export const searchTb = pgTable("search_tb", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  userId: text("user_id").notNull(),
  query: text("query").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const comparisonsTb = pgTable("comparison_table", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  userId: text("user_id").notNull(),
  searchId: uuid("search_id")
    .notNull()
    .references(() => searchTb.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const comparisonItemsTb = pgTable("comparison_items_table", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  comparisonId: uuid("comparison_id")
    .notNull()
    .references(() => comparisonsTb.id, { onDelete: "cascade" }),
  source: text("source"),
  productTitle: text("product_title").notNull(),
  productUrl: text("product_url").notNull(),
  productImage: text("product_image"),
  merchant: text("merchant"),
  description: text("description"),
  productPrice: bigint("product_price"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const recommendationTb = pgTable("recommendation_table", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  comparisionId: uuid("comparison_id").references(() => comparisonsTb.id, {
    onDelete: "cascade",
  }),
  aiRecomendation: text("ai_recommendation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
