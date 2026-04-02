"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { DASHBOARD_LINKS } from "./nav-links";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LogoutButton } from "./logout-button";

export function MobileNav() {
  const pathname = usePathname();
  const mobileLinks = DASHBOARD_LINKS.filter((l) => l.mobile);
  const otherLinks = DASHBOARD_LINKS.filter((l) => !l.mobile);

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-around border-t border-gray-200 bg-white px-2 lg:hidden">
      {/* Links visibles abajo */}
      {mobileLinks.map((link) => {
        const isActive =
          link.href === "/dashboard"
            ? pathname === link.href
            : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors",
              isActive
                ? "text-green-primary"
                : "text-gray-500 hover:text-navy"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <link.icon className={cn("h-5 w-5", isActive ? "text-green-primary" : "")} />
            <span>{link.name}</span>
          </Link>
        );
      })}

      {/* Menú Más */}
      <Sheet>
        <SheetTrigger asChild>
          <button className="flex flex-col items-center justify-center gap-1 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition-colors hover:text-navy">
            <Menu className="h-5 w-5" />
            <span>Más</span>
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="rounded-t-2xl px-4 py-6">
          <SheetHeader className="mb-4 text-left">
            <SheetTitle>Menú</SheetTitle>
          </SheetHeader>
          
          <nav className="flex flex-col space-y-2">
            {otherLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center justify-between rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-green-primary/10 text-green-primary"
                      : "text-navy hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="h-5 w-5" />
                    <span>{link.name}</span>
                  </div>
                  {link.locked && (
                    <Lock className="h-4 w-4 text-gray-400" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-8 border-t border-gray-100 pt-4">
            <div className="rounded-lg bg-gray-50 p-2">
              <LogoutButton />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
