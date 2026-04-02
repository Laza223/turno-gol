"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FixedSlotForm } from "./fixed-slot-form";
import { FixedSlotDetail } from "./fixed-slot-detail";

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const STATUS_COLORS: any = {
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-orange-100 text-orange-800 border-orange-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};
const STATUS_LABELS: any = {
  active: "Activo",
  paused: "Pausado",
  cancelled: "Cancelado",
};

interface FixedSlotsViewProps {
  initialSlots: any[];
  courts: any[];
  complex: any;
}

export function FixedSlotsView({ initialSlots, courts, complex }: FixedSlotsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // Stats
  const activeCount = initialSlots.filter(s => s.status === "active").length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 border border-gray-200 p-4 rounded-xl">
         <p className="text-sm font-medium text-navy">
           Tenes <span className="font-bold text-green-primary">{activeCount}</span> turnos fijos activos.
         </p>
         <Button onClick={() => setIsFormOpen(true)} className="bg-green-primary hover:bg-green-dark">
            <Plus className="w-4 h-4 mr-2" /> Nuevo Turno Fijo
         </Button>
      </div>

      <div className="bg-white border text-sm border-gray-200 rounded-xl overflow-hidden">
        {initialSlots.length === 0 ? (
           <div className="text-center py-12 text-gray-500">No hay turnos fijos configurados.</div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left border-collapse">
               <thead>
                 <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase text-xs">
                   <th className="p-4 font-semibold">Cliente</th>
                   <th className="p-4 font-semibold">Cancha</th>
                   <th className="p-4 font-semibold w-32 text-center">Día</th>
                   <th className="p-4 font-semibold w-40 text-center">Horario</th>
                   <th className="p-4 font-semibold w-24 text-center">Estado</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100">
                  {initialSlots.map(slot => (
                     <tr 
                       key={slot.id} 
                       onClick={() => setSelectedSlot(slot)}
                       className="group hover:bg-gray-50 cursor-pointer transition-colors"
                     >
                        <td className="p-4">
                           <p className="font-semibold text-navy">{slot.customer.name}</p>
                           <p className="text-xs text-gray-400 font-medium">{slot.customer.phone}</p>
                        </td>
                        <td className="p-4 font-medium text-gray-600">{slot.court.name}</td>
                        <td className="p-4 text-center text-gray-600 font-medium">{DAYS[slot.dayOfWeek]}</td>
                        <td className="p-4 text-center font-bold text-navy">
                           {slot.startTime} a {slot.endTime}
                        </td>
                        <td className="p-4 text-center">
                           <span className={`px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wider border ${STATUS_COLORS[slot.status]}`}>
                             {STATUS_LABELS[slot.status]}
                           </span>
                        </td>
                     </tr>
                  ))}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {isFormOpen && (
        <FixedSlotForm 
           onClose={() => setIsFormOpen(false)}
           courts={courts}
           complex={complex}
           existingFixedSlots={initialSlots}
        />
      )}

      {selectedSlot && (
        <FixedSlotDetail
           fixedSlot={selectedSlot}
           onClose={() => setSelectedSlot(null)}
        />
      )}
    </div>
  );
}
