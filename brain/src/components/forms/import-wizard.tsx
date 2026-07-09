"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

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
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { quickImportHistoricalCase } from "@/lib/actions/import";
import {
  CLIENT_OBJECTIVE_LABELS,
  CLIENT_STATUS_LABELS,
  TIMELINE_EVENT_LABELS,
} from "@/lib/labels";
import type {
  ClientObjective,
  ClientStatus,
  TimelineEventType,
} from "@/lib/types";

type ImportWizardProps = {
  comunas: { id: string; name: string }[];
};

const STEPS = [
  "Cliente",
  "Caso — Resumen",
  "Caso — Análisis",
  "Aprendizajes",
  "Confirmar",
];

export function ImportWizard({ comunas }: ImportWizardProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [client, setClient] = useState({
    name: "",
    email: "",
    phone: "",
    first_contact_date: "",
    status: "cerrado_compra" as ClientStatus,
    budget_uf: "",
    payment_method: "",
    objective: "" as ClientObjective | "",
    notes: "",
    final_result: "",
    satisfaction: "",
    purchase_date: "",
  });

  const [caseData, setCaseData] = useState({
    title: "",
    comuna_id: "",
    executive_summary: "",
    client_problem: "",
    needs: "",
    restrictions: "",
    initial_hypothesis: "",
    alternatives_evaluated: "",
    analysis_text: "",
    normativa: "",
    land_use: "",
    water: "",
    electricity: "",
    connectivity: "",
    topography: "",
    valuation: "",
    risks: "",
    conclusions: "",
    final_recommendation: "",
    outcome: "",
    learnings: "",
    errors_detected: "",
    would_do_again: "",
    would_do_differently: "",
    lessons_learned: "",
    closed_at: "",
  });

  const [timeline, setTimeline] = useState({
    event_type: "nota" as TimelineEventType,
    title: "",
    description: "",
    occurred_at: "",
  });

  function handleImport() {
    setError(null);

    let alternatives: import("@/lib/types").Json | undefined;
    if (caseData.alternatives_evaluated.trim()) {
      try {
        alternatives = JSON.parse(
          caseData.alternatives_evaluated,
        ) as import("@/lib/types").Json;
      } catch {
        setError("Alternativas evaluadas: JSON inválido");
        return;
      }
    }

    startTransition(async () => {
      const result = await quickImportHistoricalCase({
        client: {
          name: client.name,
          email: client.email || null,
          phone: client.phone || null,
          first_contact_date: client.first_contact_date || null,
          status: client.status,
          budget_uf: client.budget_uf ? Number(client.budget_uf) : null,
          payment_method: client.payment_method || null,
          objective: client.objective || null,
          notes: client.notes || null,
          final_result: client.final_result || null,
          satisfaction: client.satisfaction ? Number(client.satisfaction) : null,
          purchase_date: client.purchase_date || null,
        },
        case: {
          title: caseData.title,
          comuna_id: caseData.comuna_id || null,
          executive_summary: caseData.executive_summary || null,
          client_problem: caseData.client_problem || null,
          needs: caseData.needs || null,
          restrictions: caseData.restrictions || null,
          initial_hypothesis: caseData.initial_hypothesis || null,
          alternatives_evaluated: alternatives,
          analysis_text: caseData.analysis_text || null,
          normativa: caseData.normativa || null,
          land_use: caseData.land_use || null,
          water: caseData.water || null,
          electricity: caseData.electricity || null,
          connectivity: caseData.connectivity || null,
          topography: caseData.topography || null,
          valuation: caseData.valuation || null,
          risks: caseData.risks || null,
          conclusions: caseData.conclusions || null,
          final_recommendation: caseData.final_recommendation || null,
          outcome: caseData.outcome || null,
          learnings: caseData.learnings || null,
          errors_detected: caseData.errors_detected || null,
          would_do_again: caseData.would_do_again || null,
          would_do_differently: caseData.would_do_differently || null,
          lessons_learned: caseData.lessons_learned || null,
          closed_at: caseData.closed_at
            ? new Date(caseData.closed_at).toISOString()
            : null,
        },
        timeline: timeline.title || timeline.description
          ? {
              event_type: timeline.event_type,
              title: timeline.title || undefined,
              description: timeline.description || null,
              occurred_at: timeline.occurred_at
                ? new Date(timeline.occurred_at).toISOString()
                : undefined,
            }
          : undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/casos/${result.data.case.id}`);
      router.refresh();
    });
  }

  const canNext =
    step === 0
      ? client.name.trim().length > 0
      : step === 1
        ? caseData.title.trim().length > 0
        : true;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`rounded-full px-3 py-1 text-xs font-medium ${
              i === step
                ? "bg-la-blue text-white"
                : i < step
                  ? "bg-la-teal/20 text-la-teal"
                  : "bg-la-blue/5 text-muted"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step]}</CardTitle>
          <CardDescription>Paso {step + 1} de {STEPS.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label>Nombre cliente *</Label>
                <Input value={client.name} onChange={(e) => setClient({ ...client, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Teléfono</Label>
                <Input value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Primer contacto</Label>
                <Input type="date" value={client.first_contact_date} onChange={(e) => setClient({ ...client, first_contact_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={client.status} onValueChange={(v) => setClient({ ...client, status: v as ClientStatus })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CLIENT_STATUS_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Presupuesto UF</Label>
                <Input type="number" value={client.budget_uf} onChange={(e) => setClient({ ...client, budget_uf: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Forma de pago</Label>
                <Input value={client.payment_method} onChange={(e) => setClient({ ...client, payment_method: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Objetivo</Label>
                <Select value={client.objective || "none"} onValueChange={(v) => setClient({ ...client, objective: v === "none" ? "" : (v as ClientObjective) })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin definir</SelectItem>
                    {Object.entries(CLIENT_OBJECTIVE_LABELS).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Satisfacción (1-5)</Label>
                <Input type="number" min="1" max="5" value={client.satisfaction} onChange={(e) => setClient({ ...client, satisfaction: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Fecha compra</Label>
                <Input type="date" value={client.purchase_date} onChange={(e) => setClient({ ...client, purchase_date: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Notas</Label>
                <Textarea value={client.notes} onChange={(e) => setClient({ ...client, notes: e.target.value })} />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>Resultado final</Label>
                <Textarea value={client.final_result} onChange={(e) => setClient({ ...client, final_result: e.target.value })} />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label>Título del caso *</Label>
                  <Input value={caseData.title} onChange={(e) => setCaseData({ ...caseData, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Comuna</Label>
                  <Select value={caseData.comuna_id || "none"} onValueChange={(v) => setCaseData({ ...caseData, comuna_id: v === "none" ? "" : v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {comunas.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Fecha cierre</Label>
                  <Input type="datetime-local" value={caseData.closed_at} onChange={(e) => setCaseData({ ...caseData, closed_at: e.target.value })} />
                </div>
              </div>
              {[
                ["executive_summary", "Resumen ejecutivo"],
                ["client_problem", "Problema del cliente"],
                ["needs", "Necesidades"],
                ["restrictions", "Restricciones"],
                ["initial_hypothesis", "Hipótesis inicial"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Textarea
                    value={caseData[key as keyof typeof caseData]}
                    onChange={(e) => setCaseData({ ...caseData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="space-y-2">
                <Label>Alternativas evaluadas (JSON)</Label>
                <Textarea
                  value={caseData.alternatives_evaluated}
                  onChange={(e) =>
                    setCaseData({ ...caseData, alternatives_evaluated: e.target.value })
                  }
                  className="font-mono text-xs"
                  placeholder='[{"nombre": "Opción A"}]'
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {[
                ["analysis_text", "Análisis"],
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
                ["outcome", "Resultado"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Textarea
                    value={caseData[key as keyof typeof caseData]}
                    onChange={(e) => setCaseData({ ...caseData, [key]: e.target.value })}
                  />
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {[
                ["learnings", "Aprendizajes"],
                ["errors_detected", "Errores detectados"],
                ["would_do_again", "Qué haríamos de nuevo"],
                ["would_do_differently", "Qué haríamos distinto"],
                ["lessons_learned", "Lecciones aprendidas"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Textarea
                    value={caseData[key as keyof typeof caseData]}
                    onChange={(e) => setCaseData({ ...caseData, [key]: e.target.value })}
                  />
                </div>
              ))}
              <div className="border-t border-la-blue/10 pt-4">
                <p className="mb-3 text-sm font-medium">Evento en timeline (opcional)</p>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select value={timeline.event_type} onValueChange={(v) => setTimeline({ ...timeline, event_type: v as TimelineEventType })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.entries(TIMELINE_EVENT_LABELS).map(([k, v]) => (
                          <SelectItem key={k} value={k}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fecha</Label>
                    <Input type="datetime-local" value={timeline.occurred_at} onChange={(e) => setTimeline({ ...timeline, occurred_at: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Título</Label>
                    <Input value={timeline.title} onChange={(e) => setTimeline({ ...timeline, title: e.target.value })} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label>Descripción</Label>
                    <Textarea value={timeline.description} onChange={(e) => setTimeline({ ...timeline, description: e.target.value })} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3 text-sm">
              <p><strong>Cliente:</strong> {client.name}</p>
              <p><strong>Caso:</strong> {caseData.title}</p>
              <p><strong>Comuna:</strong> {comunas.find((c) => c.id === caseData.comuna_id)?.name ?? "—"}</p>
              <p className="text-muted">Se creará como caso histórico cerrado con indexación automática.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        {step > 0 && (
          <Button type="button" variant="secondary" onClick={() => setStep(step - 1)}>
            Anterior
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep(step + 1)} disabled={!canNext}>
            Siguiente
          </Button>
        ) : (
          <Button type="button" onClick={handleImport} disabled={isPending}>
            {isPending ? "Importando…" : "Importar caso"}
          </Button>
        )}
        <Button type="button" variant="ghost" asChild>
          <Link href="/casos">Cancelar</Link>
        </Button>
      </div>
    </div>
  );
}
