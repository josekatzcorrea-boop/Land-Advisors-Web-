import Link from "next/link";
import { notFound } from "next/navigation";

import { CaseForm } from "@/components/forms/case-form";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  getCase,
  getCaseTerrains,
} from "@/lib/actions/cases";
import { getClient } from "@/lib/actions/clients";
import { listClients } from "@/lib/actions/clients";
import { listComunas } from "@/lib/actions/comunas";
import { listTerrains } from "@/lib/actions/terrains";

type Props = { params: Promise<{ id: string }> };

export default async function CasoDetailPage({ params }: Props) {
  const { id } = await params;
  const caseResult = await getCase(id);

  if (!caseResult.success) {
    notFound();
  }

  const [clientsResult, comunasResult, terrainsResult, caseTerrainsResult, clientResult] =
    await Promise.all([
      listClients(),
      listComunas(),
      listTerrains(),
      getCaseTerrains(id),
      getClient(caseResult.data.client_id),
    ]);

  const clients = clientsResult.success ? clientsResult.data : [];
  const comunas = comunasResult.success ? comunasResult.data : [];
  const terrains = terrainsResult.success ? terrainsResult.data : [];
  const caseTerrains = caseTerrainsResult.success ? caseTerrainsResult.data : [];
  const clientName = clientResult.success ? clientResult.data.name : "Cliente";

  return (
    <div className="space-y-6">
      <PageHeader
        title={caseResult.data.title}
        description={`Caso de ${clientName}`}
        action={
          <Button variant="secondary" asChild>
            <Link href={`/clientes/${caseResult.data.client_id}`}>
              Ver cliente
            </Link>
          </Button>
        }
      />
      <Card>
        <CardContent className="pt-6">
          <CaseForm
            caseData={caseResult.data}
            clients={clients}
            comunas={comunas}
            terrains={terrains}
            caseTerrains={caseTerrains}
          />
        </CardContent>
      </Card>
    </div>
  );
}
