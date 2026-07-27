"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, ShieldCheck, FileSearch, Plug, FileText,
  Settings, LogOut, Menu, X, ChevronRight
} from "lucide-react";

const navItems = [
  { href: "/overview", label: "Overview", icon: LayoutDashboard },
  { href: "/controls", label: "Controls", icon: ShieldCheck },
  { href: "/evidence", label: "Evidencias", icon: FileSearch },
  { href: "/connectors", label: "Conectores", icon: Plug },
  { href: "/reports", label: "Informes", icon: FileText },
  { href: "/settings", label: "Configuracion", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        glass border-r border-white/5
        flex flex-col transition-all duration-300
        ${mobileOpen ? "w-64 translate-x-0" : "-translate-x-full lg:translate-x-0"}
        ${collapsed ? "lg:w-20" : "lg:w-64"}
      `}>
        {/* Logo */}
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <Link href="/overview" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            {!collapsed && <span className="text-white font-bold text-lg">CertFlow</span>}
          </Link>
          <button onClick={() => setMobileOpen(false)} className="lg:hidden text-zinc-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all group
                  ${isActive
                    ? "bg-accent-500/10 text-accent-400 border border-accent-500/20"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"}
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && <ChevronRight className="w-4 h-4 ml-auto" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={() => { localStorage.removeItem("token"); window.location.href = "/login"; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-zinc-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span>Cerrar Sesion</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar */}
        <div className="sticky top-0 z-30 glass border-b border-white/5 px-6 py-4 flex items-center gap-4">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-zinc-400">
            <Menu className="w-6 h-6" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex text-zinc-400 hover:text-white transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full bg-accent-500/20 flex items-center justify-center text-accent-400 text-sm font-medium">
            U
          </div>
        </div>

        {/* Page content */}
        <div className="p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
