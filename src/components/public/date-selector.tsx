"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { getNextNDates } from "@/lib/utils/dates";
import { format, parse } from "date-fns";
import { es } from "date-fns/locale";

interface DateSelectorProps {
  currentDate: string;
  maxAdvanceDays: number;
  slug: string;
}

export function DateSelector({ currentDate, maxAdvanceDays, slug }: DateSelectorProps) {
  const dates = getNextNDates(maxAdvanceDays === 0 ? 1 : maxAdvanceDays);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para mantener a la vista el item seleccionado
  useEffect(() => {
    if (!scrollRef.current) return;
    const selected = scrollRef.current.querySelector<HTMLAnchorElement>('[data-state="active"]');
    if (selected) {
      const containerLeft = scrollRef.current.scrollLeft;
      const containerWidth = scrollRef.current.clientWidth;
      const elementLeft = selected.offsetLeft;
      const elementWidth = selected.clientWidth;

      if (elementLeft < containerLeft || elementLeft + elementWidth > containerLeft + containerWidth) {
         scrollRef.current.scrollTo({
           left: elementLeft - containerWidth / 2 + elementWidth / 2,
           behavior: "smooth"
         });
      }
    }
  }, [currentDate]);

  return (
    <div className="w-full relative">
      {/* Indicador de scroll */}
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-50 to-transparent pointer-events-none md:hidden" />
      
      <div 
        ref={scrollRef}
        className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {dates.map((dateStr) => {
          const isActive = dateStr === currentDate;
          const parsed = parse(dateStr, "yyyy-MM-dd", new Date());
          const dayName = format(parsed, "EEE", { locale: es });
          const dayNumber = format(parsed, "d");

          return (
            <Link
              key={dateStr}
              href={`/${slug}?date=${dateStr}`}
              data-state={isActive ? "active" : "inactive"}
              className={`snap-start flex-shrink-0 flex flex-col items-center justify-center w-16 p-2 rounded-xl border transition-colors ${
                isActive 
                  ? "bg-green-primary border-green-primary text-white shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-300"
              }`}
            >
              <span className="text-xs font-medium uppercase truncate">{dayName}</span>
              <span className={`text-lg font-bold mt-0.5 ${isActive ? "text-white" : "text-navy"}`}>
                {dayNumber}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
