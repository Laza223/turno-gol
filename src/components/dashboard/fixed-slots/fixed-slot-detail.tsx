"use client";

import { useTransition, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { 
  pauseFixedSlotAction, 
  reactivateFixedSlotAction, 
  cancelFixedSlotAction 
} from "@/actions/fixed-slot-actions";
import { toast } from "sonner";
import { Loader2, Play, Pause, Ban, CalendarDays } from "lucide-react";
import { formatBookingDate } from "@/lib/utils/dates";

interface FixedSlotDetailProps {
  fixedSlot: any;
  onClose: () => void;
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function FixedSlotDetail({ fixedSlot, onClose }: FixedSlotDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const isActive = fixedSlot.status === "active";
  const isPaused = fixedSlot.status === "paused";
  const isCancelled = fixedSlot.status === "cancelled";

  const handlePause = () => {
     startTransition(async () => {
        const res = await pauseFixedSlotAction({ id: fixedSlot.id });
        if (res.success) {
           toast.success("Turno fijo pausado. No se generarán nuevas reservas.");
           onClose();
        } else toast.error(res.error);
     });
  };

  const handleReactivate = () => {
     startTransition(async () => {
        const res = await reactivateFixedSlotAction({ id: fixedSlot.id });
        if (res.success) {
           toast.success("Turno fijo reactivado.");
           onClose();
        } else toast.error(res.error);
     });
  };

  const handleCancelDefinitive = () => {
     startTransition(async () => {
        const res = await cancelFixedSlotAction({ id: fixedSlot.id });
        if (res.success) {
           toast.success("Turno fijo y reservas futuras canceladas definitivamente.");
           onClose();
        } else toast.error(res.error);
     });
  };

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex justify-between items-center">
            <span>Detalle Fijo</span>
            {isCancelled ? (
               <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">CANCELADO</span>
            ) : isActive ? (
               <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">ACTIVO</span>
            ) : (
               <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">PAUSADO</span>
            )}
          </SheetTitle>
        </SheetHeader>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
           <div className="flex justify-between border-b pb-2">
             <span className="text-gray-500 font-medium">Cancha</span>
             <span className="text-navy font-bold">{fixedSlot.court.name}</span>
           </div>
           <div className="flex justify-between border-b pb-2">
             <span className="text-gray-500 font-medium">Día</span>
             <span className="text-navy font-bold">{DAYS[fixedSlot.dayOfWeek]}</span>
           </div>
           <div className="flex justify-between">
             <span className="text-gray-500 font-medium">Horario</span>
             <span className="text-navy font-bold">{fixedSlot.startTime} a {fixedSlot.endTime}</span>
           </div>
        </div>

        <div className="mb-6">
           <p className="text-sm font-semibold text-gray-400 mb-2 uppercase">Titular</p>
           <div className="bg-white border rounded-lg p-3">
              <p className="font-bold text-navy">{fixedSlot.customer.name}</p>
              <p className="text-sm text-gray-500">{fixedSlot.customer.phone}</p>
           </div>
        </div>

        <div className="mb-8">
           <p className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-1">
             <CalendarDays className="w-4 h-4" /> Próximas Reservas
           </p>
           {fixedSlot.bookings?.length === 0 ? (
              <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                No hay reservas futuras pendientes.
              </p>
           ) : (
              <ul className="space-y-2">
                 {fixedSlot.bookings?.map((b: any) => (
                    <li key={b.id} className="flex justify-between text-sm bg-white border p-2.5 rounded-lg">
                       <span className="font-semibold text-navy capitalize">{formatBookingDate(b.bookingDate)}</span>
                       <span className="bg-green-100 text-green-800 text-[10px] uppercase font-bold py-1 px-2 rounded">Generada</span>
                    </li>
                 ))}
              </ul>
           )}
        </div>

        {!isCancelled && (
           <div className="space-y-3 pt-4 border-t border-gray-100">
              {isActive ? (
                <Button 
                   variant="outline" 
                   className="w-full text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                   onClick={handlePause}
                   disabled={isPending}
                >
                   {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Pause className="w-4 h-4 mr-2" />}
                   Pausar Turno Fijo
                </Button>
              ) : (
                <Button 
                   variant="outline" 
                   className="w-full text-green-700 hover:text-green-800 hover:bg-green-50 border-green-200"
                   onClick={handleReactivate}
                   disabled={isPending}
                >
                   {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
                   Reactivar Turno
                </Button>
              )}

              {!showCancelConfirm ? (
                 <Button 
                    variant="ghost" 
                    className="w-full text-gray-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => setShowCancelConfirm(true)}
                 >
                    <Ban className="w-4 h-4 mr-2" /> Cancelar Definitivamente
                 </Button>
              ) : (
                 <div className="bg-red-50 p-4 rounded-xl border border-red-100 mt-4 space-y-3">
                    <p className="text-sm font-semibold text-red-800 text-center">
                      ¿Borrar este turno fijo y anular todas sus reservas futuras (que no estén cobradas)?
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-white" onClick={() => setShowCancelConfirm(false)}>Atrás</Button>
                      <Button variant="destructive" className="flex-1" onClick={handleCancelDefinitive} disabled={isPending}>
                         {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Cancelar Todo"}
                      </Button>
                    </div>
                 </div>
              )}
           </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
