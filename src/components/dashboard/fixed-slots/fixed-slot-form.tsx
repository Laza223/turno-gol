"use client";

import { useState, useTransition, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createFixedSlotAction } from "@/actions/fixed-slot-actions";
import { searchCustomersAction } from "@/actions/customer-actions";
import { generateSlots } from "@/lib/utils/dates";
import { toast } from "sonner";
import { Loader2, CalendarHeart } from "lucide-react";

interface FixedSlotFormProps {
  onClose: () => void;
  courts: any[];
  complex: any;
  existingFixedSlots: any[]; // Used for frontend dynamic validation of availability
}

const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function FixedSlotForm({ onClose, courts, complex, existingFixedSlots }: FixedSlotFormProps) {
  const [isPending, startTransition] = useTransition();
  const [courtId, setCourtId] = useState(courts[0]?.id || "");
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState("");
  
  // Custom Customer block
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length > 1 && !customerPhone) {
        searchCustomersAction(searchQuery).then(res => {
          setSuggestions(res);
          setShowSuggestions(res.length > 0);
        });
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, customerPhone]);

  // Derived available slots for the selected combination
  const allSlots = generateSlots(complex.openTime, complex.closeTime, complex.slotStartMinute);
  
  const availableSlots = allSlots.filter(s => {
    // Check if there is an active or paused fixed slot exactly overlapping
    const overlapId = existingFixedSlots.find(f => {
       if (f.status === "cancelled") return false;
       if (f.courtId !== courtId) return false;
       if (f.dayOfWeek !== dayOfWeek) return false;
       
       return (s.startTime < f.endTime && s.endTime > f.startTime);
    });
    return overlapId === undefined;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!courtId || !startTime || !customerName || !customerPhone) {
       toast.error("Completá todos los campos.");
       return;
    }

    const slotObj = availableSlots.find(a => a.startTime === startTime);
    if (!slotObj) return;

    startTransition(async () => {
       const res = await createFixedSlotAction({
          courtId,
          dayOfWeek: Number(dayOfWeek),
          customerName,
          customerPhone,
          startTime: slotObj.startTime,
          endTime: slotObj.endTime
       });

       if (res.success) {
          toast.success(`Turno Fijo creado exitosamente. Se generaron ${res.data.generatedCount} reservas iniciales.`);
          onClose();
       } else {
          toast.error(res.error);
       }
    });
  };

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
             <CalendarHeart className="w-5 h-5 text-blue-600" />
             Nuevo Turno Fijo
          </SheetTitle>
        </SheetHeader>

        <form onSubmit={handleCreate} className="space-y-5">
           {/* Auto-complete Client */}
           <div className="space-y-4 bg-gray-50 border border-gray-100 p-4 rounded-xl">
             <div className="space-y-1.5 relative">
                <Label>Cliente Titular</Label>
                <Input 
                   value={searchQuery}
                   onChange={e => {
                      setSearchQuery(e.target.value);
                      setCustomerName(e.target.value);
                      if (customerPhone) setCustomerPhone("");
                   }}
                   placeholder="Ej: Marcelo Díaz"
                />
                {showSuggestions && (
                  <div className="absolute top-16 z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                     {suggestions.map(s => (
                       <button
                         key={s.id}
                         type="button"
                         onClick={() => {
                            setSearchQuery(s.name);
                            setCustomerName(s.name);
                            setCustomerPhone(s.phone);
                            setShowSuggestions(false);
                         }}
                         className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 border-b border-gray-100 last:border-0"
                       >
                         <p className="font-medium text-navy">{s.name}</p>
                         <p className="text-xs text-gray-400">{s.phone}</p>
                       </button>
                     ))}
                  </div>
                )}
             </div>

             <div className="space-y-1.5">
                <Label>Teléfono</Label>
                <Input 
                   value={customerPhone}
                   onChange={e => setCustomerPhone(e.target.value)}
                   placeholder="11 1234 5678"
                />
             </div>
           </div>

           <div className="space-y-1.5">
              <Label>Cancha</Label>
              <select 
                 className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer bg-white"
                 value={courtId}
                 onChange={e => setCourtId(e.target.value)}
              >
                 {courts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
           </div>

           <div className="space-y-1.5">
              <Label>Día de Repetición</Label>
              <select 
                 className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer bg-white"
                 value={dayOfWeek}
                 onChange={e => setDayOfWeek(Number(e.target.value))}
              >
                 {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
              </select>
           </div>

           <div className="space-y-1.5">
              <Label>Horario</Label>
              <select 
                 className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-navy cursor-pointer bg-white"
                 value={startTime}
                 onChange={e => setStartTime(e.target.value)}
              >
                 <option value="" disabled>Seleccioná un horario</option>
                 {availableSlots.map(s => (
                    <option key={s.startTime} value={s.startTime}>
                       {s.startTime} a {s.endTime}
                    </option>
                 ))}
              </select>
              {availableSlots.length === 0 && (
                 <p className="text-xs text-orange-600 mt-1 font-medium bg-orange-50 p-2 rounded">No hay horarios libres este día en esta cancha.</p>
              )}
           </div>

           <Button type="submit" className="w-full h-12" disabled={isPending || availableSlots.length === 0}>
             {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : null}
             Acordar Turno Fijo
           </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
