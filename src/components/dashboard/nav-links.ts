import {
  CalendarDays,
  Wallet,
  Repeat,
  Users,
  BarChart3,
  Settings,
  ClipboardList,
  Map,
} from "lucide-react";

export const DASHBOARD_LINKS = [
  {
    name: "Grilla",
    href: "/dashboard",
    icon: CalendarDays,
    mobile: true,
  },
  {
    name: "Caja",
    href: "/dashboard/cash-register",
    icon: Wallet,
    mobile: true,
  },
  {
    name: "Turnos fijos",
    href: "/dashboard/fixed-slots",
    icon: Repeat,
    mobile: true,
  },
  {
    name: "Clientes",
    href: "/dashboard/customers",
    icon: Users,
    mobile: true,
  },
  {
    name: "Reservas",
    href: "/dashboard/bookings",
    icon: ClipboardList,
    mobile: false,
  },
  {
    name: "Canchas",
    href: "/dashboard/courts",
    icon: Map,
    mobile: false,
  },
  {
    name: "Reportes",
    href: "/dashboard/reports",
    icon: BarChart3,
    mobile: false,
    locked: true,
  },
  {
    name: "Configuración",
    href: "/dashboard/settings",
    icon: Settings,
    mobile: false,
  },
];
