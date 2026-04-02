"use client";

import { useState } from "react";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveOnboardingSchedule } from "@/actions/onboarding-actions";

interface StepScheduleProps {
  defaultValue: number;
  onNext: () => void;
  onBack: () => void;
}

export function StepSchedule({ defaultValue, onNext, onBack }: StepScheduleProps) {
  const [value, setValue] = useState(String(defaultValue));
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    setSaving(true);
    setServerError(null);
    const result = await saveOnboardingSchedule({ slotStartMinute: Number(value) as 0 | 15 | 30 });
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
        <h2 className="text-lg font-semibold text-navy">Horarios</h2>
        <p className="text-sm text-gray-500">
          ¿A qué minuto arrancan tus turnos?
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      <RadioGroup
        value={value}
        onValueChange={setValue}
        className="space-y-3"
      >
        <label
          htmlFor="slot-00"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
        >
          <RadioGroupItem value="0" id="slot-00" />
          <div>
            <p className="font-medium text-navy">En punto (:00)</p>
            <p className="text-sm text-gray-500">
              14:00, 15:00, 16:00...
            </p>
          </div>
        </label>

        <label
          htmlFor="slot-15"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
        >
          <RadioGroupItem value="15" id="slot-15" />
          <div>
            <p className="font-medium text-navy">Y cuarto (:15)</p>
            <p className="text-sm text-gray-500">
              14:15, 15:15, 16:15...
            </p>
          </div>
        </label>

        <label
          htmlFor="slot-30"
          className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
        >
          <RadioGroupItem value="30" id="slot-30" />
          <div>
            <p className="font-medium text-navy">Y media (:30)</p>
            <p className="text-sm text-gray-500">
              14:30, 15:30, 16:30...
            </p>
          </div>
        </label>
      </RadioGroup>

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
