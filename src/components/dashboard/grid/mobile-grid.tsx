import { useState } from "react";
import { GridCourtData, BookingWithRelations } from "@/lib/types";
import { GridCell } from "./grid-cell";
import { cn } from "@/lib/utils";

interface MobileGridProps {
  gridData: GridCourtData[];
  onSlotClick: (court: GridCourtData, startTime: string, endTime: string, booking?: BookingWithRelations | null) => void;
}

export function MobileGrid({ gridData, onSlotClick }: MobileGridProps) {
  const [activeCourtIndex, setActiveCourtIndex] = useState(0);

  if (!gridData || gridData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No hay canchas registradas.
      </div>
    );
  }

  // Si se inactivó la cancha y el index se salió de rango
  const safeIndex = activeCourtIndex >= gridData.length ? 0 : activeCourtIndex;
  const activeCourt = gridData[safeIndex]!;

  return (
    <div className="flex h-full flex-col space-y-4">
      {/* Pill-shaped horizontal scroll navigation */}
      <div className="-mx-4 flex overflow-x-auto px-4 pb-2 scrollbar-none">
        <div className="flex gap-2">
          {gridData.map((court, i) => {
            const isActive = i === safeIndex;
            return (
              <button
                key={court.courtId}
                onClick={() => setActiveCourtIndex(i)}
                className={cn(
                  "flex flex-col items-center justify-center whitespace-nowrap rounded-full px-5 py-2 text-sm font-semibold transition-colors flex-shrink-0",
                  isActive
                    ? "bg-navy text-white shadow-sm"
                    : "border border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
                )}
              >
                <span>{court.courtName}</span>
                <span className={cn(
                  "text-[10px] uppercase font-bold tracking-wider",
                  isActive ? "text-green-300" : "text-gray-400"
                )}>
                  Fútbol {court.playerCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid List for selected court */}
      <div className="flex-1 overflow-y-auto rounded-xl border border-gray-200 bg-white p-2">
        <div className="flex flex-col space-y-2">
          {activeCourt.slots.map((slot) => (
             <div key={slot.startTime} className="flex items-center gap-3 border-b border-gray-50 pb-2 last:border-b-0 last:pb-0">
               <div className="flex w-14 flex-col items-center justify-center flex-shrink-0 text-center">
                 <span className="text-sm font-bold text-navy">{slot.startTime}</span>
                 <span className="text-xs text-gray-400">{slot.endTime}</span>
               </div>
               
               <div className="flex-1 min-w-0">
                 <GridCell 
                   slotStart={slot.startTime} 
                   slotData={slot} 
                   isMobile={true}
                   onClick={() => {
                     onSlotClick(activeCourt, slot.startTime, slot.endTime, slot.booking);
                   }} 
                 />
               </div>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
