# TurnoGol ⚽

Sistema de gestión para complejos de fútbol en Argentina.

## ¿Qué es?

Un software para que complejos de fútbol gestionen reservas, señas, turnos fijos, WhatsApp y caja diaria desde un solo lugar. No es marketplace, no es app de descubrimiento. Es el sistema operativo del complejo.

## Stack

| Categoría | Tecnología               |
| --------- | ------------------------ |
| Framework | Next.js 14+ (App Router) |
| Lenguaje  | TypeScript               |
| UI        | Tailwind CSS + shadcn/ui |
| DB        | PostgreSQL (Supabase)    |
| ORM       | Prisma                   |
| Auth      | Supabase Auth            |
| Realtime  | Supabase Realtime        |
| Pagos     | MercadoPago              |
| Email     | Resend                   |
| Deploy    | Vercel                   |

## Setup local

```bash
git clone [repo]
cd turnogol
pnpm install
cp .env.example .env.local
# Completar variables de entorno
pnpm prisma generate
pnpm prisma db push
pnpm prisma db seed
pnpm dev
```

## Variables de entorno

# Supabase

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Base de datos (Supabase PostgreSQL)

DATABASE_URL=
DIRECT_URL=

# MercadoPago

MERCADOPAGO_CLIENT_ID=
MERCADOPAGO_CLIENT_SECRET=
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=

# Resend

RESEND_API_KEY=

# App

NEXT_PUBLIC_APP_URL=http://localhost:3000
CRON_SECRET=

Estructura
Ver SKILLS.md para la estructura completa de carpetas y patrones técnicos.

## Módulos

1- Auth + Onboarding
2- Grilla de turnos (pantalla principal)
3- Reservas (manuales + online)
4- Página pública del complejo
5- Turnos fijos
6- Canchas y clientes
7- Caja diaria
8- MercadoPago (señas + suscripción)
9- Reportes y analíticas
10- Configuración
11- Landing page
