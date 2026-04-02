"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Wallet, Banknote, CreditCard, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/utils/currency";
import { formatBookingDate } from "@/lib/utils/dates";
import { addDays, subDays, parse } from "date-fns";
import { PinGuard } from "@/components/guards/pin-guard";
import { MovementList } from "./movement-list";

interface CashRegisterViewProps {
  summary: any;
  currentDate: string;
}

export function CashRegisterView({ summary, currentDate }: CashRegisterViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handlePrevDay = () => {
     const dateObj = parse(currentDate, "yyyy-MM-dd", new Date());
     const prev = formatBookingDate(subDays(dateObj, 1), "yyyy-MM-dd") || addDays(dateObj, -1).toISOString().substring(0, 10);
     router.push(`${pathname}?date=${prev}`);
  };

  const handleNextDay = () => {
     const dateObj = parse(currentDate, "yyyy-MM-dd", new Date());
     const next = addDays(dateObj, 1).toISOString().substring(0, 10);
     router.push(`${pathname}?date=${next}`);
  };

  const setToday = () => {
     router.push(`${pathname}`);
  };

  return (
    <div className="space-y-6">
      {/* Date Navigation */}
      <div className="flex items-center justify-between bg-white border border-gray-200 p-2 rounded-xl">
         <Button variant="ghost" onClick={handlePrevDay}><ChevronLeft className="w-5 h-5 mr-1"/> Anterior</Button>
         <div className="text-center">
            <p className="font-bold text-navy capitalize text-lg">{formatBookingDate(currentDate)}</p>
         </div>
         <div className="flex gap-2">
            <Button variant="outline" className="hidden sm:flex" onClick={setToday}>Hoy</Button>
            <Button variant="ghost" onClick={handleNextDay}>Próximo <ChevronRight className="w-5 h-5 ml-1"/></Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
         {/* Main Financials */}
         <div className="md:col-span-8 space-y-6">
            {/* Grand Total */}
            <div className="bg-navy rounded-2xl p-6 text-white shadow-sm flex flex-col justify-center relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Wallet className="w-32 h-32" />
               </div>
               <p className="text-blue-200 font-medium mb-1 relative z-10">Total Recaudado en el Día</p>
               <h2 className="text-4xl md:text-5xl font-bold tracking-tight relative z-10">{formatARS(summary.total)}</h2>
            </div>

            {/* Breakdown Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="bg-green-100 p-3 rounded-full mb-3 text-green-700"><Banknote className="w-6 h-6" /></div>
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Efectivo</p>
                  <p className="font-bold text-navy text-lg">{formatARS(summary.breakdown.cash)}</p>
               </div>
               <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="bg-blue-100 p-3 rounded-full mb-3 text-blue-700"><Landmark className="w-6 h-6" /></div>
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Transferencia</p>
                  <p className="font-bold text-navy text-lg">{formatARS(summary.breakdown.transfer)}</p>
               </div>
               <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="bg-sky-100 p-3 rounded-full mb-3 text-sky-700 relative">
                     <span className="font-bold text-lg -tracking-widest">mp</span>
                  </div>
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-1">MercadoPago</p>
                  <p className="font-bold text-navy text-lg">{formatARS(summary.breakdown.mp)}</p>
               </div>
               <div className="bg-white border rounded-xl p-4 shadow-sm flex flex-col items-center text-center">
                  <div className="bg-purple-100 p-3 rounded-full mb-3 text-purple-700"><CreditCard className="w-6 h-6" /></div>
                  <p className="text-gray-500 text-xs font-semibold uppercase mb-1">Tarjeta</p>
                  <p className="font-bold text-navy text-lg">{formatARS(summary.breakdown.card)}</p>
               </div>
            </div>
         </div>

         {/* Stats Panel */}
         <div className="md:col-span-4 flex flex-col gap-4">
            <div className="bg-white border text-sm rounded-xl p-5 shadow-sm space-y-4">
               <h3 className="font-bold text-gray-800 border-b pb-2">Rendimiento Operativo</h3>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600 font-medium">⚽ Turnos jugados</span>
                 <span className="font-bold text-lg text-navy">{summary.stats.completedTurns}</span>
               </div>
               <div className="flex justify-between items-center">
                 <span className="text-gray-600 font-medium">✅ Señas cobradas</span>
                 <span className="font-bold text-lg text-green-primary">{formatARS(summary.stats.depositCollected)}</span>
               </div>
               <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                 <span className="text-gray-600 font-medium">⏳ Pendientes de cobro</span>
                 <span className="font-bold text-lg text-orange-600">{summary.stats.pendingToPay}</span>
               </div>
            </div>
         </div>
      </div>

      <div className="pt-6">
         <h3 className="text-xl font-bold text-navy mb-4">Listado de Movimientos</h3>
         <PinGuard>
            <MovementList date={currentDate} />
         </PinGuard>
      </div>

    </div>
  );
}
