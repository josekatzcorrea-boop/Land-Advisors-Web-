import { PageHeader } from "@/components/layout/page-header";
import { TerrainForm } from "@/components/forms/terrain-form";
import { Card, CardContent } from "@/components/ui/card";
import { listComunas } from "@/lib/actions/comunas";

export default async function NuevoTerrenoPage() {
  const comunasResult = await listComunas();
  const comunas = comunasResult.success ? comunasResult.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo terreno"
        description="Registra un terreno en la base de datos."
      />
      <Card>
        <CardContent className="pt-6">
          <TerrainForm comunas={comunas} />
        </CardContent>
      </Card>
    </div>
  );
}
