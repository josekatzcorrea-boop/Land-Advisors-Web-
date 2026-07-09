"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import {
  BRAIN_PATHS,
  caseStatusSchema,
  clientObjectiveSchema,
  clientStatusSchema,
  fail,
  formatZodError,
  getActorId,
  getSupabase,
  ok,
  optionalDateSchema,
  timelineEventTypeSchema,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import { indexCase } from "@/lib/knowledge";
import type { Case, Client, Json, TimelineEvent } from "@/lib/types";

const quickImportSchema = z.object({
  client: z.object({
    name: z.string().min(1),
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
  }),
  case: z.object({
    title: z.string().min(1),
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
    closed_at: z.string().datetime().nullable().optional(),
  }),
  timeline: z
    .object({
      event_type: timelineEventTypeSchema.optional(),
      title: z.string().min(1).optional(),
      description: z.string().nullable().optional(),
      occurred_at: z.string().datetime().optional(),
    })
    .optional(),
});

export type QuickImportResult = {
  client: Client;
  case: Case;
  timeline: TimelineEvent | null;
};

export async function quickImportHistoricalCase(
  data: z.infer<typeof quickImportSchema>,
): Promise<ActionResult<QuickImportResult>> {
  const parsed = quickImportSchema.safeParse(data);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  const actorId = await getActorId();

  const { data: client, error: clientError } = await supabase
    .from("clients")
    .insert(parsed.data.client)
    .select()
    .single();

  if (clientError || !client) {
    return fail(clientError?.message ?? "No se pudo crear el cliente");
  }

  const { data: caseRow, error: caseError } = await supabase
    .from("cases")
    .insert({
      ...parsed.data.case,
      client_id: client.id,
      is_historical: true,
      status: parsed.data.case.status ?? "cerrado",
    })
    .select()
    .single();

  if (caseError || !caseRow) {
    await supabase.from("clients").delete().eq("id", client.id);
    return fail(caseError?.message ?? "No se pudo crear el caso");
  }

  let timeline: TimelineEvent | null = null;

  if (parsed.data.timeline) {
    const { data: timelineRow, error: timelineError } = await supabase
      .from("timeline_events")
      .insert({
        client_id: client.id,
        case_id: caseRow.id,
        event_type: parsed.data.timeline.event_type ?? "nota",
        title:
          parsed.data.timeline.title ??
          `Importación histórica: ${caseRow.title}`,
        description: parsed.data.timeline.description ?? null,
        occurred_at: parsed.data.timeline.occurred_at ?? new Date().toISOString(),
        created_by: actorId,
      })
      .select()
      .single();

    if (timelineError) {
      await supabase.from("cases").delete().eq("id", caseRow.id);
      await supabase.from("clients").delete().eq("id", client.id);
      return fail(timelineError.message);
    }

    timeline = timelineRow;
  }

  try {
    await indexCase(caseRow);
  } catch (indexError) {
    console.error("indexCase failed after quickImportHistoricalCase:", indexError);
  }

  await logActivity({
    actorId,
    action: "import_historical",
    entityType: "case",
    entityId: caseRow.id,
    summary: `Importación rápida: ${client.name} — ${caseRow.title}`,
  });

  revalidatePath(BRAIN_PATHS.import);
  revalidatePath(BRAIN_PATHS.clients);
  revalidatePath(BRAIN_PATHS.client(client.id));
  revalidatePath(BRAIN_PATHS.cases);
  revalidatePath(BRAIN_PATHS.case(caseRow.id));
  revalidatePath(BRAIN_PATHS.dashboard);
  revalidatePath(BRAIN_PATHS.analytics);
  revalidatePath(BRAIN_PATHS.search);

  return ok({ client, case: caseRow, timeline });
}
