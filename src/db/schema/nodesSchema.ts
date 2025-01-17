import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Nodes = sqliteTable("nodes", {
  id: text("id"),
  url: text("url").notNull(),
  name: text("name").notNull().unique(),
  ping: integer("ping").default(0).notNull(),
  selected: text("selected").default("false"),
});
