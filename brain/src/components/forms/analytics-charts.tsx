"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { AnalyticsStats } from "@/lib/actions/stats";
import { CASE_STATUS_LABELS, TERRAIN_STATUS_LABELS } from "@/lib/labels";
import type { CaseStatus, TerrainStatus } from "@/lib/types";

const CHART_COLORS = ["#052C4D", "#1A5F72", "#5B8FA0", "#3D6B5E", "#A7ADB3"];

type AnalyticsChartsProps = {
  stats: AnalyticsStats;
};

export function AnalyticsCharts({ stats }: AnalyticsChartsProps) {
  const casesData = Object.entries(stats.casesByStatus).map(([status, count]) => ({
    name: CASE_STATUS_LABELS[status as CaseStatus] ?? status,
    value: count,
  }));

  const terrainsData = Object.entries(stats.terrainsByStatus).map(
    ([status, count]) => ({
      name: TERRAIN_STATUS_LABELS[status as TerrainStatus] ?? status,
      value: count,
    }),
  );

  const comunasData = stats.comunasExitosas.slice(0, 8).map((c) => ({
    name: c.comuna_name,
    exitosos: c.successful_cases,
    total: c.total_cases,
  }));

  const discardData = stats.discardReasons.slice(0, 8);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-la-blue/10 bg-white p-6">
        <h3 className="mb-4 font-semibold text-la-blue">Casos por estado</h3>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={casesData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label={({ name, value }) => `${name}: ${value}`}
            >
              {casesData.map((_, i) => (
                <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-la-blue/10 bg-white p-6">
        <h3 className="mb-4 font-semibold text-la-blue">Terrenos por estado</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={terrainsData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#1A5F72" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-la-blue/10 bg-white p-6 lg:col-span-2">
        <h3 className="mb-4 font-semibold text-la-blue">
          Comunas con más casos exitosos
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={comunasData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" allowDecimals={false} />
            <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="exitosos" name="Exitosos" fill="#052C4D" radius={[0, 4, 4, 0]} />
            <Bar dataKey="total" name="Total casos" fill="#A7ADB3" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {discardData.length > 0 && (
        <div className="rounded-xl border border-la-blue/10 bg-white p-6 lg:col-span-2">
          <h3 className="mb-4 font-semibold text-la-blue">
            Motivos de descarte de terrenos
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={discardData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="reason" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={80} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Cantidad" fill="#3D6B5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
