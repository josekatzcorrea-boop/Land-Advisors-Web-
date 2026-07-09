"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { logActivity } from "@/lib/activity";
import {
  BRAIN_PATHS,
  fail,
  formatZodError,
  getActorId,
  getSupabase,
  ok,
  type ActionResult,
  uuidSchema,
} from "@/lib/actions/utils";
import { indexDocument } from "@/lib/knowledge";
import type { Document } from "@/lib/types";

const DOCUMENTS_BUCKET = "brain-documents";

const listDocumentsSchema = z
  .object({
    client_id: uuidSchema.optional(),
    case_id: uuidSchema.optional(),
    comuna_id: uuidSchema.optional(),
    entity_type: z.string().optional(),
    limit: z.number().int().positive().max(200).optional(),
  })
  .optional();

async function extractTextFromFile(
  file: File,
): Promise<string | null> {
  const mime = file.type;
  const name = file.name.toLowerCase();

  if (
    mime.startsWith("text/") ||
    name.endsWith(".txt") ||
    name.endsWith(".md")
  ) {
    return file.text();
  }

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    return null;
  }

  return null;
}

export async function listDocuments(
  filters?: z.infer<typeof listDocumentsSchema>,
): Promise<ActionResult<Document[]>> {
  const parsed = listDocumentsSchema.safeParse(filters);
  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const supabase = await getSupabase();
  let query = supabase
    .from("documents")
    .select("*")
    .order("created_at", { ascending: false });

  if (parsed.data?.client_id) {
    query = query.eq("client_id", parsed.data.client_id);
  }
  if (parsed.data?.case_id) {
    query = query.eq("case_id", parsed.data.case_id);
  }
  if (parsed.data?.comuna_id) {
    query = query.eq("comuna_id", parsed.data.comuna_id);
  }
  if (parsed.data?.entity_type) {
    query = query.eq("entity_type", parsed.data.entity_type);
  }
  if (parsed.data?.limit) {
    query = query.limit(parsed.data.limit);
  }

  const { data, error } = await query;

  if (error) {
    return fail(error.message);
  }

  return ok(data);
}

export async function uploadDocument(
  formData: FormData,
): Promise<ActionResult<Document>> {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    return fail("Archivo requerido");
  }

  const metadataSchema = z.object({
    title: z.string().min(1).optional(),
    client_id: uuidSchema.nullable().optional(),
    case_id: uuidSchema.nullable().optional(),
    comuna_id: uuidSchema.nullable().optional(),
    entity_type: z.string().nullable().optional(),
    entity_id: uuidSchema.nullable().optional(),
  });

  const metadataParsed = metadataSchema.safeParse({
    title: formData.get("title")?.toString() || undefined,
    client_id: formData.get("client_id")?.toString() || undefined,
    case_id: formData.get("case_id")?.toString() || undefined,
    comuna_id: formData.get("comuna_id")?.toString() || undefined,
    entity_type: formData.get("entity_type")?.toString() || undefined,
    entity_id: formData.get("entity_id")?.toString() || undefined,
  });

  if (!metadataParsed.success) {
    return fail(formatZodError(metadataParsed.error));
  }

  const documentId = randomUUID();
  const safeName = file.name.replace(/[^\w.\-() ]+/g, "_");
  const folder = metadataParsed.data.entity_type ?? "general";
  const storagePath = `${folder}/${documentId}/${safeName}`;

  const supabase = await getSupabase();
  const actorId = await getActorId();

  const { error: uploadError } = await supabase.storage
    .from(DOCUMENTS_BUCKET)
    .upload(storagePath, file, {
      contentType: file.type || undefined,
      upsert: false,
    });

  if (uploadError) {
    return fail(uploadError.message);
  }

  let extractedText = await extractTextFromFile(file);
  const isPdf =
    file.type === "application/pdf" || safeName.toLowerCase().endsWith(".pdf");

  if (isPdf && !extractedText) {
    extractedText = safeName;
  }

  const title = metadataParsed.data.title?.trim() || safeName;

  const { data, error } = await supabase
    .from("documents")
    .insert({
      id: documentId,
      title,
      file_name: safeName,
      storage_path: storagePath,
      mime_type: file.type || null,
      file_size: file.size,
      entity_type: metadataParsed.data.entity_type ?? null,
      entity_id: metadataParsed.data.entity_id ?? null,
      client_id: metadataParsed.data.client_id ?? null,
      case_id: metadataParsed.data.case_id ?? null,
      comuna_id: metadataParsed.data.comuna_id ?? null,
      extracted_text: extractedText,
      uploaded_by: actorId,
    })
    .select()
    .single();

  if (error) {
    await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
    return fail(error.message);
  }

  try {
    await indexDocument(data);
  } catch (indexError) {
    console.error("indexDocument failed after uploadDocument:", indexError);
  }

  await logActivity({
    actorId,
    action: "upload",
    entityType: "document",
    entityId: data.id,
    summary: `Documento subido: ${data.title}`,
  });

  revalidatePath(BRAIN_PATHS.documents);
  if (data.client_id) {
    revalidatePath(BRAIN_PATHS.client(data.client_id));
  }
  if (data.case_id) {
    revalidatePath(BRAIN_PATHS.case(data.case_id));
  }
  if (data.comuna_id) {
    revalidatePath(BRAIN_PATHS.comuna(data.comuna_id));
  }
  revalidatePath(BRAIN_PATHS.search);

  return ok(data);
}
