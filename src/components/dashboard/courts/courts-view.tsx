"use client";

import { useState, useTransition } from "react";
import { Plus, Edit3, Power, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CourtForm } from "./court-form";
import { toggleCourtActiveAction } from "@/actions/court-actions";
import { toast } from "sonner";
import { formatARS } from "@/lib/utils/currency";

interface CourtsViewProps {
  initialCourts: any[];
}

export function CourtsView({ initialCourts }: CourtsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourt, setEditingCourt] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggle = (courtId: string, isActive: boolean) => {
     startTransition(async () => {
        const res = await toggleCourtActiveAction({ courtId, isActive: !isActive });
        if (res.success) {
           toast.success(`Cancha ${!isActive ? "activada" : "desactivada"}.`);
        } else {
           toast.error(res.error);
        }
     });
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-end">
          <Button onClick={() => setIsFormOpen(true)} className="bg-green-primary hover:bg-green-dark text-white">
             <Plus className="w-4 h-4 mr-2" /> Agregar Cancha
          </Button>
       </div>

       {initialCourts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 border border-gray-200 rounded-xl">
             <Calendar className="w-10 h-10 text-gray-400 mx-auto mb-3" />
             <p className="text-gray-500 font-medium">Todavía no agregaste canchas.</p>
          </div>
       ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {initialCourts.map(court => (
                <div key={court.id} className={`flex flex-col bg-white border rounded-xl overflow-hidden transition-all shadow-sm ${!court.isActive ? 'border-red-200 opacity-60' : 'border-gray-200'}`}>
                   {/* Top Header */}
                   <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <div>
                         <h3 className="font-bold text-navy text-lg">{court.name}</h3>
                         <span className="text-xs font-semibold uppercase text-gray-500 bg-gray-200 px-2 rounded-full py-0.5 mt-1 inline-block">
                            Fútbol {court.playerCount / 2}
                         </span>
                      </div>
                      <div className="flex gap-2">
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-gray-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => {
                               setEditingCourt(court);
                               setIsFormOpen(true);
                            }}
                         >
                            <Edit3 className="w-4 h-4" />
                         </Button>
                         <Button 
                            variant="ghost" 
                            size="icon" 
                            className={`h-8 w-8 transition-colors ${court.isActive ? 'text-green-600 hover:bg-green-50' : 'text-red-500 hover:bg-red-50'}`}
                            onClick={() => handleToggle(court.id, court.isActive)}
                            disabled={isPending}
                         >
                            <Power className="w-4 h-4" />
                         </Button>
                      </div>
                   </div>

                   {/* Body details */}
                   <div className="p-4 flex-1 space-y-3">
                      <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                         <span className="text-gray-500">Superficie</span>
                         <span className="font-medium text-navy capitalize">{court.surface}</span>
                      </div>
                       <div className="flex justify-between text-sm border-b border-gray-50 pb-2">
                         <span className="text-gray-500">Techo</span>
                         <span className="font-medium text-navy">{court.isRoofed ? "Techada" : "Descubierta"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                         <span className="text-gray-500">Precio Diurno</span>
                         <span className="font-bold text-green-primary">{formatARS(court.price)}</span>
                      </div>
                      {court.priceWeekend && (
                        <div className="flex justify-between text-sm">
                           <span className="text-gray-500">Fin de Semana</span>
                           <span className="font-bold text-blue-600">{formatARS(court.priceWeekend)}</span>
                        </div>
                      )}
                   </div>
                   
                   {!court.isActive && (
                      <div className="bg-red-50 text-red-700 text-xs text-center p-2 font-semibold">
                         INACTIVA
                      </div>
                   )}
                </div>
             ))}
          </div>
       )}

       {isFormOpen && (
          <CourtForm 
             court={editingCourt}
             onClose={() => {
                setIsFormOpen(false);
                setEditingCourt(null);
             }}
          />
       )}
    </div>
  );
}
