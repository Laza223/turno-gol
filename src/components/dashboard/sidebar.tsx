"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_LINKS } from "./nav-links";
import { LogoutButton } from "./logout-button";

interface SidebarProps {
  complexName: string;
}

export function Sidebar({ complexName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col overflow-y-auto bg-navy text-white">
      {/* Header */}
      <div className="flex flex-col p-6">
        <span className="text-xl font-bold tracking-tight text-white">
          TurnoGol ⚽
        </span>
        <span className="mt-1 text-sm text-gray-400 truncate">
          {complexName}
        </span>
      </div>

      {/* Navegación principal */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {DASHBOARD_LINKS.map((link) => {
          // Exact match para grilla (home), startswith para el resto
          const isActive =
            link.href === "/dashboard"
              ? pathname === link.href
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-green-primary/20 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <div className="flex items-center gap-3">
                <link.icon className={cn("h-5 w-5", isActive ? "text-green-primary" : "")} />
                <span>{link.name}</span>
              </div>
              
              {link.locked && (
                <Lock className="h-4 w-4 text-gray-400/50" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4">
        <LogoutButton />
      </div>
    </aside>
  );
}
