"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import {
  BRAIN_PATHS,
  fail,
  formatZodError,
  getActorId,
  getSupabase,
  ok,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import { indexComuna } from "@/lib/knowledge";
import type { Comuna, ComunaRevision } from "@/lib/types";

const updateComunaSchema = z.object({
  id: uuidSchema,
  name: z.string().min(1).optional(),
  region: z.string().optional(),
  description: z.string().nullable().optional(),
  strengths: z.string().nullable().optional(),
  weaknesses: z.string().nullable().optional(),
  mop_projects: z.string().nullable().optional(),
  private_projects: z.string().nullable().optional(),
  connectivity_notes: z.string().nullable().optional(),
  hospitals: z.string().nullable().optional(),
  schools: z.string().nullable().optional(),
  demographics: z.string().nullable().optional(),
  normativa: z.string().nullable().optional(),
  prc_notes: z.string().nullable().optional(),
  valuation_notes: z.string().nullable().optional(),
  trends: z.string().nullable().optional(),
  internal_comments: z.string().nullable().optional(),
});

const listComunasSchema = z
  .object({
    search: z.string().optional(),
    region: z.string().optional(),
  })
  .optional();

export async function listComunas(
  filters?: z.infer<typeof listComunasSchema>,
): Promise<ActionResult<Comuna[]>> {
  const parsed = listComunasSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  let query = supabase.from("comunas").select("*").order("name");

  if (parsed.data?.region) {
    query = query.eq("region", parsed.data.region);
  }
  if (parsed.data?.search?.trim()) {
    query = query.ilike("name", `%${parsed.data.search.trim()}%`);
  }

  const { data, error } = await query;

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function getComuna(id: string): Promise<ActionResult<Comuna>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de comuna inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("comunas")
    .select("*")
    .eq("id", parsed.data)
    .single();

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function updateComuna(
  input: z.infer<typeof updateComunaSchema>,
): Promise<ActionResult<Comuna>> {
  const parsed = updateComunaSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const { id, ...updates } = parsed.data;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("comunas")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  try {
    await indexComuna(data);
  } catch (indexError) {
    console.error("indexComuna failed after updateComuna:", indexError);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "update",
    entityType: "comuna",
    entityId: data.id,
    summary: `Ficha comunal actualizada: ${data.name}`,
  });

  revalidatePath(BRAIN_PATHS.comunas);
  revalidatePath(BRAIN_PATHS.comuna(data.id));
  revalidatePath(BRAIN_PATHS.search);

  return ok(data);
}

export async function getComunaRevisions(
  comunaId: string,
): Promise<ActionResult<ComunaRevision[]>> {
  const parsed = uuidSchema.safeParse(comunaId);
  if (!parsed.success) {
    return fail("ID de comuna inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("comuna_revisions")
    .select("*")
    .eq("comuna_id", parsed.data)
    .order("created_at", { ascending: false });

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}
