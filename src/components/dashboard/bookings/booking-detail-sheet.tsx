"use client";

import { useState, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { formatARS } from "@/lib/utils/currency";
import { createWhatsAppLink } from "@/lib/utils/whatsapp";
import { BookingWithRelations } from "@/lib/types";
import { BOOKING_STATUSES, BOOKING_SOURCES } from "@/lib/constants/booking-states";
import { PAYMENT_METHODS } from "@/lib/constants/payment-methods";
import { 
  markDepositPaidAction, 
  collectBookingAction, 
  cancelBookingAction, 
  noShowAction, 
  unlockSlotAction 
} from "@/actions/booking-actions";
import { toast } from "sonner";
import { Loader2, DollarSign, Ban, UserX, Phone, MessageCircle, LockOpen } from "lucide-react";
import { formatBookingDate } from "@/lib/utils/dates";

interface BookingDetailSheetProps {
  booking: BookingWithRelations;
  onClose: () => void;
}

export function BookingDetailSheet({ booking, onClose }: BookingDetailSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [showCollect, setShowCollect] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [collectAmount, setCollectAmount] = useState<number>(
     (booking.price || 0) - (booking.depositAmount || 0)
  );

  const statusConfig = BOOKING_STATUSES[booking.status];
  const sourceConfig = BOOKING_SOURCES[booking.source];

  // Helper actions
  const handleMarkDeposit = () => {
    startTransition(async () => {
      const res = await markDepositPaidAction({ bookingId: booking.id });
      if (res.success) {
        toast.success("Seña marcada como pagada");
        onClose();
      } else toast.error(res.error);
    });
  };

  const handleCollect = () => {
    startTransition(async () => {
      const res = await collectBookingAction({ 
         bookingId: booking.id, 
         amount: collectAmount, 
         paymentMethod 
      });
      if (res.success) {
        toast.success("Turno cobrado y completado");
        onClose();
      } else toast.error(res.error);
    });
  };

  const handleCancel = () => {
    startTransition(async () => {
      const res = await cancelBookingAction({ bookingId: booking.id });
      if (res.success) {
        toast.success("Turno cancelado");
        onClose();
      } else toast.error(res.error);
    });
  };

  const handleNoShow = () => {
    startTransition(async () => {
      const res = await noShowAction({ bookingId: booking.id });
      if (res.success) {
        toast.success("Marcado como No se presentó");
        onClose();
      } else toast.error(res.error);
    });
  };

  const handleUnlock = () => {
    startTransition(async () => {
      const res = await unlockSlotAction({ bookingId: booking.id });
      if (res.success) {
        toast.success("Horario desbloqueado");
        onClose();
      } else toast.error(res.error);
    });
  };

  // WhatsApp helpers
  const handleWhatsapp = (type: "remind" | "deposit" | "cancel") => {
    if (!booking.customer?.phone) return;
    
    let msg = "";
    const name = booking.customer.name;
    const date = formatBookingDate(booking.bookingDate);
    const time = booking.startTime;
    const court = booking.court.name;
    
    if (type === "remind") {
      msg = `Hola ${name}, te escribimos de TurnoGol para recordarte tu turno hoy ${date} a las ${time}hs en la cancha de Fútbol ${court}. ¡Te esperamos!`;
    } else if (type === "deposit") {
      msg = `Hola ${name}, necesitamos que abones la seña para confirmar tu turno del ${date} a las ${time}hs. ¡Avisanos cualquier duda!`;
    } else if (type === "cancel") {
      msg = `Hola ${name}, lamentablemente hemos tenido que cancelar tu turno para el ${date} a las ${time}hs. Por favor, comunícate con nosotros para reprogramar.`;
    }

    window.open(createWhatsAppLink(booking.customer.phone, msg), "_blank");
  };

  if (booking.status === "blocked") {
    return (
      <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="mb-6">
            <SheetTitle className="flex items-center gap-2 text-navy">
              <span className={`w-3 h-3 rounded-full bg-navy`} />
              Horario Bloqueado
            </SheetTitle>
          </SheetHeader>
          <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-6">
             <p className="font-semibold text-navy">{booking.court.name}</p>
             <p className="text-sm text-gray-500">
               {formatBookingDate(booking.bookingDate)} • {booking.startTime} a {booking.endTime}
             </p>
             <div className="mt-4 pt-4 border-t border-gray-200">
               <p className="text-xs text-gray-500 uppercase font-semibold">MOTIVO DEL BLOQUEO</p>
               <p className="text-sm text-gray-800 mt-1">{booking.blockNote || "Sin especificar"}</p>
             </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
            disabled={isPending}
            onClick={handleUnlock}
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <LockOpen className="w-4 h-4 mr-2" />}
            Desbloquear Horario
          </Button>
        </SheetContent>
      </Sheet>
    );
  }

  const isConfirmed = booking.status === "confirmed";

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full bg-${statusConfig.color}`} />
              {statusConfig.label}
            </div>
            {booking.fixedSlotId && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold uppercase tracking-wider">FIJO</span>
            )}
          </SheetTitle>
        </SheetHeader>

        {/* Info principal */}
        <div className="bg-gray-50 border border-gray-100 p-4 rounded-lg mb-6 flex justify-between items-center">
           <div>
             <p className="font-semibold text-navy">{booking.court.name}</p>
             <p className="text-sm text-gray-500">{booking.bookingDate} • {booking.startTime} a {booking.endTime}</p>
           </div>
           <p className="text-xl font-bold text-navy">{formatARS(booking.price)}</p>
        </div>

        {/* Estado Financiero */}
        <div className="flex border border-gray-100 rounded-lg overflow-hidden mb-6">
          <div className="flex-1 bg-white p-3 border-r border-gray-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Seña</span>
            {booking.depositPaid ? (
               <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">Pagada ({formatARS(booking.depositAmount || 0)})</span>
            ) : (
               <span className="text-sm font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">Sin seña</span>
            )}
          </div>
          <div className="flex-1 bg-white p-3 flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase">Estado</span>
            {booking.isPaid ? (
               <span className="text-sm font-bold text-gray-600">Cobrado</span>
            ) : (
               <span className="text-sm font-bold text-navy">Pendiente</span>
            )}
          </div>
        </div>

        {/* Cliente */}
        {booking.customer && (
          <div className="mb-6 space-y-3">
             <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Cliente</h3>
             <div className="flex items-center justify-between">
               <div>
                  <p className="font-medium text-navy">{booking.customer.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {booking.customer.phone}
                  </p>
               </div>
               <div className="flex gap-2">
                 <Button variant="outline" size="icon" onClick={() => handleWhatsapp("remind")}>
                    <MessageCircle className="w-4 h-4 text-green-600" />
                 </Button>
               </div>
             </div>
             
             {/* Wahtsapp Extras */}
             {isConfirmed && !booking.depositPaid && (
               <Button variant="ghost" size="sm" className="w-full text-orange-600 justify-start" onClick={() => handleWhatsapp("deposit")}>
                 <MessageCircle className="w-4 h-4 mr-2" />
                 Pedir pago de seña por WA
               </Button>
             )}
          </div>
        )}

        {/* Acciones */}
        {isConfirmed && (
          <div className="space-y-3 pt-4 border-t border-gray-100">
            {!booking.depositPaid && (
              <Button 
                variant="outline" 
                className="w-full border-green-200 text-green-700 hover:bg-green-50"
                disabled={isPending}
                onClick={handleMarkDeposit}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Marcar seña adelantada
              </Button>
            )}

            {!showCollect ? (
              <Button 
                className="w-full bg-navy text-white hover:bg-navy/90"
                onClick={() => setShowCollect(true)}
              >
                Cobrar Turno
              </Button>
            ) : (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-4">
                <h4 className="font-semibold text-sm text-navy">Cerrar y Cobrar</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(PAYMENT_METHODS).map(([key, item]) => {
                     // Exclude deposit as a method to collect remainder, deposit is a special logic
                     if (key === "deposit") return null;
                     return (
                       <button
                         key={key}
                         onClick={() => setPaymentMethod(key)}
                         className={`p-2 text-xs font-medium rounded-md border text-center transition-colors ${paymentMethod === key ? "bg-navy text-white border-navy" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"}`}
                       >
                         {item.label}
                       </button>
                     )
                  })}
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500 font-medium">$</span>
                  <input 
                    type="number"
                    value={collectAmount || ""}
                    onChange={e => setCollectAmount(Number(e.target.value))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-green-primary"
                  />
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => setShowCollect(false)}>Cancelar</Button>
                  <Button className="flex-1" disabled={isPending} onClick={handleCollect}>
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar"}
                  </Button>
                </div>
              </div>
            )}

            <div className="pt-4 flex gap-2">
               {!showCancel ? (
                 <>
                   <Button variant="ghost" className="flex-1 text-gray-500" onClick={() => handleNoShow()} disabled={isPending}>
                       <UserX className="w-4 h-4 mr-2" /> No se presentó
                   </Button>
                   <Button variant="ghost" className="flex-1 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => setShowCancel(true)} disabled={isPending}>
                       <Ban className="w-4 h-4 mr-2" /> Cancelar
                   </Button>
                 </>
               ) : (
                 <div className="w-full bg-red-50 p-4 rounded-xl border border-red-100 space-y-3">
                    <p className="text-sm font-semibold text-red-800 text-center">¿Anular esta reserva?</p>
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1 bg-white" onClick={() => setShowCancel(false)}>No</Button>
                      <Button variant="destructive" className="flex-1" onClick={handleCancel} disabled={isPending}>Sí, cancelar</Button>
                    </div>
                 </div>
               )}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
