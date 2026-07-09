"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadDocument } from "@/lib/actions/documents";

export function DocumentUploadForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const form = e.currentTarget;
    const formData = new FormData(form);
    if (title) {
      formData.set("title", title);
    }

    startTransition(async () => {
      const result = await uploadDocument(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setTitle("");
      form.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="title">Título (opcional)</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Nombre descriptivo del documento"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="file">Archivo *</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Subiendo…" : "Subir documento"}
      </Button>
    </form>
  );
}
