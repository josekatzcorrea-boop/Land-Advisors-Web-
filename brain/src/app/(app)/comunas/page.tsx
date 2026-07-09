import Link from "next/link";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { listComunas } from "@/lib/actions/comunas";

export default async function ComunasPage() {
  const result = await listComunas();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Comunas"
        description="Fichas comunales vivas del territorio."
      />

      {!result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </div>
      )}

      {result.success && result.data.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center text-muted">
            No hay comunas cargadas. Ejecuta la migración SQL con el seed inicial.
          </CardContent>
        </Card>
      )}

      {result.success && result.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((comuna) => (
            <Link
              key={comuna.id}
              href={`/comunas/${comuna.id}`}
              className="group rounded-xl border border-la-blue/10 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <h3 className="font-semibold text-la-blue group-hover:text-la-teal">
                {comuna.name}
              </h3>
              <p className="mt-1 text-sm text-muted">{comuna.region}</p>
              {comuna.description && (
                <p className="mt-3 line-clamp-2 text-sm text-muted">
                  {comuna.description}
                </p>
              )}
              <Button variant="ghost" size="sm" className="mt-4 px-0">
                Editar ficha →
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
