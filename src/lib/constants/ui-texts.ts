/**
 * Textos de UI centralizados.
 * AGENTS.md: "No hardcodees textos de UI en componentes."
 */

export const UI_TEXTS = {
  // Errores genéricos
  errors: {
    unexpected: "Ocurrió un error inesperado. Intentá de nuevo.",
    unauthorized: "No tenés permisos para realizar esta acción.",
    not_found: "No se encontró el recurso solicitado.",
    validation: "Datos inválidos. Revisá los campos marcados.",
    network: "Error de conexión. Verificá tu internet e intentá de nuevo.",
    blocked: "Tu cuenta está temporalmente bloqueada.",
  },

  // Auth
  auth: {
    login_title: "Iniciá sesión",
    login_subtitle: "Ingresá con tu email y contraseña",
    register_title: "Creá tu cuenta",
    register_subtitle: "Empezá a gestionar tu complejo en minutos",
    email_label: "Email",
    email_placeholder: "complejo@email.com",
    password_label: "Contraseña",
    password_placeholder: "Tu contraseña",
    complex_name_label: "Nombre del complejo",
    complex_name_placeholder: "Ej: La Cancha de Barrio Norte",
    login_button: "Iniciar sesión",
    register_button: "Crear cuenta",
    login_link: "¿Ya tenés cuenta? Iniciá sesión",
    register_link: "¿No tenés cuenta? Registrate",
    login_error: "Email o contraseña incorrectos.",
    register_error: "No se pudo crear la cuenta. Intentá de nuevo.",
  },

  // Reservas
  bookings: {
    create_title: "Nueva reserva",
    edit_title: "Detalle de reserva",
    customer_name_label: "Nombre del cliente",
    customer_name_placeholder: "Ej: Juan Pérez",
    customer_phone_label: "Teléfono",
    customer_phone_placeholder: "Ej: 11 1234-5678",
    notes_label: "Notas",
    notes_placeholder: "Notas adicionales (opcional)",
    deposit_toggle: "¿Señó?",
    confirm_button: "Confirmar reserva",
    cancel_button: "Cancelar reserva",
    collect_button: "Cobrar turno",
    block_title: "Bloquear horario",
    block_reason_label: "Motivo (opcional)",
    block_reason_placeholder: "Ej: Mantenimiento",
    block_button: "Bloquear",
    slot_taken: "Este horario ya está reservado.",
    created_success: "Reserva creada correctamente.",
    cancelled_success: "Reserva cancelada.",
    collected_success: "Turno cobrado correctamente.",
    blocked_success: "Horario bloqueado.",
    unblocked_success: "Horario desbloqueado.",
    customer_blocked_warning: "⚠️ Cliente bloqueado",
    fixed_badge: "FIJO",
  },

  // Canchas
  courts: {
    title: "Canchas",
    create_title: "Nueva cancha",
    edit_title: "Editar cancha",
    name_label: "Nombre",
    name_placeholder: "Ej: Cancha 1",
    players_label: "Cantidad de jugadores",
    surface_label: "Superficie",
    roofed_label: "Techada",
    price_label: "Precio (pesos)",
    price_placeholder: "Ej: 25000",
    price_weekend_label: "Precio fin de semana (opcional)",
    price_weekend_placeholder: "Dejar vacío para usar precio base",
    created_success: "Cancha creada correctamente.",
    updated_success: "Cancha actualizada.",
    deactivated_success: "Cancha desactivada.",
  },

  // Clientes
  customers: {
    title: "Clientes",
    search_placeholder: "Buscar por nombre o teléfono...",
    block_button: "Bloquear cliente",
    unblock_button: "Desbloquear cliente",
    block_reason_label: "Motivo del bloqueo (opcional)",
    blocked_success: "Cliente bloqueado.",
    unblocked_success: "Cliente desbloqueado.",
    online_blocked_message:
      "No se pudo procesar tu reserva. Contactá al complejo.",
  },

  // Turnos fijos
  fixed_slots: {
    title: "Turnos fijos",
    create_title: "Nuevo turno fijo",
    day_label: "Día de la semana",
    pause_button: "Pausar",
    cancel_button: "Cancelar turno fijo",
    created_success: "Turno fijo creado.",
    cancelled_success: "Turno fijo cancelado.",
    paused_success: "Turno fijo pausado.",
    activated_success: "Turno fijo reactivado.",
  },

  // Caja
  cash_register: {
    title: "Caja diaria",
    total_label: "Total del día",
    payments_label: "Movimientos",
    pending_label: "Pendientes de cobro",
  },

  // PIN
  pin: {
    title: "Ingresá tu PIN de gestión",
    placeholder: "PIN de 4-6 dígitos",
    button: "Verificar",
    error: "PIN incorrecto.",
    locked: "PIN bloqueado por demasiados intentos. Esperá 5 minutos.",
    create_title: "Creá tu PIN de gestión",
    create_subtitle:
      "Este PIN protege los reportes, precios y configuración.",
    confirm_label: "Confirmá el PIN",
  },

  // Configuración
  settings: {
    title: "Configuración",
    deposit_section: "Señas",
    deposit_enabled_label: "¿Cobrás seña?",
    deposit_type_label: "Tipo de seña",
    deposit_type_percentage: "Porcentaje",
    deposit_type_fixed: "Monto fijo",
    deposit_value_label: "Valor",
    transfer_alias_label: "Alias para transferencias",
    transfer_cbu_label: "CBU para transferencias",
    cancellation_section: "Política de cancelación",
    cancellation_lose: "La seña se pierde",
    cancellation_refund: "Se devuelve si cancela con anticipación",
    cancellation_hours_label: "Horas de anticipación mínimas",
    mercadopago_section: "MercadoPago",
    mercadopago_connect: "Conectar MercadoPago",
    mercadopago_connected: "MercadoPago conectado ✅",
    mercadopago_disconnect: "Desconectar",
    saved_success: "Configuración guardada.",
  },

  // Suscripción
  subscription: {
    trial_banner: "Te quedan {days} días de prueba.",
    trial_expired: "Tu período de prueba terminó.",
    grace_banner: "Tu suscripción venció. Tenés {days} días para renovar.",
    blocked_banner:
      "Tu cuenta está bloqueada por falta de pago. Suscribite para seguir usando TurnoGol.",
    plan_cancha: "Plan CANCHA (1-3 canchas)",
    plan_complejo: "Plan COMPLEJO (4+ canchas)",
    subscribe_button: "Suscribirme",
  },

  // General
  general: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    close: "Cerrar",
    loading: "Cargando...",
    no_results: "No se encontraron resultados.",
    confirm_delete: "¿Estás seguro? Esta acción no se puede deshacer.",
    whatsapp_send: "Enviar por WhatsApp",
    price_label: "Precio",
    date_label: "Fecha",
    time_label: "Horario",
    court_label: "Cancha",
  },

  // Público
  public: {
    footer: "Gestionado con TurnoGol ⚽",
    bookings_disabled: "Reservas deshabilitadas temporalmente.",
    select_day: "Elegí un día",
    select_court: "Elegí cancha y horario",
    available: "Disponible",
    no_slots: "No hay horarios disponibles para este día.",
    book_button: "Reservar",
    booking_confirmed: "¡Reserva confirmada!",
    cancellation_policy_label: "Política de cancelación",
  },
} as const;
