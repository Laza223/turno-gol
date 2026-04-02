"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import {
  createCourtSchema,
  type CreateCourtSchema,
} from "@/lib/validations/court";
import { addCourt, deleteCourt, saveCourtsStep } from "@/actions/onboarding-actions";
import { formatARS } from "@/lib/utils/currency";
import { COURT_SURFACES } from "@/lib/types";

interface CourtItem {
  id: string;
  name: string;
  playerCount: number;
  surface: string;
  isRoofed: boolean;
  price: number;
  priceWeekend: number | null;
}

interface StepCourtsProps {
  initialCourts: CourtItem[];
  onNext: () => void;
  onBack: () => void;
}

export function StepCourts({ initialCourts, onNext, onBack }: StepCourtsProps) {
  const [courts, setCourts] = useState<CourtItem[]>(initialCourts);
  const [showForm, setShowForm] = useState(initialCourts.length === 0);
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [showWeekendPrice, setShowWeekendPrice] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<z.input<typeof createCourtSchema>>({
    resolver: zodResolver(createCourtSchema),
    defaultValues: {
      name: "",
      playerCount: 5,
      surface: "sintetico",
      isRoofed: false,
      price: 0,
      priceWeekend: null,
    },
  });

  const surface = watch("surface");
  const isRoofed = watch("isRoofed");
  const playerCount = watch("playerCount");

  async function onAddCourt(data: z.input<typeof createCourtSchema>) {
    setServerError(null);
    const courtData: CreateCourtSchema = {
      ...data,
      isRoofed: data.isRoofed ?? false,
      priceWeekend: showWeekendPrice ? (data.priceWeekend ?? null) : null,
    };

    const result = await addCourt(courtData);

    if (result.success) {
      setCourts((prev) => [
        ...prev,
        { id: result.data.id, ...courtData },
      ]);
      reset();
      setShowWeekendPrice(false);
      setShowForm(false);
    } else {
      setServerError(result.error);
    }
  }

  async function onDeleteCourt(courtId: string) {
    const result = await deleteCourt(courtId);
    if (result.success) {
      setCourts((prev) => prev.filter((c) => c.id !== courtId));
    }
  }

  async function handleNext() {
    setSaving(true);
    setServerError(null);
    const result = await saveCourtsStep();
    setSaving(false);

    if (result.success) {
      onNext();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy">Canchas</h2>
        <p className="text-sm text-gray-500">
          Agregá las canchas de tu complejo. Mínimo 1 para continuar.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      {/* Lista de canchas agregadas */}
      {courts.length > 0 && (
        <div className="space-y-2">
          {courts.map((court) => (
            <div
              key={court.id}
              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
            >
              <div>
                <p className="font-medium text-navy">{court.name}</p>
                <p className="text-sm text-gray-500">
                  Fútbol {court.playerCount} · {COURT_SURFACES[court.surface as keyof typeof COURT_SURFACES] ?? court.surface}
                  {court.isRoofed && " · Techada"}
                  {" · "}
                  {formatARS(court.price)}
                  {court.priceWeekend && ` (finde ${formatARS(court.priceWeekend)})`}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => onDeleteCourt(court.id)}
                aria-label={`Eliminar ${court.name}`}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Formulario de nueva cancha */}
      {showForm ? (
        <form
          onSubmit={handleSubmit(onAddCourt)}
          className="space-y-4 rounded-lg border border-green-primary/20 bg-green-primary/[0.03] p-4"
        >
          <p className="text-sm font-medium text-green-dark">Nueva cancha</p>

          <div className="space-y-2">
            <Label htmlFor="court-name">Nombre</Label>
            <Input
              id="court-name"
              placeholder="Ej: Cancha 1"
              {...register("name")}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="court-players">Jugadores</Label>
              <Select
                value={String(playerCount)}
                onValueChange={(val) => setValue("playerCount", Number(val))}
              >
                <SelectTrigger id="court-players">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 6, 7, 8, 9, 10, 11].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      Fútbol {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="court-surface">Superficie</Label>
              <Select
                value={surface}
                onValueChange={(val) => setValue("surface", val as "sintetico" | "natural" | "cemento")}
              >
                <SelectTrigger id="court-surface">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(COURT_SURFACES).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="court-roofed"
              checked={isRoofed}
              onCheckedChange={(val) => setValue("isRoofed", val)}
            />
            <Label htmlFor="court-roofed">Techada</Label>
          </div>

          <div className="space-y-2">
            <Label htmlFor="court-price">Precio (pesos)</Label>
            <Input
              id="court-price"
              type="number"
              placeholder="Ej: 25000"
              {...register("price", { valueAsNumber: true })}
              aria-invalid={!!errors.price}
            />
            {errors.price && (
              <p className="text-sm text-red-500">{errors.price.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="weekend-toggle"
              checked={showWeekendPrice}
              onCheckedChange={setShowWeekendPrice}
            />
            <Label htmlFor="weekend-toggle">
              ¿Precio diferente fines de semana?
            </Label>
          </div>

          {showWeekendPrice && (
            <div className="space-y-2">
              <Label htmlFor="court-price-weekend">Precio fin de semana</Label>
              <Input
                id="court-price-weekend"
                type="number"
                placeholder="Ej: 32000"
                {...register("priceWeekend", { valueAsNumber: true })}
                aria-invalid={!!errors.priceWeekend}
              />
              {errors.priceWeekend && (
                <p className="text-sm text-red-500">
                  {errors.priceWeekend.message}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowForm(false);
                reset();
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="animate-spin" />}
              Agregar
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="outline"
          className="w-full border-dashed"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-4 w-4" />
          Agregar cancha
        </Button>
      )}

      {/* Navegación */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={courts.length === 0 || saving}
          className="flex-1"
          size="lg"
        >
          {saving && <Loader2 className="animate-spin" />}
          Siguiente
        </Button>
      </div>
    </div>
  );
}
