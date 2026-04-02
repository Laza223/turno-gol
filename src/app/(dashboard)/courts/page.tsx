import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CourtsView } from "@/components/dashboard/courts/courts-view";

export default async function CourtsPage() {
  const complex = await getAuthComplex();
  if (!complex) redirect("/login");

  const courts = await prisma.court.findMany({
    where: { complexId: complex.id },
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Gestión de Canchas</h1>
            <p className="text-gray-500 text-sm mt-1">Administrá las instalaciones de tu predio.</p>
          </div>
       </div>

       <CourtsView initialCourts={courts} />
    </div>
  );
}
