"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ChevronLeft, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  onboardingPinSchema,
  type OnboardingPinSchema,
} from "@/lib/validations/complex";
import { saveOnboardingPin } from "@/actions/onboarding-actions";

interface StepPinProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepPin({ onNext, onBack }: StepPinProps) {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OnboardingPinSchema>({
    resolver: zodResolver(onboardingPinSchema),
  });

  async function onSubmit(data: OnboardingPinSchema) {
    setServerError(null);
    const result = await saveOnboardingPin(data);

    if (result.success) {
      onNext();
    } else {
      setServerError(result.error);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-navy">PIN de gestión</h2>
        <p className="text-sm text-gray-500">
          Creá un PIN para proteger los reportes, precios y configuración.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      <div className="mx-auto flex max-w-[240px] flex-col items-center gap-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-primary/10">
          <Lock className="h-8 w-8 text-green-primary" />
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="pin">PIN (4-6 dígitos)</Label>
          <Input
            id="pin"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            {...register("pin")}
            aria-invalid={!!errors.pin}
            autoFocus
          />
          {errors.pin && (
            <p className="text-center text-sm text-red-500">
              {errors.pin.message}
            </p>
          )}
        </div>

        <div className="w-full space-y-2">
          <Label htmlFor="pinConfirmation">Confirmá el PIN</Label>
          <Input
            id="pinConfirmation"
            type="password"
            inputMode="numeric"
            placeholder="••••"
            maxLength={6}
            className="text-center text-lg tracking-widest"
            {...register("pinConfirmation")}
            aria-invalid={!!errors.pinConfirmation}
          />
          {errors.pinConfirmation && (
            <p className="text-center text-sm text-red-500">
              {errors.pinConfirmation.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          className="flex-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="flex-1"
          size="lg"
        >
          {isSubmitting && <Loader2 className="animate-spin" />}
          Siguiente
        </Button>
      </div>
    </form>
  );
}
