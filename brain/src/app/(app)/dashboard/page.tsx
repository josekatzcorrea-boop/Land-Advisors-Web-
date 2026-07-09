import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnalyticsStats } from "@/lib/actions/stats";
import { getDashboardStats, getRecentActivity } from "@/lib/actions/dashboard";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

export default async function DashboardPage() {
  const [statsResult, activityResult, analyticsResult] = await Promise.all([
    getDashboardStats(),
    getRecentActivity(12),
    getAnalyticsStats(),
  ]);

  const stats = statsResult.success ? statsResult.data : null;
  const activity = activityResult.success ? activityResult.data : [];
  const topComunas = analyticsResult.success
    ? analyticsResult.data.comunasExitosas.slice(0, 5)
    : [];

  const statCards = stats
    ? [
        { label: "Clientes", value: stats.clients, sub: `${stats.activeClients} activos` },
        { label: "Casos", value: stats.cases, sub: `${stats.activeCases} activos` },
        { label: "Terrenos", value: stats.terrains, sub: `${stats.comunas} comunas` },
        { label: "Compras exitosas", value: stats.successfulPurchases, sub: `${stats.documents} documentos` },
      ]
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Vista general del conocimiento territorial acumulado."
      />

      {!statsResult.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {statsResult.error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardHeader className="pb-2">
              <CardDescription>{card.label}</CardDescription>
              <CardTitle className="text-3xl font-semibold">{card.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top comunas</CardTitle>
            <CardDescription>Comunas con más casos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            {topComunas.length === 0 ? (
              <p className="text-sm text-muted">Sin datos aún.</p>
            ) : (
              <ul className="space-y-3">
                {topComunas.map((comuna) => (
                  <li
                    key={comuna.comuna_id ?? comuna.comuna_name}
                    className="flex items-center justify-between rounded-lg bg-la-mist px-4 py-3"
                  >
                    <div>
                      <p className="font-medium">{comuna.comuna_name}</p>
                      <p className="text-xs text-muted">
                        {comuna.successful_cases} exitosos / {comuna.total_cases} casos
                      </p>
                    </div>
                    {comuna.comuna_id && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/comunas/${comuna.comuna_id}`}>Ver</Link>
                      </Button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted">Sin actividad registrada.</p>
            ) : (
              <ul className="space-y-3">
                {activity.map((item) => (
                  <li
                    key={item.id}
                    className="border-b border-la-blue/5 pb-3 last:border-0 last:pb-0"
                  >
                    <p className="text-sm">{item.summary}</p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDistanceToNow(new Date(item.created_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
