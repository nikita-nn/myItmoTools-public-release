import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const Users = sqliteTable("users", {
  isu_id: text("isu_id").notNull().unique().primaryKey(),
  password: text("password").notNull(),
  refresh_token: text("refresh_token").notNull(),
  access_token: text("access_token").notNull(),
  selected: text("selected").default("false"),
  timeToUpdate: integer("timeToUpdate", { mode: "timestamp" }),
  isTelegramLinked: text("isTelegramLinked").notNull().default("false"),
});
