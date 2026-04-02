import { prisma } from "@/lib/prisma";

export class CustomerService {
  /**
   * Obtener detalle completo del cliente + ultimas 10 reservas
   */
  static async getCustomerDetail(complexId: string, customerId: string) {
     const customer = await prisma.customer.findUnique({
        where: { id: customerId },
     });

     if (!customer || customer.complexId !== complexId) {
        throw new Error("Cliente no encontrado o sin permisos.");
     }

     const recentBookings = await prisma.booking.findMany({
        where: { customerId, complexId },
        orderBy: [{ bookingDate: 'desc' }, { startTime: 'desc' }],
        take: 10,
        include: { court: true }
     });

     return { customer, recentBookings };
  }

  /**
   * Bloquear cliente
   */
  static async blockCustomer(complexId: string, customerId: string, reason: string) {
     const customer = await prisma.customer.findUnique({ where: { id: customerId } });
     if (!customer || customer.complexId !== complexId) throw new Error("Cliente no encontrado");

     return await prisma.customer.update({
        where: { id: customerId },
        data: {
           isBlocked: true,
           blockReason: reason
        }
     });
  }

  /**
   * Desbloquear cliente
   */
  static async unblockCustomer(complexId: string, customerId: string) {
     const customer = await prisma.customer.findUnique({ where: { id: customerId } });
     if (!customer || customer.complexId !== complexId) throw new Error("Cliente no encontrado");

     return await prisma.customer.update({
        where: { id: customerId },
        data: {
           isBlocked: false,
           blockReason: null
        }
     });
  }
}
