import { PageHeader } from "@/components/layout/page-header";
import { ClientForm } from "@/components/forms/client-form";
import { Card, CardContent } from "@/components/ui/card";
import { listTerrains } from "@/lib/actions/terrains";

export default async function NuevoClientePage() {
  const terrainsResult = await listTerrains();
  const terrains = terrainsResult.success
    ? terrainsResult.data.map((t) => ({ id: t.id, name: t.name }))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo cliente"
        description="Registra un nuevo cliente en el sistema."
      />
      <Card>
        <CardContent className="pt-6">
          <ClientForm terrains={terrains} />
        </CardContent>
      </Card>
    </div>
  );
}
