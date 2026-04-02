"use client";

import { useState, useEffect, useTransition } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { SelectedSlotData } from "../grid/grid-realtime-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createBookingAction, blockSlotAction } from "@/actions/booking-actions";
import { searchCustomersAction } from "@/actions/customer-actions";
import { formatARS } from "@/lib/utils/currency";
import { Loader2, Plus, Lock } from "lucide-react";
import { toast } from "sonner";
import { BOOKING_SOURCES } from "@/lib/constants/booking-states";
import { createWhatsAppLink } from "@/lib/utils/whatsapp";

interface BookingSheetProps {
  selectedSlot: SelectedSlotData;
  onClose: () => void;
  bookingDate: string;
  complexId: string;
  depositEnabled: boolean;
}

export function BookingSheet({
  selectedSlot,
  onClose,
  bookingDate,
  complexId, // Not explicitly needed here since SA takes it from auth, but useful
  depositEnabled,
}: BookingSheetProps) {
  const [isPending, startTransition] = useTransition();
  const [mode, setMode] = useState<"book" | "block">("book");
  
  // Forms
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [depositPaid, setDepositPaid] = useState(false);
  const [notes, setNotes] = useState("");
  const [blockNote, setBlockNote] = useState("");

  // Autocomplete
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

  const price = selectedSlot.price; // Weekend calc should ideally be determined. We just fallback to price or priceWeekend visually
  // Fast fix for UI display (since Pricing logic is done by server properly)
  const isWeekend = false; // We can parse bookingDate, but let's just show baseline price for now
  const displayPrice = isWeekend && selectedSlot.priceWeekend ? selectedSlot.priceWeekend : price;

  const handleCreate = () => {
    if (!customerName || !customerPhone) {
       toast.error("Completá el nombre y teléfono del cliente");
       return;
    }

    startTransition(async () => {
      const res = await createBookingAction({
        courtId: selectedSlot.courtId,
        bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        customerName,
        customerPhone,
        depositPaid,
        source: "manual",
        notes,
      });

      if (res.success) {
        toast.success("Reserva confirmada", {
           action: {
              label: "📲 Avisar por WhatsApp",
              onClick: () => {
                 const waLink = createWhatsAppLink(customerPhone, `Hola ${customerName}, confirmamos tu turno para el ${bookingDate} a las ${selectedSlot.startTime}hs en la cancha de Fútbol ${selectedSlot.courtName}.`);
                 window.open(waLink, "_blank");
              }
           },
           duration: 6000,
        });
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleBlock = () => {
    if (!blockNote) {
       toast.error("Indicá un motivo de bloqueo");
       return;
    }

    startTransition(async () => {
      const res = await blockSlotAction({
        courtId: selectedSlot.courtId,
        bookingDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        blockNote,
      });

      if (res.success) {
        toast.success("Horario bloqueado");
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="mb-6">
          <SheetTitle>Nuevo Turno</SheetTitle>
        </SheetHeader>

        {/* Read only info */}
        <div className="mb-6 rounded-lg bg-gray-50 p-4 border border-gray-100">
          <p className="font-bold text-navy">{selectedSlot.courtName}</p>
          <p className="text-sm text-gray-500">
             {bookingDate} • {selectedSlot.startTime} a {selectedSlot.endTime}
          </p>
          <p className="mt-2 text-lg font-semibold text-green-primary">
            {formatARS(displayPrice)}
          </p>
        </div>

        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
           <button 
             onClick={() => setMode("book")}
             className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${mode === "book" ? "bg-white shadow-sm text-navy" : "text-gray-500 hover:text-navy"}`}
           >
             Reservar
           </button>
           <button 
             onClick={() => setMode("block")}
             className={`flex-1 text-sm font-medium py-1.5 rounded-md transition-colors ${mode === "block" ? "bg-white shadow-sm text-red-600" : "text-gray-500 hover:text-red-600"}`}
           >
             Bloquear
           </button>
        </div>

        {mode === "book" ? (
          <div className="space-y-4">
            <div className="space-y-2 relative">
              <Label>Nombre del Cliente</Label>
              <Input 
                value={searchQuery}
                onChange={(e) => {
                   setSearchQuery(e.target.value);
                   setCustomerName(e.target.value);
                   if (customerPhone) setCustomerPhone(""); // Reset phone if typing new
                }}
                placeholder="Ej: Juan Pérez"
              />
              
              {showSuggestions && (
                <div className="absolute top-16 z-50 w-full bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden">
                   {suggestions.map(s => (
                     <button
                       key={s.id}
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

            <div className="space-y-2">
              <Label>Teléfono Whatsapp</Label>
              <Input 
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="11 1234 5678"
                type="tel"
              />
            </div>

            {depositEnabled && (
               <div className="flex items-center gap-3 py-2">
                 <Switch 
                   checked={depositPaid}
                   onCheckedChange={(val) => setDepositPaid(val)}
                 />
                 <Label>¿Ya pagó la seña?</Label>
               </div>
            )}

            <div className="space-y-2">
              <Label>Notas (Opcional)</Label>
              <Input 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Viene con remera azul"
              />
            </div>

            <Button 
               className="w-full mt-6" 
               size="lg"
               disabled={isPending}
               onClick={handleCreate}
            >
              {isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
              Confirmar reserva
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
             <div className="space-y-2">
              <Label>Motivo del Bloqueo</Label>
              <Input 
                value={blockNote}
                onChange={(e) => setBlockNote(e.target.value)}
                placeholder="Ej: Mantenimiento, Escuela de Fútbol"
              />
            </div>

            <Button 
               className="w-full mt-6" 
               variant="outline"
               size="lg"
               disabled={isPending}
               onClick={handleBlock}
            >
              {isPending ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Lock className="h-5 w-5 mr-2 text-red-500" />}
              <span className="text-red-600 font-medium">Bloquear horario</span>
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
