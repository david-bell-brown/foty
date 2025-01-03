// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  timestamp,
  varchar,
  text,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `foty_${name}`);

// Projects table
export const projects = createTable(
  "project",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    nameIndex: index("project_name_idx").on(table.name),
  }),
);

// Ranking Categories table
export const rankingCategories = createTable(
  "ranking_category",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 256 }).notNull(),
    description: text("description"),
    orderIndex: integer("order_index").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    projectIdIndex: index("ranking_category_project_id_idx").on(
      table.projectId,
    ),
    nameIndex: index("ranking_category_name_idx").on(table.name),
  }),
);

// Items table
export const items = createTable(
  "item",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 256 }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    projectIdIndex: index("item_project_id_idx").on(table.projectId),
    nameIndex: index("item_name_idx").on(table.name),
  }),
);

// ItemRankings table - stores the ranking of items within each category
export const itemRankings = createTable(
  "item_ranking",
  {
    categoryId: uuid("category_id")
      .notNull()
      .references(() => rankingCategories.id, { onDelete: "cascade" }),
    itemId: uuid("item_id")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    rank: integer("rank").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.categoryId, table.itemId] }),
    categoryIdIndex: index("item_ranking_category_id_idx").on(table.categoryId),
    itemIdIndex: index("item_ranking_item_id_idx").on(table.itemId),
  }),
);
