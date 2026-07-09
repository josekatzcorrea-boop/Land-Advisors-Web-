"use server";

import { z } from "zod";

import { createEmbedding } from "@/lib/embeddings";
import {
  fail,
  formatZodError,
  getSupabase,
  ok,
  type ActionResult,
} from "@/lib/actions/utils";
import type { HybridSearchResult } from "@/lib/types";

const hybridSearchSchema = z.object({
  query: z.string().min(1, "Consulta requerida"),
  matchCount: z.number().int().positive().max(50).optional(),
  fullTextWeight: z.number().positive().optional(),
  semanticWeight: z.number().positive().optional(),
});

export async function hybridSearch(
  input: z.infer<typeof hybridSearchSchema> | string,
): Promise<ActionResult<HybridSearchResult[]>> {
  const parsed =
    typeof input === "string"
      ? hybridSearchSchema.safeParse({ query: input })
      : hybridSearchSchema.safeParse(input);

  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const { query, matchCount, fullTextWeight, semanticWeight } = parsed.data;
  const trimmed = query.trim();

  if (!trimmed) {
    return fail("Consulta vacía");
  }

  let embedding: number[];

  try {
    embedding = await createEmbedding(trimmed);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error al generar embedding";
    return fail(message);
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase.rpc("hybrid_search", {
    query_text: trimmed,
    query_embedding: embedding,
    match_count: matchCount ?? 20,
    full_text_weight: fullTextWeight ?? 1,
    semantic_weight: semanticWeight ?? 1,
  });

  if (error) {
    return fail(error.message);
  }

  return ok(data ?? []);
}
