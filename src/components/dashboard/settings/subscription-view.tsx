"use client";

import { useState, useTransition } from "react";
import { format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2, Zap, AlertTriangle, ShieldX, CalendarCheck } from "lucide-react";
import { generateSubscriptionAction } from "@/actions/subscription-actions";

interface SubscriptionViewProps {
   status: string;
   plan: string;
   trialEndsAt: Date | null;
   subscriptionEndsAt: Date | null;
}

export function SubscriptionView({ status, plan, trialEndsAt, subscriptionEndsAt }: SubscriptionViewProps) {
   const [isPending, startTransition] = useTransition();

   const handleSubscribe = (planId: "cancha" | "complejo") => {
      startTransition(async () => {
         const res = await generateSubscriptionAction(planId);
         if (res.success) {
            window.location.href = res.data;
         } else {
            toast.error(res.error || "Algo salió mal al contactar la proveedora de pagos.");
         }
      });
   };

   // Render state calculation
   let badgeColor = "bg-green-100 text-green-700";
   let title = "Suscripción Activa";
   let description = "Tu complejo tiene todo en regla para seguir recibiendo jugadores.";
   let Icon = CalendarCheck;

   if (status === "trial" && trialEndsAt) {
      const daysLeft = differenceInDays(trialEndsAt, new Date());
      badgeColor = "bg-blue-100 text-blue-700";
      title = `Prueba Gratuita (${Math.max(0, daysLeft)} días)`;
      description = "Estás probando TurnoGol sin costo. Al terminar, la plataforma pedirá suscribirte.";
      Icon = Zap;
   } else if (status === "grace") {
      badgeColor = "bg-yellow-100 text-yellow-800";
      title = "Prueba / Suscripción Vencida";
      description = "Tenés un lapso de gracia para regularizar tu cuota antes del bloqueo temporal.";
      Icon = AlertTriangle;
   } else if (status === "blocked") {
      badgeColor = "bg-red-100 text-red-800";
      title = "Sistema Bloqueado";
      description = "No has regularizado tu plan tecnológico. Las reservas públicas han sido dadas de baja temporalmente.";
      Icon = ShieldX;
   }

   return (
      <div className="space-y-8">
         <div className="bg-white border text-center sm:text-left border-gray-200 rounded-xl p-8 flex flex-col sm:flex-row items-center gap-6">
            <div className={`${badgeColor} p-4 rounded-full flex-shrink-0`}>
               <Icon className="w-8 h-8" />
            </div>
            
            <div className="flex-1">
               <h2 className="text-xl font-bold text-navy flex items-center justify-center sm:justify-start gap-2">
                  {title}
               </h2>
               <p className="text-gray-500 text-sm mt-1">{description}</p>
               
               {subscriptionEndsAt && status === "active" && (
                  <p className="text-sm font-semibold text-gray-800 mt-3">
                     Vencimiento formal: {format(subscriptionEndsAt, "dd 'de' MMMM, yyyy", { locale: es })}
                  </p>
               )}
            </div>
            
            {(status === "trial" || status === "grace" || status === "blocked") && (
               <Button 
                  onClick={() => handleSubscribe("cancha")}
                  className="bg-green-primary hover:bg-green-dark w-full sm:w-auto h-12 px-6 shadow-sm"
                  disabled={isPending}
               >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Activar Plan Ahora
               </Button>
            )}
         </div>

         {/* Plan Features */}
         <div className="grid md:grid-cols-2 gap-6">
            <div className="border border-green-200 bg-green-50 rounded-xl p-6">
               <h3 className="text-lg font-bold text-green-900">Plan Básico</h3>
               <p className="text-green-700 text-sm">Todo lo indispensable para rentar por hora</p>
               <div className="my-6">
                  <span className="text-3xl font-black text-navy">$22.900</span>
                  <span className="text-gray-500 text-sm"> / mes</span>
               </div>
               
               <ul className="text-sm text-green-800 space-y-2 mb-6">
                 <li>✅ Turnos Ilimitados</li>
                 <li>✅ Caja y Módulos de Señas con MP</li>
                 <li>✅ Hasta 5 Canchas conectadas</li>
               </ul>
               
               <Button 
                  onClick={() => handleSubscribe("cancha")}
                  variant="outline"
                  className="w-full border-green-600 text-green-700 hover:bg-green-100"
                  disabled={isPending}
               >
                  Suscribirse (MercadoPago)
               </Button>
            </div>
         </div>
      </div>
   );
}
