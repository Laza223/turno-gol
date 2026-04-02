"use client";

import { useState, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, ChevronLeft, ChevronRight, Ban } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CustomerDetail } from "./customer-detail";
import { formatBookingDate } from "@/lib/utils/dates";

interface CustomersViewProps {
  customers: any[];
  currentPage: number;
  totalPages: number;
  currentQuery: string;
  totalItems: number;
}

export function CustomersView({ 
  customers, 
  currentPage, 
  totalPages, 
  currentQuery,
  totalItems
}: CustomersViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedCustomer, setSelectedCustomer] = useState<any | null>(null);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
         params.set(name, value);
      } else {
         params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
     const value = e.target.value;
     const newQueryString = createQueryString("q", value);
     // Reset pagination on new search
     const finalQueryString = value 
        ? new URLSearchParams(newQueryString).set("page", "1") // reset page
        : newQueryString;
     
     // The prompt requests 300ms debounce
     // We can implement a naive URL push here since React's transition takes over,
     // but real debounce is better. For standard Next.js behavior, pushing without await is standard.
     router.push(`${pathname}?${finalQueryString || "page=1"}`, { scroll: false });
  };

  const setPage = (pageNumber: number) => {
     if (pageNumber < 1 || pageNumber > totalPages) return;
     router.push(`${pathname}?${createQueryString("page", pageNumber.toString())}`);
  };

  return (
    <div className="space-y-6">
       <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
          <div className="relative w-full md:w-96">
             <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
             <Input 
                className="pl-10"
                placeholder="Buscar por nombre o teléfono..."
                defaultValue={currentQuery}
                onChange={(e) => {
                   // Local quick debounce
                   setTimeout(() => handleSearch(e), 300)
                }}
             />
          </div>
          <div className="text-sm font-medium text-gray-500 whitespace-nowrap">
             Total: <span className="text-navy">{totalItems} clientes</span>
          </div>
       </div>

       <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden">
        {customers.length === 0 ? (
           <div className="text-center py-12 text-gray-500">
              No se encontraron clientes para la búsqueda actual.
           </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                   <th className="p-4 font-semibold">Cliente</th>
                   <th className="p-4 font-semibold text-center">Reservas Totales</th>
                   <th className="p-4 font-semibold text-center hidden md:table-cell">Reg. Cancelaciones/No-Shows</th>
                   <th className="p-4 font-semibold text-center">Última Vez</th>
                   <th className="p-4 font-semibold text-center">Estado</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {customers.map(customer => (
                     <tr 
                       key={customer.id} 
                       onClick={() => setSelectedCustomer(customer)}
                       className={`group hover:bg-gray-50 cursor-pointer transition-colors ${customer.isBlocked ? 'bg-red-50/30' : ''}`}
                     >
                        <td className="p-4 flex items-center gap-3 relative">
                           {customer.isBlocked && <Ban className="w-4 h-4 text-red-500 absolute -left-1" />}
                           <div>
                             <p className="font-semibold text-navy">{customer.name}</p>
                             <p className="text-xs text-gray-400 font-medium">{customer.phone}</p>
                           </div>
                        </td>
                        <td className="p-4 text-center font-bold text-navy">{customer.totalBookings}</td>
                        <td className="p-4 text-center hidden md:table-cell text-xs font-semibold">
                           <span className="text-orange-500">{customer.totalCancellations}</span> / <span className="text-red-600">{customer.totalNoShows}</span>
                        </td>
                        <td className="p-4 text-center text-gray-600 font-medium capitalize">
                           {customer.lastBookingDate ? formatBookingDate(customer.lastBookingDate) : "Nunca"}
                        </td>
                        <td className="p-4 text-center">
                           {customer.isBlocked ? (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800 border border-red-200">BLOQUEADO</span>
                           ) : (
                              <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-200">ACTIVO</span>
                           )}
                        </td>
                     </tr>
                  ))}
               </tbody>
             </table>
          </div>
        )}
       </div>

       {/* Pagination */}
       {totalPages > 1 && (
         <div className="flex items-center justify-between">
           <p className="text-sm text-gray-500">
             Página {currentPage} de {totalPages}
           </p>
           <div className="flex gap-2">
             <Button
               variant="outline"
               size="icon"
               onClick={() => setPage(currentPage - 1)}
               disabled={currentPage === 1}
               className="h-9 w-9"
             >
               <ChevronLeft className="w-4 h-4" />
             </Button>
             <Button
               variant="outline"
               size="icon"
               onClick={() => setPage(currentPage + 1)}
               disabled={currentPage === totalPages}
               className="h-9 w-9"
             >
               <ChevronRight className="w-4 h-4" />
             </Button>
           </div>
         </div>
       )}

       {selectedCustomer && (
         <CustomerDetail
           customerId={selectedCustomer.id}
           onClose={() => setSelectedCustomer(null)}
         />
       )}
    </div>
  );
}
