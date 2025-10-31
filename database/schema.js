import Card from "@/components/Card";
import { bigint, json } from "drizzle-orm/pg-core";
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
  snapshot: json("snapshot").notNull(),
  createdAt: timestamp("created_at", {
    withTimezone: true,
  }).defaultNow(),
});

export const recommendationTb = pgTable("recommendation_table", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  comparisionId: uuid("comparison_id").references(() => comparisonsTb.id, {
    onDelete: "cascade",
  }),
  aiRecomendation: text("ai_recommendation").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
});

export const UserLikes = pgTable("user_likes", {
  id: uuid("id").notNull().primaryKey().unique().defaultRandom(),
  userId: text("user_id"),
  snapshot: json("snapshot"),
});
