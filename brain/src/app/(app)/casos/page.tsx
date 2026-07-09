import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { listCases } from "@/lib/actions/cases";
import { listClients } from "@/lib/actions/clients";
import { CASE_STATUS_LABELS } from "@/lib/labels";

export default async function CasosPage() {
  const result = await listCases();
  const clientsResult = await listClients();
  const clientMap = new Map(
    (clientsResult.success ? clientsResult.data : []).map((c) => [c.id, c.name]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Casos"
        description="Casos de asesoría y análisis territorial."
        action={
          <Button asChild>
            <Link href="/casos/nuevo">Nuevo caso</Link>
          </Button>
        }
      />

      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result.success && result.data.length === 0 && (
        <p className="text-sm text-muted">
          No hay casos.{" "}
          <Link href="/casos/nuevo" className="text-la-teal underline">
            Crear el primero
          </Link>
        </p>
      )}

      {result.success && result.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-la-blue/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-la-blue/10 bg-la-mist/50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Título</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-la-blue/5 last:border-0 hover:bg-la-mist/30"
                >
                  <td className="px-4 py-3 font-medium">{c.title}</td>
                  <td className="px-4 py-3 text-muted">
                    {clientMap.get(c.client_id) ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {CASE_STATUS_LABELS[c.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {c.is_historical ? "Histórico" : "Activo"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/casos/${c.id}`}>Ver</Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
