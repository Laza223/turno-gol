"use client";

import { useRouter, usePathname } from "next/navigation";
import { format, addDays, subDays, parse } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatBookingDate, todayDateString } from "@/lib/utils/dates";
import { Button } from "@/components/ui/button";

interface GridHeaderProps {
  bookingDate: string;
}

export function GridHeader({ bookingDate }: GridHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  function navigateTo(dateStr: string) {
    router.push(`${pathname}?date=${dateStr}`);
  }

  function handlePrev() {
    const current = parse(bookingDate, "yyyy-MM-dd", new Date());
    navigateTo(format(subDays(current, 1), "yyyy-MM-dd"));
  }

  function handleNext() {
    const current = parse(bookingDate, "yyyy-MM-dd", new Date());
    navigateTo(format(addDays(current, 1), "yyyy-MM-dd"));
  }

  function handleToday() {
    navigateTo(todayDateString());
  }

  const isToday = bookingDate === todayDateString();

  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 md:gap-4">
        <div className="flex items-center rounded-lg border border-gray-200">
          <button
            onClick={handlePrev}
            className="flex h-9 w-9 items-center justify-center rounded-l-lg hover:bg-gray-50 focus:outline-none"
            aria-label="Día anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="h-5 w-px bg-gray-200" />
          <button
            onClick={handleNext}
            className="flex h-9 w-9 items-center justify-center rounded-r-lg hover:bg-gray-50 focus:outline-none"
            aria-label="Día siguiente"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <h2 className="text-sm font-semibold capitalize text-navy md:text-lg">
          {formatBookingDate(bookingDate)}
        </h2>
      </div>

      <Button
        variant={isToday ? "outline" : "default"}
        size="sm"
        onClick={handleToday}
        className={isToday ? "text-gray-500" : ""}
      >
        Hoy
      </Button>
    </div>
  );
}
