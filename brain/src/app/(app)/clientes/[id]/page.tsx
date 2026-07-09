import Link from "next/link";
import { notFound } from "next/navigation";

import { ClientForm } from "@/components/forms/client-form";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getClient } from "@/lib/actions/clients";
import { listCases } from "@/lib/actions/cases";
import { listTimelineForClient } from "@/lib/actions/timeline";
import { listTerrains } from "@/lib/actions/terrains";
import { CLIENT_STATUS_LABELS, CASE_STATUS_LABELS } from "@/lib/labels";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

type Props = { params: Promise<{ id: string }> };

export default async function ClienteDetailPage({ params }: Props) {
  const { id } = await params;
  const [clientResult, casesResult, timelineResult, terrainsResult] =
    await Promise.all([
      getClient(id),
      listCases({ client_id: id }),
      listTimelineForClient(id),
      listTerrains(),
    ]);

  if (!clientResult.success) {
    notFound();
  }

  const client = clientResult.data;
  const cases = casesResult.success ? casesResult.data : [];
  const timeline = timelineResult.success ? timelineResult.data : [];
  const terrains = terrainsResult.success
    ? terrainsResult.data.map((t) => ({ id: t.id, name: t.name }))
    : [];

  return (
    <div className="space-y-8">
      <PageHeader
        title={client.name}
        description="Ficha del cliente y su historial."
        action={
          <div className="flex gap-2">
            <Badge variant="secondary">{CLIENT_STATUS_LABELS[client.status]}</Badge>
            <Button variant="secondary" asChild>
              <Link href={`/casos/nuevo?client_id=${client.id}`}>Nuevo caso</Link>
            </Button>
          </div>
        }
      />

      <Card>
        <CardContent className="pt-6">
          <ClientForm client={client} terrains={terrains} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Casos</CardTitle>
          </CardHeader>
          <CardContent>
            {cases.length === 0 ? (
              <p className="text-sm text-muted">Sin casos asociados.</p>
            ) : (
              <ul className="space-y-2">
                {cases.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/casos/${c.id}`}
                      className="flex items-center justify-between rounded-lg bg-la-mist px-4 py-3 text-sm hover:bg-la-mist/80"
                    >
                      <span className="font-medium">{c.title}</span>
                      <Badge variant="outline">
                        {CASE_STATUS_LABELS[c.status]}
                      </Badge>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            {timeline.length === 0 ? (
              <p className="text-sm text-muted">Sin eventos registrados.</p>
            ) : (
              <ul className="space-y-3">
                {timeline.map((event) => (
                  <li
                    key={event.id}
                    className="border-b border-la-blue/5 pb-3 last:border-0"
                  >
                    <p className="text-sm font-medium">{event.title}</p>
                    {event.description && (
                      <p className="mt-1 text-sm text-muted">{event.description}</p>
                    )}
                    <p className="mt-1 text-xs text-muted">
                      {formatDistanceToNow(new Date(event.occurred_at), {
                        addSuffix: true,
                        locale: es,
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
