import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TurnoGol — Acceso",
  description: "Iniciá sesión o registrate en TurnoGol",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gray-50 p-6">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-navy">
            TurnoGol ⚽
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
