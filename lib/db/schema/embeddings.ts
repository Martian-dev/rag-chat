import { nanoid } from "@/lib/utils";
import { index, text, varchar, vector } from "drizzle-orm/pg-core";
import { createTable } from "./resources";

export const embeddings = createTable(
  "embeddings",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => nanoid()),
    resourceURL: varchar("resource_url").notNull(),
    content: text("content").notNull(),
    embedding: vector("embedding", { dimensions: 768 }).notNull(),
  },
  (table) => ({
    embeddingIndex: index("embeddingIndex").using(
      "hnsw",
      table.embedding.op("vector_cosine_ops"),
    ),
  }),
);
