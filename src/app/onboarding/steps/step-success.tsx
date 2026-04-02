"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PartyPopper, ExternalLink, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { completeOnboarding } from "@/actions/onboarding-actions";

interface StepSuccessProps {
  complexSlug: string;
  complexName: string;
}

export function StepSuccess({ complexSlug, complexName }: StepSuccessProps) {
  const router = useRouter();
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleComplete() {
    setCompleting(true);
    setError(null);

    const result = await completeOnboarding();

    if (result.success) {
      router.push("/dashboard");
    } else {
      setCompleting(false);
      setError(result.error);
    }
  }

  const publicUrl = `/${complexSlug}`;

  return (
    <div className="space-y-8 py-4 text-center">
      <div className="flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-primary/10">
          <PartyPopper className="h-10 w-10 text-green-primary" />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-navy">
          ¡TurnoGol está listo! 🎉
        </h2>
        <p className="text-gray-500">
          <strong>{complexName}</strong> ya está configurado.
          <br />
          Tus clientes pueden reservar desde tu página pública.
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="text-sm text-gray-500">Tu página pública:</p>
        <a
          href={publicUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-green-primary hover:text-green-dark"
        >
          turnogol.com{publicUrl}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <Button
        onClick={handleComplete}
        disabled={completing}
        className="w-full"
        size="lg"
      >
        {completing ? (
          <Loader2 className="animate-spin" />
        ) : (
          <LayoutGrid className="h-4 w-4" />
        )}
        Ir a la grilla
      </Button>
    </div>
  );
}
