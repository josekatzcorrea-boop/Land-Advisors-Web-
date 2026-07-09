"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { AnalyticsStats } from "@/lib/actions/stats";
import { CASE_STATUS_LABELS, TERRAIN_STATUS_LABELS } from "@/lib/labels";

const COLORS = ["#052C4D", "#1A5F72", "#5B8FA0", "#3D6B5E", "#A7ADB3"];

type EstadisticasClientProps = {
  stats: AnalyticsStats | null;
  error?: string;
};

export function EstadisticasClient({ stats, error }: EstadisticasClientProps) {
  if (error || !stats) {
    return (
      <div className="space-y-6">
        <PageHeader title="Estadísticas" description="Análisis agregado del portafolio." />
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error ?? "No se pudieron cargar las estadísticas."}
        </div>
      </div>
    );
  }

  const casesData = Object.entries(stats.casesByStatus).map(([key, value]) => ({
    name: CASE_STATUS_LABELS[key as keyof typeof CASE_STATUS_LABELS] ?? key,
    value,
  }));

  const terrainsData = Object.entries(stats.terrainsByStatus).map(
    ([key, value]) => ({
      name: TERRAIN_STATUS_LABELS[key as keyof typeof TERRAIN_STATUS_LABELS] ?? key,
      value,
    }),
  );

  const discardData = stats.discardReasons.slice(0, 8);
  const comunaData = stats.comunasExitosas.slice(0, 8);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Estadísticas"
        description="Métricas agregadas de clientes, casos y terrenos."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Presupuesto promedio</CardDescription>
            <CardTitle className="text-2xl">
              {stats.avgBudgetUf ? `${stats.avgBudgetUf} UF` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mediana presupuesto</CardDescription>
            <CardTitle className="text-2xl">
              {stats.medianBudgetUf ? `${stats.medianBudgetUf} UF` : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Compras exitosas</CardDescription>
            <CardTitle className="text-2xl">{stats.successfulPurchases}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Satisfacción promedio</CardDescription>
            <CardTitle className="text-2xl">
              {stats.avgSatisfaction ?? "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Casos por estado</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {casesData.length === 0 ? (
              <p className="text-sm text-muted">Sin datos.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={casesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                    {casesData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Terrenos por estado</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {terrainsData.length === 0 ? (
              <p className="text-sm text-muted">Sin datos.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={terrainsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#1A5F72" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Motivos de descarte</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {discardData.length === 0 ? (
              <p className="text-sm text-muted">Sin datos.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={discardData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis dataKey="reason" type="category" width={120} tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#052C4D" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comunas con más casos</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            {comunaData.length === 0 ? (
              <p className="text-sm text-muted">Sin datos.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={comunaData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="comuna_name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total_cases" fill="#5B8FA0" name="Total casos" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="successful_cases" fill="#3D6B5E" name="Exitosos" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
