"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  onboardingComplexSchema,
  type OnboardingComplexSchema,
} from "@/lib/validations/complex";
import { saveOnboardingComplex, uploadLogo } from "@/actions/onboarding-actions";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return { value: `${h}:00`, label: `${h}:00` };
});

interface StepComplexProps {
  defaultValues: {
    name: string;
    address: string;
    phone: string;
    openTime: string;
    closeTime: string;
    logoUrl: string | null;
  };
  onNext: () => void;
}

export function StepComplex({ defaultValues, onNext }: StepComplexProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(
    defaultValues.logoUrl
  );
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingComplexSchema>({
    resolver: zodResolver(onboardingComplexSchema),
    defaultValues: {
      name: defaultValues.name,
      address: defaultValues.address ?? "",
      phone: defaultValues.phone ?? "",
      openTime: defaultValues.openTime,
      closeTime: defaultValues.closeTime,
    },
  });

  const openTime = watch("openTime");
  const closeTime = watch("closeTime");

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("logo", file);

    const result = await uploadLogo(formData);
    setUploading(false);

    if (result.success) {
      setLogoPreview(result.data);
    } else {
      setServerError(result.error);
    }
  }

  async function onSubmit(data: OnboardingComplexSchema) {
    setServerError(null);
    const result = await saveOnboardingComplex(data);

    if (result.success) {
      onNext();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy">
          Datos del complejo
        </h2>
        <p className="text-sm text-gray-500">
          Completá la información básica de tu complejo.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      {/* Logo */}
      <div className="space-y-2">
        <Label>Logo (opcional)</Label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-200 bg-gray-50">
            {logoPreview ? (
              <img
                src={logoPreview}
                alt="Logo del complejo"
                className="h-full w-full object-cover"
              />
            ) : (
              <ImageIcon className="h-6 w-6 text-gray-300" />
            )}
          </div>
          <label className="cursor-pointer">
            <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50">
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Upload className="h-4 w-4" />
              )}
              {uploading ? "Subiendo..." : "Subir logo"}
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleLogoUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Dirección */}
      <div className="space-y-2">
        <Label htmlFor="address">Dirección</Label>
        <Input
          id="address"
          placeholder="Ej: Av. Rivadavia 4500, CABA"
          {...register("address")}
          aria-invalid={!!errors.address}
        />
        {errors.address && (
          <p className="text-sm text-red-500">{errors.address.message}</p>
        )}
      </div>

      {/* Teléfono */}
      <div className="space-y-2">
        <Label htmlFor="phone">Teléfono (WhatsApp)</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Ej: 11 1234-5678"
          {...register("phone")}
          aria-invalid={!!errors.phone}
        />
        {errors.phone && (
          <p className="text-sm text-red-500">{errors.phone.message}</p>
        )}
      </div>

      {/* Horario */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="openTime">Abre</Label>
          <Select
            value={openTime}
            onValueChange={(val) => setValue("openTime", val)}
          >
            <SelectTrigger id="openTime">
              <SelectValue placeholder="Apertura" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={`open-${h.value}`} value={h.value}>
                  {h.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.openTime && (
            <p className="text-sm text-red-500">{errors.openTime.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="closeTime">Cierra</Label>
          <Select
            value={closeTime}
            onValueChange={(val) => setValue("closeTime", val)}
          >
            <SelectTrigger id="closeTime">
              <SelectValue placeholder="Cierre" />
            </SelectTrigger>
            <SelectContent>
              {HOURS.map((h) => (
                <SelectItem key={`close-${h.value}`} value={h.value}>
                  {h.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.closeTime && (
            <p className="text-sm text-red-500">{errors.closeTime.message}</p>
          )}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting && <Loader2 className="animate-spin" />}
        Siguiente
      </Button>
    </form>
  );
}
