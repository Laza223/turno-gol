"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { registerAction } from "@/actions/auth-actions";
import {
  registerSchema,
  type RegisterSchema,
} from "@/lib/validations/complex";
import { UI_TEXTS } from "@/lib/constants/ui-texts";

export function RegisterForm() {
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterSchema) {
    setServerError(null);
    const result = await registerAction(data);

    if (!result.success) {
      setServerError(result.error);
    }
  }

  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold text-navy">
          {UI_TEXTS.auth.register_title}
        </CardTitle>
        <CardDescription className="text-gray-500">
          {UI_TEXTS.auth.register_subtitle}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-4">
          {serverError && (
            <div
              className="rounded-lg bg-red-50 p-3 text-sm text-red-500"
              role="alert"
              id="register-error"
            >
              {serverError}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="complexName">
              {UI_TEXTS.auth.complex_name_label}
            </Label>
            <Input
              id="complexName"
              type="text"
              placeholder={UI_TEXTS.auth.complex_name_placeholder}
              autoComplete="organization"
              autoFocus
              {...register("complexName")}
              aria-invalid={!!errors.complexName}
            />
            {errors.complexName && (
              <p className="text-sm text-red-500">
                {errors.complexName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">{UI_TEXTS.auth.email_label}</Label>
            <Input
              id="email"
              type="email"
              placeholder={UI_TEXTS.auth.email_placeholder}
              autoComplete="email"
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
              autoComplete="new-password"
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
            id="register-submit"
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {UI_TEXTS.auth.register_button}
          </Button>
          <p className="text-center text-sm text-gray-500">
            <Link
              href="/login"
              className="font-medium text-green-primary hover:text-green-dark"
              id="login-link"
            >
              {UI_TEXTS.auth.login_link}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
