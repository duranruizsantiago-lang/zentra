"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ClipboardCheck, TreePine, FileUp,
  FileText, BarChart3, Store, MessageSquare, Leaf,
} from "lucide-react";
import { cn } from "@/lib/utils";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/diagnostics": "Autodiagnóstico ASG",
  "/carbon": "Huella de Carbono",
  "/invoices": "Facturas",
  "/reports": "Informes",
  "/benchmarks": "Benchmarking Sectorial",
  "/marketplace": "Marketplace",
  "/ai-chat": "Asistente IA",
};

const mobileNavAll = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Autodiagnóstico", href: "/diagnostics", icon: ClipboardCheck },
  { label: "Huella de Carbono", href: "/carbon", icon: TreePine },
  { label: "Facturas", href: "/invoices", icon: FileUp },
  { label: "Informes", href: "/reports", icon: FileText },
  { label: "Benchmarking", href: "/benchmarks", icon: BarChart3 },
  { label: "Marketplace", href: "/marketplace", icon: Store },
  { label: "Asistente IA", href: "/ai-chat", icon: MessageSquare },
];

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Zentra ESG";

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      {/* Desktop sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex items-center h-16 px-4 border-b border-border">
            <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Leaf className="h-4 w-4" />
              </div>
              <span className="font-bold text-lg">Zentra ESG</span>
            </Link>
          </div>
          <nav className="py-4 px-2 space-y-1">
            {mobileNavAll.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors duration-150 border-l-[3px]",
                    isActive
                      ? "bg-primary/10 text-primary border-primary"
                      : "text-foreground hover:bg-muted border-transparent"
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[60] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:text-sm focus:font-medium"
        >
          Saltar al contenido
        </a>
        <Navbar title={title} onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0" id="main-content">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">{children}</div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
}
