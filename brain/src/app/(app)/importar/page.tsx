import { ImportWizard } from "@/components/forms/import-wizard";
import { PageHeader } from "@/components/layout/page-header";
import { listComunas } from "@/lib/actions/comunas";

export default async function ImportarPage() {
  const comunasResult = await listComunas();
  const comunas = comunasResult.success
    ? comunasResult.data.map((c) => ({ id: c.id, name: c.name }))
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Importar histórico"
        description="Wizard de 5 pasos para cargar un caso cerrado (~15 min)."
      />
      <ImportWizard comunas={comunas} />
    </div>
  );
}
