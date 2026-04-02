import { getAuthComplex } from "@/lib/supabase/server";
import { format } from "date-fns";
import { redirect } from "next/navigation";
import { CashRegisterService } from "@/lib/services/cash-register-service";
import { CashRegisterView } from "@/components/dashboard/cash-register/cash-register-view";

export default async function CashRegisterPage({ searchParams }: { searchParams: { date?: string } }) {
  const complex = await getAuthComplex();
  if (!complex) redirect("/login");

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const targetDate = searchParams.date || todayStr;

  const summary = await CashRegisterService.getDailySummary(complex.id, targetDate);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Caja Diaria</h1>
            <p className="text-gray-500 text-sm mt-1">Sumario general de las recaudaciones y turnos saldados.</p>
          </div>
       </div>

       <CashRegisterView 
          summary={summary} 
          currentDate={targetDate} 
       />
    </div>
  );
}
