import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const PESettings = sqliteTable("PESettings", {
  id: integer("id").default(1),
  mode: text("mode"),
  taskId: integer("taskId"),
});
