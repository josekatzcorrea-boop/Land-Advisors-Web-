"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import {
  BRAIN_PATHS,
  clientObjectiveSchema,
  clientStatusSchema,
  fail,
  formatZodError,
  getActorId,
  getSupabase,
  ok,
  optionalDateSchema,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import type { Client } from "@/lib/types";

const createClientSchema = z.object({
  name: z.string().min(1, "Nombre requerido"),
  email: z.string().email().nullable().optional(),
  phone: z.string().nullable().optional(),
  first_contact_date: optionalDateSchema,
  status: clientStatusSchema.optional(),
  budget_uf: z.number().nonnegative().nullable().optional(),
  payment_method: z.string().nullable().optional(),
  objective: clientObjectiveSchema.nullable().optional(),
  notes: z.string().nullable().optional(),
  final_result: z.string().nullable().optional(),
  satisfaction: z.number().int().min(1).max(5).nullable().optional(),
  purchase_date: optionalDateSchema,
  purchased_terrain_id: uuidSchema.nullable().optional(),
});

const updateClientSchema = createClientSchema.partial().extend({
  id: uuidSchema,
});

const listClientsSchema = z
  .object({
    status: clientStatusSchema.optional(),
    search: z.string().optional(),
    limit: z.number().int().positive().max(200).optional(),
  })
  .optional();

export async function listClients(
  filters?: z.infer<typeof listClientsSchema>,
): Promise<ActionResult<Client[]>> {
  const parsed = listClientsSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  let query = supabase
    .from("clients")
    .select("*")
    .order("updated_at", { ascending: false });

  if (parsed.data?.status) {
    query = query.eq("status", parsed.data.status);
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

export async function getClient(id: string): Promise<ActionResult<Client>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de cliente inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .eq("id", parsed.data)
    .single();

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function createClient(
  input: z.infer<typeof createClientSchema>,
): Promise<ActionResult<Client>> {
  const parsed = createClientSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("clients")
    .insert(parsed.data)
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "create",
    entityType: "client",
    entityId: data.id,
    summary: `Cliente creado: ${data.name}`,
  });

  revalidatePath(BRAIN_PATHS.clients);
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok(data);
}

export async function updateClient(
  input: z.infer<typeof updateClientSchema>,
): Promise<ActionResult<Client>> {
  const parsed = updateClientSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const { id, ...updates } = parsed.data;
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("clients")
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
    entityType: "client",
    entityId: data.id,
    summary: `Cliente actualizado: ${data.name}`,
  });

  revalidatePath(BRAIN_PATHS.clients);
  revalidatePath(BRAIN_PATHS.client(data.id));
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok(data);
}

export async function deleteClient(id: string): Promise<ActionResult<{ id: string }>> {
  const parsed = uuidSchema.safeParse(id);
  if (!parsed.success) {
    return fail("ID de cliente inválido");
  }

  const supabase = await getSupabase();
  const { data: existing } = await supabase
    .from("clients")
    .select("name")
    .eq("id", parsed.data)
    .single();

  const { error } = await supabase.from("clients").delete().eq("id", parsed.data);

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId: await getActorId(),
    action: "delete",
    entityType: "client",
    entityId: parsed.data,
    summary: `Cliente eliminado: ${existing?.name ?? parsed.data}`,
  });

  revalidatePath(BRAIN_PATHS.clients);
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok({ id: parsed.data });
}
