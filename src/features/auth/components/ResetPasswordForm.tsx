"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { useResetPassword } from "@/features/auth/hooks/useAuthMutations";
import {
  resetPasswordSchema,
  type ResetPasswordFormValues,
} from "@/features/auth/schemas/authSchemas";
import { readApiErrorMessage } from "@/lib/api-client";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const resetPassword = useResetPassword();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (!token) {
      router.replace("/forgot-password");
    }
  }, [router, token]);

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          if (!token) {
            return;
          }
          setError(null);
          resetPassword.mutate(
            { token, ...values },
            {
              onSuccess: () => {
                setMessage("Password reset successful. Redirecting to login...");
                window.setTimeout(() => router.push("/login"), 2000);
              },
              onError: (apiError) => {
                setError(readApiErrorMessage(apiError, "This reset link is invalid or expired"));
              },
            },
          );
        })}
      >
        {message ? (
          <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="space-y-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            <p>{error}</p>
            <Link className="font-medium underline" href="/forgot-password">
              Request a new reset link
            </Link>
          </div>
        ) : null}
        <FormField<ResetPasswordFormValues>
          autoComplete="new-password"
          label="New password"
          name="password"
          type="password"
        />
        <FormField<ResetPasswordFormValues>
          autoComplete="new-password"
          label="Confirm password"
          name="confirmPassword"
          type="password"
        />
        <Button className="w-full" disabled={resetPassword.isPending} type="submit">
          {resetPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Reset password
        </Button>
      </form>
    </FormProvider>
  );
}
