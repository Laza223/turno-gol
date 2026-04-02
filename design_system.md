# DESIGN_SYSTEM.md — TurnoGol

## Identidad de marca

- **Nombre:** TurnoGol
- **Personalidad:** profesional, simple, confiable, deportivo sin ser infantil
- **Tipografía:** Inter (única fuente, vía next/font/google)

## Paleta de colores

### Colores de marca

| Token           | Hex       | Uso                                                                                                                                                                                     |
| --------------- | --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `green-primary` | `#16A34A` | Color principal. Botones primarios, íconos activos, indicadores positivos. **Solo como fondo o elemento grande, NUNCA como color de texto en párrafos** (no pasa WCAG AA sobre blanco). |
| `green-dark`    | `#0F7A35` | Hover de botones verdes, énfasis.                                                                                                                                                       |
| `navy`          | `#0F172A` | Texto principal, fondos oscuros, sidebar. Contraste ~16:1 sobre blanco ✅                                                                                                               |
| `white`         | `#FFFFFF` | Fondos principales.                                                                                                                                                                     |
| `yellow-accent` | `#FACC15` | CTAs especiales, badges, alertas. **SOLO como fondo con texto navy encima.** Contraste ~1.8:1 sobre blanco → NUNCA como texto.                                                          |

### Colores neutros (escala de grises)

| Token      | Hex       | Uso                                   |
| ---------- | --------- | ------------------------------------- |
| `gray-50`  | `#F8FAFC` | Fondo alternativo sutil               |
| `gray-100` | `#F1F5F9` | Fondo de inputs, áreas secundarias    |
| `gray-200` | `#E2E8F0` | Bordes                                |
| `gray-300` | `#CBD5E1` | Bordes activos, divisores             |
| `gray-400` | `#94A3B8` | Placeholder text                      |
| `gray-500` | `#64748B` | Texto terciario (contraste ~4.6:1 ✅) |
| `gray-600` | `#475569` | Texto secundario (contraste ~7:1 ✅)  |
| `gray-700` | `#334155` | Texto secundario fuerte               |
| `gray-900` | `#0F172A` | Texto principal (= navy)              |

### Colores funcionales

| Token        | Hex       | Uso                           |
| ------------ | --------- | ----------------------------- |
| `red-500`    | `#EF4444` | Error, cancelado, destructivo |
| `red-50`     | `#FEF2F2` | Fondo de error/alerta         |
| `orange-500` | `#F97316` | Warning, pendiente, sin señar |
| `orange-50`  | `#FFF7ED` | Fondo de warning              |
| `blue-500`   | `#3B82F6` | Turno fijo, info              |
| `blue-50`    | `#EFF6FF` | Fondo de info/turno fijo      |

### Colores de la grilla

| Estado               | Fondo             | Borde             |
| -------------------- | ----------------- | ----------------- |
| Disponible           | transparente      | punteado gray-300 |
| Confirmado + señado  | green-primary/10% | green-primary     |
| Confirmado sin señar | orange-500/10%    | orange-500        |
| Turno fijo           | blue-500/10%      | blue-500          |
| Completado           | gray-500/8%       | gray-300          |
| Bloqueado            | navy/8%           | navy/30%          |

## Tipografía

**Única fuente: Inter** (next/font/google)

| Nivel         | Tamaño           | Peso           | Uso                               |
| ------------- | ---------------- | -------------- | --------------------------------- |
| Hero number   | 36px (text-4xl)  | Bold (700)     | Número principal de caja/reportes |
| Page title    | 24px (text-2xl)  | Semibold (600) | Título de página                  |
| Section title | 20px (text-xl)   | Semibold (600) | Título de sección                 |
| Subtitle      | 18px (text-lg)   | Medium (500)   | Subtítulos                        |
| Body          | 16px (text-base) | Normal (400)   | Texto principal                   |
| Body small    | 14px (text-sm)   | Normal (400)   | Texto secundario, tablas          |
| Caption       | 12px (text-xs)   | Normal/Medium  | Labels, metadata                  |

**Inter tiene números tabulares** (se alinean en columnas → ideal para tablas de precios y caja).

## Espaciado

Padding de página mobile: 24px (p-6)
Padding de página desktop: 32px (p-8)
Padding interno de cards: 16px (p-4) mobile, 24px (p-6) desktop
Gap entre secciones: 24px (gap-6)
Gap entre elementos: 12px (gap-3)
Gap entre items en lista: 8px (gap-2)

## Bordes y esquinas

Inputs, badges: 6px (rounded-md)
Botones, cards pequeñas: 8px (rounded-lg)
Cards principales, modals: 12px (rounded-xl)
Avatars, pills: 9999px (rounded-full)

### Sombras (usar con moderación)

Cards sobre fondo: shadow-sm → 0 1px 2px rgba(0,0,0,0.05)
Dropdowns, modales: shadow-md → 0 4px 6px rgba(0,0,0,0.07)
Default (sin sombra): Bordes con gray-200

**Regla:** la mayoría de las cards no tienen sombra. Tienen borde 1px gray-200. Solo los elementos flotantes (dropdown, modal, sheet) usan sombra.

## Componentes — Directrices

### Botones

| Variante    | Estilos                                                    | Uso                  |
| ----------- | ---------------------------------------------------------- | -------------------- |
| Primario    | bg-green-primary, text-white, hover:bg-green-dark          | Acciones principales |
| Secundario  | bg-white, border gray-200, text-gray-700, hover:bg-gray-50 | Acciones secundarias |
| Destructivo | bg-red-500, text-white, hover:bg-red-600                   | Eliminar, bloquear   |
| Ghost       | bg-transparent, text-gray-600, hover:bg-gray-100           | Acciones terciarias  |
| Acento      | bg-yellow-accent, text-navy, hover:opacity-90              | CTAs especiales      |

Tamaños: sm (h-8), md (h-10, default), lg (h-12).
Border-radius: rounded-lg (8px).
Todos los botones tienen estado de loading (spinner + disabled).

### Cards

- Fondo blanco
- Borde: 1px solid gray-200
- Border-radius: rounded-xl (12px)
- Sin sombra por default
- Hover: border-gray-300 si es clickeable

### Formularios

- Labels arriba del input, font-medium, text-sm
- Inputs: h-10, border gray-300, rounded-lg, focus:ring-green-primary, focus:border-green-primary
- Placeholder: text-gray-400
- Error: text-red-500 text-sm debajo del input
- React Hook Form + Zod

### Grilla de turnos

**La pantalla más importante del sistema.**

Mobile (< 768px):

- Vista de UN día
- Tabs para cambiar cancha
- Cada slot es un row: "20:00 — Juan P. 🟢"
- Tap → Sheet (bottom) con detalle

Desktop (>= 768px):

- Vista de UN día (con navegación ← →)
- Columnas = canchas
- Filas = horarios
- Click en celda → panel lateral con detalle

### Toasts

- Librería: Sonner (incluido en shadcn/ui)
- Success: ícono verde
- Error: ícono rojo
- Position: bottom-right (desktop), top-center (mobile)
- Duration: 4 segundos

### Modales y Sheets

- Mobile: Sheet (slide from bottom)
- Desktop: Sheet lateral derecho para detalles de reserva. Dialog (modal centrado) para confirmaciones.

## Principios de UX

### 1. Velocidad percibida

- Skeleton loaders en la grilla mientras carga.
- Optimistic updates al crear/editar reservas.
- Transiciones de 150ms.

### 2. Feedback inmediato

- Toda acción tiene toast de confirmación o error.
- Botones con loading state.
- Errores que explican qué pasó y qué hacer.

### 3. Diseño para el contexto real

- El recepcionista usa esto con una mano, celular en la otra.
- Botones grandes, áreas de toque mínimo 44x44px.
- Alto contraste (puede haber sol en la pantalla).
- Acciones frecuentes a máximo 2 taps.

### 4. Jerarquía visual clara

- El dato más importante de cada pantalla es el más grande.
- No más de 3 niveles de jerarquía tipográfica por pantalla.
- Información secundaria en gris y más chico.

### 5. Consistencia

- Mismo componente para la misma función en toda la app.
- Verde = ok/confirmado, naranja = pendiente, rojo = problema, azul = fijo/info.
- Mismo patrón de interacción (toast para feedback, sheet en mobile).

## Responsive

| Breakpoint | Ancho      | Comportamiento                                      |
| ---------- | ---------- | --------------------------------------------------- |
| Mobile     | < 768px    | Una columna, bottom nav, sheets                     |
| Tablet     | 768-1024px | Sidebar colapsable, grilla ajustada                 |
| Desktop    | > 1024px   | Sidebar visible, grilla completa, paneles laterales |

## Iconografía

- Librería: Lucide React
- Default: 20px (w-5 h-5)
- Pequeño: 16px (w-4 h-4)
- Grande: 24px (w-6 h-6)
- Color: currentColor

## Animaciones

- Duración: 150ms (micro), 300ms (layout)
- Easing: ease-in-out
- Permitido: hover color/border, apertura de modals/sheets, skeleton pulse, fade in
- Prohibido: bounce, spin (salvo loading spinner), blink, cualquier cosa >300ms
