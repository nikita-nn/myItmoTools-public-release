import { drizzle } from "drizzle-orm/better-sqlite3";
export const db = drizzle("localDb.db");
