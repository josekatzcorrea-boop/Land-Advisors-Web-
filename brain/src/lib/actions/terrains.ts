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
  terrainStatusSchema,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import type { Terrain } from "@/lib/types";

const createTerrainSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  comuna_id: uuidSchema.nullable().optional(),
  region: z.string().nullable().optional(),
  rol: z.string().nullable().optional(),
  surface_m2: z.number().nonnegative().nullable().optional(),
  price_uf: z.number().nonnegative().nullable().optional(),
  slope: z.string().nullable().optional(),
  water: z.string().nullable().optional(),
  electricity: z.string().nullable().optional(),
  road: z.string().nullable().optional(),
  fiber: z.string().nullable().optional(),
  view_notes: z.string().nullable().optional(),
  forest: z.string().nullable().optional(),
  land_use: z.string().nullable().optional(),
  restrictions: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  status: terrainStatusSchema.optional(),
  photo_urls: z.array(z.string().url()).optional(),
});

const updateTerrainSchema = createTerrainSchema.partial().extend({
  id: uuidSchema,
});

const listTerrainsSchema = z
  .object({
    status: terrainStatusSchema.optional(),
    comuna_id: uuidSchema.optional(),
    search: z.string().optional(),
    limit: z.number().int().positive().max(200).optional(),
  })
  .optional();

export async function listTerrains(
  filters?: z.infer<typeof listTerrainsSchema>,
): Promise<ActionResult<Terrain[]>> {
  const parsed = listTerrainsSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  let query = supabase
    .from("terrains")
    .select("*")
    .order("updated_at", { ascending: false });

  if (parsed.data?.status) {
    query = query.eq("status", parsed.data.status);
  }
  if (parsed.data?.comuna_id) {
    query = query.eq("comuna_id", parsed.data.comuna_id);
  }
  if (parsed.data?.search?.trim()) {
    query = query.ilike("name", `%${parsed.data.search.trim()}%`);
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

export async function getTerrain(id: string): Promise<ActionResult<Terrain>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de terreno inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("terrains")
    .select("*")
    .eq("id", parsed.data)
    .single();

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function createTerrain(
  input: z.infer<typeof createTerrainSchema>,
): Promise<ActionResult<Terrain>> {
  const parsed = createTerrainSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("terrains")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "create",
    entityType: "terrain",
    entityId: data.id,
    summary: `Terreno creado: ${data.name}`,
  });

  revalidatePath(BRAIN_PATHS.terrains);
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok(data);
}

export async function updateTerrain(
  input: z.infer<typeof updateTerrainSchema>,
): Promise<ActionResult<Terrain>> {
  const parsed = updateTerrainSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const { id, ...updates } = parsed.data;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("terrains")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "update",
    entityType: "terrain",
    entityId: data.id,
    summary: `Terreno actualizado: ${data.name}`,
  });

  revalidatePath(BRAIN_PATHS.terrains);
  revalidatePath(BRAIN_PATHS.terrain(data.id));
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok(data);
}

export async function deleteTerrain(
  id: string,
): Promise<ActionResult<{ id: string }>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de terreno inválido");
  }

  const supabase = await getSupabase();
  const { data: existing } = await supabase
    .from("terrains")
    .select("name")
    .eq("id", parsed.data)
    .single();

  const { error } = await supabase.from("terrains").delete().eq("id", parsed.data);

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "delete",
    entityType: "terrain",
    entityId: parsed.data,
    summary: `Terreno eliminado: ${existing?.name ?? parsed.data}`,
  });

  revalidatePath(BRAIN_PATHS.terrains);
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok({ id: parsed.data });
}
