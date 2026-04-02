import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCourtPrice } from "@/lib/utils/pricing";
import { OnlineBookingForm } from "@/components/public/online-booking-form";

export const revalidate = 0;

interface BookingPageProps {
  params: { slug: string };
  searchParams: { courtId?: string; date?: string; time?: string };
}

export default async function BookingPage({ params, searchParams }: BookingPageProps) {
  const { courtId, date, time } = searchParams;
  
  if (!courtId || !date || !time) {
     redirect(`/${params.slug}`);
  }

  const complex = await prisma.complex.findUnique({
    where: { slug: params.slug }
  });

  if (!complex || complex.subscriptionStatus === "blocked") {
    notFound();
  }

  const court = await prisma.court.findUnique({
    where: { id: courtId, complexId: complex.id }
  });

  if (!court) {
    redirect(`/${params.slug}`);
  }

  // Calculate endTime (always strictly 60 minutes after startTime in TurnoGol)
  const [hourStr, minStr] = time.split(":");
  const h = parseInt(hourStr);
  const m = parseInt(minStr);
  const endH = h + 1;
  const endTime = `${endH.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  const price = getCourtPrice({ price: court.price, priceWeekend: court.priceWeekend }, date);

  let depositAmount = null;
  if (complex.depositEnabled) {
     if (complex.depositType === "percentage" && complex.depositValue) {
       depositAmount = Math.round((price * complex.depositValue) / 100);
     } else if (complex.depositType === "fixed" && complex.depositValue) {
       depositAmount = complex.depositValue;
     }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-safe pb-safe items-center py-6 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 bg-navy text-white text-center">
           <h1 className="font-bold text-lg">Finalizar Reserva</h1>
        </div>
        
        <div className="p-6">
          <OnlineBookingForm 
            complex={complex as any}
            court={court as any}
            bookingDate={date}
            startTime={time}
            endTime={endTime}
            price={price}
            depositAmount={depositAmount}
          />
        </div>
      </div>
    </div>
  );
}
