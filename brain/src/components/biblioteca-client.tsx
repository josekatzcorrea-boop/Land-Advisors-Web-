"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { uploadDocument } from "@/lib/actions/documents";
import type { Document } from "@/lib/types";

type BibliotecaClientProps = {
  initialDocuments: Document[];
};

export function BibliotecaClient({ initialDocuments }: BibliotecaClientProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Selecciona un archivo");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    if (title.trim()) formData.append("title", title.trim());

    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTitle("");
      if (fileRef.current) fileRef.current.value = "";
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Biblioteca"
        description="Documentos internos indexados para búsqueda."
      />

      <Card>
        <CardHeader>
          <CardTitle>Subir documento</CardTitle>
          <CardDescription>PDF, TXT o MD</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpload} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="title">Título (opcional)</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre descriptivo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">Archivo</Label>
              <Input
                id="file"
                ref={fileRef}
                type="file"
                accept=".pdf,.txt,.md,text/*,application/pdf"
              />
            </div>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Subiendo…" : "Subir"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Documentos ({initialDocuments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {initialDocuments.length === 0 ? (
            <p className="text-sm text-muted">Sin documentos aún.</p>
          ) : (
            <ul className="divide-y divide-la-blue/5">
              {initialDocuments.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{doc.title}</p>
                    <p className="text-xs text-muted">
                      {doc.file_name}
                      {doc.file_size
                        ? ` · ${Math.round(doc.file_size / 1024)} KB`
                        : ""}
                    </p>
                  </div>
                  <span className="text-xs text-muted">
                    {new Date(doc.created_at).toLocaleDateString("es-CL")}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
