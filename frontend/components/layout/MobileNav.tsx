"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ClipboardCheck, TreePine, FileUp, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";

const mobileNavItems = [
  { label: "Inicio", href: "/", icon: LayoutDashboard },
  { label: "Diagnóstico", href: "/diagnostics", icon: ClipboardCheck },
  { label: "Carbono", href: "/carbon", icon: TreePine },
  { label: "Facturas", href: "/invoices", icon: FileUp },
  { label: "IA Chat", href: "/ai-chat", icon: MessageSquare },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-pb">
      <div className="grid grid-cols-5 h-16">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon className={cn("h-5 w-5", isActive && "stroke-[2.5px]")} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
