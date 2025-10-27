import {
  uuid,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  pgEnum,
  date,
} from "drizzle-orm/pg-core";

export const searchTb = pgTable("search_tb", {
  id: uuid("id").notNull().primaryKey().unique(),
  userId: integer("user_id").notNull(),
  query: text("query").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const comparisonsTb = pgTable("comparison_table", {
  id: uuid("id").notNull().primaryKey().unique(),
  userId: integer("user_id").notNull(),
  searchId: integer("search_id")
    .notNull()
    .references(() => searchTb.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const comparisonItemsTb = pgTable("comparison_items_table", {
  id: uuid("id").notNull().primaryKey().unique(),
  comparisonId: uuid("comparison_id")
    .notNull()
    .references(() => comparisonsTb.id, { onDelete: "cascade" }),
  source: text("source"),
  productTitle: text("product_title").notNull(),
  productUrl: text("product_url").notNull(),
  productImage: text("product_image"),
  merchant: text("merchant"),
  description: text("description"),
  productPrice: numeric("product_price", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const recommendationTb = pgTable("recommendation_table", {
  id: uuid("id").notNull().primaryKey().unique(),
  comparisionId: integer("comparison_id").references(() => comparisonsTb.id, {
    onDelete: "cascade",
  }),
  aiRecomendation: text("ai_recommendation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});
