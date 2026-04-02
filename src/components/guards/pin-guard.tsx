"use client";

import { useState, useEffect, useTransition } from "react";
import { validatePinAction } from "@/actions/cash-register-actions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LockKeyhole, Unlock, Loader2 } from "lucide-react";

interface PinGuardProps {
  children: React.ReactNode;
}

export function PinGuard({ children }: PinGuardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [errorObj, setErrorObj] = useState("");
  const [isPending, startTransition] = useTransition();

  // On Mount check if there is an active valid flag
  useEffect(() => {
     setMounted(true);
     const flag = sessionStorage.getItem("tg_vault_unlocked");
     if (flag) {
        const payload = JSON.parse(flag);
        const diffInMinutes = (new Date().getTime() - new Date(payload.timestamp).getTime()) / 60000;
        if (diffInMinutes < 30) {
           setIsUnlocked(true);
        } else {
           sessionStorage.removeItem("tg_vault_unlocked");
        }
     }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
     e.preventDefault();
     if (!pin || pin.length < 4) return;
     setErrorObj("");

     startTransition(async () => {
        const res = await validatePinAction(pin);
        if (res.success) {
           sessionStorage.setItem("tg_vault_unlocked", JSON.stringify({ timestamp: new Date() }));
           setIsUnlocked(true);
           setPin("");
        } else {
           setErrorObj(res.error);
           setPin("");
        }
     });
  };

  const handleLock = () => {
     sessionStorage.removeItem("tg_vault_unlocked");
     setIsUnlocked(false);
  };

  // Prevent SSR mismatch on unlocking state
  if (!mounted) return <div className="h-48 bg-gray-100 rounded-xl animate-pulse"></div>;

  if (isUnlocked) {
     return (
        <div className="relative">
           <div className="absolute -top-12 right-0">
             <Button variant="ghost" size="sm" onClick={handleLock} className="text-gray-500 hover:text-red-600 hover:bg-red-50">
                <Unlock className="w-4 h-4 mr-2" /> Bloquear Bóveda
             </Button>
           </div>
           {children}
        </div>
     );
  }

  return (
    <div className="bg-gray-100 rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center py-16 px-4">
       <div className="bg-white p-4 rounded-full shadow-sm mb-4 text-gray-400">
          <LockKeyhole className="w-8 h-8" />
       </div>
       <h3 className="text-lg font-bold text-navy mb-1">Zona Protegida</h3>
       <p className="text-gray-500 text-sm mb-6 text-center max-w-sm">Ingresá el PIN de gestión del complejo para destrabar el registro sensible de transacciones del día.</p>
       
       <form onSubmit={handleUnlock} className="flex flex-col items-center w-full max-w-xs space-y-3">
          <Input 
             type="password" 
             placeholder="••••" 
             value={pin}
             onChange={(e) => setPin(e.target.value)}
             className="text-center tracking-widest text-lg h-12"
             maxLength={8}
          />
          {errorObj && <p className="text-xs font-semibold text-red-600 bg-red-50 p-2 rounded w-full text-center border border-red-100">{errorObj}</p>}
          <Button type="submit" className="w-full h-11" disabled={isPending || pin.length < 4}>
             {isPending ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : null}
             Desbloquear
          </Button>
       </form>
    </div>
  );
}
