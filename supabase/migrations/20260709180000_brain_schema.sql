-- Land Advisors Brain — esquema interno (LAKG operativo)
-- Ejecutar en Supabase SQL Editor o: supabase db push

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Enums
CREATE TYPE client_status AS ENUM (
  'prospecto', 'activo', 'en_negociacion', 'cerrado_compra', 'cerrado_sin_compra', 'inactivo'
);
CREATE TYPE client_objective AS ENUM (
  'familia', 'inversion', 'segunda_vivienda', 'agricola', 'empresa'
);
CREATE TYPE case_status AS ENUM ('borrador', 'activo', 'cerrado');
CREATE TYPE terrain_status AS ENUM ('disponible', 'en_analisis', 'descartado', 'comprado', 'referencia');
CREATE TYPE case_terrain_role AS ENUM ('visitado', 'descartado', 'recomendado', 'comprado', 'alternativa');
CREATE TYPE timeline_event_type AS ENUM (
  'reunion', 'llamada', 'email', 'visita', 'informe', 'documento', 'compra', 'postventa', 'nota', 'otro'
);
CREATE TYPE knowledge_source_type AS ENUM (
  'case', 'client', 'terrain', 'comuna', 'document', 'note'
);

-- Perfiles (equipo interno)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL DEFAULT 'advisor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comunas (ficha viva)
CREATE TABLE comunas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  region TEXT NOT NULL DEFAULT 'Los Lagos',
  description TEXT,
  strengths TEXT,
  weaknesses TEXT,
  mop_projects TEXT,
  private_projects TEXT,
  connectivity_notes TEXT,
  hospitals TEXT,
  schools TEXT,
  demographics TEXT,
  normativa TEXT,
  prc_notes TEXT,
  valuation_notes TEXT,
  trends TEXT,
  internal_comments TEXT,
  search_text TEXT GENERATED ALWAYS AS (
    coalesce(name,'') || ' ' || coalesce(description,'') || ' ' || coalesce(internal_comments,'')
  ) STORED,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE comuna_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comuna_id UUID NOT NULL REFERENCES comunas(id) ON DELETE CASCADE,
  changed_by UUID REFERENCES profiles(id),
  snapshot JSONB NOT NULL,
  change_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Terrenos (reutilizables)
CREATE TABLE terrains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  comuna_id UUID REFERENCES comunas(id) ON DELETE SET NULL,
  region TEXT,
  rol TEXT,
  surface_m2 NUMERIC,
  price_uf NUMERIC,
  uf_per_m2 NUMERIC GENERATED ALWAYS AS (
    CASE WHEN surface_m2 > 0 AND price_uf IS NOT NULL THEN round(price_uf / surface_m2, 2) ELSE NULL END
  ) STORED,
  slope TEXT,
  water TEXT,
  electricity TEXT,
  road TEXT,
  fiber TEXT,
  view_notes TEXT,
  forest TEXT,
  land_use TEXT,
  restrictions TEXT,
  notes TEXT,
  status terrain_status NOT NULL DEFAULT 'disponible',
  photo_urls TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clientes
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  first_contact_date DATE,
  status client_status NOT NULL DEFAULT 'prospecto',
  budget_uf NUMERIC,
  payment_method TEXT,
  objective client_objective,
  notes TEXT,
  final_result TEXT,
  satisfaction SMALLINT CHECK (satisfaction IS NULL OR (satisfaction >= 1 AND satisfaction <= 5)),
  purchase_date DATE,
  purchased_terrain_id UUID REFERENCES terrains(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Casos (corazón del sistema)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status case_status NOT NULL DEFAULT 'borrador',
  comuna_id UUID REFERENCES comunas(id) ON DELETE SET NULL,
  executive_summary TEXT,
  client_problem TEXT,
  needs TEXT,
  restrictions TEXT,
  initial_hypothesis TEXT,
  alternatives_evaluated JSONB DEFAULT '[]',
  analysis_text TEXT,
  normativa TEXT,
  land_use TEXT,
  water TEXT,
  electricity TEXT,
  connectivity TEXT,
  topography TEXT,
  valuation TEXT,
  risks TEXT,
  conclusions TEXT,
  final_recommendation TEXT,
  outcome TEXT,
  learnings TEXT,
  errors_detected TEXT,
  would_do_again TEXT,
  would_do_differently TEXT,
  lessons_learned TEXT,
  is_historical BOOLEAN NOT NULL DEFAULT false,
  closed_at TIMESTAMPTZ,
  search_text TEXT GENERATED ALWAYS AS (
    coalesce(title,'') || ' ' || coalesce(executive_summary,'') || ' ' || coalesce(client_problem,'') ||
    ' ' || coalesce(needs,'') || ' ' || coalesce(conclusions,'') || ' ' || coalesce(lessons_learned,'') ||
    ' ' || coalesce(outcome,'')
  ) STORED,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE case_terrains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  terrain_id UUID NOT NULL REFERENCES terrains(id) ON DELETE CASCADE,
  role case_terrain_role NOT NULL DEFAULT 'visitado',
  discard_reason TEXT,
  visit_date DATE,
  notes TEXT,
  UNIQUE (case_id, terrain_id)
);

-- Documentos
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  file_size BIGINT,
  entity_type TEXT,
  entity_id UUID,
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  comuna_id UUID REFERENCES comunas(id) ON DELETE SET NULL,
  extracted_text TEXT,
  embedding vector(1536),
  uploaded_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Timeline
CREATE TABLE timeline_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  event_type timeline_event_type NOT NULL DEFAULT 'nota',
  title TEXT NOT NULL,
  description TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chunks unificados para RAG / búsqueda
CREATE TABLE knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type knowledge_source_type NOT NULL,
  source_id UUID NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  search_vector tsvector GENERATED ALWAYS AS (to_tsvector('spanish', coalesce(title,'') || ' ' || coalesce(content,''))) STORED,
  embedding vector(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_knowledge_chunks_search ON knowledge_chunks USING GIN (search_vector);
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX idx_cases_search ON cases USING GIN (to_tsvector('spanish', search_text));
CREATE INDEX idx_clients_name ON clients USING GIN (name gin_trgm_ops);
CREATE INDEX idx_terrains_name ON terrains USING GIN (name gin_trgm_ops);
CREATE INDEX idx_comunas_name ON comunas USING GIN (name gin_trgm_ops);

-- Actividad reciente
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Triggers updated_at
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_comunas_updated BEFORE UPDATE ON comunas FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_terrains_updated BEFORE UPDATE ON terrains FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_clients_updated BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_cases_updated BEFORE UPDATE ON cases FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER tr_knowledge_updated BEFORE UPDATE ON knowledge_chunks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Revisión comuna al actualizar
CREATE OR REPLACE FUNCTION log_comuna_revision() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    INSERT INTO comuna_revisions (comuna_id, changed_by, snapshot, change_summary)
    VALUES (OLD.id, auth.uid(), to_jsonb(OLD), 'Actualización de ficha comunal');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER tr_comuna_revision AFTER UPDATE ON comunas
  FOR EACH ROW EXECUTE FUNCTION log_comuna_revision();

-- Perfil al registrarse
CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, coalesce(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Búsqueda híbrida
CREATE OR REPLACE FUNCTION hybrid_search(
  query_text TEXT,
  query_embedding vector(1536),
  match_count INT DEFAULT 20,
  full_text_weight FLOAT DEFAULT 1,
  semantic_weight FLOAT DEFAULT 1
)
RETURNS TABLE (
  id UUID,
  source_type knowledge_source_type,
  source_id UUID,
  title TEXT,
  content TEXT,
  score FLOAT
) LANGUAGE sql STABLE AS $$
  WITH semantic AS (
    SELECT k.id, k.source_type, k.source_id, k.title, k.content,
      (1 - (k.embedding <=> query_embedding))::float AS score
    FROM knowledge_chunks k
    WHERE k.embedding IS NOT NULL AND query_embedding IS NOT NULL
    ORDER BY k.embedding <=> query_embedding
    LIMIT match_count * 2
  ),
  keyword AS (
    SELECT k.id, k.source_type, k.source_id, k.title, k.content,
      ts_rank(k.search_vector, plainto_tsquery('spanish', query_text))::float AS score
    FROM knowledge_chunks k
    WHERE query_text IS NOT NULL AND query_text <> ''
      AND k.search_vector @@ plainto_tsquery('spanish', query_text)
    LIMIT match_count * 2
  ),
  combined AS (
    SELECT * FROM semantic
    UNION ALL
    SELECT * FROM keyword
  )
  SELECT c.id, c.source_type, c.source_id, c.title, c.content, max(c.score) AS score
  FROM combined c
  GROUP BY c.id, c.source_type, c.source_id, c.title, c.content
  ORDER BY score DESC
  LIMIT match_count;
$$;

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE comunas ENABLE ROW LEVEL SECURITY;
ALTER TABLE comuna_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_terrains ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_all" ON profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON comunas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON comuna_revisions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON terrains FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON cases FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON case_terrains FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON documents FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON timeline_events FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON knowledge_chunks FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "team_all" ON activity_log FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Storage bucket documentos
INSERT INTO storage.buckets (id, name, public) VALUES ('brain-documents', 'brain-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "team_docs_read" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'brain-documents');
CREATE POLICY "team_docs_write" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'brain-documents');
CREATE POLICY "team_docs_delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'brain-documents');

-- Comunas iniciales (cuenca LA)
INSERT INTO comunas (name, region, description, strengths, weaknesses) VALUES
  ('Puerto Varas', 'Los Lagos', 'Hub demográfico y de atracción externa en la cuenca del Lago Llanquihue.', 'Conectividad, demanda residencial y turística, inmigración.', 'Prima de precio en sectores consolidados.'),
  ('Frutillar', 'Los Lagos', 'Mercado patrimonial y turístico con prima de marca.', 'Calidad de vida, turismo cultural.', 'Riesgo de pagar narrativa sin habilitación.'),
  ('Llanquihue', 'Los Lagos', 'Parcelaciones y urbanización en expansión.', 'Valor presente en loteos, crecimiento intercensal.', 'Costos urbanización pendientes.'),
  ('Ensenada', 'Los Lagos', 'Contorno bajo densidad, alto envejecimiento.', 'Segunda vivienda, paisaje volcán Osorno.', 'Liquidez menor que PV.'),
  ('Malalcahuello', 'Los Lagos', 'Turismo inmobiliario cordillerano.', 'Paisaje, nieve, segunda vivienda.', 'Estacionalidad y acceso invernal.')
ON CONFLICT (name) DO NOTHING;
