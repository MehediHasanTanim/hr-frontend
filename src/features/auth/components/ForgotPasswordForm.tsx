"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { useForgotPassword } from "@/features/auth/hooks/useAuthMutations";
import {
  forgotPasswordSchema,
  type ForgotPasswordFormValues,
} from "@/features/auth/schemas/authSchemas";

const successMessage = "If this email exists, a reset link was sent";

export function ForgotPasswordForm() {
  const forgotPassword = useForgotPassword();
  const [sent, setSent] = useState(false);
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit((values) => {
          forgotPassword.mutate(values, {
            onSettled: () => setSent(true),
          });
        })}
      >
        {sent ? (
          <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            {successMessage}
          </div>
        ) : null}
        <FormField<ForgotPasswordFormValues>
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
        />
        <Button className="w-full" disabled={forgotPassword.isPending} type="submit">
          {forgotPassword.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Send reset link
        </Button>
      </form>
    </FormProvider>
  );
}
