"use client";

// Prisma models removed to avoid client mismatch
import { generateSlots } from "@/lib/utils/dates";
import { getCourtPrice } from "@/lib/utils/pricing";
import { formatARS } from "@/lib/utils/currency";
import Link from "next/link";
import { format } from "date-fns";

interface CourtListProps {
  courts: any[];
  bookings: any[];
  targetDate: string; // The selected day
  complex: {
    openTime: string;
    closeTime: string;
    slotStartMinute: number;
    slug: string;
  };
}

export function CourtList({ courts, bookings, targetDate, complex }: CourtListProps) {
  // Configuración de visualización (Ocultar turnos ya pasados del día actual)
  const isToday = targetDate === format(new Date(), "yyyy-MM-dd");
  const nowStr = format(new Date(), "HH:mm");

  return (
    <div className="space-y-8">
      {courts.length === 0 ? (
        <div className="text-center p-8 bg-white border border-gray-200 rounded-xl">
           <p className="text-gray-500">No hay canchas configuradas en este complejo.</p>
        </div>
      ) : (
        courts.map(court => {
           const slots = generateSlots(complex.openTime, complex.closeTime, complex.slotStartMinute);
           const price = getCourtPrice({ price: court.price, priceWeekend: court.priceWeekend }, targetDate);
           
           return (
             <div key={court.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
               <div className="bg-gray-100/50 p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-navy">{court.name}</h3>
                  <span className="bg-white border border-gray-200 px-3 py-1 rounded-full text-xs font-semibold text-gray-600">
                    Fútbol {court.playerCount}
                  </span>
               </div>
               
               <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                 {slots.map(slot => {
                   // Comprobación de si está ocupado/bloqueado o pasado
                   const isOccupied = bookings.some(b => 
                      b.courtId === court.id && 
                      // Simple overlap check since all slots are 1h blocks matching identically, equality is enough here 
                      (b.startTime === slot.startTime || (slot.startTime >= b.startTime && slot.startTime < b.endTime))
                   );

                   // Si el slot inició antes que la hora actual, en el día en curso, desactivar.
                   // Asume que a partir de las 18:00hs un slot de 17:00hs no tiene sentido público.
                   let isPast = false;
                   if (isToday) {
                     // Solo chequeamos "puros" porque cross-midnight se torna complejo, 
                     // Si openTime > slotStart y no cruzó. Hacemos chequeo lexicográfico básico
                     if (slot.startTime < nowStr) {
                         const closeCrossed = complex.closeTime < complex.openTime;
                         // Si la reserva dice 00:30 y ahora son 20:00 del mismo día... no debe dar "pasado" si el cruce pertenece a la trasnoche.
                         // Simplificación segura: comparar directo si no estamos en horario trasnoche (madrugada)
                         if (!closeCrossed || (slot.startTime > "06:00" && nowStr > "06:00")) {
                            isPast = true;
                         }
                     }
                   }

                   const disabled = isOccupied || isPast;

                   return (
                     <div 
                       key={slot.startTime} 
                       className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                         disabled 
                           ? "bg-gray-50 border-gray-100 opacity-70" 
                           : "bg-white border-gray-200 hover:border-green-300"
                       }`}
                     >
                       <div>
                         <p className="font-bold text-navy text-sm">{slot.startTime}</p>
                         <p className="text-xs font-medium text-gray-500">{formatARS(price)}</p>
                       </div>
                       
                       {disabled ? (
                         <span className="text-xs font-bold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-md uppercase tracking-wider">
                           {isPast && !isOccupied ? "Expirado" : "Ocupado"}
                         </span>
                       ) : (
                         <Link 
                           href={`/${complex.slug}/book?courtId=${court.id}&date=${targetDate}&time=${slot.startTime}`}
                           className="bg-green-primary hover:bg-green-dark text-white text-xs font-bold px-4 py-2 rounded-md shadow-sm transition-colors"
                         >
                           Reservar
                         </Link>
                       )}
                     </div>
                   );
                 })}
               </div>
             </div>
           );
        })
      )}
    </div>
  );
}
