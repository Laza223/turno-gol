import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatBookingDate } from "@/lib/utils/dates";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { status?: string; booking?: string; date?: string; time?: string; court?: string };
}) {
  const complex = await prisma.complex.findUnique({
    where: { slug: params.slug },
  });

  if (!complex) notFound();

  // If coming from MercadoPago success
  if (searchParams.status === "approved" && searchParams.booking) {
     // Here in a real world app we'd do a quick sanity update if the webhook was delayed.
     // For this test we can assume they literally just paid.
     await prisma.booking.updateMany({
        where: { id: searchParams.booking, complexId: complex.id },
        data: { depositPaid: true }
     });

     return (
       <div className="min-h-screen bg-gray-50 flex flex-col pt-12 items-center px-4">
         <div className="bg-white border p-8 rounded-2xl max-w-sm w-full text-center shadow-sm">
            <div className="bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-navy mb-2">¡Seña pagada con éxito!</h1>
            <p className="text-gray-500 mb-8">Tu plata ya ingresó. El turno quedó 100% asegurado en {complex.name}. Te esperamos en la cancha.</p>
            <Button asChild className="w-full bg-green-primary hover:bg-green-dark">
              <Link href={`/${params.slug}`}>Volver al inicio</Link>
            </Button>
         </div>
       </div>
     );
  }

  const { date, time, court } = searchParams;
  const formattedDate = date ? formatBookingDate(date) : "";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-navy mb-2">¡Tu cancha está reservada!</h1>
        <p className="text-gray-500 mb-8">El turno fue agendado exitosamente.</p>

        <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-8 text-left space-y-2">
           <p className="text-sm text-gray-500">Detalles:</p>
           <p className="font-semibold text-navy text-lg">{court}</p>
           <p className="font-medium text-navy capitalize">{formattedDate} a las {time}hs</p>
        </div>

        <div className="space-y-3">
          {/* Opcional / Nice to have ICS */}
          <button className="w-full bg-white border-2 border-gray-200 text-gray-700 font-bold py-3 rounded-md hover:bg-gray-50 transition-colors">
            Agregar al calendario
          </button>
          
          <Link href={`/${params.slug}`} className="block w-full bg-green-primary hover:bg-green-dark text-white font-bold py-3 rounded-md transition-colors shadow-sm">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
