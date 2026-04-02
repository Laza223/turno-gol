import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addDays, format, getDay } from "date-fns";
import { getCourtPrice } from "@/lib/utils/pricing";

export const dynamic = "force-dynamic";

/**
 * Obtener las siguientes N ocurrencias (4 x defecto) del dia de la semana `targetDayOfWeek`
 */
function getNextOccurrenceDates(targetDayOfWeek: number, weeksCount: number = 4): string[] {
   const dates: string[] = [];
   const today = new Date();
   const currentDay = getDay(today);

   let daysToAdd = targetDayOfWeek - currentDay;
   if (daysToAdd < 0) {
      daysToAdd += 7;
   }

   let pointerDate = addDays(today, daysToAdd);

   for (let i=0; i<weeksCount; i++) {
      dates.push(format(addDays(pointerDate, i * 7), "yyyy-MM-dd"));
   }

   return dates;
}

export async function GET(req: Request) {
  // Validate Vercel CRON_SECRET for security
  if (
    process.env.CRON_SECRET &&
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // Buscar todos los fixed slots activos
    const fixedSlots = await prisma.fixedSlot.findMany({
      where: { status: "active" },
      include: { court: true }
    });

    let generatedCount = 0;
    let collisionsCount = 0;

    for (const fs of fixedSlots) {
       // Buscamos llenar huecos de las proximas 4 semanas que esten descubiertos
       const targetDates = getNextOccurrenceDates(fs.dayOfWeek, 4);

       await prisma.$transaction(async (tx) => {
         for (const targetDate of targetDates) {
           // Chequear colision real
           const overlap = await tx.booking.findFirst({
              where: {
                 courtId: fs.courtId,
                 bookingDate: targetDate,
                 status: { notIn: ["cancelled", "no_show"] },
                 OR: [
                   { startTime: { lt: fs.endTime }, endTime: { gt: fs.startTime } }
                 ]
              }
           });

           if (!overlap) {
              const actualPrice = getCourtPrice(fs.court, targetDate);
              await tx.booking.create({
                 data: {
                    complexId: fs.complexId,
                    courtId: fs.courtId,
                    customerId: fs.customerId,
                    fixedSlotId: fs.id,
                    bookingDate: targetDate,
                    startTime: fs.startTime,
                    endTime: fs.endTime,
                    status: "confirmed",
                    source: "fixed",
                    price: actualPrice,
                    depositPaid: false,
                    isPaid: false
                 }
              });
              generatedCount++;
           } else {
              if (overlap.fixedSlotId !== fs.id) {
                 collisionsCount++;
              }
              // si era el mismo fs (ya existia la reserva), la idempotencia esta ok y saltea sin contar colision toxica.
           }
         }
       });
    }

    return NextResponse.json({
       success: true,
       fixedSlotsProcessed: fixedSlots.length,
       generatedCount,
       collisionsCount
    });
  } catch (error: any) {
    console.error("Error en CRON Turnos fijos:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
