import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hash } from "bcryptjs";
import { format, addDays, nextTuesday, nextThursday, nextSaturday } from "date-fns";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

// ==========================================
// Helpers
// ==========================================

function dateStr(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

// ==========================================
// Datos
// ==========================================

const CUSTOMER_DATA = [
  { name: "Juan Pérez", phone: "1134567890" },
  { name: "Martín González", phone: "1145678901" },
  { name: "Carlos López", phone: "1156789012" },
  { name: "Diego Fernández", phone: "1167890123" },
  { name: "Lucas Rodríguez", phone: "1178901234" },
  { name: "Nicolás García", phone: "1189012345" },
  { name: "Facundo Martínez", phone: "1190123456" },
  { name: "Santiago Romero", phone: "1112345678" },
  { name: "Tomás Álvarez", phone: "1123456789" },
  { name: "Matías Díaz", phone: "1198765432" },
];

const SLOT_TIMES = [
  { start: "14:00", end: "15:00" },
  { start: "15:00", end: "16:00" },
  { start: "16:00", end: "17:00" },
  { start: "17:00", end: "18:00" },
  { start: "18:00", end: "19:00" },
  { start: "19:00", end: "20:00" },
  { start: "20:00", end: "21:00" },
  { start: "21:00", end: "22:00" },
  { start: "22:00", end: "23:00" },
  { start: "23:00", end: "00:00" },
  { start: "00:00", end: "01:00" },
];

// ==========================================
// Seed
// ==========================================

async function main() {
  console.log("🌱 Seeding database...");

  // Limpiar en orden inverso por FK
  await prisma.activityLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.fixedSlot.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.court.deleteMany();
  await prisma.complex.deleteMany();

  console.log("🧹 Cleaned existing data");

  // ------------------------------------------
  // 1. Complejo
  // ------------------------------------------
  const pinHash = await hash("1234", 10);
  const trialEndsAt = addDays(new Date(), 14);

  const complex = await prisma.complex.create({
    data: {
      email: "elgol@test.com",
      name: "Complejo El Gol",
      slug: "el-gol",
      phone: "1155551234",
      address: "Av. Rivadavia 4500, CABA",
      city: "Buenos Aires",
      province: "Buenos Aires",
      openTime: "14:00",
      closeTime: "01:00",
      slotStartMinute: 0,
      maxAdvanceDays: 7,
      depositEnabled: true,
      depositType: "percentage",
      depositValue: 30,
      transferAlias: "elgol.futbol",
      transferCbu: "0000003100000000001234",
      cancellationPolicy: "lose",
      mpConnected: false,
      pinHash,
      subscriptionPlan: "trial",
      subscriptionStatus: "active",
      trialEndsAt,
      onboardingStep: 7,
      onboardingComplete: true,
      waTemplateConfirmation:
        "¡Hola {nombre}! 👋\n\nTu turno en *{complejo}* está confirmado:\n\n📅 {fecha}\n⏰ {hora}\n⚽ {cancha}\n💰 {precio}\n\n¡Te esperamos!",
      waTemplateDeposit:
        "¡Hola {nombre}! 👋\n\nPara confirmar tu turno en *{complejo}* necesitamos la seña de *{seña}*.\n\n📅 {fecha}\n⏰ {hora}\n⚽ {cancha}\n\nPodés transferir a:\n🏦 Alias: {alias}\n🔢 CBU: {cbu}\n\n¡Gracias!",
      waTemplateReminder:
        "¡Hola {nombre}! 👋\n\nTe recordamos que tenés turno hoy en *{complejo}*:\n\n⏰ {hora}\n⚽ {cancha}\n\n¡Te esperamos! ⚽",
      waTemplateCancellation:
        "Hola {nombre},\n\nTu turno en *{complejo}* fue cancelado:\n\n📅 {fecha}\n⏰ {hora}\n⚽ {cancha}\n\nSi tenés alguna consulta, contactanos. ¡Saludos!",
    },
  });

  console.log(`✅ Complex: ${complex.name} (${complex.slug})`);

  // ------------------------------------------
  // 2. Canchas
  // ------------------------------------------
  const court1 = await prisma.court.create({
    data: {
      complexId: complex.id,
      name: "Cancha 1",
      playerCount: 5,
      surface: "sintetico",
      isRoofed: true,
      price: 25000,
      priceWeekend: 32000,
      sortOrder: 1,
    },
  });

  const court2 = await prisma.court.create({
    data: {
      complexId: complex.id,
      name: "Cancha 2",
      playerCount: 5,
      surface: "sintetico",
      isRoofed: false,
      price: 22000,
      priceWeekend: 28000,
      sortOrder: 2,
    },
  });

  const court3 = await prisma.court.create({
    data: {
      complexId: complex.id,
      name: "Cancha 3",
      playerCount: 7,
      surface: "natural",
      isRoofed: false,
      price: 35000,
      sortOrder: 3,
    },
  });

  const courts = [court1, court2, court3];
  console.log(`✅ Courts: ${courts.map((c) => c.name).join(", ")}`);

  // ------------------------------------------
  // 3. Clientes
  // ------------------------------------------
  const customers = [];
  for (const data of CUSTOMER_DATA) {
    const customer = await prisma.customer.create({
      data: {
        complexId: complex.id,
        name: data.name,
        phone: data.phone,
      },
    });
    customers.push(customer);
  }

  // Bloquear al último cliente
  const blockedCustomer = customers[9]!;
  await prisma.customer.update({
    where: { id: blockedCustomer.id },
    data: {
      isBlocked: true,
      blockReason: "No se presentó 3 veces seguidas",
    },
  });

  console.log(
    `✅ Customers: ${customers.length} (1 bloqueado: ${blockedCustomer.name})`
  );

  // ------------------------------------------
  // 4. Turnos fijos
  // ------------------------------------------
  const today = new Date();

  const fixedSlot1 = await prisma.fixedSlot.create({
    data: {
      complexId: complex.id,
      courtId: court1.id,
      customerId: customers[0]!.id,
      dayOfWeek: 2, // martes
      startTime: "21:00",
      endTime: "22:00",
      status: "active",
    },
  });

  const fixedSlot2 = await prisma.fixedSlot.create({
    data: {
      complexId: complex.id,
      courtId: court2.id,
      customerId: customers[1]!.id,
      dayOfWeek: 4, // jueves
      startTime: "20:00",
      endTime: "21:00",
      status: "active",
    },
  });

  const fixedSlot3 = await prisma.fixedSlot.create({
    data: {
      complexId: complex.id,
      courtId: court1.id,
      customerId: customers[2]!.id,
      dayOfWeek: 6, // sábado
      startTime: "18:00",
      endTime: "19:00",
      status: "active",
    },
  });

  console.log("✅ Fixed slots: 3 (mar 21:00, jue 20:00, sáb 18:00)");

  // ------------------------------------------
  // 5. Reservas
  // ------------------------------------------

  // Fechas para la semana actual
  const weekDates = Array.from({ length: 7 }, (_, i) =>
    dateStr(addDays(today, i))
  );

  // --- 10 confirmed (5 con seña, 5 sin seña) ---
  const confirmedBookings = [];
  for (let i = 0; i < 10; i++) {
    const court = courts[i % 3]!;
    const customer = customers[i]!;
    const date = weekDates[i % 7]!;
    const slot = SLOT_TIMES[i % SLOT_TIMES.length]!;
    const price = court.price;
    const depositPaid = i < 5;
    const depositAmount = depositPaid ? Math.round(price * 0.3) : null;

    const booking = await prisma.booking.create({
      data: {
        complexId: complex.id,
        courtId: court.id,
        customerId: customer.id,
        bookingDate: date,
        startTime: slot.start,
        endTime: slot.end,
        status: "confirmed",
        source: "manual",
        price,
        depositAmount,
        depositPaid,
      },
    });

    confirmedBookings.push(booking);
  }

  console.log(
    `✅ Confirmed bookings: 10 (5 con seña, 5 sin seña)`
  );

  // --- 5 completed (con pago) ---
  const completedBookings = [];
  for (let i = 0; i < 5; i++) {
    const court = courts[i % 3]!;
    const customer = customers[i]!;
    const date = weekDates[0]!; // hoy
    const slotIndex = 5 + i; // horarios de la tarde-noche
    const slot = SLOT_TIMES[slotIndex % SLOT_TIMES.length]!;
    const price = court.price;
    const paymentMethods = [
      "cash",
      "transfer",
      "mercadopago",
      "debit",
      "credit",
    ] as const;

    const booking = await prisma.booking.create({
      data: {
        complexId: complex.id,
        courtId: court.id,
        customerId: customer.id,
        bookingDate: date,
        startTime: slot.start,
        endTime: slot.end,
        status: "completed",
        source: "manual",
        price,
        isPaid: true,
        paymentMethod: paymentMethods[i],
        completedAt: new Date(),
      },
    });

    completedBookings.push(booking);
  }

  console.log("✅ Completed bookings: 5");

  // --- 3 de turno fijo ---
  const tuesdayDate = dateStr(nextTuesday(today));
  const thursdayDate = dateStr(nextThursday(today));
  const saturdayDate = dateStr(nextSaturday(today));

  const fixedBooking1 = await prisma.booking.create({
    data: {
      complexId: complex.id,
      courtId: court1.id,
      customerId: customers[0]!.id,
      bookingDate: tuesdayDate,
      startTime: "21:00",
      endTime: "22:00",
      status: "confirmed",
      source: "fixed",
      price: court1.price,
      fixedSlotId: fixedSlot1.id,
    },
  });

  const fixedBooking2 = await prisma.booking.create({
    data: {
      complexId: complex.id,
      courtId: court2.id,
      customerId: customers[1]!.id,
      bookingDate: thursdayDate,
      startTime: "20:00",
      endTime: "21:00",
      status: "confirmed",
      source: "fixed",
      price: court2.price,
      fixedSlotId: fixedSlot2.id,
    },
  });

  const fixedBooking3 = await prisma.booking.create({
    data: {
      complexId: complex.id,
      courtId: court1.id,
      customerId: customers[2]!.id,
      bookingDate: saturdayDate,
      startTime: "18:00",
      endTime: "19:00",
      status: "confirmed",
      source: "fixed",
      price: court1.priceWeekend ?? court1.price,
      fixedSlotId: fixedSlot3.id,
    },
  });

  console.log(
    `✅ Fixed bookings: 3 (mar ${tuesdayDate}, jue ${thursdayDate}, sáb ${saturdayDate})`
  );

  // --- 2 blocked ---
  await prisma.booking.create({
    data: {
      complexId: complex.id,
      courtId: court1.id,
      bookingDate: weekDates[2]!,
      startTime: "16:00",
      endTime: "17:00",
      status: "blocked",
      source: "manual",
      price: 0,
      blockNote: "Mantenimiento del piso",
    },
  });

  await prisma.booking.create({
    data: {
      complexId: complex.id,
      courtId: court3.id,
      bookingDate: weekDates[3]!,
      startTime: "15:00",
      endTime: "16:00",
      status: "blocked",
      source: "manual",
      price: 0,
      blockNote: "Lluvia - cancha inundada",
    },
  });

  console.log("✅ Blocked slots: 2");

  // ------------------------------------------
  // 6. Pagos
  // ------------------------------------------

  // Pagos de reservas completadas (5)
  for (const booking of completedBookings) {
    await prisma.payment.create({
      data: {
        complexId: complex.id,
        bookingId: booking.id,
        customerId: booking.customerId,
        type: "booking_payment",
        amount: booking.price,
        paymentMethod: booking.paymentMethod ?? "cash",
        paymentDate: booking.bookingDate,
        paymentTime: booking.startTime,
        description: `Pago turno ${booking.startTime}`,
      },
    });
  }

  // Pagos de señas (5 reservas señadas)
  for (let i = 0; i < 5; i++) {
    const booking = confirmedBookings[i]!;
    const depositAmount = booking.depositAmount ?? Math.round(booking.price * 0.3);
    const methods = ["transfer", "mercadopago", "cash", "transfer", "mercadopago"] as const;

    await prisma.payment.create({
      data: {
        complexId: complex.id,
        bookingId: booking.id,
        customerId: booking.customerId,
        type: "deposit",
        amount: depositAmount,
        paymentMethod: methods[i]!,
        paymentDate: booking.bookingDate,
        paymentTime: "12:00",
        description: `Seña turno ${booking.startTime}`,
      },
    });
  }

  console.log("✅ Payments: 10 (5 pagos completos + 5 señas)");

  // ------------------------------------------
  // 7. Actualizar stats de clientes
  // ------------------------------------------
  for (let i = 0; i < 8; i++) {
    const customer = customers[i]!;
    const bookingCount = await prisma.booking.count({
      where: {
        customerId: customer.id,
        status: { notIn: ["cancelled", "blocked"] },
      },
    });

    await prisma.customer.update({
      where: { id: customer.id },
      data: {
        totalBookings: bookingCount,
        lastBookingDate: weekDates[0],
      },
    });
  }

  console.log("✅ Customer stats updated");
  console.log("");
  console.log("🎉 Seed complete!");
  console.log(`   Complex: ${complex.name} (${complex.email})`);
  console.log(`   Courts: ${courts.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Bookings: 20`);
  console.log(`   Fixed Slots: 3`);
  console.log(`   Payments: 10`);
  console.log(`   PIN: 1234`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
