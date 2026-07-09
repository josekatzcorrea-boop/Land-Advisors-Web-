"use client";

import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { hybridSearch } from "@/lib/actions/search";
import { SOURCE_TYPE_LABELS } from "@/lib/labels";
import type { HybridSearchResult } from "@/lib/types";

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<HybridSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setError(null);

    startTransition(async () => {
      const result = await hybridSearch(query.trim());
      setSearched(true);
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
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar en casos, clientes, comunas, documentos…"
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

      {searched && !error && results.length === 0 && (
        <p className="text-sm text-muted">Sin resultados para esta consulta.</p>
      )}

      <div className="space-y-3">
        {results.map((item) => (
          <Card key={item.id}>
            <CardContent className="pt-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {SOURCE_TYPE_LABELS[item.source_type] ?? item.source_type}
                    </Badge>
                    <span className="text-xs text-muted">
                      score {item.score.toFixed(3)}
                    </span>
                  </div>
                  <h3 className="mt-2 font-medium text-la-blue">{item.title}</h3>
                  <p className="mt-2 line-clamp-4 text-sm text-muted">
                    {item.content}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
