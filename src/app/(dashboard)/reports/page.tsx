import { getAuthComplex } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PinGuard } from "@/components/guards/pin-guard";
import { ReportsView } from "@/components/dashboard/reports/reports-view";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default async function ReportsPage() {
   const complex = await getAuthComplex();
   if (!complex) redirect("/login");

   return (
      <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
         <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-end gap-2">
            <div>
               <h1 className="text-2xl font-bold text-navy">Reportes y Analíticas</h1>
               <p className="text-gray-500 text-sm mt-1">Métricas de rendimiento e ingresos a tiempo real.</p>
            </div>
            <p className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase tracking-widest border border-gray-200">
               Actualizado: {format(new Date(), "HH:mm", { locale: es })}hs
            </p>
         </div>

         <PinGuard>
            <ReportsView />
         </PinGuard>
      </div>
   );
}
