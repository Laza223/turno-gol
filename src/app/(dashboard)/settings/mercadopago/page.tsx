import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { MpSettingsView } from "@/components/dashboard/settings/mp-settings-view";

export default async function MercadoPagoSettingsPage({ searchParams }: { searchParams: { code?: string } }) {
   const authUser = await getAuthComplex();
   if (!authUser) redirect("/login");

   const complex = await prisma.complex.findUnique({ where: { id: authUser.id } });
   if (!complex) redirect("/login");

   return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto space-y-6">
         <div className="mb-6">
            <h1 className="text-2xl font-bold text-navy">Integración con MercadoPago</h1>
            <p className="text-gray-500 text-sm mt-1">Conectá tu cuenta de MercadoPago para asegurar depósitos desde la web de manera automática.</p>
         </div>

         <MpSettingsView 
            isConnected={complex.mpConnected} 
            capturedCode={searchParams.code} 
         />
      </div>
   );
}
