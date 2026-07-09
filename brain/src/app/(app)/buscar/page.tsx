import { PageHeader } from "@/components/layout/page-header";
import { SearchPanel } from "@/components/forms/search-panel";

export default function BuscarPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Buscar"
        description="Búsqueda híbrida: texto completo + semántica sobre el conocimiento interno."
      />
      <SearchPanel />
    </div>
  );
}
