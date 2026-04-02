"use client";

import { useState } from "react";
import { StepIndicator } from "@/components/onboarding/step-indicator";
import { StepComplex } from "./steps/step-complex";
import { StepCourts } from "./steps/step-courts";
import { StepSchedule } from "./steps/step-schedule";
import { StepDeposit } from "./steps/step-deposit";
import { StepCancellation } from "./steps/step-cancellation";
import { StepPin } from "./steps/step-pin";
import { StepSuccess } from "./steps/step-success";

const TOTAL_STEPS = 7;

interface CourtData {
  id: string;
  name: string;
  playerCount: number;
  surface: string;
  isRoofed: boolean;
  price: number;
  priceWeekend: number | null;
}

interface ComplexData {
  name: string;
  slug: string;
  address: string | null;
  phone: string | null;
  openTime: string;
  closeTime: string;
  logoUrl: string | null;
  slotStartMinute: number;
  depositEnabled: boolean;
  depositType: string | null;
  depositValue: number | null;
  transferAlias: string | null;
  transferCbu: string | null;
  cancellationPolicy: string;
  cancellationHours: number | null;
  onboardingStep: number;
}

interface OnboardingWizardProps {
  complex: ComplexData;
  courts: CourtData[];
}

export function OnboardingWizard({ complex, courts }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(complex.onboardingStep);

  function goNext() {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS - 1));
  }

  function goBack() {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="mx-auto max-w-lg space-y-8 p-6">
      <div className="text-center">
        <h1 className="text-xl font-bold text-navy">TurnoGol ⚽</h1>
      </div>

      <StepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        {currentStep === 0 && (
          <StepComplex
            defaultValues={{
              name: complex.name,
              address: complex.address ?? "",
              phone: complex.phone ?? "",
              openTime: complex.openTime,
              closeTime: complex.closeTime,
              logoUrl: complex.logoUrl,
            }}
            onNext={goNext}
          />
        )}

        {currentStep === 1 && (
          <StepCourts
            initialCourts={courts}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 2 && (
          <StepSchedule
            defaultValue={complex.slotStartMinute}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 3 && (
          <StepDeposit
            defaultValues={{
              depositEnabled: complex.depositEnabled,
              depositType: complex.depositType,
              depositValue: complex.depositValue,
              transferAlias: complex.transferAlias,
              transferCbu: complex.transferCbu,
            }}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 4 && (
          <StepCancellation
            defaultValues={{
              cancellationPolicy: complex.cancellationPolicy,
              cancellationHours: complex.cancellationHours,
            }}
            onNext={goNext}
            onBack={goBack}
          />
        )}

        {currentStep === 5 && (
          <StepPin onNext={goNext} onBack={goBack} />
        )}

        {currentStep === 6 && (
          <StepSuccess
            complexSlug={complex.slug}
            complexName={complex.name}
          />
        )}
      </div>
    </div>
  );
}
