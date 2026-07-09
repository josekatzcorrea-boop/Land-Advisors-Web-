import { chunkText, createEmbedding } from "@/lib/embeddings";
import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Case,
  Comuna,
  Document,
  Json,
  KnowledgeSourceType,
} from "@/lib/types";

type TextSection = {
  heading: string;
  body: string | null | undefined;
};

function appendSection(sections: string[], heading: string, body?: string | null) {
  const trimmed = body?.trim();
  if (trimmed) {
    sections.push(`## ${heading}\n${trimmed}`);
  }
}

function buildFromSections(title: string, parts: TextSection[]): string {
  const sections: string[] = [`# ${title}`];

  for (const part of parts) {
    appendSection(sections, part.heading, part.body);
  }

  return sections.join("\n\n").trim();
}

export function buildCaseContent(caseRow: Case): string {
  const alternatives =
    Array.isArray(caseRow.alternatives_evaluated) &&
    caseRow.alternatives_evaluated.length > 0
      ? JSON.stringify(caseRow.alternatives_evaluated, null, 2)
      : null;

  return buildFromSections(caseRow.title, [
    { heading: "Resumen ejecutivo", body: caseRow.executive_summary },
    { heading: "Problema del cliente", body: caseRow.client_problem },
    { heading: "Necesidades", body: caseRow.needs },
    { heading: "Restricciones", body: caseRow.restrictions },
    { heading: "Hipótesis inicial", body: caseRow.initial_hypothesis },
    { heading: "Alternativas evaluadas", body: alternatives },
    { heading: "Análisis", body: caseRow.analysis_text },
    { heading: "Normativa", body: caseRow.normativa },
    { heading: "Uso de suelo", body: caseRow.land_use },
    { heading: "Agua", body: caseRow.water },
    { heading: "Electricidad", body: caseRow.electricity },
    { heading: "Conectividad", body: caseRow.connectivity },
    { heading: "Topografía", body: caseRow.topography },
    { heading: "Tasación", body: caseRow.valuation },
    { heading: "Riesgos", body: caseRow.risks },
    { heading: "Conclusiones", body: caseRow.conclusions },
    { heading: "Recomendación final", body: caseRow.final_recommendation },
    { heading: "Resultado", body: caseRow.outcome },
    { heading: "Aprendizajes", body: caseRow.learnings },
    { heading: "Errores detectados", body: caseRow.errors_detected },
    { heading: "Qué haríamos de nuevo", body: caseRow.would_do_again },
    {
      heading: "Qué haríamos distinto",
      body: caseRow.would_do_differently,
    },
    { heading: "Lecciones aprendidas", body: caseRow.lessons_learned },
  ]);
}

export function buildComunaContent(comuna: Comuna): string {
  return buildFromSections(comuna.name, [
    { heading: "Región", body: comuna.region },
    { heading: "Descripción", body: comuna.description },
    { heading: "Fortalezas", body: comuna.strengths },
    { heading: "Debilidades", body: comuna.weaknesses },
    { heading: "Proyectos MOP", body: comuna.mop_projects },
    { heading: "Proyectos privados", body: comuna.private_projects },
    { heading: "Conectividad", body: comuna.connectivity_notes },
    { heading: "Hospitales", body: comuna.hospitals },
    { heading: "Colegios", body: comuna.schools },
    { heading: "Demografía", body: comuna.demographics },
    { heading: "Normativa", body: comuna.normativa },
    { heading: "Notas PRC", body: comuna.prc_notes },
    { heading: "Tasación", body: comuna.valuation_notes },
    { heading: "Tendencias", body: comuna.trends },
    { heading: "Comentarios internos", body: comuna.internal_comments },
  ]);
}

export function buildDocumentContent(document: Document): string {
  const sections: string[] = [`# ${document.title}`, `Archivo: ${document.file_name}`];
  const extracted = document.extracted_text?.trim();

  if (extracted) {
    sections.push(`## Contenido\n${extracted}`);
  }

  return sections.join("\n\n").trim();
}

async function replaceKnowledgeChunks(
  sourceType: KnowledgeSourceType,
  sourceId: string,
  title: string,
  content: string,
  metadata: Json = {},
): Promise<number[]> {
  const supabase = createAdminClient();
  const chunks = chunkText(content);

  if (chunks.length === 0) {
    throw new Error("No content available to index");
  }

  const { error: deleteError } = await supabase
    .from("knowledge_chunks")
    .delete()
    .eq("source_type", sourceType)
    .eq("source_id", sourceId);

  if (deleteError) {
    throw deleteError;
  }

  const rows = await Promise.all(
    chunks.map(async (chunk, index) => ({
      source_type: sourceType,
      source_id: sourceId,
      title:
        chunks.length > 1 ? `${title} (${index + 1}/${chunks.length})` : title,
      content: chunk,
      metadata,
      embedding: await createEmbedding(chunk),
    })),
  );

  const { error: insertError } = await supabase
    .from("knowledge_chunks")
    .insert(rows);

  if (insertError) {
    throw insertError;
  }

  return createEmbedding(content.slice(0, 8000));
}

export async function indexCase(caseRow: Case): Promise<void> {
  const content = buildCaseContent(caseRow);

  if (!content.trim()) {
    return;
  }

  const embedding = await replaceKnowledgeChunks("case", caseRow.id, caseRow.title, content, {
    case_id: caseRow.id,
    client_id: caseRow.client_id,
    status: caseRow.status,
    comuna_id: caseRow.comuna_id,
  });

  const { error } = await createAdminClient()
    .from("cases")
    .update({ embedding })
    .eq("id", caseRow.id);

  if (error) {
    throw error;
  }
}

export async function indexComuna(comuna: Comuna): Promise<void> {
  const content = buildComunaContent(comuna);

  if (!content.trim()) {
    return;
  }

  const embedding = await replaceKnowledgeChunks(
    "comuna",
    comuna.id,
    comuna.name,
    content,
    {
      comuna_id: comuna.id,
      region: comuna.region,
    },
  );

  const { error } = await createAdminClient()
    .from("comunas")
    .update({ embedding })
    .eq("id", comuna.id);

  if (error) {
    throw error;
  }
}

export async function indexDocument(document: Document): Promise<void> {
  const content = buildDocumentContent(document);

  if (!content.trim()) {
    return;
  }

  const embedding = await replaceKnowledgeChunks(
    "document",
    document.id,
    document.title,
    content,
    {
      document_id: document.id,
      file_name: document.file_name,
      client_id: document.client_id,
      case_id: document.case_id,
      comuna_id: document.comuna_id,
    },
  );

  const { error } = await createAdminClient()
    .from("documents")
    .update({ embedding })
    .eq("id", document.id);

  if (error) {
    throw error;
  }
}
