"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOnlineBookingAction } from "@/actions/booking-actions";
import { formatARS } from "@/lib/utils/currency";
import { formatBookingDate } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface OnlineBookingFormProps {
  complex: any;
  court: any;
  bookingDate?: string;
  startTime?: string;
  endTime: string;
  price: number;
  depositAmount: number | null;
  initialCourtId?: string;
  initialDate?: string;
  initialTime?: string;
}

export function OnlineBookingForm({
  complex,
  court,
  bookingDate,
  startTime,
  endTime,
  price,
  depositAmount,
  initialCourtId,
  initialDate,
  initialTime
}: OnlineBookingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [errorObj, setErrorObj] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorObj("");

    if (!name || name.length < 2) {
       setErrorObj("Proporcioná un nombre válido.");
       return;
    }
    if (!phone || phone.length < 8) {
       setErrorObj("Proporcioná un teléfono válido.");
       return;
    }

    startTransition(async () => {
       const res = await createOnlineBookingAction({
         complexId: complex.id,
         courtId: court.id,
         customerName: name,
         customerPhone: phone,
         bookingDate: initialDate || bookingDate || "",
         startTime: initialTime || startTime || "",
         endTime
       });

       if (res.success) {
         // Proceed to success page
         router.push(`/${complex.slug}/book/success?date=${bookingDate}&time=${startTime}&court=${court.name}`);
       } else {
         setErrorObj(res.error);
       }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       {/* Resumen */}
       <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Complejo:</span>
            <span className="font-semibold text-navy">{complex.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Cancha:</span>
            <span className="font-semibold text-navy">{court.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Fecha:</span>
            <span className="font-semibold text-navy capitalize">{formatBookingDate(initialDate || bookingDate || "")}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Horario:</span>
            <span className="font-semibold text-navy">{initialTime || startTime} a {endTime}</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-200 flex justify-between items-center">
            <span className="text-navy font-bold">Total a pagar:</span>
            <span className="text-lg font-bold text-green-primary">{formatARS(price)}</span>
          </div>
       </div>

       {/* Formulario */}
       <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Nombre y Apellido</Label>
            <Input 
              id="name" 
              placeholder="Ej: Lionel Messi" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="phone">Tu Teléfono (WhatsApp)</Label>
            <Input 
              id="phone" 
              type="tel"
              placeholder="11 1234 5678" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
       </div>

       {/* Explicación de pago */}
       <div className="bg-orange-50 border border-orange-100 p-4 rounded-lg text-sm">
         {complex.depositEnabled && depositAmount ? (
           complex.mercadopagoConfigured ? (
             <p className="text-orange-800">
               Al confirmar vas a poder pagar la seña de <strong>{formatARS(depositAmount)}</strong> con MercadoPago para asegurar tu turno.
             </p>
           ) : (
             <div className="text-orange-800 space-y-2">
               <p>Para asegurar tu turno es necesario abonar una seña de <strong>{formatARS(depositAmount)}</strong>.</p>
               <p className="font-medium text-xs bg-white p-2 rounded border border-orange-200">
                 Transferí al Alias: <span className="font-bold text-navy">{complex.transferAlias || "No definido"}</span><br/>
                 CBU: <span className="font-bold text-navy">{complex.transferCbu || "No definido"}</span>
               </p>
               <p className="text-xs">Al confirmar, recordá mandarnos el comprobante por WhatsApp.</p>
             </div>
           )
         ) : (
           <p className="text-orange-800 font-medium text-center">
             El cobro se realizará presencialmente en el complejo.
           </p>
         )}
       </div>

       {/* Error Block */}
       {errorObj && (
         <p className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200 text-center font-medium">
           {errorObj}
         </p>
       )}

       {/* Botón */}
       <Button 
         type="submit" 
         className="w-full h-12 text-md" 
         disabled={isPending}
       >
         {isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
         Confirmar Reserva
       </Button>

       {/* Legals */}
       <div className="text-center">
         <p className="text-xs text-gray-400">
           Al reservar aceptás la política del complejo.
         </p>
         <p className="text-[10px] text-gray-400 mt-1">
           Política de cancelación: {complex.cancellationPolicy === "loose" ? `Tenés tiempo de cancelar hasta ${complex.cancellationHours || 24}hs antes.` : "La seña es no reembolsable en caso de no concurrir."}
         </p>
       </div>
    </form>
  );
}
