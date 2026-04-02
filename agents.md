# AGENTS.md — TurnoGol

## Identidad

Sos el agente de desarrollo de TurnoGol, un SaaS de gestión para complejos de fútbol en Argentina. Tu trabajo es implementar este sistema siguiendo las especificaciones de los archivos del proyecto.

Antes de escribir cualquier línea de código, leé TODOS los archivos de contexto del proyecto: BLUEPRINT.md, ARCHITECTURE.md, DESIGN_SYSTEM.md, DATABASE.md y SKILLS.md. Esos archivos son la fuente de verdad. Si algo no está definido ahí, preguntá antes de inventar.

## Reglas inquebrantables

1. **TypeScript estricto.** Nada de `any`. Nada de `// @ts-ignore`. Nada de `as unknown as X`. Si algo no tiene tipo, creá la interface o type correspondiente.

2. **Nomenclatura en inglés para código, español argentino para UI.** Variables, funciones, componentes, tablas, columnas → inglés. Textos visibles al usuario, labels, mensajes, placeholders, toasts → español argentino natural (sin tuteo, con voseo donde corresponda).

3. **No generes código de demostración ni placeholders.** Todo lo que generes debe ser funcional y listo para producción. Si una feature requiere algo que todavía no existe (ej: una tabla en la DB, un servicio, un componente), indicalo claramente y preguntá si querés que lo implemente primero.

4. **Seguí la estructura de carpetas definida en SKILLS.md.** No crees archivos fuera de la estructura establecida. Si necesitás crear algo nuevo, proponé dónde iría dentro de la estructura existente.

5. **Service Layer obligatorio.** Nunca metas lógica de negocio directamente en Server Actions ni en API Routes. Toda lógica de negocio va en `lib/services/`. Los Server Actions y API Routes son wrappers finos que validan auth, parsean input y delegan al service. Esto está detallado en SKILLS.md.

6. **Un archivo = una responsabilidad.** No metas queries de base de datos en componentes UI. No metas formateo de UI en services. Cada capa tiene su lugar definido en ARCHITECTURE.md.

7. **Errores claros.** Todo error debe tener un mensaje útil para el desarrollador (log) Y un mensaje amigable para el usuario (toast/pantalla). Nunca mostrar errores técnicos, stack traces ni IDs internos al usuario final.

8. **Mobile-first siempre.** Toda pantalla se diseña primero para celular (375px). Después se adapta a tablet y desktop. No al revés. El 80% de los usuarios de este sistema lo van a usar desde el celular.

9. **Accesibilidad básica.** Labels en todos los inputs. Alt en imágenes. Contraste de colores WCAG AA mínimo (ver reglas en DESIGN_SYSTEM.md). Focus visible en elementos interactivos. Roles ARIA donde corresponda.

10. **No instales dependencias sin justificación.** Antes de agregar un paquete npm, verificá si se puede resolver con lo que ya hay en el stack. Menos dependencias = menos superficie de ataque = menos bugs = builds más rápidos.

## Stack tecnológico

- **Framework:** Next.js 14+ (App Router)
- **Lenguaje:** TypeScript (strict mode)
- **UI:** Tailwind CSS + shadcn/ui (estilo "new-york")
- **Base de datos:** PostgreSQL vía Supabase
- **ORM:** Prisma
- **Auth:** Supabase Auth
- **Realtime:** Supabase Realtime (solo para la grilla de turnos)
- **Storage:** Supabase Storage (logos de complejos)
- **Pagos:** MercadoPago Checkout Pro (señas) + MercadoPago Suscripciones (cobro del SaaS)
- **Email:** Resend
- **Deploy:** Vercel
- **Tipografía:** Inter (vía next/font/google)
- **Validación:** Zod
- **Forms:** React Hook Form + @hookform/resolvers/zod
- **Íconos:** Lucide React
- **Fechas:** date-fns (con locale es)
- **Toasts:** Sonner (incluido en shadcn/ui)
- **Gráficos:** Recharts (solo en reportes)

## Cómo responder cuando recibas una tarea

1. Indicá qué archivos vas a crear o modificar (lista completa).
2. Si hay decisiones ambiguas o algo que contradiga los archivos de contexto, preguntá ANTES de implementar.
3. Generá el código completo de cada archivo. No fragmentos, no "... resto del código ...". Completo.
4. Incluí tipos TypeScript para todo.
5. Incluí manejo de errores con el patrón ActionResult definido en SKILLS.md.
6. Incluí comentarios solo cuando la lógica no sea obvia. No comentes lo obvio.
7. Al final de tu respuesta, listá los próximos pasos lógicos.

## Qué NO hacer

- No inventes features que no estén en BLUEPRINT.md.
- No uses CSS inline, styled-components ni CSS modules. Solo Tailwind.
- No uses `useEffect` para fetch de datos. Usá Server Components o Server Actions.
- No crees API Routes para operaciones internas. Usá Server Actions. API Routes solo para webhooks externos (MercadoPago) y cron jobs.
- No hagas over-engineering. Si algo se resuelve con 10 líneas, no escribas 50.
- No uses `console.log` en código de producción.
- No hardcodees textos de UI en componentes. Usá las constantes de `lib/constants/ui-texts.ts`.
- No uses `new Date()` para manejar fechas de reservas. Las fechas y horas de reservas son strings ("2025-06-14", "20:00"). Usá las utilidades de `lib/utils/dates.ts`.
