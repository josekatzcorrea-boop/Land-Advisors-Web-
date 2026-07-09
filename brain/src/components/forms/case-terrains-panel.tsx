"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
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
  linkTerrainToCase,
  unlinkTerrain,
} from "@/lib/actions/cases";
import { CASE_TERRAIN_ROLE_LABELS } from "@/lib/labels";
import type { CaseTerrain, CaseTerrainRole, Terrain } from "@/lib/types";

type CaseTerrainsPanelProps = {
  caseId: string;
  terrains: Terrain[];
  caseTerrains: CaseTerrain[];
};

const ROLE_OPTIONS = Object.keys(
  CASE_TERRAIN_ROLE_LABELS,
) as CaseTerrainRole[];

export function CaseTerrainsPanel({
  caseId,
  terrains,
  caseTerrains: initialCaseTerrains,
}: CaseTerrainsPanelProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [caseTerrains, setCaseTerrains] = useState(initialCaseTerrains);

  const [linkForm, setLinkForm] = useState({
    terrain_id: "",
    role: "visitado" as CaseTerrainRole,
    discard_reason: "",
    visit_date: "",
    notes: "",
  });

  const linkedIds = new Set(caseTerrains.map((ct) => ct.terrain_id));
  const availableTerrains = terrains.filter((t) => !linkedIds.has(t.id));

  function handleLink(e: React.FormEvent) {
    e.preventDefault();
    if (!linkForm.terrain_id) return;
    setError(null);

    startTransition(async () => {
      const result = await linkTerrainToCase({
        case_id: caseId,
        terrain_id: linkForm.terrain_id,
        role: linkForm.role,
        discard_reason: linkForm.discard_reason || null,
        visit_date: linkForm.visit_date || null,
        notes: linkForm.notes || null,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setCaseTerrains((prev) => {
        const filtered = prev.filter(
          (ct) => ct.terrain_id !== result.data.terrain_id,
        );
        return [...filtered, result.data];
      });
      setLinkForm({
        terrain_id: "",
        role: "visitado",
        discard_reason: "",
        visit_date: "",
        notes: "",
      });
      router.refresh();
    });
  }

  function handleUnlink(terrainId: string) {
    if (!confirm("¿Desvincular este terreno del caso?")) return;
    setError(null);

    startTransition(async () => {
      const result = await unlinkTerrain({
        case_id: caseId,
        terrain_id: terrainId,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      setCaseTerrains((prev) =>
        prev.filter((ct) => ct.terrain_id !== terrainId),
      );
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-la-blue">Terrenos vinculados</h3>
        {caseTerrains.length === 0 ? (
          <p className="text-sm text-muted">Ningún terreno vinculado aún.</p>
        ) : (
          <ul className="space-y-2">
            {caseTerrains.map((ct) => {
              const terrain = terrains.find((t) => t.id === ct.terrain_id);
              return (
                <li
                  key={ct.id}
                  className="flex items-start justify-between rounded-lg border border-la-blue/10 bg-la-mist/50 px-4 py-3"
                >
                  <div>
                    <p className="font-medium">
                      {terrain?.name ?? ct.terrain_id}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {CASE_TERRAIN_ROLE_LABELS[ct.role]}
                    </Badge>
                    {ct.discard_reason && (
                      <p className="mt-1 text-xs text-muted">
                        Motivo descarte: {ct.discard_reason}
                      </p>
                    )}
                    {ct.notes && (
                      <p className="mt-1 text-sm text-muted">{ct.notes}</p>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleUnlink(ct.terrain_id)}
                    disabled={isPending}
                  >
                    Quitar
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {availableTerrains.length > 0 && (
        <form
          onSubmit={handleLink}
          className="space-y-4 rounded-lg border border-la-blue/10 bg-white p-4"
        >
          <h3 className="text-sm font-medium text-la-blue">Vincular terreno</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="terrain_id">Terreno</Label>
              <Select
                value={linkForm.terrain_id}
                onValueChange={(v) =>
                  setLinkForm((p) => ({ ...p, terrain_id: v }))
                }
              >
                <SelectTrigger id="terrain_id">
                  <SelectValue placeholder="Seleccionar" />
                </SelectTrigger>
                <SelectContent>
                  {availableTerrains.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Select
                value={linkForm.role}
                onValueChange={(v) =>
                  setLinkForm((p) => ({ ...p, role: v as CaseTerrainRole }))
                }
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {CASE_TERRAIN_ROLE_LABELS[r]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="visit_date">Fecha de visita</Label>
              <Input
                id="visit_date"
                type="date"
                value={linkForm.visit_date}
                onChange={(e) =>
                  setLinkForm((p) => ({ ...p, visit_date: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discard_reason">Motivo de descarte</Label>
              <Input
                id="discard_reason"
                value={linkForm.discard_reason}
                onChange={(e) =>
                  setLinkForm((p) => ({ ...p, discard_reason: e.target.value }))
                }
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              value={linkForm.notes}
              onChange={(e) =>
                setLinkForm((p) => ({ ...p, notes: e.target.value }))
              }
            />
          </div>
          <Button type="submit" size="sm" disabled={isPending || !linkForm.terrain_id}>
            Vincular
          </Button>
        </form>
      )}
    </div>
  );
}
