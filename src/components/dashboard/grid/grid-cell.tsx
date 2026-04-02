import { cn } from "@/lib/utils";
import type { GridSlotData } from "@/lib/types";
import { Lock } from "lucide-react";

interface GridCellProps {
  slotStart: string;
  slotData: GridSlotData;
  onClick?: () => void;
  className?: string;
  isMobile?: boolean; // Prop to adapt layout if needed
}

export function GridCell({ slotStart, slotData, onClick, className, isMobile }: GridCellProps) {
  const { booking } = slotData;

  // Render vacío
  if (!booking) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-center rounded-md border-2 border-dashed border-gray-200 bg-transparent text-sm font-medium text-gray-400 transition-colors hover:border-gray-300 hover:bg-gray-50",
          className
        )}
      >
        <span className="sr-only">Reservar slot {slotStart}</span>
        <span className="opacity-0 group-hover:opacity-100">+ Reservar</span>
      </button>
    );
  }

  // Lógica de estilos por estado
  const { status, depositPaid, fixedSlotId, customer, blockNote } = booking;
  const customerName = customer?.name ?? "Sin nombre";

  if (status === "blocked") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full flex-col items-center justify-center rounded-md bg-navy/5 p-2 border border-navy/10 text-center transition-colors hover:bg-navy/10 cursor-pointer",
          className
        )}
      >
        <div className="flex items-center gap-1 text-navy mb-1">
          <Lock className="h-3 w-3" />
          <span className="text-xs font-semibold uppercase tracking-wider">Bloqueado</span>
        </div>
        {blockNote && (
          <span className="text-xs text-navy/70 line-clamp-1">{blockNote}</span>
        )}
      </button>
    );
  }

  if (status === "completed") {
    return (
      <button
        className={cn(
          "flex w-full flex-col justify-center rounded-md border border-gray-200 bg-gray-100 p-2 text-left opacity-60 transition-opacity hover:opacity-80",
          className
        )}
      >
        <span className="text-xs font-medium text-gray-500 line-through">
          {customerName}
        </span>
        <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
          Completado
        </span>
      </button>
    );
  }

  // Fijo
  if (fixedSlotId) {
    return (
      <button
        className={cn(
          "flex w-full flex-col justify-center rounded-md border border-blue-200 bg-blue-50 p-2 text-left transition-colors hover:bg-blue-100",
          className
        )}
      >
        <span className="text-xs font-bold text-blue-900 truncate w-full">
          {customerName}
        </span>
        <div className="mt-1 flex items-center">
          <span className="rounded bg-blue-200 px-1 py-0.5 text-[10px] font-bold text-blue-800 tracking-wider">
            FIJO
          </span>
        </div>
      </button>
    );
  }

  // Confirmado con o sin seña
  if (status === "confirmed") {
    const isSeñado = depositPaid;
    return (
      <button
        className={cn(
          "flex w-full flex-col justify-center rounded-md border p-2 text-left transition-colors",
          isSeñado
            ? "border-green-300 bg-green-primary/10 hover:bg-green-primary/20"
            : "border-orange-300 bg-orange-50 hover:bg-orange-100",
          className
        )}
      >
        <div className="flex w-full items-center justify-between">
            <span className={cn(
              "text-xs font-bold truncate",
              isSeñado ? "text-green-900" : "text-orange-900"
            )}>
              {customerName}
            </span>
            <span className="text-[10px] ml-1 flex-shrink-0">
              {isSeñado ? "🟢" : "🟡"}
            </span>
        </div>
        <span className={cn(
          "text-[10px] mt-1 font-medium",
          isSeñado ? "text-green-700" : "text-orange-700"
        )}>
           {isSeñado ? "Señado" : "Sin seña"}
        </span>
      </button>
    );
  }

  return null; // Fallback
}
