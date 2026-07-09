"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  FileUp,
  LayoutDashboard,
  Map,
  MapPin,
  Search,
  Users,
} from "lucide-react";

import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/casos", label: "Casos", icon: Building2 },
  { href: "/terrenos", label: "Terrenos", icon: MapPin },
  { href: "/comunas", label: "Comunas", icon: Map },
  { href: "/biblioteca", label: "Biblioteca", icon: BookOpen },
  { href: "/buscar", label: "Buscar", icon: Search },
  { href: "/ia", label: "IA", icon: Brain },
  { href: "/estadisticas", label: "Estadísticas", icon: BarChart3 },
  { href: "/importar", label: "Importar histórico", icon: FileUp },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-la-sidebar text-white">
      <div className="border-b border-white/10 px-5 py-6">
        <div className="text-xs font-light uppercase tracking-[0.2em] text-white/50">
          Land Advisors
        </div>
        <div className="mt-1 text-lg font-semibold tracking-tight">Brain</div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white",
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-5 py-4 text-xs text-white/40">
        Estrategia territorial · Sur de Chile
      </div>
    </aside>
  );
}
