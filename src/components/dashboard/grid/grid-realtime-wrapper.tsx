"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { GridCourtData } from "@/lib/types";
import { GridHeader } from "./grid-header";
import { DesktopGrid } from "./desktop-grid";
import { MobileGrid } from "./mobile-grid";
import { BookingSheet } from "../bookings/booking-sheet";
import { BookingDetailSheet } from "../bookings/booking-detail-sheet";
import { BookingWithRelations } from "@/lib/types";

interface GridRealtimeWrapperProps {
  complexId: string;
  bookingDate: string;
  gridData: GridCourtData[];
  depositEnabled: boolean;
}

export interface SelectedSlotData {
  courtId: string;
  courtName: string;
  startTime: string;
  endTime: string;
  price: number;
  priceWeekend: number | null;
}

export function GridRealtimeWrapper({
  complexId,
  bookingDate,
  gridData,
  depositEnabled,
}: GridRealtimeWrapperProps) {
  const router = useRouter();
  const [selectedSlot, setSelectedSlot] = useState<SelectedSlotData | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithRelations | null>(null);

  useEffect(() => {
    const supabase = createClient();
    
    const channel = supabase
      .channel(`bookings:realtime:${complexId}:${bookingDate}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "Booking",
          filter: `complex_id=eq.${complexId}`, // DB column name for filter!
        },
        (payload) => {
          const oldRecord = payload.old as any;
          const newRecord = payload.new as any;
          const impactsCurrentlyViewedDate = 
             (oldRecord && oldRecord.booking_date === bookingDate) || 
             (newRecord && newRecord.booking_date === bookingDate);
             
          if (impactsCurrentlyViewedDate) {
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [complexId, bookingDate, router]);

  const handleSlotClick = (court: GridCourtData, startTime: string, endTime: string, booking?: BookingWithRelations | null) => {
    if (booking) {
      setSelectedBooking(booking);
    } else {
      setSelectedSlot({
        courtId: court.courtId,
        courtName: court.courtName,
        startTime,
        endTime,
        price: court.price,
        priceWeekend: court.priceWeekend,
      });
    }
  };

  const handleCloseSheet = () => {
    setSelectedSlot(null);
    setSelectedBooking(null);
  };

  return (
    <div className="flex h-full flex-col space-y-4">
      <GridHeader bookingDate={bookingDate} />
      
      <div className="hidden flex-1 md:block">
        <DesktopGrid gridData={gridData} onSlotClick={handleSlotClick} />
      </div>
      
      <div className="block flex-1 md:hidden">
        <MobileGrid gridData={gridData} onSlotClick={handleSlotClick} />
      </div>

      {selectedSlot && (
        <BookingSheet 
          selectedSlot={selectedSlot} 
          onClose={handleCloseSheet} 
          bookingDate={bookingDate}
          complexId={complexId}
          depositEnabled={depositEnabled}
        />
      )}
      {selectedBooking && (
        <BookingDetailSheet 
          booking={selectedBooking} 
          onClose={handleCloseSheet} 
        />
      )}
    </div>
  );
}
