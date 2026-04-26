import { FileUp, FileText, ClipboardCheck, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatRelativeDate } from "@/lib/utils";

const activities = [
  {
    id: 1,
    type: "invoice",
    icon: FileUp,
    title: "Factura eléctrica procesada",
    subtitle: "Iberdrola — Marzo 2026",
    time: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    status: "completed",
  },
  {
    id: 2,
    type: "report",
    icon: FileText,
    title: "Informe VSME generado",
    subtitle: "T1 2026",
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: "completed",
  },
  {
    id: 3,
    type: "diagnostic",
    icon: ClipboardCheck,
    title: "Autodiagnóstico completado",
    subtitle: "Score: 72/100",
    time: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    status: "completed",
  },
  {
    id: 4,
    type: "invoice",
    icon: FileUp,
    title: "Factura de gas pendiente",
    subtitle: "Naturgy — Marzo 2026",
    time: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(),
    status: "pending",
  },
  {
    id: 5,
    type: "chat",
    icon: MessageSquare,
    title: "Consulta sobre VSME",
    subtitle: "Art. 5 — Materialidad",
    time: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    status: "completed",
  },
];

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  completed: "secondary",
  pending: "outline",
};

export function RecentActivity() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Actividad Reciente</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ul className="divide-y divide-border">
          {activities.map((activity) => {
            const Icon = activity.icon;
            return (
              <li key={activity.id} className="flex items-start gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted mt-0.5">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{activity.subtitle}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant={statusVariant[activity.status]} className="text-xs">
                    {activity.status === "completed" ? "Completado" : "Pendiente"}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(activity.time)}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
