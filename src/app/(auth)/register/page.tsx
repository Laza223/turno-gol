import type { Metadata } from "next";
import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "TurnoGol — Crear cuenta",
  description: "Creá tu cuenta en TurnoGol y empezá a gestionar tu complejo",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
