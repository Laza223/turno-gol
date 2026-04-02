/**
 * Templates default de WhatsApp con variables.
 * Variables disponibles: {nombre}, {fecha}, {hora}, {cancha}, {precio},
 * {seña}, {complejo}, {alias}, {cbu}
 *
 * El complejo puede editar estos templates desde settings.
 * Se usan con buildMessage() de lib/utils/whatsapp.ts.
 */

export const WA_TEMPLATES = {
  confirmation: `¡Hola {nombre}! 👋

Tu turno en *{complejo}* está confirmado:

📅 {fecha}
⏰ {hora}
⚽ {cancha}
💰 {precio}

¡Te esperamos!`,

  deposit: `¡Hola {nombre}! 👋

Para confirmar tu turno en *{complejo}* necesitamos la seña de *{seña}*.

📅 {fecha}
⏰ {hora}
⚽ {cancha}

Podés transferir a:
🏦 Alias: {alias}
🔢 CBU: {cbu}

Envianos el comprobante por acá. ¡Gracias!`,

  reminder: `¡Hola {nombre}! 👋

Te recordamos que tenés turno hoy en *{complejo}*:

⏰ {hora}
⚽ {cancha}

¡Te esperamos! ⚽`,

  cancellation: `Hola {nombre},

Tu turno en *{complejo}* fue cancelado:

📅 {fecha}
⏰ {hora}
⚽ {cancha}

Si tenés alguna consulta, contactanos. ¡Saludos!`,
} as const;

export type WaTemplateKey = keyof typeof WA_TEMPLATES;
