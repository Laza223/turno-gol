import { GridCourtData, BookingWithRelations } from "@/lib/types";
import { GridCell } from "./grid-cell";

interface DesktopGridProps {
  gridData: GridCourtData[];
  onSlotClick: (court: GridCourtData, startTime: string, endTime: string, booking?: BookingWithRelations | null) => void;
}

export function DesktopGrid({ gridData, onSlotClick }: DesktopGridProps) {
  if (!gridData || gridData.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        No hay canchas registradas.
      </div>
    );
  }

  const timeslots = gridData[0]?.slots.map(s => ({ startTime: s.startTime, endTime: s.endTime })) ?? [];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white">
      {/* Header Row */}
      <div className="flex border-b border-gray-200 bg-gray-50">
        <div className="w-20 flex-shrink-0 border-r border-gray-200 p-3 text-center text-sm font-semibold text-gray-500">
          Horario
        </div>
        {gridData.map((court) => (
          <div key={court.courtId} className="flex flex-1 flex-col items-center justify-center border-r border-gray-200 p-3 last:border-r-0">
            <span className="font-bold text-navy truncate break-all">
              {court.courtName}
            </span>
            <span className="text-xs text-gray-500">
              Fútbol {court.playerCount}
              {!court.isActive && " (Inactiva)"}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col min-w-max">
          {timeslots.map((time, index) => (
            <div key={time.startTime} className="flex border-b border-gray-100 last:border-b-0 min-h-[80px]">
              {/* Time Column */}
              <div className="flex w-20 flex-shrink-0 flex-col items-center justify-center border-r border-gray-200 bg-gray-50/50 p-2 text-sm font-medium text-gray-600">
                <span>{time.startTime}</span>
                <span className="text-xs text-gray-400 mt-1">{time.endTime}</span>
              </div>
              
              {/* Cells */}
              {gridData.map((court) => {
                const slotData = court.slots[index];
                if (!slotData) return null;
                return (
                  <div key={`${court.courtId}-${time.startTime}`} className="flex flex-1 border-r border-gray-100 p-1 last:border-r-0 relative group">
                    <GridCell 
                       slotStart={time.startTime} 
                       slotData={slotData} 
                       // Render empty cell to be clickable
                       onClick={() => {
                          onSlotClick(court, time.startTime, time.endTime, slotData.booking);
                       }} 
                       className="h-full" 
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
