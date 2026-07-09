"use server";

import {
  fail,
  getSupabase,
  ok,
  type ActionResult,
} from "@/lib/actions/utils";

export type DiscardReasonStat = {
  reason: string;
  count: number;
};

export type ComunaSuccessStat = {
  comuna_id: string | null;
  comuna_name: string;
  successful_cases: number;
  total_cases: number;
  success_rate: number;
};

export type AnalyticsStats = {
  avgBudgetUf: number | null;
  medianBudgetUf: number | null;
  clientsWithBudget: number;
  successfulPurchases: number;
  closedWithoutPurchase: number;
  avgSatisfaction: number | null;
  comunasExitosas: ComunaSuccessStat[];
  discardReasons: DiscardReasonStat[];
  terrainsByStatus: Record<string, number>;
  casesByStatus: Record<string, number>;
};

function median(values: number[]): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }

  return sorted[mid];
}

export async function getAnalyticsStats(): Promise<ActionResult<AnalyticsStats>> {
  const supabase = await getSupabase();

  const [
    clientsRes,
    casesRes,
    comunasRes,
    discardRes,
    terrainsRes,
  ] = await Promise.all([
    supabase
      .from("clients")
      .select("budget_uf, status, satisfaction"),
    supabase.from("cases").select("id, status, comuna_id, outcome"),
    supabase.from("comunas").select("id, name"),
    supabase
      .from("case_terrains")
      .select("discard_reason")
      .eq("role", "descartado")
      .not("discard_reason", "is", null),
    supabase.from("terrains").select("status"),
  ]);

  const firstError =
    clientsRes.error ??
    casesRes.error ??
    comunasRes.error ??
    discardRes.error ??
    terrainsRes.error;

  if (firstError) {
    return fail(firstError.message);
  }

  const clients = clientsRes.data ?? [];
  const cases = casesRes.data ?? [];
  const comunas = comunasRes.data ?? [];
  const discards = discardRes.data ?? [];
  const terrains = terrainsRes.data ?? [];

  const budgets = clients
    .map((c) => c.budget_uf)
    .filter((v): v is number => v !== null && v !== undefined);

  const satisfactions = clients
    .map((c) => c.satisfaction)
    .filter((v): v is number => v !== null && v !== undefined);

  const comunaNameById = new Map(comunas.map((c) => [c.id, c.name]));

  const comunaStats = new Map<
    string,
    { successful: number; total: number; name: string }
  >();

  for (const caseRow of cases) {
    const key = caseRow.comuna_id ?? "sin_comuna";
    const name = caseRow.comuna_id
      ? (comunaNameById.get(caseRow.comuna_id) ?? "Comuna desconocida")
      : "Sin comuna";

    const current = comunaStats.get(key) ?? {
      successful: 0,
      total: 0,
      name,
    };

    current.total += 1;

    const outcome = caseRow.outcome?.toLowerCase() ?? "";
    const isSuccess =
      outcome.includes("compra") ||
      outcome.includes("éxito") ||
      outcome.includes("exito") ||
      outcome.includes("cerrado con compra");

    if (isSuccess || caseRow.status === "cerrado") {
      if (isSuccess) {
        current.successful += 1;
      }
    }

    comunaStats.set(key, current);
  }

  const comunasExitosas = [...comunaStats.entries()]
    .map(([key, stat]) => ({
      comuna_id: key === "sin_comuna" ? null : key,
      comuna_name: stat.name,
      successful_cases: stat.successful,
      total_cases: stat.total,
      success_rate:
        stat.total > 0 ? Math.round((stat.successful / stat.total) * 100) : 0,
    }))
    .sort((a, b) => b.successful_cases - a.successful_cases);

  const discardCounts = new Map<string, number>();

  for (const row of discards) {
    const reason = row.discard_reason?.trim();
    if (!reason) {
      continue;
    }
    discardCounts.set(reason, (discardCounts.get(reason) ?? 0) + 1);
  }

  const discardReasons = [...discardCounts.entries()]
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);

  const casesByStatus: Record<string, number> = {};
  for (const caseRow of cases) {
    casesByStatus[caseRow.status] = (casesByStatus[caseRow.status] ?? 0) + 1;
  }

  const terrainsByStatus: Record<string, number> = {};
  for (const terrain of terrains) {
    terrainsByStatus[terrain.status] =
      (terrainsByStatus[terrain.status] ?? 0) + 1;
  }

  return ok({
    avgBudgetUf:
      budgets.length > 0
        ? Math.round(
            (budgets.reduce((sum, v) => sum + v, 0) / budgets.length) * 100,
          ) / 100
        : null,
    medianBudgetUf: median(budgets),
    clientsWithBudget: budgets.length,
    successfulPurchases: clients.filter((c) => c.status === "cerrado_compra")
      .length,
    closedWithoutPurchase: clients.filter(
      (c) => c.status === "cerrado_sin_compra",
    ).length,
    avgSatisfaction:
      satisfactions.length > 0
        ? Math.round(
            (satisfactions.reduce((sum, v) => sum + v, 0) /
              satisfactions.length) *
              100,
          ) / 100
        : null,
    comunasExitosas,
    discardReasons,
    terrainsByStatus,
    casesByStatus,
  });
}
