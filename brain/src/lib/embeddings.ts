import OpenAI from "openai";

const EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 1536;

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const normalized = text.replace(/\s+/g, " ").trim();

  if (!normalized) {
    throw new Error("Cannot create embedding for empty text");
  }

  const response = await getOpenAIClient().embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalized,
    dimensions: EMBEDDING_DIMENSIONS,
  });

  const embedding = response.data[0]?.embedding;

  if (!embedding) {
    throw new Error("OpenAI returned no embedding");
  }

  return embedding;
}

export type ChunkTextOptions = {
  maxChars?: number;
  overlap?: number;
};

export function chunkText(
  text: string,
  options: ChunkTextOptions = {},
): string[] {
  const maxChars = options.maxChars ?? 2000;
  const overlap = options.overlap ?? 200;

  const normalized = text.replace(/\r\n/g, "\n").trim();

  if (!normalized) {
    return [];
  }

  if (normalized.length <= maxChars) {
    return [normalized];
  }

  const paragraphs = normalized.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  const pushCurrent = () => {
    const trimmed = current.trim();
    if (trimmed) {
      chunks.push(trimmed);
    }
    current = "";
  };

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      pushCurrent();
    }

    if (paragraph.length <= maxChars) {
      current = paragraph;
      continue;
    }

    let start = 0;

    while (start < paragraph.length) {
      const end = Math.min(start + maxChars, paragraph.length);
      chunks.push(paragraph.slice(start, end).trim());
      if (end >= paragraph.length) {
        break;
      }
      start = Math.max(end - overlap, start + 1);
    }
  }

  pushCurrent();

  if (chunks.length <= 1) {
    return chunks;
  }

  const merged: string[] = [];

  for (const chunk of chunks) {
    const previous = merged[merged.length - 1];

    if (previous && previous.length + 2 + chunk.length <= maxChars) {
      merged[merged.length - 1] = `${previous}\n\n${chunk}`;
    } else {
      merged.push(chunk);
    }
  }

  return merged;
}
