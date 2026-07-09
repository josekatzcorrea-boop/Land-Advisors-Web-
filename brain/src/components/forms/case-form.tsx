"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { CaseTerrainsPanel } from "@/components/forms/case-terrains-panel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  createCase,
  deleteCase,
  updateCase,
} from "@/lib/actions/cases";
import { CASE_STATUS_LABELS } from "@/lib/labels";
import type {
  Case,
  CaseStatus,
  CaseTerrain,
  Client,
  Comuna,
  Json,
  Terrain,
} from "@/lib/types";

type CaseFormProps = {
  caseData?: Case;
  clients: Client[];
  comunas: Comuna[];
  terrains: Terrain[];
  caseTerrains?: CaseTerrain[];
  defaultClientId?: string;
};

const STATUS_OPTIONS = Object.keys(CASE_STATUS_LABELS) as CaseStatus[];

export function CaseForm({
  caseData,
  clients,
  comunas,
  terrains,
  caseTerrains = [],
  defaultClientId,
}: CaseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    client_id: caseData?.client_id ?? defaultClientId ?? "",
    title: caseData?.title ?? "",
    status: (caseData?.status ?? "borrador") as CaseStatus,
    comuna_id: caseData?.comuna_id ?? "",
    executive_summary: caseData?.executive_summary ?? "",
    client_problem: caseData?.client_problem ?? "",
    needs: caseData?.needs ?? "",
    restrictions: caseData?.restrictions ?? "",
    initial_hypothesis: caseData?.initial_hypothesis ?? "",
    alternatives_evaluated: caseData?.alternatives_evaluated
      ? JSON.stringify(caseData.alternatives_evaluated, null, 2)
      : "",
    analysis_text: caseData?.analysis_text ?? "",
    normativa: caseData?.normativa ?? "",
    land_use: caseData?.land_use ?? "",
    water: caseData?.water ?? "",
    electricity: caseData?.electricity ?? "",
    connectivity: caseData?.connectivity ?? "",
    topography: caseData?.topography ?? "",
    valuation: caseData?.valuation ?? "",
    risks: caseData?.risks ?? "",
    conclusions: caseData?.conclusions ?? "",
    final_recommendation: caseData?.final_recommendation ?? "",
    outcome: caseData?.outcome ?? "",
    learnings: caseData?.learnings ?? "",
    errors_detected: caseData?.errors_detected ?? "",
    would_do_again: caseData?.would_do_again ?? "",
    would_do_differently: caseData?.would_do_differently ?? "",
    lessons_learned: caseData?.lessons_learned ?? "",
    is_historical: caseData?.is_historical ?? false,
    closed_at: caseData?.closed_at
      ? caseData.closed_at.slice(0, 16)
      : "",
  });

  function updateField<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function buildPayload() {
    let alternatives: Json | undefined = undefined;
    if (form.alternatives_evaluated.trim()) {
      try {
        alternatives = JSON.parse(form.alternatives_evaluated) as Json;
      } catch {
        throw new Error("Alternativas evaluadas: JSON inválido");
      }
    }

    return {
      client_id: form.client_id,
      title: form.title,
      status: form.status as CaseStatus,
      comuna_id: form.comuna_id || null,
      executive_summary: form.executive_summary || null,
      client_problem: form.client_problem || null,
      needs: form.needs || null,
      restrictions: form.restrictions || null,
      initial_hypothesis: form.initial_hypothesis || null,
      alternatives_evaluated: alternatives,
      analysis_text: form.analysis_text || null,
      normativa: form.normativa || null,
      land_use: form.land_use || null,
      water: form.water || null,
      electricity: form.electricity || null,
      connectivity: form.connectivity || null,
      topography: form.topography || null,
      valuation: form.valuation || null,
      risks: form.risks || null,
      conclusions: form.conclusions || null,
      final_recommendation: form.final_recommendation || null,
      outcome: form.outcome || null,
      learnings: form.learnings || null,
      errors_detected: form.errors_detected || null,
      would_do_again: form.would_do_again || null,
      would_do_differently: form.would_do_differently || null,
      lessons_learned: form.lessons_learned || null,
      is_historical: form.is_historical,
      closed_at: form.closed_at
        ? new Date(form.closed_at).toISOString()
        : null,
    };
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    let payload;
    try {
      payload = buildPayload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el formulario");
      return;
    }

    startTransition(async () => {
      const result = caseData
        ? await updateCase({ id: caseData.id, ...payload })
        : await createCase(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/casos/${result.data.id}`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!caseData || !confirm("¿Eliminar este caso?")) return;

    startTransition(async () => {
      const result = await deleteCase(caseData.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/casos");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="analisis">Análisis</TabsTrigger>
          <TabsTrigger value="terrenos">Terrenos</TabsTrigger>
          <TabsTrigger value="aprendizajes">Aprendizajes</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                required
                value={form.title}
                onChange={(e) => updateField("title", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Cliente *</Label>
              <Select
                value={form.client_id}
                onValueChange={(v) => updateField("client_id", v)}
                disabled={!!caseData}
              >
                <SelectTrigger id="client_id">
                  <SelectValue placeholder="Seleccionar cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select
                value={form.status}
                onValueChange={(v) => updateField("status", v as CaseStatus)}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {CASE_STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="comuna_id">Comuna</Label>
              <Select
                value={form.comuna_id || "none"}
                onValueChange={(v) =>
                  updateField("comuna_id", v === "none" ? "" : v)
                }
              >
                <SelectTrigger id="comuna_id">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin asignar</SelectItem>
                  {comunas.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="closed_at">Fecha de cierre</Label>
              <Input
                id="closed_at"
                type="datetime-local"
                value={form.closed_at}
                onChange={(e) => updateField("closed_at", e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                id="is_historical"
                type="checkbox"
                checked={form.is_historical}
                onChange={(e) => updateField("is_historical", e.target.checked)}
                className="h-4 w-4 rounded border-la-blue/20"
              />
              <Label htmlFor="is_historical">Caso histórico</Label>
            </div>
          </div>
          {[
            ["executive_summary", "Resumen ejecutivo"],
            ["client_problem", "Problema del cliente"],
            ["needs", "Necesidades"],
            ["restrictions", "Restricciones"],
            ["initial_hypothesis", "Hipótesis inicial"],
            ["outcome", "Resultado"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  updateField(key as keyof typeof form, e.target.value)
                }
              />
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="alternatives_evaluated">
              Alternativas evaluadas (JSON)
            </Label>
            <Textarea
              id="alternatives_evaluated"
              value={form.alternatives_evaluated}
              onChange={(e) =>
                updateField("alternatives_evaluated", e.target.value)
              }
              placeholder='[{"nombre": "Opción A", "notas": "..."}]'
              className="font-mono text-xs"
            />
          </div>
        </TabsContent>

        <TabsContent value="analisis" className="space-y-4">
          {[
            ["analysis_text", "Texto de análisis"],
            ["normativa", "Normativa"],
            ["land_use", "Uso de suelo"],
            ["water", "Agua"],
            ["electricity", "Electricidad"],
            ["connectivity", "Conectividad"],
            ["topography", "Topografía"],
            ["valuation", "Valoración"],
            ["risks", "Riesgos"],
            ["conclusions", "Conclusiones"],
            ["final_recommendation", "Recomendación final"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  updateField(key as keyof typeof form, e.target.value)
                }
              />
            </div>
          ))}
        </TabsContent>

        <TabsContent value="terrenos">
          {caseData ? (
            <CaseTerrainsPanel
              caseId={caseData.id}
              terrains={terrains}
              caseTerrains={caseTerrains}
            />
          ) : (
            <p className="text-sm text-muted">
              Guarda el caso primero para vincular terrenos.
            </p>
          )}
        </TabsContent>

        <TabsContent value="aprendizajes" className="space-y-4">
          {[
            ["learnings", "Aprendizajes"],
            ["errors_detected", "Errores detectados"],
            ["would_do_again", "Qué haríamos de nuevo"],
            ["would_do_differently", "Qué haríamos distinto"],
            ["lessons_learned", "Lecciones aprendidas"],
          ].map(([key, label]) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={key}>{label}</Label>
              <Textarea
                id={key}
                value={form[key as keyof typeof form] as string}
                onChange={(e) =>
                  updateField(key as keyof typeof form, e.target.value)
                }
              />
            </div>
          ))}
        </TabsContent>
      </Tabs>

      <div className="flex gap-3 border-t border-la-blue/10 pt-6">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : caseData ? "Actualizar" : "Crear caso"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        {caseData && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isPending}
          >
            Eliminar
          </Button>
        )}
      </div>
    </form>
  );
}
