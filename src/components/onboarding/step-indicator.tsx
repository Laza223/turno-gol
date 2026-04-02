"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEP_LABELS = [
  "Complejo",
  "Canchas",
  "Horarios",
  "Señas",
  "Cancelación",
  "PIN",
  "¡Listo!",
];

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2" role="navigation" aria-label="Pasos del onboarding">
      {Array.from({ length: totalSteps }, (_, i) => {
        const stepNumber = i + 1;
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const label = STEP_LABELS[i] ?? `Paso ${stepNumber}`;

        return (
          <div key={i} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted &&
                    "bg-green-primary text-white",
                  isCurrent &&
                    "border-2 border-green-primary bg-green-primary/10 text-green-primary",
                  !isCompleted &&
                    !isCurrent &&
                    "border-2 border-gray-200 bg-white text-gray-400"
                )}
                aria-current={isCurrent ? "step" : undefined}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  stepNumber
                )}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] sm:block",
                  isCurrent ? "font-medium text-green-primary" : "text-gray-400"
                )}
              >
                {label}
              </span>
            </div>
            {i < totalSteps - 1 && (
              <div
                className={cn(
                  "mb-4 h-0.5 w-4 sm:w-6",
                  isCompleted ? "bg-green-primary" : "bg-gray-200"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
