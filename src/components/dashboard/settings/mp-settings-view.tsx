"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { generateMpAuthUrlAction, processMpCallbackAction, disconnectMpAction } from "@/actions/mercadopago-actions";
import { toast } from "sonner";
import { Loader2, ArrowRightLeft, ShieldCheck, Link2Off, Wallet } from "lucide-react";

interface MpSettingsViewProps {
  isConnected: boolean;
  capturedCode?: string;
}

export function MpSettingsView({ isConnected, capturedCode }: MpSettingsViewProps) {
  const [isPending, startTransition] = useTransition();
  const [isConnecting, setIsConnecting] = useState(false);
  const router = useRouter();

  useEffect(() => {
     if (capturedCode && !isConnected) {
        setIsConnecting(true);
        processMpCallbackAction(capturedCode).then(res => {
           if (res.success) {
              toast.success("¡MercadoPago enlazado exitosamente!");
              router.replace("/dashboard/settings/mercadopago");
           } else {
              toast.error(res.error);
              setIsConnecting(false);
           }
        });
     }
  }, [capturedCode, isConnected, router]);

  const handleConnect = async () => {
     startTransition(async () => {
        const url = await generateMpAuthUrlAction();
        window.location.href = url;
     });
  };

  const handleDisconnect = () => {
     if (!window.confirm("¿Seguro querés desconectar MercadoPago? Dejarás de recibir cobros online.")) return;
     
     startTransition(async () => {
        const res = await disconnectMpAction();
        if (res.success) {
           toast.success("Cuenta desconectada.");
        } else {
           toast.error(res.error);
        }
     });
  };

  if (isConnecting) {
     return (
        <div className="bg-white border rounded-xl p-16 flex flex-col items-center justify-center text-center">
           <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-4" />
           <p className="font-bold text-navy text-lg">Enlazando con MercadoPago...</p>
           <p className="text-gray-500 text-sm mt-2">Estamos guardando y encriptando tus tokens de cobro. No cierres esta ventana.</p>
        </div>
     );
  }

  return (
     <div className="space-y-6">
        {isConnected ? (
           <div className="bg-white border border-green-200 rounded-xl overflow-hidden">
              <div className="bg-green-50 p-6 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-green-100">
                 <div className="bg-green-100 text-green-600 p-4 rounded-full">
                    <ShieldCheck className="w-8 h-8" />
                 </div>
                 <div className="flex-1">
                    <h2 className="text-xl font-bold text-green-900 flex items-center justify-center sm:justify-start gap-2">
                       MercadoPago Conectado <span className="bg-green-200 text-green-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Activo</span>
                    </h2>
                    <p className="text-green-700 text-sm mt-1">El complejo ya se encuentra recibiendo depósitos bancarios director a tu billetera personal.</p>
                 </div>
                 <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50"
                    onClick={handleDisconnect}
                    disabled={isPending}
                 >
                    {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Link2Off className="w-4 h-4 mr-2" />}
                    Desconectar
                 </Button>
              </div>
           </div>
        ) : (
           <div className="bg-white border text-center border-gray-200 rounded-xl p-8 max-w-lg mb-8">
              <div className="bg-sky-50 text-sky-600 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                 <Wallet className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-navy mb-2">Conectá tu billetera</h2>
              <p className="text-gray-500 text-sm mb-6">
                 Tu cuenta de MercadoPago será utilizada para percibir exclusivamente las transacciones y señas que exijas en el módulo de Canchas. El dinero pasará directamente a tu patrimonio.
              </p>
              
              <Button 
                 className="w-full bg-[#009EE3] hover:bg-[#0089C5] text-white h-12 text-lg font-semibold"
                 onClick={handleConnect}
                 disabled={isPending}
              >
                 {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <ArrowRightLeft className="w-5 h-5 mr-2" />}
                 Conectar con MercadoPago
              </Button>
           </div>
        )}
     </div>
  );
}
