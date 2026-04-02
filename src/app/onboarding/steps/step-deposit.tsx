"use client";

import { useState } from "react";
import { Loader2, ChevronLeft, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { saveOnboardingDeposit } from "@/actions/onboarding-actions";

interface StepDepositProps {
  defaultValues: {
    depositEnabled: boolean;
    depositType: string | null;
    depositValue: number | null;
    transferAlias: string | null;
    transferCbu: string | null;
  };
  onNext: () => void;
  onBack: () => void;
}

export function StepDeposit({ defaultValues, onNext, onBack }: StepDepositProps) {
  const [enabled, setEnabled] = useState(defaultValues.depositEnabled);
  const [depositType, setDepositType] = useState<"percentage" | "fixed">(
    (defaultValues.depositType as "percentage" | "fixed") ?? "percentage"
  );
  const [depositValue, setDepositValue] = useState(
    defaultValues.depositValue?.toString() ?? ""
  );
  const [transferAlias, setTransferAlias] = useState(
    defaultValues.transferAlias ?? ""
  );
  const [transferCbu, setTransferCbu] = useState(
    defaultValues.transferCbu ?? ""
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleNext() {
    setSaving(true);
    setServerError(null);

    const result = await saveOnboardingDeposit({
      depositEnabled: enabled,
      depositType: enabled ? depositType : null,
      depositValue: enabled ? Number(depositValue) || null : null,
      transferAlias: transferAlias || null,
      transferCbu: transferCbu || null,
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
        <h2 className="text-lg font-semibold text-navy">Señas</h2>
        <p className="text-sm text-gray-500">
          Configurá si cobrás seña para confirmar los turnos.
        </p>
      </div>

      {serverError && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-500" role="alert">
          {serverError}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Switch
          id="deposit-enabled"
          checked={enabled}
          onCheckedChange={setEnabled}
        />
        <Label htmlFor="deposit-enabled" className="font-medium">
          ¿Cobrás seña?
        </Label>
      </div>

      {enabled && (
        <div className="space-y-4 rounded-lg border border-gray-200 p-4">
          <RadioGroup
            value={depositType}
            onValueChange={(val) => setDepositType(val as "percentage" | "fixed")}
            className="space-y-2"
          >
            <label
              htmlFor="deposit-percentage"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
            >
              <RadioGroupItem value="percentage" id="deposit-percentage" />
              <span className="text-sm font-medium">Porcentaje del turno</span>
            </label>

            <label
              htmlFor="deposit-fixed"
              className="flex cursor-pointer items-center gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:bg-gray-50 has-[button[data-state='checked']]:border-green-primary has-[button[data-state='checked']]:bg-green-primary/5"
            >
              <RadioGroupItem value="fixed" id="deposit-fixed" />
              <span className="text-sm font-medium">Monto fijo</span>
            </label>
          </RadioGroup>

          <div className="space-y-2">
            <Label htmlFor="deposit-value">
              {depositType === "percentage" ? "Porcentaje (%)" : "Monto ($)"}
            </Label>
            <Input
              id="deposit-value"
              type="number"
              placeholder={depositType === "percentage" ? "Ej: 30" : "Ej: 8000"}
              value={depositValue}
              onChange={(e) => setDepositValue(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-alias">
              Alias para transferencias (opcional)
            </Label>
            <Input
              id="transfer-alias"
              placeholder="Ej: micancha.futbol"
              value={transferAlias}
              onChange={(e) => setTransferAlias(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transfer-cbu">CBU (opcional)</Label>
            <Input
              id="transfer-cbu"
              placeholder="Ej: 0000003100000000001234"
              value={transferCbu}
              onChange={(e) => setTransferCbu(e.target.value)}
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            disabled
          >
            <CreditCard className="h-4 w-4" />
            Conectar MercadoPago (próximamente)
          </Button>
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
