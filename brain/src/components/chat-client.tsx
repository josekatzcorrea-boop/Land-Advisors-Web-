"use client";

import { useRef, useState, useTransition } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatWithCopilot, type CopilotMessage } from "@/lib/actions/ai";
import { SOURCE_TYPE_LABELS } from "@/lib/labels";

type ChatEntry = CopilotMessage & {
  sources?: Array<{
    source_type: string;
    source_id: string;
    title: string;
    score: number;
  }>;
};

export function ChatClient() {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      content:
        "Hola. Soy el copiloto interno de Land Advisors Brain. Pregúntame sobre clientes, casos, terrenos o comunas — respondo solo con lo que está en la base de conocimiento.",
    },
  ]);
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    setError(null);
    const userMessage: CopilotMessage = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const apiMessages = nextMessages.filter((m) => m.role !== "assistant" || nextMessages.indexOf(m) > 0);
      const result = await chatWithCopilot(
        apiMessages.map(({ role, content }) => ({ role, content })),
      );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: result.data.reply,
          sources: result.data.sources,
        },
      ]);
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      <PageHeader
        title="IA Copiloto"
        description="Asistente con contexto interno (RAG)."
      />

      <div className="flex-1 space-y-4 overflow-y-auto rounded-xl border border-la-blue/10 bg-white p-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-4 py-3 text-sm ${
                msg.role === "user"
                  ? "bg-la-blue text-white"
                  : "bg-la-mist text-foreground"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 space-y-1 border-t border-la-blue/10 pt-2">
                  <p className="text-xs font-medium opacity-70">Fuentes:</p>
                  {msg.sources.map((s, j) => (
                    <Badge key={j} variant="outline" className="mr-1 text-xs">
                      {SOURCE_TYPE_LABELS[s.source_type] ?? s.source_type}:{" "}
                      {s.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta…"
          className="min-h-[60px] flex-1 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        <Button type="submit" disabled={isPending || !input.trim()}>
          {isPending ? "…" : "Enviar"}
        </Button>
      </form>
    </div>
  );
}
