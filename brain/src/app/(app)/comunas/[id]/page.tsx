import { notFound } from "next/navigation";
import { format } from "date-fns";
import { es } from "date-fns/locale";

import { ComunaForm } from "@/components/forms/comuna-form";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getComuna, getComunaRevisions } from "@/lib/actions/comunas";

type Props = { params: Promise<{ id: string }> };

export default async function ComunaDetailPage({ params }: Props) {
  const { id } = await params;
  const [comunaResult, revisionsResult] = await Promise.all([
    getComuna(id),
    getComunaRevisions(id),
  ]);

  if (!comunaResult.success) {
    notFound();
  }

  const revisions = revisionsResult.success ? revisionsResult.data : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={comunaResult.data.name}
        description={`Ficha comunal · ${comunaResult.data.region}`}
      />

      <Card>
        <CardContent className="pt-6">
          <ComunaForm comuna={comunaResult.data} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de revisiones</CardTitle>
          <CardDescription>
            Cambios guardados automáticamente al actualizar la ficha
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revisions.length === 0 ? (
            <p className="text-sm text-muted">Sin revisiones previas.</p>
          ) : (
            <ul className="space-y-4">
              {revisions.map((rev) => (
                <li
                  key={rev.id}
                  className="rounded-lg border border-la-blue/10 bg-la-mist/30 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">
                        {rev.change_summary ?? "Actualización de ficha"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {format(new Date(rev.created_at), "PPpp", {
                          locale: es,
                        })}
                      </p>
                    </div>
                  </div>
                  {rev.snapshot && typeof rev.snapshot === "object" && (
                    <details className="mt-2">
                      <summary className="cursor-pointer text-xs text-la-teal">
                        Ver snapshot
                      </summary>
                      <pre className="mt-2 max-h-48 overflow-auto rounded bg-white p-3 text-xs">
                        {JSON.stringify(rev.snapshot, null, 2)}
                      </pre>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
