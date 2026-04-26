"use client";

import { useRouter } from "next/navigation";
import { FileUp, FileText, ClipboardCheck, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const actions = [
  {
    label: "Subir factura",
    icon: FileUp,
    href: "/invoices",
    variant: "default" as const,
  },
  {
    label: "Nuevo informe",
    icon: FileText,
    href: "/reports",
    variant: "outline" as const,
  },
  {
    label: "Iniciar diagnóstico",
    icon: ClipboardCheck,
    href: "/diagnostics",
    variant: "outline" as const,
  },
  {
    label: "Hablar con IA",
    icon: MessageSquare,
    href: "/ai-chat",
    variant: "outline" as const,
  },
];

export function QuickActions() {
  const router = useRouter();

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-base font-semibold">Acciones Rápidas</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <Button
              key={action.href}
              variant={action.variant}
              className="h-auto flex-col gap-2 py-4 px-3"
              onClick={() => router.push(action.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
