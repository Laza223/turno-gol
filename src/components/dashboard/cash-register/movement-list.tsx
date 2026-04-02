"use client";

import { useEffect, useState } from "react";
import { getDailyMovementsAction } from "@/actions/cash-register-actions";
import { formatARS } from "@/lib/utils/currency";
import { CheckCircle2, ArrowRightLeft, CreditCard, Banknote, HelpCircle, Loader2 } from "lucide-react";
import { BookingDetailSheet } from "@/components/dashboard/bookings/booking-detail-sheet";

interface MovementListProps {
  date: string;
}

const ICONS: any = {
  cash: <Banknote className="w-4 h-4 text-green-600" />,
  transfer: <ArrowRightLeft className="w-4 h-4 text-blue-600" />,
  mercadopago: <CheckCircle2 className="w-4 h-4 text-sky-600" />,
  debit: <CreditCard className="w-4 h-4 text-purple-600" />,
  credit: <CreditCard className="w-4 h-4 text-purple-600" />,
};

const LABELS: any = {
  deposit: "Seña Inicial",
  booking_payment: "Pago Turno",
  refund: "Reembolso"
};

export function MovementList({ date }: MovementListProps) {
  const [movements, setMovements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

  useEffect(() => {
     let isMounted = true;
     setIsLoading(true);

     getDailyMovementsAction(date).then(res => {
        if (!isMounted) return;
        if (res.success) {
           setMovements(res.data);
        }
        setIsLoading(false);
     });

     return () => {
        isMounted = false;
     };
  }, [date]);

  if (isLoading) {
     return (
       <div className="bg-white border border-gray-200 rounded-xl p-12 text-center flex flex-col items-center">
         <Loader2 className="w-8 h-8 text-gray-300 animate-spin mb-4" />
         <span className="text-gray-500 font-medium">Desencriptando movimientos...</span>
       </div>
     );
  }

  if (movements.length === 0) {
     return (
       <div className="bg-gray-50 border border-gray-100 rounded-xl p-12 text-center flex flex-col items-center">
         <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
            <Banknote className="w-6 h-6 text-gray-400" />
         </div>
         <span className="text-gray-500 font-medium">Bóveda vacía. No hubo movimientos este día.</span>
       </div>
     );
  }

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
             <thead>
               <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                 <th className="p-4 font-semibold w-24">Hora</th>
                 <th className="p-4 font-semibold">Tipo</th>
                 <th className="p-4 font-semibold">Cliente</th>
                 <th className="p-4 font-semibold w-32">Monto</th>
                 <th className="p-4 font-semibold w-32 border-l border-gray-100 hidden sm:table-cell">Medio</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-gray-100">
               {movements.map(m => (
                  <tr 
                     key={m.id} 
                     className="hover:bg-gray-50 cursor-pointer transition-colors"
                     onClick={() => m.bookingId && setSelectedBookingId(m.bookingId)}
                  >
                     <td className="p-4 text-gray-500 font-medium">{m.paymentTime}</td>
                     <td className="p-4">
                        <span className="font-semibold text-navy">{LABELS[m.type] || m.type}</span>
                        {m.booking && (
                           <p className="text-[10px] text-gray-400 mt-0.5">Ref: {m.booking.court.name} a las {m.booking.startTime}</p>
                        )}
                     </td>
                     <td className="p-4">
                        {m.customer ? (
                           <>
                              <p className="font-semibold text-navy truncate max-w-[150px]">{m.customer.name}</p>
                              <p className="text-xs text-gray-400">{m.customer.phone}</p>
                           </>
                        ) : (
                           <span className="italic text-gray-400">Genérico</span>
                        )}
                     </td>
                     <td className="p-4 font-bold text-green-primary text-base">
                        {formatARS(m.amount)}
                     </td>
                     <td className="p-4 border-l border-gray-100 hidden sm:table-cell">
                        <div className="flex items-center gap-2">
                           <div className="bg-gray-100 p-1.5 rounded">
                              {ICONS[m.paymentMethod] || <HelpCircle className="w-4 h-4 text-gray-400"/>}
                           </div>
                           <span className="text-xs font-semibold uppercase text-gray-500">{m.paymentMethod}</span>
                        </div>
                     </td>
                  </tr>
               ))}
             </tbody>
          </table>
        </div>
      </div>

      {selectedBookingId && (
         <BookingDetailSheet 
            booking={ { id: selectedBookingId } as any } 
            onClose={() => setSelectedBookingId(null)} 
         />
      )}
    </>
  );
}
