import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listComunas } from "@/lib/actions/comunas";
import { listTerrains } from "@/lib/actions/terrains";
import { TERRAIN_STATUS_LABELS } from "@/lib/labels";

export default async function TerrenosPage() {
  const [terrainsResult, comunasResult] = await Promise.all([
    listTerrains(),
    listComunas(),
  ]);

  const comunaMap = new Map(
    (comunasResult.success ? comunasResult.data : []).map((c) => [
      c.id,
      c.name,
    ]),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Terrenos"
        description="Base de terrenos evaluados y referencias."
        action={
          <Button asChild>
            <Link href="/terrenos/nuevo">Nuevo terreno</Link>
          </Button>
        }
      />

      {!terrainsResult.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {terrainsResult.error}
        </div>
      )}

      {terrainsResult.success && terrainsResult.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted">
            No hay terrenos.{" "}
            <Link href="/terrenos/nuevo" className="text-la-teal underline">
              Crear el primero
            </Link>
          </CardContent>
        </Card>
      )}

      {terrainsResult.success && terrainsResult.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-la-blue/10 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-la-blue/10 bg-la-mist/50 text-left text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nombre</th>
                <th className="px-4 py-3 font-medium">Comuna</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Superficie</th>
                <th className="px-4 py-3 font-medium">Precio</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {terrainsResult.data.map((t) => (
                <tr
                  key={t.id}
                  className="border-b border-la-blue/5 last:border-0 hover:bg-la-mist/30"
                >
                  <td className="px-4 py-3 font-medium">{t.name}</td>
                  <td className="px-4 py-3 text-muted">
                    {t.comuna_id ? comunaMap.get(t.comuna_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary">
                      {TERRAIN_STATUS_LABELS[t.status]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {t.surface_m2 ? `${t.surface_m2} m²` : "—"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {t.price_uf ? `${t.price_uf} UF` : "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/terrenos/${t.id}`}>Ver</Link>
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
