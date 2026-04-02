import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthComplex } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { OnboardingWizard } from "./onboarding-wizard";

export const metadata: Metadata = {
  title: "TurnoGol — Configurar complejo",
  description: "Configurá tu complejo paso a paso",
};

export default async function OnboardingPage() {
  const complex = await getAuthComplex();

  if (!complex) {
    redirect("/login");
  }

  if (complex.onboardingComplete) {
    redirect("/dashboard");
  }

  const courts = await prisma.court.findMany({
    where: { complexId: complex.id, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      playerCount: true,
      surface: true,
      isRoofed: true,
      price: true,
      priceWeekend: true,
    },
  });

  return (
    <div className="min-h-dvh bg-gray-50">
      <OnboardingWizard
        complex={{
          name: complex.name,
          slug: complex.slug,
          address: complex.address,
          phone: complex.phone,
          openTime: complex.openTime,
          closeTime: complex.closeTime,
          logoUrl: complex.logoUrl,
          slotStartMinute: complex.slotStartMinute,
          depositEnabled: complex.depositEnabled,
          depositType: complex.depositType,
          depositValue: complex.depositValue,
          transferAlias: complex.transferAlias,
          transferCbu: complex.transferCbu,
          cancellationPolicy: complex.cancellationPolicy,
          cancellationHours: complex.cancellationHours,
          onboardingStep: complex.onboardingStep,
        }}
        courts={courts}
      />
    </div>
  );
}
