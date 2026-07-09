"use server";

import OpenAI from "openai";
import { z } from "zod";

import { hybridSearch } from "@/lib/actions/search";
import {
  fail,
  formatZodError,
  ok,
  type ActionResult,
} from "@/lib/actions/utils";

const CHAT_MODEL = "gpt-4o-mini";

const messageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1),
});

const chatSchema = z.object({
  messages: z.array(messageSchema).min(1),
  matchCount: z.number().int().positive().max(15).optional(),
});

export type CopilotMessage = z.infer<typeof messageSchema>;

export type CopilotResponse = {
  reply: string;
  sources: Array<{
    source_type: string;
    source_id: string;
    title: string;
    score: number;
  }>;
};

let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey });
  }

  return openaiClient;
}

function buildRagContext(
  results: Array<{ source_type: string; source_id: string; title: string; content: string; score: number }>,
): string {
  if (results.length === 0) {
    return "No se encontraron fragmentos internos relevantes para esta consulta.";
  }

  return results
    .map(
      (item, index) =>
        `[${index + 1}] (${item.source_type}) ${item.title} [score: ${item.score.toFixed(3)}]\n${item.content}`,
    )
    .join("\n\n---\n\n");
}

export async function chatWithCopilot(
  input: z.infer<typeof chatSchema> | CopilotMessage[],
): Promise<ActionResult<CopilotResponse>> {
  const parsed = Array.isArray(input)
    ? chatSchema.safeParse({ messages: input })
    : chatSchema.safeParse(input);

  if (!parsed.success) {
    return fail(formatZodError(parsed.error));
  }

  const lastUserMessage = [...parsed.data.messages]
    .reverse()
    .find((message) => message.role === "user");

  if (!lastUserMessage) {
    return fail("Se requiere al menos un mensaje del usuario");
  }

  const searchResult = await hybridSearch({
    query: lastUserMessage.content,
    matchCount: parsed.data.matchCount ?? 8,
  });

  if (!searchResult.success) {
    return fail(searchResult.error);
  }

  const context = buildRagContext(searchResult.data);
  const systemPrompt = `Eres el copiloto interno de Land Advisors Brain.

Reglas estrictas:
- Responde solo con información presente en el CONTEXTO INTERNO provisto.
- Si el contexto no alcanza, dilo explícitamente y pide datos faltantes.
- Nunca inventes clientes, casos, terrenos, comunas, precios, fechas ni conclusiones internas.
- No cites fuentes externas ni completes con suposiciones.
- Tono profesional, cercano y territorial (sur de Chile, contorno rural).
- Si hay varias fuentes, sintetiza sin contradecir el contexto.

CONTEXTO INTERNO:
${context}`;

  try {
    const completion = await getOpenAIClient().chat.completions.create({
      model: CHAT_MODEL,
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...parsed.data.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      ],
    });

    const reply = completion.choices[0]?.message?.content?.trim();

    if (!reply) {
      return fail("OpenAI no devolvió respuesta");
    }

    return ok({
      reply,
      sources: searchResult.data.map((item) => ({
        source_type: item.source_type,
        source_id: item.source_id,
        title: item.title,
        score: item.score,
      })),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al consultar el copiloto";
    return fail(message);
  }
}
