import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listClients } from "@/lib/actions/clients";
import { CLIENT_STATUS_LABELS } from "@/lib/labels";

export default async function ClientesPage() {
  const result = await listClients();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clientes"
        description="Gestión de clientes y su historial."
        action={
          <Button asChild>
            <Link href="/clientes/nuevo">Nuevo cliente</Link>
          </Button>
        }
      />

      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result.success && result.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted">
            No hay clientes registrados.{" "}
            <Link href="/clientes/nuevo" className="text-la-teal underline">
              Crear el primero
            </Link>
          </CardContent>
        </Card>
      )}

      {result.success && result.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-la-blue/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-la-blue/10 bg-la-mist/50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Presupuesto</th>
                <th className="px-4 py-3 font-medium">Contacto</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {result.data.map((client) => (
                <tr
                  key={client.id}
                  className="border-b border-la-blue/5 last:border-0 hover:bg-la-mist/30"
                >
                  <td className="px-4 py-3 font-medium">{client.name}</td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {CLIENT_STATUS_LABELS[client.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {client.budget_uf ? `${client.budget_uf} UF` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {client.email ?? client.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/clientes/${client.id}`}>Ver</Link>
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
