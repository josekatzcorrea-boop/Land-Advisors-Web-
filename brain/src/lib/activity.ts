import { createAdminClient } from "@/lib/supabase/admin";
import type { ActivityLog, ActivityLogInsert } from "@/lib/types";

export type LogActivityInput = {
  actorId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  summary: string;
};

export async function logActivity(
  input: LogActivityInput,
): Promise<ActivityLog> {
  const payload: ActivityLogInsert = {
    actor_id: input.actorId ?? null,
    action: input.action,
    entity_type: input.entityType,
    entity_id: input.entityId ?? null,
    summary: input.summary,
  };

  const { data, error } = await createAdminClient()
    .from("activity_log")
    .insert(payload)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
