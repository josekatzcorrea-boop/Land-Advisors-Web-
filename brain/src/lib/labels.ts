import type {
  CaseStatus,
  CaseTerrainRole,
  ClientObjective,
  ClientStatus,
  TerrainStatus,
  TimelineEventType,
} from "@/lib/types";

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  prospecto: "Prospecto",
  activo: "Activo",
  en_negociacion: "En negociación",
  cerrado_compra: "Cerrado con compra",
  cerrado_sin_compra: "Cerrado sin compra",
  inactivo: "Inactivo",
};

export const CLIENT_OBJECTIVE_LABELS: Record<ClientObjective, string> = {
  familia: "Familia",
  inversion: "Inversión",
  segunda_vivienda: "Segunda vivienda",
  agricola: "Agrícola",
  empresa: "Empresa",
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  borrador: "Borrador",
  activo: "Activo",
  cerrado: "Cerrado",
};

export const TERRAIN_STATUS_LABELS: Record<TerrainStatus, string> = {
  disponible: "Disponible",
  en_analisis: "En análisis",
  descartado: "Descartado",
  comprado: "Comprado",
  referencia: "Referencia",
};

export const CASE_TERRAIN_ROLE_LABELS: Record<CaseTerrainRole, string> = {
  visitado: "Visitado",
  descartado: "Descartado",
  recomendado: "Recomendado",
  comprado: "Comprado",
  alternativa: "Alternativa",
};

export const TIMELINE_EVENT_LABELS: Record<TimelineEventType, string> = {
  reunion: "Reunión",
  llamada: "Llamada",
  email: "Email",
  visita: "Visita",
  informe: "Informe",
  documento: "Documento",
  compra: "Compra",
  postventa: "Postventa",
  nota: "Nota",
  otro: "Otro",
};

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  case: "Caso",
  client: "Cliente",
  terrain: "Terreno",
  comuna: "Comuna",
  document: "Documento",
  note: "Nota",
};
