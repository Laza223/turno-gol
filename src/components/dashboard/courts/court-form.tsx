"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCourtSchema, type CreateCourtSchema } from "@/lib/validations/court";
import { createCourtAction, updateCourtAction } from "@/actions/court-actions";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface CourtFormProps {
  court?: any; // null for creation
  onClose: () => void;
}

export function CourtForm({ court, onClose }: CourtFormProps) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<CreateCourtSchema>({
    // @ts-ignore zod schema strict bypass
    resolver: zodResolver(createCourtSchema),
    defaultValues: court ? {
       name: court.name,
       playerCount: court.playerCount,
       surface: court.surface as any,
       isRoofed: court.isRoofed,
       price: court.price,
       priceWeekend: court.priceWeekend,
    } : {
       name: "",
       playerCount: 10, // Futbol 5 defecto (2*5)
       surface: "sintetico",
       isRoofed: false,
       price: 30000,
       priceWeekend: null,
    }
  });

  const onSubmit = (data: CreateCourtSchema) => {
     startTransition(async () => {
        let res;
        if (court) {
           res = await updateCourtAction(court.id, data);
        } else {
           res = await createCourtAction(data);
        }

        if (res.success) {
           toast.success(court ? "Cancha actualizada" : "Cancha creada exitosamente");
           onClose();
        } else {
           toast.error(res.error);
        }
     });
  };

  return (
    <Sheet open={true} onOpenChange={(val) => !val && onClose()}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>{court ? "Editar Cancha" : "Nueva Cancha"}</SheetTitle>
        </SheetHeader>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
           {/* Nombre */}
           <div className="space-y-1.5">
             <Label>Nombre identificador</Label>
             <Input 
                {...form.register("name")} 
                placeholder="Ej: Cancha Principal"
             />
             {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
           </div>

           <div className="grid grid-cols-2 gap-4">
             {/* Jugadores */}
             <div className="space-y-1.5">
               <Label>Jugadores totales</Label>
               <select 
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
                  {...form.register("playerCount", { valueAsNumber: true })}
               >
                  <option value={10}>Fútbol 5 (10 Jugadores)</option>
                  <option value={12}>Fútbol 6 (12 Jugadores)</option>
                  <option value={14}>Fútbol 7 (14 Jugadores)</option>
                  <option value={18}>Fútbol 9 (18 Jugadores)</option>
                  <option value={22}>Fútbol 11 (22 Jugadores)</option>
               </select>
             </div>

             {/* Superficie */}
             <div className="space-y-1.5">
               <Label>Superficie</Label>
               <select 
                  className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
                  {...form.register("surface")}
               >
                  <option value="sintetico">Sintético</option>
                  <option value="natural">Natural</option>
                  <option value="cemento">Cemento</option>
               </select>
             </div>
           </div>

           {/* Techo */}
           <div className="space-y-1.5">
             <Label>¿Es techada?</Label>
             <select 
                className="w-full h-10 px-3 border border-gray-300 rounded-md text-sm cursor-pointer bg-white"
                onChange={(e) => form.setValue("isRoofed", e.target.value === "true")}
                value={form.watch("isRoofed") ? "true" : "false"}
             >
                <option value="false">No (Descubierta)</option>
                <option value="true">Sí (Techada/Indoor)</option>
             </select>
           </div>

           <div className="space-y-4 pt-4 border-t border-gray-100">
             {/* Precios */}
             <div className="space-y-1.5">
                 <Label>Precio Normal (ARS)</Label>
                 <Input 
                   type="number"
                   {...form.register("price", { valueAsNumber: true })} 
                   placeholder="Ej: 30000"
                 />
                 <p className="text-xs text-gray-500 mt-1">Precio por turno base (Lunes a Viernes)</p>
                 {form.formState.errors.price && <p className="text-xs text-red-500">{form.formState.errors.price.message}</p>}
             </div>

             <div className="space-y-1.5 pt-2">
                 <Label>Precio Fin de Semana (Opcional)</Label>
                 <Input 
                   type="number"
                   onChange={(e) => {
                      const val = e.target.value;
                      form.setValue("priceWeekend", val === "" ? null : Number(val));
                   }}
                   value={form.watch("priceWeekend") || ""}
                   placeholder="Ej: 40000"
                 />
                 <p className="text-xs text-gray-500 mt-1">Precio aplicado automáticamente para Sábados y Domingos. Dejar vacío si es el mismo precio.</p>
             </div>
           </div>

           <Button type="submit" className="w-full mt-4 h-11" disabled={isPending}>
              {isPending ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Guardar Cancha"}
           </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
