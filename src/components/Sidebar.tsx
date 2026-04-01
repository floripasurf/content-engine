"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: "📊" },
  { href: "/brands", label: "Marcas", icon: "🏷️" },
  { href: "/generate", label: "Gerar Roteiros", icon: "✨" },
  { href: "/queue", label: "Fila de Aprovação", icon: "📋" },
  { href: "/calendar", label: "Calendário", icon: "📅" },
  { href: "/templates", label: "Templates", icon: "📐" },
  { href: "/analytics", label: "Analytics", icon: "📈" },
  { href: "/settings", label: "Configurações", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#1e1e1e] border-r border-border flex flex-col z-50">
      <div className="p-5 border-b border-border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-white font-bold text-sm">
            CE
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">Content Engine</h1>
            <p className="text-[11px] text-muted">Produção de conteúdo viral</p>
          </div>
        </Link>
      </div>
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                active
                  ? "bg-accent/15 text-accent font-medium"
                  : "text-muted hover:text-foreground hover:bg-surface-hover"
              )}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border">
        <div className="bg-accent-dim rounded-lg p-3">
          <p className="text-xs text-accent font-medium">Modo Protótipo</p>
          <p className="text-[11px] text-muted mt-1">Dados salvos no localStorage</p>
        </div>
      </div>
    </aside>
  );
}
