import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthComplex } from "@/lib/supabase/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { MobileNav } from "@/components/dashboard/mobile-nav";
import { MobileHeader } from "@/components/dashboard/mobile-header";
import { SubscriptionBanner } from "@/components/dashboard/subscription-banner";
import { Lock } from "lucide-react";
import { UI_TEXTS } from "@/lib/constants/ui-texts";

export const metadata: Metadata = {
  title: "TurnoGol — Dashboard",
};

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const complex = await getAuthComplex();

  if (!complex) {
    redirect("/login");
  }

  if (!complex.onboardingComplete) {
    redirect("/onboarding");
  }

  const isBlocked = complex.subscriptionStatus === "blocked";

  return (
    <div className="min-h-dvh bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar complexName={complex.name} />
      </div>

      {/* Mobile Top Header */}
      <MobileHeader complexName={complex.name} />

      {/* Main Content Area */}
      <div className="flex flex-col lg:pl-64">
        <SubscriptionBanner
          status={complex.subscriptionStatus}
          plan={complex.subscriptionPlan}
          trialEndsAt={complex.trialEndsAt}
        />

        {isBlocked ? (
          <main className="flex min-h-[calc(100dvh-4rem)] items-center justify-center p-6 lg:min-h-dvh lg:p-8">
            <div className="max-w-md space-y-4 rounded-xl border border-red-200 bg-red-50 p-8 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <Lock className="h-8 w-8 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-red-900">
                Cuenta bloqueada
              </h2>
              <p className="text-sm text-red-700">
                {UI_TEXTS.subscription.blocked_banner}
              </p>
            </div>
          </main>
        ) : (
          <main className="min-h-[calc(100dvh-8rem)] p-4 pb-24 lg:min-h-dvh lg:p-8 lg:pb-8">
            {children}
          </main>
        )}
      </div>

      {/* Mobile Bottom Navigation */}
      {!isBlocked && <MobileNav />}
    </div>
  );
}
