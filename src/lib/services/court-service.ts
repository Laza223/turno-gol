import { prisma } from "@/lib/prisma";

export class CourtService {
  /**
   * Crear nueva cancha (mismos campos que Onboarding)
   */
  static async createCourt(complexId: string, data: any) {
     const count = await prisma.court.count({ where: { complexId } });
     return await prisma.court.create({
       data: {
         complexId,
         name: data.name,
         playerCount: data.playerCount,
         surface: data.surface,
         isRoofed: data.isRoofed,
         price: data.price,
         priceWeekend: data.priceWeekend,
         sortOrder: count + 1,
       }
     });
  }

  /**
   * Editar cancha existente
   */
  static async updateCourt(complexId: string, courtId: string, data: any) {
     const existing = await prisma.court.findUnique({ where: { id: courtId } });
     if (!existing || existing.complexId !== complexId) {
        throw new Error("Cancha no encontrada");
     }

     return await prisma.court.update({
        where: { id: courtId },
        data: {
           name: data.name,
           playerCount: data.playerCount,
           surface: data.surface,
           isRoofed: data.isRoofed,
           price: data.price,
           priceWeekend: data.priceWeekend,
        }
     });
  }

  /**
   * Activar / Desactivar cancha
   */
  static async toggleActive(complexId: string, courtId: string, isActive: boolean) {
     const existing = await prisma.court.findUnique({ where: { id: courtId } });
     if (!existing || existing.complexId !== complexId) {
        throw new Error("Cancha no encontrada");
     }

     // Si se pide desactivar, verificar si hay turnos fijos activos enganchados
     if (isActive === false) {
        const fixedSlots = await prisma.fixedSlot.count({
           where: {
              courtId,
              status: { in: ["active", "paused"] }
           }
        });

        if (fixedSlots > 0) {
           throw new Error("Esta cancha tiene turnos fijos activos. Pausalos o cancelalos primero.");
        }
     }

     return await prisma.court.update({
        where: { id: courtId },
        data: { isActive }
     });
  }
}
