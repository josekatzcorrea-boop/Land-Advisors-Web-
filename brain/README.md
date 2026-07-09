# Land Advisors Brain

Plataforma interna de conocimiento territorial para Land Advisors Chile.

## Requisitos

- Node.js 20+
- Cuenta en [Supabase](https://supabase.com)
- API key de OpenAI (para búsqueda semántica y copiloto IA)

## Configuración

### 1. Crear proyecto Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En el SQL Editor, ejecuta la migración desde:
   ```
   ../supabase/migrations/20260709180000_brain_schema.sql
   ```
3. Crea el bucket de storage `brain-documents` (público o con políticas RLS según tu setup).
4. En Authentication → Providers, habilita Email/Password.

### 2. Variables de entorno

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env.local
```

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (actividad reciente) |
| `OPENAI_API_KEY` | Para embeddings y copiloto IA |

### 3. Instalar y ejecutar

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### 4. Crear primer usuario

1. Ve a [http://localhost:3000/login](http://localhost:3000/login)
2. Haz clic en **Crear cuenta** (primer usuario interno)
3. Completa email y contraseña
4. Si Supabase requiere confirmación por email, confirma antes de iniciar sesión

## Módulos

| Ruta | Descripción |
|------|-------------|
| `/dashboard` | Resumen y actividad reciente |
| `/clientes` | CRUD de clientes |
| `/casos` | Casos con pestañas (Resumen, Análisis, Terrenos, Aprendizajes) |
| `/terrenos` | CRUD de terrenos |
| `/comunas` | Fichas comunales con historial |
| `/biblioteca` | Subida y listado de documentos |
| `/buscar` | Búsqueda híbrida semántica |
| `/ia` | Copiloto con RAG interno |
| `/estadisticas` | Gráficos analíticos |
| `/importar` | Wizard de importación histórica (~15 min) |

## Stack

- Next.js 16 · React 19 · Tailwind CSS v4
- Supabase (auth, DB, storage, pgvector)
- OpenAI (embeddings + chat)
- Recharts · Radix UI
