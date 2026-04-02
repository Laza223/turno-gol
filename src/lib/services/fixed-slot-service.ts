import { prisma } from "@/lib/prisma";
import { addDays, format, parse, startOfWeek, getDay } from "date-fns";
import { getCourtPrice } from "@/lib/utils/pricing";

interface CreateFixedSlotInput {
  courtId: string;
  customerName: string;
  customerPhone: string;
  dayOfWeek: number; // 0=sun, 1=mon, ..., 6=sat
  startTime: string;
  endTime: string;
}

export class FixedSlotService {
  /**
   * Obtener las siguientes N fechas que correspondan al `targetDayOfWeek`.
   */
  private static getNextOccurrenceDates(targetDayOfWeek: number, weeksCount: number = 4): string[] {
     const dates: string[] = [];
     const today = new Date();
     const currentDay = getDay(today);

     let daysToAdd = targetDayOfWeek - currentDay;
     if (daysToAdd < 0) {
        daysToAdd += 7; // Next occurrence
     }

     let pointerDate = addDays(today, daysToAdd);

     for (let i=0; i<weeksCount; i++) {
        dates.push(format(addDays(pointerDate, i * 7), "yyyy-MM-dd"));
     }

     return dates;
  }

  /**
   * Crear Turno Fijo y emitir reservas proyectadas iniciales
   */
  static async createFixedSlot(complexId: string, input: CreateFixedSlotInput) {
     // 1. Validar que la cancha no tenga ya un Fijo activo en ese dia/hora
     const existingFixed = await prisma.fixedSlot.findFirst({
        where: {
           courtId: input.courtId,
           dayOfWeek: input.dayOfWeek,
           status: { in: ["active", "paused"] },
           OR: [
             {
               startTime: { lt: input.endTime },
               endTime: { gt: input.startTime },
             }
           ]
        }
     });

     if (existingFixed) {
        throw new Error("Ya existe un turno fijo activo en este horario para este día.");
     }

     // Normalizar Phone y buscar/crear customer
     const normalizedPhone = input.customerPhone.replace(/\D/g, "");
     let customer = await prisma.customer.findFirst({
       where: { complexId, phone: { contains: normalizedPhone } }
     });

     return await prisma.$transaction(async (tx) => {
        if (!customer) {
           customer = await tx.customer.create({
             data: {
                complexId,
                name: input.customerName,
                phone: input.customerPhone,
             }
           });
        }

        // Crear configuración de Fijo
        const fixedSlot = await tx.fixedSlot.create({
          data: {
             complexId,
             courtId: input.courtId,
             customerId: customer.id,
             dayOfWeek: input.dayOfWeek,
             startTime: input.startTime,
             endTime: input.endTime,
             status: "active"
          },
          include: { court: true, customer: true }
        });

        const getBasePrice = getCourtPrice({ 
           price: fixedSlot.court.price, 
           priceWeekend: fixedSlot.court.priceWeekend 
        }, "2000-01-01"); // PriceWeekend needs a datestr, but fixed slots prices might vary correctly per date generated.

        // 2. Generar próxima cuota (4 semanas)
        const targetDates = this.getNextOccurrenceDates(input.dayOfWeek, 4);
        let countGenerated = 0;

        for (const dateStr of targetDates) {
           // Chequear colisiones individuales
           const overlap = await tx.booking.findFirst({
             where: {
                courtId: input.courtId,
                bookingDate: dateStr,
                status: { notIn: ["cancelled", "no_show"] },
                OR: [
                  { startTime: { lt: input.endTime }, endTime: { gt: input.startTime } }
                ]
             }
           });

           if (!overlap) {
              const actualPriceForDate = getCourtPrice(fixedSlot.court, dateStr);
              await tx.booking.create({
                 data: {
                    complexId,
                    courtId: input.courtId,
                    customerId: customer.id,
                    fixedSlotId: fixedSlot.id,
                    bookingDate: dateStr,
                    startTime: input.startTime,
                    endTime: input.endTime,
                    status: "confirmed",
                    source: "fixed",
                    price: actualPriceForDate,
                    depositPaid: false,
                    isPaid: false
                 }
              });
              countGenerated++;
           }
        }

        await tx.activityLog.create({
          data: {
             complexId,
             action: "fixed_slot_created",
             entityType: "fixed_slot",
             entityId: fixedSlot.id,
             details: { description: `Turno Fijo creado, ${countGenerated} semanas agendadas` }
          }
        });

        return { fixedSlot, countGenerated };
     });
  }

  /**
   * Pausar el fijo
   */
  static async pauseStatus(complexId: string, fixedSlotId: string) {
     return await prisma.fixedSlot.update({
        where: { id: fixedSlotId, complexId },
        data: { status: "paused" }
     });
  }

  /**
   * Reactivar el fijo (Generar lo que falte de acá a las proxs semanas)
   */
  static async reactivateStatus(complexId: string, fixedSlotId: string) {
     const fs = await prisma.fixedSlot.findUnique({
        where: { id: fixedSlotId },
        include: { court: true }
     });
     if (!fs || fs.complexId !== complexId) throw new Error("Fijo no encontrado");

     return await prisma.$transaction(async (tx) => {
        const updated = await tx.fixedSlot.update({
           where: { id: fixedSlotId },
           data: { status: "active" }
        });

        // Intentar llenar la proxima semana
        const dateTarget = this.getNextOccurrenceDates(fs.dayOfWeek, 1)[0];
        const overlap = await tx.booking.findFirst({
           where: {
              courtId: fs.courtId,
              bookingDate: dateTarget,
              status: { notIn: ["cancelled", "no_show"] },
              OR: [{ startTime: { lt: fs.endTime }, endTime: { gt: fs.startTime } }]
           }
        });

        if (!overlap) {
            await tx.booking.create({
                data: {
                   complexId,
                   courtId: fs.courtId,
                   customerId: fs.customerId,
                   fixedSlotId: fs.id,
                   bookingDate: dateTarget,
                   startTime: fs.startTime,
                   endTime: fs.endTime,
                   status: "confirmed",
                   source: "fixed",
                   price: getCourtPrice(fs.court, dateTarget),
                   depositPaid: false,
                   isPaid: false
                }
             });
        }
        return updated;
     });
  }

  /**
   * Cancelar un fixed slot y las reservas a futuro
   */
  static async cancelFixedSlot(complexId: string, fixedSlotId: string) {
     return await prisma.$transaction(async (tx) => {
        const fs = await tx.fixedSlot.update({
           where: { id: fixedSlotId, complexId },
           data: { status: "cancelled" }
        });

        // Borrar el vinculo future. El blueprint: "Cancelar def => status cancelled, cancelar todas las reservas futuras"
        // Fechas a futuro: strings alfanumericos.
        const todayStr = format(new Date(), "yyyy-MM-dd");

        await tx.booking.updateMany({
           where: {
              fixedSlotId,
              complexId,
              bookingDate: { gte: todayStr },
              status: "confirmed",
              isPaid: false
           },
           data: {
              status: "cancelled",
              cancelledAt: new Date()
           }
        });

        await tx.activityLog.create({
           data: {
              complexId,
              action: "fixed_slot_cancelled",
              entityType: "fixed_slot",
              entityId: fixedSlotId,
              details: { description: "Turno fijo cancelado definitivamente." }
           }
        });

        return fs;
     });
  }
}
