import { sql } from "drizzle-orm";
import { varchar, uuid, timestamp, json } from "drizzle-orm/pg-core";
import { createTable } from "./resources";

export const chats = createTable("chats", {
  id: uuid("id").primaryKey().notNull().defaultRandom(),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .default(sql`CURRENT_TIMESTAMP`)
    .notNull(),
  messages: json("messages").notNull(),
  userID: varchar("userID").notNull(),
});
