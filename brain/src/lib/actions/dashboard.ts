"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  fail,
  getSupabase,
  ok,
  type ActionResult,
} from "@/lib/actions/utils";
import type { ActivityLog } from "@/lib/types";

export type DashboardStats = {
  clients: number;
  activeClients: number;
  cases: number;
  activeCases: number;
  closedCases: number;
  historicalCases: number;
  terrains: number;
  comunas: number;
  documents: number;
  successfulPurchases: number;
};

export async function getDashboardStats(): Promise<ActionResult<DashboardStats>> {
  const supabase = await getSupabase();

  const [
    clientsRes,
    activeClientsRes,
    casesRes,
    activeCasesRes,
    closedCasesRes,
    historicalCasesRes,
    terrainsRes,
    comunasRes,
    documentsRes,
    purchasesRes,
  ] = await Promise.all([
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .in("status", ["activo", "en_negociacion"]),
    supabase.from("cases").select("id", { count: "exact", head: true }),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "activo"),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("status", "cerrado"),
    supabase
      .from("cases")
      .select("id", { count: "exact", head: true })
      .eq("is_historical", true),
    supabase.from("terrains").select("id", { count: "exact", head: true }),
    supabase.from("comunas").select("id", { count: "exact", head: true }),
    supabase.from("documents").select("id", { count: "exact", head: true }),
    supabase
      .from("clients")
      .select("id", { count: "exact", head: true })
      .eq("status", "cerrado_compra"),
  ]);

  const firstError =
    clientsRes.error ??
    activeClientsRes.error ??
    casesRes.error ??
    activeCasesRes.error ??
    closedCasesRes.error ??
    historicalCasesRes.error ??
    terrainsRes.error ??
    comunasRes.error ??
    documentsRes.error ??
    purchasesRes.error;

  if (firstError) {
    return fail(firstError.message);
  }

  return ok({
    clients: clientsRes.count ?? 0,
    activeClients: activeClientsRes.count ?? 0,
    cases: casesRes.count ?? 0,
    activeCases: activeCasesRes.count ?? 0,
    closedCases: closedCasesRes.count ?? 0,
    historicalCases: historicalCasesRes.count ?? 0,
    terrains: terrainsRes.count ?? 0,
    comunas: comunasRes.count ?? 0,
    documents: documentsRes.count ?? 0,
    successfulPurchases: purchasesRes.count ?? 0,
  });
}

export async function getRecentActivity(
  limit = 20,
): Promise<ActionResult<ActivityLog[]>> {
  const safeLimit = Math.min(Math.max(limit, 1), 100);

  const { data, error } = await createAdminClient()
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}
