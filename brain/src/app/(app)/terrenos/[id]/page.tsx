import { notFound } from "next/navigation";

import { TerrainForm } from "@/components/forms/terrain-form";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { getTerrain } from "@/lib/actions/terrains";
import { listComunas } from "@/lib/actions/comunas";

type Props = { params: Promise<{ id: string }> };

export default async function TerrenoDetailPage({ params }: Props) {
  const { id } = await params;
  const [terrainResult, comunasResult] = await Promise.all([
    getTerrain(id),
    listComunas(),
  ]);

  if (!terrainResult.success) {
    notFound();
  }

  const comunas = comunasResult.success ? comunasResult.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={terrainResult.data.name}
        description="Ficha del terreno."
      />
      <Card>
        <CardContent className="pt-6">
          <TerrainForm terrain={terrainResult.data} comunas={comunas} />
        </CardContent>
      </Card>
    </div>
  );
}
