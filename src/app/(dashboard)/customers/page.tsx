import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CustomersView } from "@/components/dashboard/customers/customers-view";

const PAGE_SIZE = 20;

export default async function CustomersPage({ searchParams }: { searchParams: { q?: string; page?: string } }) {
  const complex = await getAuthComplex();
  if (!complex) redirect("/login");

  const query = searchParams.q || "";
  const page = parseInt(searchParams.page || "1", 10);
  const skip = (page - 1) * PAGE_SIZE;

  // Build Prisma Where
  const whereFilter: any = { complexId: complex.id };
  if (query) {
     whereFilter.OR = [
       { name: { contains: query, mode: "insensitive" } },
       { phone: { contains: query } }
     ];
  }

  // Promise All for Count + Find
  const [total, customers] = await Promise.all([
     prisma.customer.count({ where: whereFilter }),
     prisma.customer.findMany({
        where: whereFilter,
        orderBy: { lastBookingDate: "desc" },
        skip,
        take: PAGE_SIZE,
     })
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-6">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-navy">Directorio de Clientes</h1>
            <p className="text-gray-500 text-sm mt-1">Buscá y administrá a quienes reservan en tu predio.</p>
          </div>
       </div>

       <CustomersView 
          customers={customers} 
          currentPage={page} 
          totalPages={totalPages} 
          currentQuery={query}
          totalItems={total}
       />
    </div>
  );
}
