import { PageHeader } from "@/components/layout/page-header";
import { CaseForm } from "@/components/forms/case-form";
import { Card, CardContent } from "@/components/ui/card";
import { listClients } from "@/lib/actions/clients";
import { listComunas } from "@/lib/actions/comunas";
import { listTerrains } from "@/lib/actions/terrains";

type Props = { searchParams: Promise<{ client_id?: string }> };

export default async function NuevoCasoPage({ searchParams }: Props) {
  const { client_id } = await searchParams;
  const [clientsResult, comunasResult, terrainsResult] = await Promise.all([
    listClients(),
    listComunas(),
    listTerrains(),
  ]);

  const clients = clientsResult.success ? clientsResult.data : [];
  const comunas = comunasResult.success ? comunasResult.data : [];
  const terrains = terrainsResult.success ? terrainsResult.data : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nuevo caso"
        description="Registra un nuevo caso de asesoría."
      />
      <Card>
        <CardContent className="pt-6">
          <CaseForm
            clients={clients}
            comunas={comunas}
            terrains={terrains}
            defaultClientId={client_id}
          />
        </CardContent>
      </Card>
    </div>
  );
}
