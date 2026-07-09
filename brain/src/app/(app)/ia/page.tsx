import { PageHeader } from "@/components/layout/page-header";
import { ChatPanel } from "@/components/forms/chat-panel";

export default function IAPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="IA"
        description="Copiloto interno con RAG sobre el conocimiento de Land Advisors."
      />
      <ChatPanel />
    </div>
  );
}
