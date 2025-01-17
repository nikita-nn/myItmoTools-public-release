import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const System = sqliteTable("system", {
  id: integer("id").default(1),
  key: text("key"),
  activatedTo: text("activatedTo"),
});
