"use client";

import { useState, useTransition, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { blockCustomerAction, unblockCustomerAction } from "@/actions/customer-actions";
import { toast } from "sonner";
import { Loader2, Ban, CheckCircle2, User, Phone } from "lucide-react";
import { formatBookingDate } from "@/lib/utils/dates";

interface CustomerDetailProps {
  customerId: string;
  onClose: () => void;
}

export function CustomerDetail({ customerId, onClose }: CustomerDetailProps) {
  const [isPending, startTransition] = useTransition();
  const [data, setData] = useState<{customer: any, recentBookings: any[]} | null>(null);
  
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [blockReason, setBlockReason] = useState("");

  useEffect(() => {
     // Fetch the detail client-side bypassing full SSR for the modal exactly when opened.
     // TurnoGol normally uses Server Components, but fetching specific detail deep is fine via a quick manual fetch or just delegating the query.
     fetch(`/api/customers/${customerId}`)
       .then(res => res.json())
       .then(res => { if(res.success) setData(res.data) })
       .catch(e => toast.error("Error cargando detalles del cliente."));
  }, [customerId]);

  const handleBlock = () => {
     if (!blockReason.trim()) {
        toast.error("Proporcioná un motivo de bloqueo.");
        return;
     }

     startTransition(async () => {
        const res = await blockCustomerAction({ customerId, reason: blockReason });
        if (res.success) {
           toast.success("Cliente bloqueado exitosamente.");
           onClose();
        } else {
           toast.error(res.error);
        }
     });
  };

  const handleUnblock = () => {
     startTransition(async () => {
        const res = await unblockCustomerAction({ customerId });
        if (res.success) {
           toast.success("Cliente desbloqueado exitosamente.");
           onClose();
        } else {
           toast.error(res.error);
        }
     });
  };

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        {!data ? (
           <div className="flex h-full items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
           </div>
        ) : (
           <>
              <SheetHeader className="mb-6">
                <SheetTitle className="flex justify-between items-center">
                  <span>Detalle de Cliente</span>
                  {data.customer.isBlocked ? (
                     <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded font-bold uppercase">BLOQUEADO</span>
                  ) : (
                     <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded font-bold uppercase">ACTIVO</span>
                  )}
                </SheetTitle>
              </SheetHeader>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 space-y-3">
                 <div className="flex items-center gap-3 border-b pb-3">
                   <div className="bg-white p-2 rounded-full border">
                      <User className="w-6 h-6 text-navy" />
                   </div>
                   <div>
                      <p className="font-bold text-navy text-lg">{data.customer.name}</p>
                      <a href={`https://wa.me/${data.customer.phone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="text-sm text-green-600 font-semibold flex items-center hover:underline">
                         <Phone className="w-3 h-3 mr-1" /> {data.customer.phone}
                      </a>
                   </div>
                 </div>
                 
                 <div className="pt-2 grid grid-cols-3 gap-2 text-center divide-x divide-gray-200">
                    <div>
                       <p className="text-xs text-gray-500 font-semibold">Reservas</p>
                       <p className="text-lg font-bold text-navy">{data.customer.totalBookings}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-semibold">Canceladas</p>
                       <p className="text-lg font-bold text-orange-500">{data.customer.totalCancellations}</p>
                    </div>
                    <div>
                       <p className="text-xs text-gray-500 font-semibold">No Show</p>
                       <p className="text-lg font-bold text-red-600">{data.customer.totalNoShows}</p>
                    </div>
                 </div>
              </div>

              {data.customer.isBlocked && data.customer.blockReason && (
                 <div className="bg-red-50 p-4 border border-red-200 rounded-xl mb-6">
                    <p className="text-xs font-bold text-red-800 uppercase mb-1">Motivo del Bloqueo</p>
                    <p className="text-sm text-red-700 italic">"{data.customer.blockReason}"</p>
                 </div>
              )}

              <div className="mb-8">
                 <p className="text-sm font-semibold text-gray-400 mb-3 uppercase">Últimas 10 Reservas</p>
                 {data.recentBookings.length === 0 ? (
                    <p className="text-sm text-gray-500 italic bg-gray-50 p-3 rounded">
                      Este cliente no tiene reservas registradas.
                    </p>
                 ) : (
                    <ul className="space-y-2">
                       {data.recentBookings.map((b: any) => (
                          <li key={b.id} className={`flex justify-between items-center text-sm border p-3 rounded-lg ${b.status === "cancelled" || b.status === "no_show" ? 'bg-red-50 border-red-100' : 'bg-white'}`}>
                             <div>
                                <p className="font-semibold text-navy capitalize">{formatBookingDate(b.bookingDate)}</p>
                                <p className="text-xs text-gray-500">{b.court.name} • {b.startTime}</p>
                             </div>
                             <div>
                                {b.status === "confirmed" && <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">Confirmada</span>}
                                {b.status === "completed" && <span className="text-[10px] font-bold bg-green-100 text-green-800 px-2 py-0.5 rounded uppercase">Completada</span>}
                                {b.status === "cancelled" && <span className="text-[10px] font-bold bg-gray-200 text-gray-800 px-2 py-0.5 rounded uppercase">Cancelada</span>}
                                {b.status === "no_show" && <span className="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded uppercase">No Show</span>}
                             </div>
                          </li>
                       ))}
                    </ul>
                 )}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                 {data.customer.isBlocked ? (
                    <Button 
                       className="w-full bg-green-600 hover:bg-green-700 text-white" 
                       onClick={handleUnblock}
                       disabled={isPending}
                    >
                       {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle2 className="w-4 h-4 mr-2" />}
                       Desbloquear Cliente
                    </Button>
                 ) : (
                    !showBlockForm ? (
                       <Button 
                          variant="ghost"
                          className="w-full text-red-600 hover:bg-red-50 hover:text-red-700" 
                          onClick={() => setShowBlockForm(true)}
                       >
                          <Ban className="w-4 h-4 mr-2" /> Bloquear Cliente
                       </Button>
                    ) : (
                       <div className="bg-red-50 p-4 border border-red-100 rounded-xl space-y-3 text-left">
                          <Label className="text-red-800">Motivo de Bloqueo (Oblitgatorio)</Label>
                          <Input 
                             value={blockReason}
                             onChange={(e) => setBlockReason(e.target.value)}
                             placeholder="Ej: Faltó 3 veces sin avisar"
                             className="border-red-200"
                          />
                          <div className="flex gap-2 mt-2">
                             <Button variant="outline" className="flex-1 bg-white" onClick={() => setShowBlockForm(false)}>Cancelar</Button>
                             <Button variant="destructive" className="flex-1" onClick={handleBlock} disabled={isPending}>
                               {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Confirmar Bloqueo"}
                             </Button>
                          </div>
                       </div>
                    )
                 )}
              </div>
           </>
        )}
      </SheetContent>
    </Sheet>
  );
}
