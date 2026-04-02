import { prisma } from "@/lib/prisma";
import { format, subDays, startOfMonth, startOfWeek, startOfDay, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type PeriodRaw = "today" | "week" | "month";

export class ReportService {
  
  static getPeriodDates(period: PeriodRaw) {
     const today = new Date();
     let startDate = new Date();
     
     if (period === "today") {
        startDate = startOfDay(today);
     } else if (period === "week") {
        startDate = startOfWeek(today, { weekStartsOn: 1 }); // Lunes
     } else if (period === "month") {
        startDate = startOfMonth(today);
     }

     // Prisma requires dates in YYYY-MM-DD string for bookingDate
     const formatStr = "yyyy-MM-dd";
     return {
        startDateObj: startDate,
        startStr: format(startDate, formatStr),
        endStr: format(today, formatStr)
     };
  }

  /**
   * FACTURACIÓN
   */
  static async getBillingStats(complexId: string, period: PeriodRaw) {
    const { startStr, endStr, startDateObj } = this.getPeriodDates(period);

    // Get strictly paid bookings or bookings with deposit paid in timeframe
    // Or we can just get all payments made in this date range.
    // That is exact billing!
    const payments = await prisma.payment.findMany({
       where: {
          complexId,
          paymentDate: { gte: startStr, lte: endStr }
       },
       include: {
          booking: { include: { court: true } }
       }
    });

    const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

    // Group by day for Chart
    const dailyMap: Record<string, number> = {};
    const methodMap: Record<string, number> = {};
    const courtMap: Record<string, { total: number, percentage: number, name: string }> = {};

    payments.forEach(p => {
       // Daily Map
       const day = p.paymentDate; // "2025-06-14"
       dailyMap[day] = (dailyMap[day] || 0) + p.amount;

       // Method Map
       methodMap[p.paymentMethod] = (methodMap[p.paymentMethod] || 0) + p.amount;

       // Court Map (If payment is tied to a booking)
       if (p.booking?.court) {
          const courtId = p.booking.court.id;
          if (!courtMap[courtId]) {
             courtMap[courtId] = { total: 0, percentage: 0, name: p.booking.court.name };
          }
          courtMap[courtId].total += p.amount;
       }
    });

    // Translate Daily Map to Chart format
    const chartData = Object.entries(dailyMap).map(([date, total]) => ({
       date: format(parseISO(date), "dd MMM", { locale: es }), 
       total 
    })).sort((a, b) => a.date.localeCompare(b.date)); // Very simple sorting, ideal is real date sort

    // Translate Court Map
    Object.values(courtMap).forEach(c => {
       c.percentage = totalRevenue > 0 ? (c.total / totalRevenue) * 100 : 0;
    });
    
    return {
       totalRevenue,
       chartData,
       methodBreakdown: Object.entries(methodMap).map(([method, amount]) => ({ method, amount })),
       courtBreakdown: Object.values(courtMap).sort((a,b) => b.total - a.total)
    };
  }

  /**
   * OCUPACIÓN
   */
  static async getOccupancyStats(complexId: string, period: PeriodRaw) {
     const { startStr, endStr } = this.getPeriodDates(period);

     // Get Confirmed/Completed bookings to calculate occupancy
     const bookings = await prisma.booking.findMany({
        where: {
           complexId,
           bookingDate: { gte: startStr, lte: endStr },
           status: { in: ["confirmed", "completed"] }
        },
        include: { court: true }
     });

     const courts = await prisma.court.findMany({ where: { complexId, isActive: true } });
     const complex = await prisma.complex.findUnique({ where: { id: complexId } });

     // Theoretical capacity logic:
     // Roughly slots between openTime and closeTime * courts * days in period
     // For simplicity, let's calculate days elapsed in period:
     const daysElapsed = Math.max(1, (new Date().getTime() - parseISO(startStr).getTime()) / (1000 * 3600 * 24));
     const totalCourts = courts.length;
     
     // Approx 10 hours a day as default if parse fails
     let openHoursPerDay = 10; 
     if (complex && complex.openTime && complex.closeTime) {
        const oh = parseInt(((complex.openTime || "14:00").split(":")[0]) || "0");
        const ch = parseInt(((complex.closeTime || "00:00").split(":")[0]) || "0");
        // handle next day close (like 00:00 or 02:00)
        openHoursPerDay = ch > oh ? ch - oh : (24 - oh) + ch;
     }
     if (openHoursPerDay === 0) openHoursPerDay = 10;

     const theoreticalTotalSlots = Math.max(1, Math.floor(daysElapsed) * openHoursPerDay * totalCourts);
     const playedSlots = bookings.length; // We assume 1 booking = 1 slot (1 hr)

     const overallOccupancy = (playedSlots / theoreticalTotalSlots) * 100;

     // Day of week Occ map
     const dayOfWeekMap: Record<string, number> = {};
     // Slot heat map
     const timeHeatMap: Record<string, number> = {};
     // Court specific
     const courtMap: Record<string, { total: number, name: string }> = {};

     bookings.forEach(b => {
        const d = parseISO(b.bookingDate);
        const dow = format(d, "EEEE", { locale: es }); // lunes, martes...
        dayOfWeekMap[dow] = (dayOfWeekMap[dow] || 0) + 1;

        timeHeatMap[b.startTime] = (timeHeatMap[b.startTime] || 0) + 1;

        const courtId = b.court.id;
        if (!courtMap[courtId]) courtMap[courtId] = { total: 0, name: b.court.name };
        courtMap[courtId].total += 1;
     });

     // Top / Bottom slots
     const timeEntries = Object.entries(timeHeatMap).sort((a,b) => b[1] - a[1]);
     const topSlots = timeEntries.slice(0, 5).map(e => ({ time: e[0], count: e[1] }));
     const bottomSlots = timeEntries.slice(-5).reverse().map(e => ({ time: e[0], count: e[1] }));

     return {
        overallOccupancy: Math.min(100, overallOccupancy), // Cap at 100
        chartData: Object.entries(dayOfWeekMap).map(([day, count]) => ({ day, count })),
        courtBreakdown: Object.values(courtMap).sort((a,b) => b.total - a.total),
        topSlots,
        bottomSlots
     };
  }

  /**
   * OPERATIVO
   */
  static async getOperationalStats(complexId: string, period: PeriodRaw) {
     const { startStr, endStr } = this.getPeriodDates(period);

     // All bookings in period
     const bookings = await prisma.booking.findMany({
        where: { complexId, bookingDate: { gte: startStr, lte: endStr } }
     });

     const totalBookings = bookings.length;
     const cancellations = bookings.filter(b => b.status === "cancelled").length;
     const noShows = bookings.filter(b => b.status === "no_show").length;
     
     const pendingDepositsList = bookings.filter(b => !b.depositPaid && b.status === "confirmed");
     const pendingDepositsAmount = pendingDepositsList.reduce((sum, b) => sum + (b.depositAmount || 0), 0);

     const fixedSlotsActive = await prisma.fixedSlot.count({
        where: { complexId, status: "active" }
     });

     return {
        totalBookings,
        cancellationRate: totalBookings > 0 ? (cancellations / totalBookings) * 100 : 0,
        cancellationsCount: cancellations,
        noShowRate: totalBookings > 0 ? (noShows / totalBookings) * 100 : 0,
        noShowsCount: noShows,
        pendingDepositsCount: pendingDepositsList.length,
        pendingDepositsAmount,
        fixedSlotsActive
     };
  }
}
