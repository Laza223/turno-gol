import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { formatBookingDate } from "@/lib/utils/dates";

interface SuccessPageProps {
  params: { slug: string };
  searchParams: { date?: string; time?: string; court?: string };
}

export default function SuccessPage({ params, searchParams }: SuccessPageProps) {
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
