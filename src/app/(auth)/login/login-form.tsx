"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { loginAction } from "@/actions/auth-actions";
import { UI_TEXTS } from "@/lib/constants/ui-texts";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormValues) {
    setServerError(null);
    const result = await loginAction(data);

    // Si llega acá, hubo error (login exitoso hace redirect vía server)
    if (!result.success) {
      setServerError(result.error);
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-navy">
          {UI_TEXTS.auth.login_title}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {UI_TEXTS.auth.login_subtitle}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-500"
              role="alert"
              id="login-error"
            >
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">{UI_TEXTS.auth.email_label}</Label>
            <Input
              id="email"
              type="email"
              placeholder={UI_TEXTS.auth.email_placeholder}
              autoComplete="email"
              autoFocus
              {...register("email")}
              aria-invalid={!!errors.email}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">{UI_TEXTS.auth.password_label}</Label>
            <Input
              id="password"
              type="password"
              placeholder={UI_TEXTS.auth.password_placeholder}
              autoComplete="current-password"
              {...register("password")}
              aria-invalid={!!errors.password}
            />
            {errors.password && (
              <p className="text-sm text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={isSubmitting}
            id="login-submit"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {UI_TEXTS.auth.login_button}
          </Button>
          <p className="text-center text-sm text-gray-500">
            <Link
              href="/register"
              className="font-medium text-green-primary hover:text-green-dark"
              id="register-link"
            >
              {UI_TEXTS.auth.register_link}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
