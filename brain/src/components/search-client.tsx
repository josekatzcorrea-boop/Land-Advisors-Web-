"use client";

import Link from "next/link";
import { useState, useTransition } from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { hybridSearch } from "@/lib/actions/search";
import { SOURCE_TYPE_LABELS } from "@/lib/labels";
import type { HybridSearchResult } from "@/lib/types";

const SOURCE_PATHS: Record<string, (id: string) => string> = {
  client: (id) => `/clientes/${id}`,
  case: (id) => `/casos/${id}`,
  terrain: (id) => `/terrenos/${id}`,
  comuna: (id) => `/comunas/${id}`,
  document: () => `/biblioteca`,
};

export function SearchClient() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HybridSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await hybridSearch(query);
      if (!result.success) {
        setError(result.error);
        setResults([]);
        return;
      }
      setResults(result.data);
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Buscar"
        description="Búsqueda híbrida semántica + texto en todo el conocimiento."
      />

      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ej: terreno con vista al lago en Frutillar"
          className="flex-1"
        />
        <Button type="submit" disabled={isPending || !query.trim()}>
          {isPending ? "Buscando…" : "Buscar"}
        </Button>
      </form>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((item) => {
            const pathFn = SOURCE_PATHS[item.source_type];
            const href = pathFn?.(item.source_id);

            return (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      <CardDescription className="mt-1">
                        <Badge variant="outline" className="mr-2">
                          {SOURCE_TYPE_LABELS[item.source_type] ??
                            item.source_type}
                        </Badge>
                        Score: {item.score.toFixed(3)}
                      </CardDescription>
                    </div>
                    {href && (
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={href}>Ver</Link>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="line-clamp-4 text-sm text-muted">
                    {item.content}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
