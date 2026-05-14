"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, X } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useLogin } from "@/features/auth/hooks/useAuthMutations";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas/authSchemas";
import { useAuthStore } from "@/features/auth/stores/authStore";
import { readApiErrorMessage } from "@/lib/api-client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useLogin();
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = form.handleSubmit((values) => {
    setApiError(null);
    login.mutate(
      { email: values.email, password: values.password },
      {
        onSuccess: (data) => {
          useAuthStore.getState().setAuth(data.access, data.user);
          router.push(searchParams.get("next") ?? "/dashboard");
        },
        onError: (error) => {
          setApiError(readApiErrorMessage(error, "Invalid credentials"));
        },
      },
    );
  });

  return (
    <FormProvider {...form}>
      <form className="space-y-4" noValidate onSubmit={onSubmit}>
        {apiError ? (
          <div
            className="flex items-start justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            <span>{apiError}</span>
            <button aria-label="Dismiss error" type="button" onClick={() => setApiError(null)}>
              <X className="size-4" />
            </button>
          </div>
        ) : null}
        <FormField<LoginFormValues>
          autoComplete="email"
          label="Email"
          name="email"
          type="email"
        />
        <FormField<LoginFormValues>
          autoComplete="current-password"
          label="Password"
          name="password"
          type="password"
        />
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <Checkbox
            checked={form.watch("rememberMe") ?? false}
            onCheckedChange={(checked) => form.setValue("rememberMe", checked === true)}
          />
          Remember me
        </label>
        <Button className="w-full" disabled={login.isPending} type="submit">
          {login.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
          Sign in
        </Button>
        <Link className="block text-center text-sm text-primary hover:underline" href="/forgot-password">
          Forgot password?
        </Link>
      </form>
    </FormProvider>
  );
}
