import { redirect } from "next/navigation";
import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { parse, isValid } from "date-fns";
import { todayDateString, generateSlots } from "@/lib/utils/dates";
import type { GridCourtData, GridSlotData, BookingWithRelations } from "@/lib/types";
import { GridRealtimeWrapper } from "@/components/dashboard/grid/grid-realtime-wrapper";
import { Suspense } from "react";
import { Loader2 } from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const complex = await getAuthComplex();

  if (!complex || !complex.onboardingComplete) {
    redirect("/login");
  }

  // Validar fecha ingresada, si no, usar hoy
  let targetDate = searchParams.date ?? todayDateString();
  const parsedDate = parse(targetDate, "yyyy-MM-dd", new Date());
  if (!isValid(parsedDate)) {
    targetDate = todayDateString();
  }

  // Obtener todas las reservas (Bookings) activas del complejo para la fecha solicitada
  const bookings = await prisma.booking.findMany({
    where: {
      complexId: complex.id,
      bookingDate: targetDate,
      status: {
        notIn: ["cancelled", "no_show"],
      },
    },
    include: {
      court: {
        select: {
          id: true,
          name: true,
          playerCount: true,
          surface: true,
        },
      },
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          isBlocked: true,
          blockReason: true,
        },
      },
    },
  });

  // Extraer qué canchas tienen reservas hoy (aun si están inactivas, queremos mostrarlas)
  const courtIdsWithBookings = [...new Set(bookings.map((b) => b.courtId))];

  // Obtener las canchas: Las activas más las inactivas que tienen reservas vinculadas
  const courts = await prisma.court.findMany({
    where: {
      complexId: complex.id,
      OR: [
        { isActive: true },
        { id: { in: courtIdsWithBookings } },
      ],
    },
    orderBy: { sortOrder: "asc" },
  });

  // Generar la matriz base de horarios para el complejo
  const timeSlots = generateSlots(
    complex.openTime,
    complex.closeTime,
    complex.slotStartMinute
  );

  // Mapear los datos de las canchas con sus slots pre-entrelazados
  const gridData: GridCourtData[] = courts.map((court) => {
    const courtBookings = bookings.filter((b) => b.courtId === court.id);

    const slotsData: GridSlotData[] = timeSlots.map((ts) => {
      // Intentar encontrar una reserva que coincida exactamente con este slot
      // Nota: Si hay reservas que ocupan múltiples slots, aquí la lógica 
      // supone emparejamiento por start_time, según requerimientos.
      const slotBooking = courtBookings.find(
        (b) => b.startTime === ts.startTime
      ) as BookingWithRelations | undefined;

      return {
        startTime: ts.startTime,
        endTime: ts.endTime,
        booking: slotBooking ?? null,
      };
    });

    return {
      courtId: court.id,
      courtName: court.name,
      isActive: court.isActive,
      playerCount: court.playerCount,
      surface: court.surface,
      price: court.price,
      priceWeekend: court.priceWeekend,
      slots: slotsData,
    };
  });

  return (
    <div className="flex h-full flex-col">
      <Suspense
        fallback={
          <div className="flex flex-1 items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-green-primary" />
          </div>
        }
      >
        <GridRealtimeWrapper
          complexId={complex.id}
          bookingDate={targetDate}
          gridData={gridData}
          depositEnabled={complex.depositEnabled}
        />
      </Suspense>
    </div>
  );
}
