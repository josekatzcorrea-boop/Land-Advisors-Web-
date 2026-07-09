"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import {
  BRAIN_PATHS,
  caseStatusSchema,
  caseTerrainRoleSchema,
  fail,
  formatZodError,
  getActorId,
  getSupabase,
  ok,
  optionalDateSchema,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import { indexCase } from "@/lib/knowledge";
import type { Case, CaseTerrain, Json } from "@/lib/types";

const createCaseSchema = z.object({
  client_id: uuidSchema,
  title: z.string().min(1, "Título requerido"),
  status: caseStatusSchema.optional(),
  comuna_id: uuidSchema.nullable().optional(),
  executive_summary: z.string().nullable().optional(),
  client_problem: z.string().nullable().optional(),
  needs: z.string().nullable().optional(),
  restrictions: z.string().nullable().optional(),
  initial_hypothesis: z.string().nullable().optional(),
  alternatives_evaluated: z.custom<Json>().optional(),
  analysis_text: z.string().nullable().optional(),
  normativa: z.string().nullable().optional(),
  land_use: z.string().nullable().optional(),
  water: z.string().nullable().optional(),
  electricity: z.string().nullable().optional(),
  connectivity: z.string().nullable().optional(),
  topography: z.string().nullable().optional(),
  valuation: z.string().nullable().optional(),
  risks: z.string().nullable().optional(),
  conclusions: z.string().nullable().optional(),
  final_recommendation: z.string().nullable().optional(),
  outcome: z.string().nullable().optional(),
  learnings: z.string().nullable().optional(),
  errors_detected: z.string().nullable().optional(),
  would_do_again: z.string().nullable().optional(),
  would_do_differently: z.string().nullable().optional(),
  lessons_learned: z.string().nullable().optional(),
  is_historical: z.boolean().optional(),
  closed_at: z.string().datetime().nullable().optional(),
});

const updateCaseSchema = createCaseSchema.partial().extend({
  id: uuidSchema,
});

const listCasesSchema = z
  .object({
    client_id: uuidSchema.optional(),
    status: caseStatusSchema.optional(),
    comuna_id: uuidSchema.optional(),
    is_historical: z.boolean().optional(),
    search: z.string().optional(),
    limit: z.number().int().positive().max(200).optional(),
  })
  .optional();

const linkTerrainSchema = z.object({
  case_id: uuidSchema,
  terrain_id: uuidSchema,
  role: caseTerrainRoleSchema.optional(),
  discard_reason: z.string().nullable().optional(),
  visit_date: optionalDateSchema,
  notes: z.string().nullable().optional(),
});

const unlinkTerrainSchema = z.object({
  case_id: uuidSchema,
  terrain_id: uuidSchema,
});

export async function listCases(
  filters?: z.infer<typeof listCasesSchema>,
): Promise<ActionResult<Case[]>> {
  const parsed = listCasesSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  let query = supabase
    .from("cases")
    .select("*")
    .order("updated_at", { ascending: false });

  if (parsed.data?.client_id) {
    query = query.eq("client_id", parsed.data.client_id);
  }
  if (parsed.data?.status) {
    query = query.eq("status", parsed.data.status);
  }
  if (parsed.data?.comuna_id) {
    query = query.eq("comuna_id", parsed.data.comuna_id);
  }
  if (parsed.data?.is_historical !== undefined) {
    query = query.eq("is_historical", parsed.data.is_historical);
  }
  if (parsed.data?.search?.trim()) {
    query = query.ilike("title", `%${parsed.data.search.trim()}%`);
  }
  if (parsed.data?.limit) {
    query = query.limit(parsed.data.limit);
  }

  const { data, error } = await query;

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function getCase(id: string): Promise<ActionResult<Case>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de caso inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", parsed.data)
    .single();

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function createCase(
  input: z.infer<typeof createCaseSchema>,
): Promise<ActionResult<Case>> {
  const parsed = createCaseSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("cases")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  try {
    await indexCase(data);
  } catch (indexError) {
    console.error("indexCase failed after createCase:", indexError);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "create",
    entityType: "case",
    entityId: data.id,
    summary: `Caso creado: ${data.title}`,
  });

  revalidatePath(BRAIN_PATHS.cases);
  revalidatePath(BRAIN_PATHS.case(data.id));
  revalidatePath(BRAIN_PATHS.client(data.client_id));
  revalidatePath(BRAIN_PATHS.dashboard);
  revalidatePath(BRAIN_PATHS.search);

  return ok(data);
}

export async function updateCase(
  input: z.infer<typeof updateCaseSchema>,
): Promise<ActionResult<Case>> {
  const parsed = updateCaseSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const { id, ...updates } = parsed.data;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("cases")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  try {
    await indexCase(data);
  } catch (indexError) {
    console.error("indexCase failed after updateCase:", indexError);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "update",
    entityType: "case",
    entityId: data.id,
    summary: `Caso actualizado: ${data.title}`,
  });

  revalidatePath(BRAIN_PATHS.cases);
  revalidatePath(BRAIN_PATHS.case(data.id));
  revalidatePath(BRAIN_PATHS.client(data.client_id));
  revalidatePath(BRAIN_PATHS.dashboard);
  revalidatePath(BRAIN_PATHS.search);

  return ok(data);
}

export async function deleteCase(id: string): Promise<ActionResult<{ id: string }>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de caso inválido");
  }

  const supabase = await getSupabase();
  const { data: existing } = await supabase
    .from("cases")
    .select("title, client_id")
    .eq("id", parsed.data)
    .single();

  const { error } = await supabase.from("cases").delete().eq("id", parsed.data);

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "delete",
    entityType: "case",
    entityId: parsed.data,
    summary: `Caso eliminado: ${existing?.title ?? parsed.data}`,
  });

  revalidatePath(BRAIN_PATHS.cases);
  if (existing?.client_id) {
    revalidatePath(BRAIN_PATHS.client(existing.client_id));
  }
  revalidatePath(BRAIN_PATHS.dashboard);
  revalidatePath(BRAIN_PATHS.search);

  return ok({ id: parsed.data });
}

export async function getCaseTerrains(
  caseId: string,
): Promise<ActionResult<CaseTerrain[]>> {
  const parsed = uuidSchema.safeParse(caseId);
  if (!parsed.success) {
    return fail("ID de caso inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("case_terrains")
    .select("*")
    .eq("case_id", parsed.data)
    .order("visit_date", { ascending: false });

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function linkTerrainToCase(
  input: z.infer<typeof linkTerrainSchema>,
): Promise<ActionResult<CaseTerrain>> {
  const parsed = linkTerrainSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("case_terrains")
    .upsert(parsed.data, { onConflict: "case_id,terrain_id" })
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "link_terrain",
    entityType: "case",
    entityId: parsed.data.case_id,
    summary: `Terreno vinculado al caso (${data.role})`,
  });

  revalidatePath(BRAIN_PATHS.case(parsed.data.case_id));
  revalidatePath(BRAIN_PATHS.terrain(parsed.data.terrain_id));

  return ok(data);
}

export async function unlinkTerrain(
  input: z.infer<typeof unlinkTerrainSchema>,
): Promise<ActionResult<{ case_id: string; terrain_id: string }>> {
  const parsed = unlinkTerrainSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const { error } = await supabase
    .from("case_terrains")
    .delete()
    .eq("case_id", parsed.data.case_id)
    .eq("terrain_id", parsed.data.terrain_id);

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "unlink_terrain",
    entityType: "case",
    entityId: parsed.data.case_id,
    summary: "Terreno desvinculado del caso",
  });

  revalidatePath(BRAIN_PATHS.case(parsed.data.case_id));
  revalidatePath(BRAIN_PATHS.terrain(parsed.data.terrain_id));

  return ok(parsed.data);
}
