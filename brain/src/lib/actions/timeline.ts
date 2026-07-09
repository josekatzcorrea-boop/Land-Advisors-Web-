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
  timelineEventTypeSchema,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import type { TimelineEvent } from "@/lib/types";

const createTimelineEventSchema = z.object({
  client_id: uuidSchema,
  case_id: uuidSchema.nullable().optional(),
  event_type: timelineEventTypeSchema.optional(),
  title: z.string().min(1, "Título requerido"),
  description: z.string().nullable().optional(),
  occurred_at: z.string().datetime().optional(),
});

export async function listTimelineForClient(
  clientId: string,
): Promise<ActionResult<TimelineEvent[]>> {
  const parsed = uuidSchema.safeParse(clientId);
  if (!parsed.success) {
    return fail("ID de cliente inválido");
  }

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("timeline_events")
    .select("*")
    .eq("client_id", parsed.data)
    .order("occurred_at", { ascending: false });

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function createTimelineEvent(
  input: z.infer<typeof createTimelineEventSchema>,
): Promise<ActionResult<TimelineEvent>> {
  const parsed = createTimelineEventSchema.safeParse(input);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const actorId = await getActorId();
  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("timeline_events")
    .insert({
      ...parsed.data,
      created_by: actorId,
    })
    .select()
    .single();

  if (error) {
    return fail(error.message);
  }

  await logActivity({
    actorId,
    action: "create",
    entityType: "timeline_event",
    entityId: data.id,
    summary: `Evento en timeline: ${data.title}`,
  });

  revalidatePath(BRAIN_PATHS.client(data.client_id));
  if (data.case_id) {
    revalidatePath(BRAIN_PATHS.case(data.case_id));
  }
  revalidatePath(BRAIN_PATHS.dashboard);

  return ok(data);
}
