import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { PublicHeader } from "@/components/public/public-header";
import { DateSelector } from "@/components/public/date-selector";
import { CourtList } from "@/components/public/court-list";

export const revalidate = 0; // Dynamic component

interface PublicPageProps {
  params: { slug: string };
  searchParams: { [key: string]: string | undefined };
}

export default async function PublicPage({ params, searchParams }: PublicPageProps) {
  const slug = params.slug;
  const complex = await prisma.complex.findUnique({
    where: { slug }
  });

  if (!complex) {
    notFound();
  }

  // Si está bloqueado, mensaje y cortina restrictiva
  if (complex.subscriptionStatus === "blocked") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-6">
        <h1 className="text-2xl font-bold text-navy mb-2">Turnos no disponibles</h1>
        <p className="text-gray-500">Reservas deshabilitadas temporalmente.<br/>Por favor contactate con el complejo directamente.</p>
      </div>
    );
  }

  // Parsear la fecha solicitada o asume hoy.
  const today = format(new Date(), "yyyy-MM-dd");
  const targetDate = searchParams.date || today;

  const courts = await prisma.court.findMany({
    where: { complexId: complex.id, isActive: true },
    orderBy: { sortOrder: 'asc' }
  });

  const bookingsDate = await prisma.booking.findMany({
    where: {
       complexId: complex.id,
       bookingDate: targetDate,
       status: { notIn: ["cancelled", "no_show"] }
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-safe pb-safe">
      <PublicHeader complex={complex as any} />
      
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 md:px-0 flex flex-col space-y-6">
        <DateSelector 
           currentDate={targetDate} 
           maxAdvanceDays={complex.maxAdvanceDays} 
           slug={complex.slug} 
        />
        
        <CourtList 
           courts={courts as any} 
           bookings={bookingsDate as any}
           targetDate={targetDate}
           complex={{
              openTime: complex.openTime,
              closeTime: complex.closeTime,
              slotStartMinute: complex.slotStartMinute,
              slug: complex.slug
           }}
        />
      </main>

      <footer className="w-full max-w-3xl mx-auto py-8 text-center px-4">
         <p className="text-sm text-gray-400">
           Gestionado con <a href="/" className="text-navy font-semibold hover:underline">TurnoGol ⚽</a>
         </p>
      </footer>
    </div>
  );
}
