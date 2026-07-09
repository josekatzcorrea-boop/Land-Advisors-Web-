import { format } from "date-fns";
import { es } from "date-fns/locale";

import { DocumentUploadForm } from "@/components/forms/document-upload-form";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { listDocuments } from "@/lib/actions/documents";

export default async function BibliotecaPage() {
  const result = await listDocuments({ limit: 100 });

  return (
    <div className="space-y-8">
      <PageHeader
        title="Biblioteca"
        description="Documentos internos indexados para búsqueda e IA."
      />

      <Card>
        <CardHeader>
          <CardTitle>Subir documento</CardTitle>
          <CardDescription>
            PDF, texto plano o markdown. Se indexará automáticamente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            {result.success ? `${result.data.length} archivos` : "—"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!result.success && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {result.error}
            </div>
          )}

          {result.success && result.data.length === 0 && (
            <p className="text-sm text-muted">No hay documentos aún.</p>
          )}

          {result.success && result.data.length > 0 && (
            <ul className="divide-y divide-la-blue/10">
              {result.data.map((doc) => (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-sm text-muted">{doc.file_name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {format(new Date(doc.created_at), "PP", { locale: es })}
                      {doc.file_size
                        ? ` · ${Math.round(doc.file_size / 1024)} KB`
                        : ""}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
