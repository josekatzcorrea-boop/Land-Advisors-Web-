import { EstadisticasClient } from "@/components/estadisticas-client";
import { getAnalyticsStats } from "@/lib/actions/stats";

export default async function EstadisticasPage() {
  const result = await getAnalyticsStats();

  return (
    <EstadisticasClient
      stats={result.success ? result.data : null}
      error={result.success ? undefined : result.error}
    />
  );
}
