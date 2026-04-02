import { prisma } from "@/lib/prisma";
import { getAuthComplex } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FixedSlotsView } from "@/components/dashboard/fixed-slots/fixed-slots-view";

export default async function FixedSlotsPage() {
  const complex = await getAuthComplex();
  if (!complex) redirect("/login");

  const [dbComplex, fixedSlots, courts] = await Promise.all([
     prisma.complex.findUnique({ where: { id: complex.id } }),
     prisma.fixedSlot.findMany({
        where: { complexId: complex.id },
        include: { court: true, customer: true, bookings: {
           where: { status: "confirmed", isPaid: false },
           orderBy: { bookingDate: "asc" }
        }},
        orderBy: [
           { status: "asc" },
           { dayOfWeek: "asc" }
        ]
     }),
     prisma.court.findMany({ where: { complexId: complex.id, isActive: true }})
  ]);

  if (!dbComplex) redirect("/");

  return (
     <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Turnos Fijos</h1>
            <p className="text-gray-500 text-sm mt-1">Acuerdos semanales reservados automáticamente.</p>
          </div>
        </div>

        <FixedSlotsView 
           initialSlots={fixedSlots as any} 
           courts={courts as any}
           complex={{
              id: dbComplex.id,
              openTime: dbComplex.openTime,
              closeTime: dbComplex.closeTime,
              slotStartMinute: dbComplex.slotStartMinute,
           }} 
        />
     </div>
  );
}
