"use client";

import { useRef, useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  chatWithCopilot,
  type CopilotMessage,
} from "@/lib/actions/ai";
import { SOURCE_TYPE_LABELS } from "@/lib/labels";

type ChatEntry = CopilotMessage & {
  sources?: Array<{
    source_type: string;
    source_id: string;
    title: string;
    score: number;
  }>;
};

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatEntry[]>([
    {
      role: "assistant",
      content:
        "Hola. Soy el copiloto interno de Land Advisors Brain. Pregúntame sobre casos, clientes, comunas o terrenos registrados.",
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
    const userMessage: ChatEntry = { role: "user", content: text };
    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    startTransition(async () => {
      const apiMessages = nextMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .map(({ role, content }) => ({ role, content }));

      const result = await chatWithCopilot(apiMessages);

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
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={
                msg.role === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-la-blue px-4 py-3 text-sm text-white"
                  : "mr-auto max-w-[85%] rounded-2xl bg-la-mist px-4 py-3 text-sm"
              }
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1 border-t border-la-blue/10 pt-2">
                  {msg.sources.map((s, j) => (
                    <Badge key={j} variant="outline" className="text-xs">
                      {SOURCE_TYPE_LABELS[s.source_type] ?? s.source_type}:{" "}
                      {s.title}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </CardContent>
      </Card>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu consulta…"
          rows={2}
          className="min-h-0 flex-1 resize-none"
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
