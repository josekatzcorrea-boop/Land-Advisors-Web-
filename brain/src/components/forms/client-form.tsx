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
import { createClient, deleteClient, updateClient } from "@/lib/actions/clients";
import {
  CLIENT_OBJECTIVE_LABELS,
  CLIENT_STATUS_LABELS,
} from "@/lib/labels";
import type { Client, ClientObjective, ClientStatus } from "@/lib/types";

type ClientFormProps = {
  client?: Client;
  terrains?: { id: string; name: string }[];
};

const STATUS_OPTIONS = Object.keys(CLIENT_STATUS_LABELS) as ClientStatus[];
const OBJECTIVE_OPTIONS = Object.keys(
  CLIENT_OBJECTIVE_LABELS,
) as ClientObjective[];

export function ClientForm({ client, terrains = [] }: ClientFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: client?.name ?? "",
    email: client?.email ?? "",
    phone: client?.phone ?? "",
    first_contact_date: client?.first_contact_date ?? "",
    status: client?.status ?? "prospecto",
    budget_uf: client?.budget_uf?.toString() ?? "",
    payment_method: client?.payment_method ?? "",
    objective: client?.objective ?? "",
    notes: client?.notes ?? "",
    final_result: client?.final_result ?? "",
    satisfaction: client?.satisfaction?.toString() ?? "",
    purchase_date: client?.purchase_date ?? "",
    purchased_terrain_id: client?.purchased_terrain_id ?? "",
  });

  function updateField<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      email: form.email || null,
      phone: form.phone || null,
      first_contact_date: form.first_contact_date || null,
      status: form.status as ClientStatus,
      budget_uf: form.budget_uf ? Number(form.budget_uf) : null,
      payment_method: form.payment_method || null,
      objective: (form.objective || null) as ClientObjective | null,
      notes: form.notes || null,
      final_result: form.final_result || null,
      satisfaction: form.satisfaction ? Number(form.satisfaction) : null,
      purchase_date: form.purchase_date || null,
      purchased_terrain_id: form.purchased_terrain_id || null,
    };

    startTransition(async () => {
      const result = client
        ? await updateClient({ id: client.id, ...payload })
        : await createClient(payload);

      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push(`/clientes/${result.data.id}`);
      router.refresh();
    });
  }

  function handleDelete() {
    if (!client || !confirm("¿Eliminar este cliente?")) return;

    startTransition(async () => {
      const result = await deleteClient(client.id);
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.push("/clientes");
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
                  {CLIENT_STATUS_LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Teléfono</Label>
          <Input
            id="phone"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="first_contact_date">Primer contacto</Label>
          <Input
            id="first_contact_date"
            type="date"
            value={form.first_contact_date}
            onChange={(e) => updateField("first_contact_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="objective">Objetivo</Label>
          <Select
            value={form.objective || "none"}
            onValueChange={(v) =>
              updateField("objective", v === "none" ? "" : v)
            }
          >
            <SelectTrigger id="objective">
              <SelectValue placeholder="Seleccionar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sin definir</SelectItem>
              {OBJECTIVE_OPTIONS.map((o) => (
                <SelectItem key={o} value={o}>
                  {CLIENT_OBJECTIVE_LABELS[o]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget_uf">Presupuesto (UF)</Label>
          <Input
            id="budget_uf"
            type="number"
            min="0"
            step="0.01"
            value={form.budget_uf}
            onChange={(e) => updateField("budget_uf", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="payment_method">Forma de pago</Label>
          <Input
            id="payment_method"
            value={form.payment_method}
            onChange={(e) => updateField("payment_method", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase_date">Fecha de compra</Label>
          <Input
            id="purchase_date"
            type="date"
            value={form.purchase_date}
            onChange={(e) => updateField("purchase_date", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="satisfaction">Satisfacción (1-5)</Label>
          <Input
            id="satisfaction"
            type="number"
            min="1"
            max="5"
            value={form.satisfaction}
            onChange={(e) => updateField("satisfaction", e.target.value)}
          />
        </div>
        {terrains.length > 0 && (
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="purchased_terrain_id">Terreno comprado</Label>
            <Select
              value={form.purchased_terrain_id || "none"}
              onValueChange={(v) =>
                updateField("purchased_terrain_id", v === "none" ? "" : v)
              }
            >
              <SelectTrigger id="purchased_terrain_id">
                <SelectValue placeholder="Seleccionar terreno" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin asignar</SelectItem>
                {terrains.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
        <Label htmlFor="final_result">Resultado final</Label>
        <Textarea
          id="final_result"
          value={form.final_result}
          onChange={(e) => updateField("final_result", e.target.value)}
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Guardando…" : client ? "Actualizar" : "Crear cliente"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        {client && (
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
