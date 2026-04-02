"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Link from "next/link";
import { Loader2, Store, CreditCard, CalendarClock, MessageCircle, Lock, ShieldCheck, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

import { PinGuard } from "@/components/guards/pin-guard";
import { 
  updateGeneralInfoAction, 
  updateFinancialsAction, 
  updateBookingRulesAction, 
  updateWhatsappTemplatesAction, 
  updatePinAction 
} from "@/actions/settings-actions";

type TabValue = "general" | "financials" | "booking" | "whatsapp" | "security";

export function SettingsView({ complex }: { complex: any }) {
  const [activeTab, setActiveTab] = useState<TabValue>("general");

  return (
    <div className="flex flex-col md:flex-row gap-6">
       {/* Sidebar Desktop // Tabs Mobile */}
       <div className="w-full md:w-64 flex flex-row md:flex-col gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar bg-white p-3 rounded-xl border border-gray-200">
          <TabButton id="general" label="Mi Complejo" icon={Store} active={activeTab} onClick={setActiveTab} />
          <TabButton id="financials" label="Señas y Pagos" icon={CreditCard} active={activeTab} onClick={setActiveTab} />
          <TabButton id="booking" label="Reservas" icon={CalendarClock} active={activeTab} onClick={setActiveTab} />
          <TabButton id="whatsapp" label="WhatsApp" icon={MessageCircle} active={activeTab} onClick={setActiveTab} />
          <TabButton id="security" label="Seguridad y PIN" icon={Lock} active={activeTab} onClick={setActiveTab} />
          
          <div className="hidden md:block my-2 border-t border-gray-100"></div>

          <Link href="/settings/subscription" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors">
            <ShieldCheck className="w-5 h-5 flex-shrink-0" />
            Suscripción SaaS
          </Link>
       </div>

       {/* Content Area */}
       <div className="flex-1 bg-white p-6 rounded-xl border border-gray-200 shadow-sm min-h-[500px]">
          {activeTab === "general" && <GeneralInfoForm complex={complex} />}
          {activeTab === "financials" && (
             <PinGuard>
                <FinancialsForm complex={complex} />
             </PinGuard>
          )}
          {activeTab === "booking" && <BookingRulesForm complex={complex} />}
          {activeTab === "whatsapp" && <WhatsappTemplatesForm complex={complex} />}
          {activeTab === "security" && <SecurityForm />}
       </div>
    </div>
  );
}

function TabButton({ id, label, icon: Icon, active, onClick }: { id: TabValue, label: string, icon: any, active: TabValue, onClick: (v: TabValue) => void }) {
  const isActive = active === id;
  return (
    <button
      onClick={() => onClick(id)}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
        ${isActive ? "bg-green-primary text-white shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-navy"}
      `}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-green-200" : "text-gray-400"}`} />
      {label}
    </button>
  );
}

// -----------------------------------------------------
// 1. General Info Form
// -----------------------------------------------------
function GeneralInfoForm({ complex }: { complex: any }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(complex.name || "");
  const [phone, setPhone] = useState(complex.phone || "");
  const [address, setAddress] = useState(complex.address || "");
  const [openTime, setOpenTime] = useState(complex.openTime || "14:00");
  const [closeTime, setCloseTime] = useState(complex.closeTime || "00:00");

  const onSubmit = () => {
     startTransition(async () => {
        const res = await updateGeneralInfoAction({ name, phone, address, openTime, closeTime });
        if (res.success) toast.success("Configuración guardada");
        else toast.error(res.error);
     });
  };

  return (
     <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-navy mb-1">Mi Complejo</h2>
         <p className="text-sm text-gray-500">Información pública que ven tus clientes.</p>
       </div>

       <div className="grid gap-5 max-w-xl">
         <div className="space-y-2">
           <Label>Nombre del Complejo</Label>
           <Input value={name} onChange={(e) => setName(e.target.value)} />
         </div>
         <div className="space-y-2">
           <Label>Teléfono de Contacto</Label>
           <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
         </div>
         <div className="space-y-2">
           <Label>Dirección</Label>
           <Input value={address} onChange={(e) => setAddress(e.target.value)} />
         </div>

         <div className="grid grid-cols-2 gap-4 border-t border-gray-100 pt-5">
           <div className="space-y-2">
             <Label>Horario de Apertura</Label>
             <Input type="time" value={openTime} onChange={(e) => setOpenTime(e.target.value)} />
           </div>
           <div className="space-y-2">
             <Label>Horario de Cierre</Label>
             <Input type="time" value={closeTime} onChange={(e) => setCloseTime(e.target.value)} />
           </div>
         </div>

         <Button disabled={isPending} onClick={onSubmit} className="w-full mt-4">
           {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar Cambios
         </Button>
       </div>
     </div>
  );
}

// -----------------------------------------------------
// 2. Financials Form (Behind PIN)
// -----------------------------------------------------
function FinancialsForm({ complex }: { complex: any }) {
  const [isPending, startTransition] = useTransition();
  const [depositEnabled, setDepositEnabled] = useState(complex.depositEnabled || false);
  const [depositType, setDepositType] = useState(complex.depositType || "percentage");
  const [depositValue, setDepositValue] = useState(complex.depositValue?.toString() || "");
  const [transferAlias, setTransferAlias] = useState(complex.transferAlias || "");
  const [transferCbu, setTransferCbu] = useState(complex.transferCbu || "");

  const onSubmit = () => {
     startTransition(async () => {
        const val = parseInt(depositValue);
        const res = await updateFinancialsAction({ 
          depositEnabled, 
          depositType, 
          depositValue: isNaN(val) ? null : val,
          transferAlias,
          transferCbu
        });
        if (res.success) toast.success("Preferencias financieras actualizadas");
        else toast.error(res.error);
     });
  };

  return (
     <div className="space-y-6">
       <div className="flex justify-between items-start">
         <div>
           <h2 className="text-xl font-bold text-navy mb-1">Señas y Pagos</h2>
           <p className="text-sm text-gray-500">Configurá cómo te pagan tus clientes.</p>
         </div>
         <Link href="/settings/mercadopago" className="text-sm px-4 py-2 bg-blue-50 text-blue-700 font-medium rounded-md hover:bg-blue-100 flex items-center gap-2">
            Ver conexión MercadoPago
         </Link>
       </div>

       <div className="bg-gray-50 p-4 border border-gray-100 rounded-xl space-y-4 max-w-2xl">
         <div className="flex items-center justify-between">
            <div>
               <p className="font-semibold text-navy mb-1">Cobro de Señas</p>
               <p className="text-xs text-gray-500">Requerir seña obligatoria para reservas online.</p>
            </div>
            <Switch checked={depositEnabled} onCheckedChange={setDepositEnabled} />
         </div>

         {depositEnabled && (
           <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200">
              <div className="space-y-2">
                 <Label>Tipo de seña</Label>
                 <select 
                   value={depositType} 
                   onChange={(e) => setDepositType(e.target.value)} 
                   className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                 >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <Label>Valor</Label>
                 <Input type="number" value={depositValue} onChange={(e) => setDepositValue(e.target.value)} placeholder="Ej: 30" />
              </div>
           </div>
         )}
       </div>

       <div className="max-w-2xl space-y-4">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Datos para transferencia</h3>
          <p className="text-sm text-gray-500 mb-4">Si no tenés MercadoPago, mostramos estos datos para que el cliente transfiera.</p>
          
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
               <Label>Alias</Label>
               <Input value={transferAlias} onChange={(e) => setTransferAlias(e.target.value)} placeholder="Ej: CANCHAS.GOL" />
             </div>
             <div className="space-y-2">
               <Label>CBU / CVU</Label>
               <Input value={transferCbu} onChange={(e) => setTransferCbu(e.target.value)} />
             </div>
          </div>
       </div>

       <Button disabled={isPending} onClick={onSubmit} className="max-w-xs mt-4">
         {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar
       </Button>
     </div>
  );
}

// -----------------------------------------------------
// 3. Booking Rules Form
// -----------------------------------------------------
function BookingRulesForm({ complex }: { complex: any }) {
  const [isPending, startTransition] = useTransition();
  const [maxAdvanceDays, setMaxAdvanceDays] = useState(complex.maxAdvanceDays?.toString() || "7");
  const [cancellationPolicy, setCancellationPolicy] = useState(complex.cancellationPolicy || "lose");
  const [cancellationHours, setCancellationHours] = useState(complex.cancellationHours?.toString() || "24");

  const onSubmit = () => {
     startTransition(async () => {
        const adv = parseInt(maxAdvanceDays);
        const hrs = parseInt(cancellationHours);
        const res = await updateBookingRulesAction({ 
          maxAdvanceDays: isNaN(adv) ? 7 : adv, 
          cancellationPolicy: cancellationPolicy as any, 
          cancellationHours: isNaN(hrs) ? null : hrs
        });
        if (res.success) toast.success("Reglas de reserva guardadas");
        else toast.error(res.error);
     });
  };

  return (
     <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-navy mb-1">Reglas de Reserva</h2>
         <p className="text-sm text-gray-500">Límites para los turnos online.</p>
       </div>

       <div className="grid gap-6 max-w-2xl">
         <div className="space-y-2">
           <Label>Anticipación Máxima (Días)</Label>
           <select 
             value={maxAdvanceDays} 
             onChange={(e) => setMaxAdvanceDays(e.target.value)} 
             className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
           >
              <option value="3">3 días</option>
              <option value="5">5 días</option>
              <option value="7">7 días</option>
              <option value="10">10 días</option>
              <option value="14">14 días</option>
              <option value="30">30 días</option>
           </select>
           <p className="text-xs text-gray-500">Hasta cuántos días en el futuro pueden ver y reservar los clientes.</p>
         </div>

         <div className="bg-orange-50 p-3 rounded-lg border border-orange-100 flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-orange-400 mt-0.5" />
            <div>
               <p className="font-semibold text-orange-900 text-sm">Bloques y Minuto de Inicio</p>
               <p className="text-xs text-orange-800 mt-1">
                 Actualmente, tus turnos inician a los <strong>{complex.slotStartMinute} minutos</strong> de la hora. Para cambiar esto, contactá a soporte técnico ya que afecta la re-estructuración de la base de datos.
               </p>
            </div>
         </div>

         <div className="space-y-4 pt-4 border-t border-gray-100">
           <Label className="text-base text-navy">Política de Cancelación</Label>
           <div className="grid gap-3">
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                 <input type="radio" checked={cancellationPolicy === "loose"} onChange={() => setCancellationPolicy("loose")} />
                 <div>
                    <span className="font-medium text-sm">Flexible</span>
                    <p className="text-xs text-gray-500 mt-0.5">Se devuelve la seña si avisan con anticipación.</p>
                 </div>
              </label>
              <label className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                 <input type="radio" checked={cancellationPolicy === "strict"} onChange={() => setCancellationPolicy("strict")} />
                 <div>
                    <span className="font-medium text-sm">Estricta</span>
                    <p className="text-xs text-gray-500 mt-0.5">No hay cancelación. Las señas no son reembolsables bajo ningún caso.</p>
                 </div>
              </label>
           </div>
         </div>

         {cancellationPolicy === "loose" && (
           <div className="space-y-2 bg-gray-50 p-4 border rounded-md">
             <Label>Límite de cancelación (Horas antes)</Label>
             <Input type="number" value={cancellationHours} onChange={(e) => setCancellationHours(e.target.value)} />
             <p className="text-xs text-gray-500">¿Cuántas horas antes del turno pueden cancelar para mantener la seña?</p>
           </div>
         )}
         
         <Button disabled={isPending} onClick={onSubmit} className="max-w-xs mt-4">
           {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar Reglas
         </Button>
       </div>
     </div>
  );
}

// -----------------------------------------------------
// 4. Whatsapp Templates Form
// -----------------------------------------------------
const DEFAULT_CONFIRMATION = "¡Hola {{customerName}}! Confirmamos tu turno en {{complexName}} para jugar el {{date}} a las {{time}} hs en la {{courtName}}.\nTe esperamos!";
const DEFAULT_DEPOSIT = "El precio del turno es de ${{totalPrice}}. Para asegurar tu plaza, te pedimos una seña de ${{depositAmount}} mediante transferencia a nuestro Alias.";
const DEFAULT_REMINDER = "¡Hola {{customerName}}! Te recordamos que hoy tenés turno en {{complexName}} a las {{time}} hs en la {{courtName}}.\n¡Llegá 10 minutitos antes!";
const DEFAULT_CANCELLATION = "Hola {{customerName}}, te avisamos que se canceló el turno para el {{date}} a las {{time}}.\nContactanos por cualquier consulta.";

function WhatsappTemplatesForm({ complex }: { complex: any }) {
  const [isPending, startTransition] = useTransition();
  const [wafc, setWafc] = useState(complex.waTemplateConfirmation || DEFAULT_CONFIRMATION);
  const [wafd, setWafd] = useState(complex.waTemplateDeposit || DEFAULT_DEPOSIT);
  const [wafr, setWafr] = useState(complex.waTemplateReminder || DEFAULT_REMINDER);
  const [wafx, setWafx] = useState(complex.waTemplateCancellation || DEFAULT_CANCELLATION);

  const onSubmit = () => {
     startTransition(async () => {
        const res = await updateWhatsappTemplatesAction({ 
          waTemplateConfirmation: wafc, 
          waTemplateDeposit: wafd, 
          waTemplateReminder: wafr, 
          waTemplateCancellation: wafx 
        });
        if (res.success) toast.success("Plantillas de WhatsApp actualizadas");
        else toast.error(res.error);
     });
  };

  return (
     <div className="space-y-6">
       <div>
         <h2 className="text-xl font-bold text-navy mb-1">Mensajes de WhatsApp</h2>
         <p className="text-sm text-gray-500">
            Plantillas para los mensajes que podés enviar con 1 click. <br/>
            Variables disponibles: <code className="bg-gray-100 text-xs px-1 rounded">{`{{customerName}}, {{complexName}}, {{courtName}}, {{date}}, {{time}}`}</code>
         </p>
       </div>

       <div className="grid gap-8 max-w-3xl">
          <TemplateBox 
            title="✅ Confirmación de Turno" 
            value={wafc} 
            onChange={setWafc} 
            defaultText={DEFAULT_CONFIRMATION} 
          />
          <TemplateBox 
            title="💳 Pedido de Seña" 
            value={wafd} 
            onChange={setWafd} 
            defaultText={DEFAULT_DEPOSIT} 
          />
          <TemplateBox 
            title="⌚ Recordatorio de Turno" 
            value={wafr} 
            onChange={setWafr} 
            defaultText={DEFAULT_REMINDER} 
          />
          <TemplateBox 
            title="❌ Cancelación" 
            value={wafx} 
            onChange={setWafx} 
            defaultText={DEFAULT_CANCELLATION} 
          />
         
         <Button disabled={isPending} onClick={onSubmit} className="max-w-xs mt-4">
           {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Guardar Mensajes
         </Button>
       </div>
     </div>
  );
}

function TemplateBox({ title, value, onChange, defaultText }: { title: string, value: string, onChange: (v: string) => void, defaultText: string }) {
   return (
      <div className="relative border border-gray-200 rounded-lg p-1 bg-gray-50">
         <div className="flex justify-between items-center px-3 py-2 bg-white rounded-t-md border-b border-gray-100">
            <span className="text-sm font-bold text-gray-700">{title}</span>
            <button onClick={() => onChange(defaultText)} className="text-xs text-blue-600 hover:underline">Restaurar default</button>
         </div>
         <Textarea 
            value={value} 
            onChange={(e: any) => onChange(e.target.value)} 
            className="min-h-[100px] border-0 focus-visible:ring-0 bg-transparent text-sm resize-y" 
         />
      </div>
   );
}


// -----------------------------------------------------
// 5. Security & PIN Form
// -----------------------------------------------------
function SecurityForm() {
   const [isPending, startTransition] = useTransition();
   const [currentPin, setCurrentPin] = useState("");
   const [newPin, setNewPin] = useState("");
   const [confirmPin, setConfirmPin] = useState("");

   const onSubmit = () => {
      if (currentPin.length !== 4 || newPin.length !== 4) {
         toast.error("Los PINs deben tener exactamente 4 dígitos");
         return;
      }
      if (newPin !== confirmPin) {
         toast.error("El nuevo PIN y su confirmación no coinciden");
         return;
      }

      startTransition(async () => {
         const res = await updatePinAction({ currentPin, newPin });
         if (res.success) {
            toast.success("PIN actualizado exitosamente");
            setCurrentPin("");
            setNewPin("");
            setConfirmPin("");
         } else {
            toast.error(res.error);
         }
      });
   };

   return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-navy mb-1">Seguridad del Sistema</h2>
          <p className="text-sm text-gray-500">Modificá el PIN de gestión administrativa (Bóveda y Reportes).</p>
        </div>

        <div className="grid gap-5 max-w-sm">
           <div className="space-y-2 relative">
             <Label>PIN Actual</Label>
             <Input 
               type="password" 
               inputMode="numeric" 
               maxLength={4} 
               value={currentPin} 
               onChange={(e) => setCurrentPin(e.target.value.replace(/\D/g, ''))} 
               className="text-center text-lg tracking-[0.5em] font-mono"
             />
           </div>
           
           <div className="space-y-2 pt-4 border-t border-gray-100">
             <Label>Nuevo PIN (4 dígitos)</Label>
             <Input 
               type="password" 
               inputMode="numeric" 
               maxLength={4} 
               value={newPin} 
               onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))} 
               className="text-center text-lg tracking-[0.5em] font-mono border-blue-200 focus-visible:ring-blue-500"
             />
           </div>

           <div className="space-y-2">
             <Label>Confirmar Nuevo PIN</Label>
             <Input 
               type="password" 
               inputMode="numeric" 
               maxLength={4} 
               value={confirmPin} 
               onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))} 
               className="text-center text-lg tracking-[0.5em] font-mono border-blue-200 focus-visible:ring-blue-500"
             />
           </div>

           <Button disabled={isPending} onClick={onSubmit} variant="default" className="w-full mt-4">
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />} Cambiar PIN
           </Button>
        </div>
      </div>
   );
}
