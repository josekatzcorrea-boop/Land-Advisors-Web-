"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateComuna } from "@/lib/actions/comunas";
import type { Comuna } from "@/lib/types";

type ComunaFormProps = {
  comuna: Comuna;
};

const FIELDS: { key: keyof Comuna; label: string; multiline?: boolean }[] = [
  { key: "name", label: "Nombre" },
  { key: "region", label: "Región" },
  { key: "description", label: "Descripción", multiline: true },
  { key: "strengths", label: "Fortalezas", multiline: true },
  { key: "weaknesses", label: "Debilidades", multiline: true },
  { key: "mop_projects", label: "Proyectos MOP", multiline: true },
  { key: "private_projects", label: "Proyectos privados", multiline: true },
  { key: "connectivity_notes", label: "Conectividad", multiline: true },
  { key: "hospitals", label: "Hospitales", multiline: true },
  { key: "schools", label: "Colegios", multiline: true },
  { key: "demographics", label: "Demografía", multiline: true },
  { key: "normativa", label: "Normativa", multiline: true },
  { key: "prc_notes", label: "Notas PRC", multiline: true },
  { key: "valuation_notes", label: "Notas de valoración", multiline: true },
  { key: "trends", label: "Tendencias", multiline: true },
  { key: "internal_comments", label: "Comentarios internos", multiline: true },
];

export function ComunaForm({ comuna }: ComunaFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(
    Object.fromEntries(
      FIELDS.map((f) => [f.key, (comuna[f.key] as string) ?? ""]),
    ) as Record<string, string>,
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const updates: Record<string, string | null> = {};
    for (const field of FIELDS) {
      if (field.key === "name" || field.key === "region") {
        updates[field.key] = form[field.key] || (field.key === "name" ? comuna.name : comuna.region);
      } else {
        updates[field.key] = form[field.key] || null;
      }
    }

    startTransition(async () => {
      const result = await updateComuna({ id: comuna.id, ...updates });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {FIELDS.map((field) => (
        <div key={field.key} className="space-y-2">
          <Label htmlFor={field.key}>{field.label}</Label>
          {field.multiline ? (
            <Textarea
              id={field.key}
              value={form[field.key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
            />
          ) : (
            <Input
              id={field.key}
              required={field.key === "name"}
              value={form[field.key]}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, [field.key]: e.target.value }))
              }
            />
          )}
        </div>
      ))}

      <Button type="submit" disabled={isPending}>
        {isPending ? "Guardando…" : "Guardar cambios"}
      </Button>
    </form>
  );
}
