import { formatBookingDate } from "@/lib/utils/dates";

interface MobileHeaderProps {
  complexName: string;
}

export function MobileHeader({ complexName }: MobileHeaderProps) {
  const today = new Date().toISOString().split("T")[0]!; // YYYY-MM-DD local enough for UI

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 lg:hidden">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-navy truncate max-w-[200px]">
          {complexName}
        </span>
        <span className="text-xs text-gray-500 capitalize">
          {formatBookingDate(today)}
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-primary/10 text-xs font-bold text-green-primary">
          TG
        </span>
      </div>
    </header>
  );
}
