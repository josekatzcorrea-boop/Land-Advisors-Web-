export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ClientStatus =
  | "prospecto"
  | "activo"
  | "en_negociacion"
  | "cerrado_compra"
  | "cerrado_sin_compra"
  | "inactivo";

export type ClientObjective =
  | "familia"
  | "inversion"
  | "segunda_vivienda"
  | "agricola"
  | "empresa";

export type CaseStatus = "borrador" | "activo" | "cerrado";

export type TerrainStatus =
  | "disponible"
  | "en_analisis"
  | "descartado"
  | "comprado"
  | "referencia";

export type CaseTerrainRole =
  | "visitado"
  | "descartado"
  | "recomendado"
  | "comprado"
  | "alternativa";

export type TimelineEventType =
  | "reunion"
  | "llamada"
  | "email"
  | "visita"
  | "informe"
  | "documento"
  | "compra"
  | "postventa"
  | "nota"
  | "otro";

export type KnowledgeSourceType =
  | "case"
  | "client"
  | "terrain"
  | "comuna"
  | "document"
  | "note";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
};

export type ProfileInsert = {
  id: string;
  email: string;
  full_name?: string | null;
  role?: string;
  created_at?: string;
};

export type ProfileUpdate = {
  id?: string;
  email?: string;
  full_name?: string | null;
  role?: string;
  created_at?: string;
};

export type Comuna = {
  id: string;
  name: string;
  region: string;
  description: string | null;
  strengths: string | null;
  weaknesses: string | null;
  mop_projects: string | null;
  private_projects: string | null;
  connectivity_notes: string | null;
  hospitals: string | null;
  schools: string | null;
  demographics: string | null;
  normativa: string | null;
  prc_notes: string | null;
  valuation_notes: string | null;
  trends: string | null;
  internal_comments: string | null;
  search_text: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type ComunaInsert = {
  id?: string;
  name: string;
  region?: string;
  description?: string | null;
  strengths?: string | null;
  weaknesses?: string | null;
  mop_projects?: string | null;
  private_projects?: string | null;
  connectivity_notes?: string | null;
  hospitals?: string | null;
  schools?: string | null;
  demographics?: string | null;
  normativa?: string | null;
  prc_notes?: string | null;
  valuation_notes?: string | null;
  trends?: string | null;
  internal_comments?: string | null;
  embedding?: number[] | null;
  created_at?: string;
  updated_at?: string;
};

export type ComunaUpdate = Partial<ComunaInsert>;

export type ComunaRevision = {
  id: string;
  comuna_id: string;
  changed_by: string | null;
  snapshot: Json;
  change_summary: string | null;
  created_at: string;
};

export type ComunaRevisionInsert = {
  id?: string;
  comuna_id: string;
  changed_by?: string | null;
  snapshot: Json;
  change_summary?: string | null;
  created_at?: string;
};

export type ComunaRevisionUpdate = Partial<ComunaRevisionInsert>;

export type Terrain = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  comuna_id: string | null;
  region: string | null;
  rol: string | null;
  surface_m2: number | null;
  price_uf: number | null;
  uf_per_m2: number | null;
  slope: string | null;
  water: string | null;
  electricity: string | null;
  road: string | null;
  fiber: string | null;
  view_notes: string | null;
  forest: string | null;
  land_use: string | null;
  restrictions: string | null;
  notes: string | null;
  status: TerrainStatus;
  photo_urls: string[];
  created_at: string;
  updated_at: string;
};

export type TerrainInsert = {
  id?: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  comuna_id?: string | null;
  region?: string | null;
  rol?: string | null;
  surface_m2?: number | null;
  price_uf?: number | null;
  slope?: string | null;
  water?: string | null;
  electricity?: string | null;
  road?: string | null;
  fiber?: string | null;
  view_notes?: string | null;
  forest?: string | null;
  land_use?: string | null;
  restrictions?: string | null;
  notes?: string | null;
  status?: TerrainStatus;
  photo_urls?: string[];
  created_at?: string;
  updated_at?: string;
};

export type TerrainUpdate = Partial<TerrainInsert>;

export type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  first_contact_date: string | null;
  status: ClientStatus;
  budget_uf: number | null;
  payment_method: string | null;
  objective: ClientObjective | null;
  notes: string | null;
  final_result: string | null;
  satisfaction: number | null;
  purchase_date: string | null;
  purchased_terrain_id: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientInsert = {
  id?: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  first_contact_date?: string | null;
  status?: ClientStatus;
  budget_uf?: number | null;
  payment_method?: string | null;
  objective?: ClientObjective | null;
  notes?: string | null;
  final_result?: string | null;
  satisfaction?: number | null;
  purchase_date?: string | null;
  purchased_terrain_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ClientUpdate = Partial<ClientInsert>;

export type Case = {
  id: string;
  client_id: string;
  title: string;
  status: CaseStatus;
  comuna_id: string | null;
  executive_summary: string | null;
  client_problem: string | null;
  needs: string | null;
  restrictions: string | null;
  initial_hypothesis: string | null;
  alternatives_evaluated: Json;
  analysis_text: string | null;
  normativa: string | null;
  land_use: string | null;
  water: string | null;
  electricity: string | null;
  connectivity: string | null;
  topography: string | null;
  valuation: string | null;
  risks: string | null;
  conclusions: string | null;
  final_recommendation: string | null;
  outcome: string | null;
  learnings: string | null;
  errors_detected: string | null;
  would_do_again: string | null;
  would_do_differently: string | null;
  lessons_learned: string | null;
  is_historical: boolean;
  closed_at: string | null;
  search_text: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type CaseInsert = {
  id?: string;
  client_id: string;
  title: string;
  status?: CaseStatus;
  comuna_id?: string | null;
  executive_summary?: string | null;
  client_problem?: string | null;
  needs?: string | null;
  restrictions?: string | null;
  initial_hypothesis?: string | null;
  alternatives_evaluated?: Json;
  analysis_text?: string | null;
  normativa?: string | null;
  land_use?: string | null;
  water?: string | null;
  electricity?: string | null;
  connectivity?: string | null;
  topography?: string | null;
  valuation?: string | null;
  risks?: string | null;
  conclusions?: string | null;
  final_recommendation?: string | null;
  outcome?: string | null;
  learnings?: string | null;
  errors_detected?: string | null;
  would_do_again?: string | null;
  would_do_differently?: string | null;
  lessons_learned?: string | null;
  is_historical?: boolean;
  closed_at?: string | null;
  embedding?: number[] | null;
  created_at?: string;
  updated_at?: string;
};

export type CaseUpdate = Partial<CaseInsert>;

export type CaseTerrain = {
  id: string;
  case_id: string;
  terrain_id: string;
  role: CaseTerrainRole;
  discard_reason: string | null;
  visit_date: string | null;
  notes: string | null;
};

export type CaseTerrainInsert = {
  id?: string;
  case_id: string;
  terrain_id: string;
  role?: CaseTerrainRole;
  discard_reason?: string | null;
  visit_date?: string | null;
  notes?: string | null;
};

export type CaseTerrainUpdate = Partial<CaseTerrainInsert>;

export type Document = {
  id: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type: string | null;
  file_size: number | null;
  entity_type: string | null;
  entity_id: string | null;
  client_id: string | null;
  case_id: string | null;
  comuna_id: string | null;
  extracted_text: string | null;
  embedding: number[] | null;
  uploaded_by: string | null;
  created_at: string;
};

export type DocumentInsert = {
  id?: string;
  title: string;
  file_name: string;
  storage_path: string;
  mime_type?: string | null;
  file_size?: number | null;
  entity_type?: string | null;
  entity_id?: string | null;
  client_id?: string | null;
  case_id?: string | null;
  comuna_id?: string | null;
  extracted_text?: string | null;
  embedding?: number[] | null;
  uploaded_by?: string | null;
  created_at?: string;
};

export type DocumentUpdate = Partial<DocumentInsert>;

export type TimelineEvent = {
  id: string;
  client_id: string;
  case_id: string | null;
  event_type: TimelineEventType;
  title: string;
  description: string | null;
  occurred_at: string;
  created_by: string | null;
  created_at: string;
};

export type TimelineEventInsert = {
  id?: string;
  client_id: string;
  case_id?: string | null;
  event_type?: TimelineEventType;
  title: string;
  description?: string | null;
  occurred_at?: string;
  created_by?: string | null;
  created_at?: string;
};

export type TimelineEventUpdate = Partial<TimelineEventInsert>;

export type KnowledgeChunk = {
  id: string;
  source_type: KnowledgeSourceType;
  source_id: string;
  title: string;
  content: string;
  metadata: Json;
  search_vector: string | null;
  embedding: number[] | null;
  created_at: string;
  updated_at: string;
};

export type KnowledgeChunkInsert = {
  id?: string;
  source_type: KnowledgeSourceType;
  source_id: string;
  title: string;
  content: string;
  metadata?: Json;
  embedding?: number[] | null;
  created_at?: string;
  updated_at?: string;
};

export type KnowledgeChunkUpdate = Partial<KnowledgeChunkInsert>;

export type ActivityLog = {
  id: string;
  actor_id: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  summary: string;
  created_at: string;
};

export type ActivityLogInsert = {
  id?: string;
  actor_id?: string | null;
  action: string;
  entity_type: string;
  entity_id?: string | null;
  summary: string;
  created_at?: string;
};

export type ActivityLogUpdate = Partial<ActivityLogInsert>;

export type HybridSearchResult = {
  id: string;
  source_type: KnowledgeSourceType;
  source_id: string;
  title: string;
  content: string;
  score: number;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      comunas: {
        Row: Comuna;
        Insert: ComunaInsert;
        Update: ComunaUpdate;
        Relationships: [];
      };
      comuna_revisions: {
        Row: ComunaRevision;
        Insert: ComunaRevisionInsert;
        Update: ComunaRevisionUpdate;
        Relationships: [];
      };
      terrains: {
        Row: Terrain;
        Insert: TerrainInsert;
        Update: TerrainUpdate;
        Relationships: [];
      };
      clients: {
        Row: Client;
        Insert: ClientInsert;
        Update: ClientUpdate;
        Relationships: [];
      };
      cases: {
        Row: Case;
        Insert: CaseInsert;
        Update: CaseUpdate;
        Relationships: [];
      };
      case_terrains: {
        Row: CaseTerrain;
        Insert: CaseTerrainInsert;
        Update: CaseTerrainUpdate;
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: DocumentInsert;
        Update: DocumentUpdate;
        Relationships: [];
      };
      timeline_events: {
        Row: TimelineEvent;
        Insert: TimelineEventInsert;
        Update: TimelineEventUpdate;
        Relationships: [];
      };
      knowledge_chunks: {
        Row: KnowledgeChunk;
        Insert: KnowledgeChunkInsert;
        Update: KnowledgeChunkUpdate;
        Relationships: [];
      };
      activity_log: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      hybrid_search: {
        Args: {
          query_text: string;
          query_embedding: number[];
          match_count?: number;
          full_text_weight?: number;
          semantic_weight?: number;
        };
        Returns: HybridSearchResult[];
      };
    };
    Enums: {
      client_status: ClientStatus;
      client_objective: ClientObjective;
      case_status: CaseStatus;
      terrain_status: TerrainStatus;
      case_terrain_role: CaseTerrainRole;
      timeline_event_type: TimelineEventType;
      knowledge_source_type: KnowledgeSourceType;
    };
    CompositeTypes: Record<string, never>;
  };
};
