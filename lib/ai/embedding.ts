import { embed, embedMany } from "ai";
import { google } from "@ai-sdk/google";
import { db } from "../db";
import { cosineDistance, desc, gt, sql } from "drizzle-orm";
import { embeddings } from "../db/schema/embeddings";
import {
  RecursiveCharacterTextSplitter,
  MarkdownTextSplitter,
} from "@langchain/textsplitters";
// Use a model with 768 dimensions instead
const embeddingModel = google.textEmbeddingModel("text-embedding-004");

// const generateChunks = (input: string): string[] => {
//   return input
//     .trim()
//     .split(".")
//     .filter((i) => i !== "");
// };

const generateChunks = async (input: string): Promise<string[]> => {
  const finalChunks: string[] = [];
  const mdSplitter = RecursiveCharacterTextSplitter.fromLanguage("markdown", {
    chunkSize: 1000,
    chunkOverlap: 100,
  });

  const characterSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 100,
    // Add separators that the character splitter should use
    separators: ["\n\n", "\n", " ", ""],
  });
  const mdDocs = await mdSplitter.createDocuments([input]);

  for (const doc of mdDocs) {
    // The pageContent of the document is the content of the Markdown section.
    // Use the character splitter to split this content further if needed.
    // createDocuments takes an array of strings or Documents.
    const chunksFromSection = await characterSplitter.createDocuments([
      doc.pageContent,
    ]);

    // Add the content of these smaller chunks to the final list
    // We can also prepend the header metadata to each chunk for better context.
    // The metadata from markdownSplitter is in doc.metadata.
    // Note: MarkdownTextSplitter adds header info directly to metadata
    const headerMetadata = Object.entries(doc.metadata || {}) // Use empty object if metadata is null/undefined
      .map(([key, value]) => `${key}: ${value}`)
      .join(" | ");

    chunksFromSection.forEach((chunk) => {
      // Prepend header information to the chunk content
      // Also consider if the chunk itself starts with a header line (due to chunkHeader: true)
      // and avoid duplicating the header info if it's already at the very start of the chunk content.
      const chunkContentWithHeader =
        headerMetadata &&
        !chunk.pageContent.startsWith(
          Object.values(doc.metadata || {}).join(" "),
        )
          ? `${headerMetadata}\n\n${chunk.pageContent}`
          : chunk.pageContent;

      finalChunks.push(chunkContentWithHeader);
    });
  }

  // 3. Filter out any empty chunks
  return finalChunks.filter((chunk) => chunk.trim().length > 0);
};

export const generateEmbeddings = async (
  value: string,
): Promise<Array<{ embedding: number[]; content: string }>> => {
  const chunks = await generateChunks(value);
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  return embeddings.map((e, i) => ({ content: chunks[i], embedding: e }));
};

export const generateEmbedding = async (value: string): Promise<number[]> => {
  const input = value.replaceAll("\\n", " ");
  const { embedding } = await embed({
    model: embeddingModel,
    value: input,
  });

  return embedding;
};

export const findRelevantContent = async (userQuery: string) => {
  const userQueryEmbedded = await generateEmbedding(userQuery);
  const similarity = sql<number>`1 - (${cosineDistance(
    embeddings.embedding,
    userQueryEmbedded,
  )})`;

  const similarGuides = await db
    .select({ name: embeddings.content, similarity })
    .from(embeddings)
    .where(gt(similarity, 0.5))
    .orderBy((t) => desc(t.similarity))
    .limit(4);

  return similarGuides;
};
