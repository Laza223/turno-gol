"use client";

import { useState } from "react";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveOnboardingCancellation } from "@/actions/onboarding-actions";

interface StepCancellationProps {
  defaultValues: {
    cancellationPolicy: string;
    cancellationHours: number | null;
  };
  onNext: () => void;
  onBack: () => void;
}

export function StepCancellation({
  defaultValues,
  onNext,
  onBack,
}: StepCancellationProps) {
  const [policy, setPolicy] = useState<"lose" | "refund">(
    (defaultValues.cancellationPolicy as "lose" | "refund") ?? "lose"
  );
  const [hours, setHours] = useState(
    defaultValues.cancellationHours?.toString() ?? ""
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    setSaving(true);
    setServerError(null);

    const result = await saveOnboardingCancellation({
      cancellationPolicy: policy,
      cancellationHours: policy === "refund" ? Number(hours) || null : null,
    });

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
        <h2 className="text-lg font-semibold text-navy">
          Política de cancelación
        </h2>
        <p className="text-sm text-gray-500">
          ¿Qué pasa con la seña si el cliente cancela?
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      <RadioGroup
        value={policy}
        onValueChange={(val) => setPolicy(val as "lose" | "refund")}
        className="space-y-3"
      >
        <label
          htmlFor="policy-lose"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
        >
          <RadioGroupItem value="lose" id="policy-lose" />
          <div>
            <p className="font-medium text-navy">La seña se pierde</p>
            <p className="text-sm text-gray-500">
              Si el cliente cancela, la seña no se devuelve.
            </p>
          </div>
        </label>

        <label
          htmlFor="policy-refund"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
        >
          <RadioGroupItem value="refund" id="policy-refund" />
          <div>
            <p className="font-medium text-navy">Se devuelve con anticipación</p>
            <p className="text-sm text-gray-500">
              Se devuelve si cancela con suficiente anticipación.
            </p>
          </div>
        </label>
      </RadioGroup>

      {policy === "refund" && (
        <div className="space-y-2 rounded-lg border border-gray-200 p-4">
          <Label htmlFor="cancellation-hours">
            Horas de anticipación mínimas
          </Label>
          <Input
            id="cancellation-hours"
            type="number"
            placeholder="Ej: 24"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
          <p className="text-xs text-gray-400">
            El cliente debe cancelar al menos esta cantidad de horas antes del turno.
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="flex-1">
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          onClick={handleNext}
          disabled={saving}
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
