import { z } from "zod";

import { createClient as createServerClient } from "@/lib/supabase/server";
import type {
  CaseStatus,
  CaseTerrainRole,
  ClientObjective,
  ClientStatus,
  TerrainStatus,
  TimelineEventType,
} from "@/lib/types";

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

export const clientStatusSchema = z.enum([
  "prospecto",
  "activo",
  "en_negociacion",
  "cerrado_compra",
  "cerrado_sin_compra",
  "inactivo",
] satisfies [ClientStatus, ...ClientStatus[]]);

export const clientObjectiveSchema = z.enum([
  "familia",
  "inversion",
  "segunda_vivienda",
  "agricola",
  "empresa",
] satisfies [ClientObjective, ...ClientObjective[]]);

export const caseStatusSchema = z.enum([
  "borrador",
  "activo",
  "cerrado",
] satisfies [CaseStatus, ...CaseStatus[]]);

export const terrainStatusSchema = z.enum([
  "disponible",
  "en_analisis",
  "descartado",
  "comprado",
  "referencia",
] satisfies [TerrainStatus, ...TerrainStatus[]]);

export const caseTerrainRoleSchema = z.enum([
  "visitado",
  "descartado",
  "recomendado",
  "comprado",
  "alternativa",
] satisfies [CaseTerrainRole, ...CaseTerrainRole[]]);

export const timelineEventTypeSchema = z.enum([
  "reunion",
  "llamada",
  "email",
  "visita",
  "informe",
  "documento",
  "compra",
  "postventa",
  "nota",
  "otro",
] satisfies [TimelineEventType, ...TimelineEventType[]]);

export const uuidSchema = z.string().uuid();

export const optionalDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

export const optionalDateTimeSchema = z.string().datetime().nullable().optional();

export function ok<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

export function fail<T>(error: string): ActionResult<T> {
  return { success: false, error };
}

export function formatZodError(error: z.ZodError): string {
  return error.issues.map((issue) => issue.message).join("; ");
}

export async function getSupabase() {
  return createServerClient();
}

export async function getActorId(): Promise<string | null> {
  const supabase = await getSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const BRAIN_PATHS = {
  dashboard: "/dashboard",
  clients: "/clientes",
  client: (id: string) => `/clientes/${id}`,
  cases: "/casos",
  case: (id: string) => `/casos/${id}`,
  terrains: "/terrenos",
  terrain: (id: string) => `/terrenos/${id}`,
  comunas: "/comunas",
  comuna: (id: string) => `/comunas/${id}`,
  documents: "/biblioteca",
  search: "/buscar",
  analytics: "/estadisticas",
  import: "/importar",
  ia: "/ia",
} as const;
