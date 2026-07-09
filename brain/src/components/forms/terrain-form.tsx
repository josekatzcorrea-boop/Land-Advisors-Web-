"use client";

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
  createTerrain,
  deleteTerrain,
  updateTerrain,
} from "@/lib/actions/terrains";
import { TERRAIN_STATUS_LABELS } from "@/lib/labels";
import type { Comuna, Terrain, TerrainStatus } from "@/lib/types";

type TerrainFormProps = {
  terrain?: Terrain;
  comunas?: Comuna[];
};

const STATUS_OPTIONS = Object.keys(TERRAIN_STATUS_LABELS) as TerrainStatus[];

export function TerrainForm({ terrain, comunas = [] }: TerrainFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: terrain?.name ?? "",
    latitude: terrain?.latitude?.toString() ?? "",
    longitude: terrain?.longitude?.toString() ?? "",
    comuna_id: terrain?.comuna_id ?? "",
    region: terrain?.region ?? "",
    rol: terrain?.rol ?? "",
    surface_m2: terrain?.surface_m2?.toString() ?? "",
    price_uf: terrain?.price_uf?.toString() ?? "",
    slope: terrain?.slope ?? "",
    water: terrain?.water ?? "",
    electricity: terrain?.electricity ?? "",
    road: terrain?.road ?? "",
    fiber: terrain?.fiber ?? "",
    view_notes: terrain?.view_notes ?? "",
    forest: terrain?.forest ?? "",
    land_use: terrain?.land_use ?? "",
    restrictions: terrain?.restrictions ?? "",
    notes: terrain?.notes ?? "",
    status: terrain?.status ?? "disponible",
    photo_urls: terrain?.photo_urls?.join("\n") ?? "",
  });

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const photoUrls = form.photo_urls
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const payload = {
      name: form.name,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
      comuna_id: form.comuna_id || null,
      region: form.region || null,
      rol: form.rol || null,
      surface_m2: form.surface_m2 ? Number(form.surface_m2) : null,
      price_uf: form.price_uf ? Number(form.price_uf) : null,
      slope: form.slope || null,
      water: form.water || null,
      electricity: form.electricity || null,
      road: form.road || null,
      fiber: form.fiber || null,
      view_notes: form.view_notes || null,
      forest: form.forest || null,
      land_use: form.land_use || null,
      restrictions: form.restrictions || null,
      notes: form.notes || null,
      status: form.status as TerrainStatus,
      photo_urls: photoUrls.length > 0 ? photoUrls : undefined,
    };

    startTransition(async () => {
      const result = terrain
        ? await updateTerrain({ id: terrain.id, ...payload })
        : await createTerrain(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/terrenos/${result.data.id}`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!terrain || !confirm("¿Eliminar este terreno?")) return;

    startTransition(async () => {
      const result = await deleteTerrain(terrain.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/terrenos");
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

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre *</Label>
          <Input
            id="name"
            required
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Estado</Label>
          <Select
            value={form.status}
            onValueChange={(v) => updateField("status", v)}
          >
            <SelectTrigger id="status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>
                  {TERRAIN_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {comunas.length > 0 && (
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
        )}
        <div className="space-y-2">
          <Label htmlFor="region">Región</Label>
          <Input
            id="region"
            value={form.region}
            onChange={(e) => updateField("region", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rol">Rol</Label>
          <Input
            id="rol"
            value={form.rol}
            onChange={(e) => updateField("rol", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="surface_m2">Superficie (m²)</Label>
          <Input
            id="surface_m2"
            type="number"
            min="0"
            value={form.surface_m2}
            onChange={(e) => updateField("surface_m2", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="price_uf">Precio (UF)</Label>
          <Input
            id="price_uf"
            type="number"
            min="0"
            step="0.01"
            value={form.price_uf}
            onChange={(e) => updateField("price_uf", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitud</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={form.latitude}
            onChange={(e) => updateField("latitude", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="longitude">Longitud</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={form.longitude}
            onChange={(e) => updateField("longitude", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="slope">Pendiente</Label>
          <Input
            id="slope"
            value={form.slope}
            onChange={(e) => updateField("slope", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="water">Agua</Label>
          <Input
            id="water"
            value={form.water}
            onChange={(e) => updateField("water", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="electricity">Electricidad</Label>
          <Input
            id="electricity"
            value={form.electricity}
            onChange={(e) => updateField("electricity", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="road">Camino</Label>
          <Input
            id="road"
            value={form.road}
            onChange={(e) => updateField("road", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fiber">Fibra</Label>
          <Input
            id="fiber"
            value={form.fiber}
            onChange={(e) => updateField("fiber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="forest">Bosque</Label>
          <Input
            id="forest"
            value={form.forest}
            onChange={(e) => updateField("forest", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="land_use">Uso de suelo</Label>
          <Input
            id="land_use"
            value={form.land_use}
            onChange={(e) => updateField("land_use", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="view_notes">Vista / notas paisajísticas</Label>
        <Textarea
          id="view_notes"
          value={form.view_notes}
          onChange={(e) => updateField("view_notes", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="restrictions">Restricciones</Label>
        <Textarea
          id="restrictions"
          value={form.restrictions}
          onChange={(e) => updateField("restrictions", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notas</Label>
        <Textarea
          id="notes"
          value={form.notes}
          onChange={(e) => updateField("notes", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="photo_urls">URLs de fotos (una por línea)</Label>
        <Textarea
          id="photo_urls"
          value={form.photo_urls}
          onChange={(e) => updateField("photo_urls", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : terrain ? "Actualizar" : "Crear terreno"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          Cancelar
        </Button>
        {terrain && (
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
