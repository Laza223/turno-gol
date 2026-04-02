import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SubscriptionView } from "@/components/dashboard/settings/subscription-view";

export default async function SubscriptionSettingsPage() {
   const authUser = await getAuthComplex();
   if (!authUser) redirect("/login");

   const complex = await prisma.complex.findUnique({ 
      where: { id: authUser.id } 
   });
   
   if (!complex) redirect("/login");

   return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
         <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy">Suscripción y Facturación</h1>
            <p className="text-gray-500 text-sm mt-1">
               Administrá tu plan actual para seguir operando con normalidad.
            </p>
         </div>

         <SubscriptionView 
            status={complex.subscriptionStatus} 
            plan={complex.subscriptionPlan}
            trialEndsAt={complex.trialEndsAt}
            subscriptionEndsAt={complex.subscriptionEndsAt}
         />
      </div>
   );
}
