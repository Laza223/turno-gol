import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "TurnoGol — Iniciar sesión",
  description: "Iniciá sesión en TurnoGol para gestionar tu complejo",
};

export default function LoginPage() {
  return <LoginForm />;
}
