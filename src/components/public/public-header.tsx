import { createWhatsAppLink } from "@/lib/utils/whatsapp";
import { MessageCircle, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface PublicHeaderProps {
  complex: {
    name: string;
    logoUrl: string | null;
    address: string | null;
    city: string | null;
    phone: string | null;
  }
}

export function PublicHeader({ complex }: PublicHeaderProps) {
  const fullAddress = [complex.address, complex.city].filter(Boolean).join(", ");

  let waLink = "";
  if (complex.phone) {
    waLink = createWhatsAppLink(complex.phone, `Hola, me comunico desde la web de reservas.`);
  }

  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-3xl mx-auto px-4 py-6 md:px-0 flex flex-col items-center text-center">
        {complex.logoUrl ? (
          <div className="w-20 h-20 relative rounded-full overflow-hidden border border-gray-100 mb-3 block">
            <Image 
              src={complex.logoUrl} 
              alt={`Logo de ${complex.name}`}
              fill
              className="object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-green-primary/10 flex items-center justify-center mb-3">
             <span className="text-2xl font-bold text-green-primary">⚽</span>
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-navy">{complex.name}</h1>
        
        {fullAddress && (
          <p className="text-gray-500 text-sm mt-2 flex items-center justify-center gap-1">
             <MapPin className="w-4 h-4" /> {fullAddress}
          </p>
        )}

        {complex.phone && waLink && (
          <div className="mt-4">
             <Link 
               href={waLink} 
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-2 bg-green-primary/10 text-green-800 hover:bg-green-primary/20 px-4 py-2 rounded-full text-sm font-medium transition-colors"
             >
                <MessageCircle className="w-4 h-4 text-green-700" />
                {complex.phone}
             </Link>
          </div>
        )}
      </div>
    </header>
  );
}
