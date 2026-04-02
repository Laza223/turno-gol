import { SettingsView } from "@/components/dashboard/settings/settings-view";
import { SettingsService } from "@/lib/services/settings-service";
import { getAuthComplex } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getAuthComplex();
  if (!session || !session.id) {
    redirect("/login");
  }

  const complex = await SettingsService.getComplexSettings(session.id);
  if (!complex) {
    redirect("/login");
  }

  return (
    <div className="max-w-4xl mx-auto py-6">
      <h1 className="text-2xl font-bold text-navy mb-6">
        Ajustes del Complejo
      </h1>
      <SettingsView complex={complex as any} />
    </div>
  );
}
