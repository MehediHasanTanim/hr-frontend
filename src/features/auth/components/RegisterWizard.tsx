"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { useRegister } from "@/features/auth/hooks/useAuthMutations";
import {
  adminUserSchema,
  companySchema,
  registerSchema,
  type RegisterFormValues,
} from "@/features/auth/schemas/authSchemas";
import type { ApiErrorResponse } from "@/types/api";

const steps = ["Company Details", "Admin User", "Confirmation"] as const;

const stepFields: Record<number, Array<keyof RegisterFormValues>> = {
  0: ["companyName", "country", "timezone", "currency"],
  1: ["name", "email", "password", "confirmPassword"],
  2: [],
};

function getFieldMessage(value: string[] | string | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export function RegisterWizard() {
  const router = useRouter();
  const register = useRegister();
  const [step, setStep] = useState(0);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      companyName: "",
      country: "",
      timezone: "Asia/Dhaka",
      currency: "USD",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  async function nextStep() {
    const valid = await form.trigger(stepFields[step] ?? []);
    if (valid) {
      setStep((current) => Math.min(current + 1, 2));
    }
  }

  function mapApiErrors(error: unknown) {
    if (!axios.isAxiosError<ApiErrorResponse>(error)) {
      setApiError("Something went wrong");
      return;
    }

    const data = error.response?.data;
    let targetStep = step;
    (Object.keys(data ?? {}) as Array<keyof RegisterFormValues>).forEach((field) => {
      const message = getFieldMessage(data?.[field]);
      if (!message || !(field in form.getValues())) {
        return;
      }
      form.setError(field, { message });
      const fieldStep = field === "companyName" || field === "country" || field === "timezone" || field === "currency" ? 0 : 1;
      targetStep = Math.min(targetStep, fieldStep);
    });
    setStep(targetStep);
    setApiError(data?.detail ?? data?.message ?? "Please review the highlighted fields");
  }

  function submit() {
    const values = form.getValues();
    const parsedCompany = companySchema.safeParse(values);
    const parsedAdmin = adminUserSchema.safeParse(values);
    if (!parsedCompany.success || !parsedAdmin.success) {
      form.trigger();
      return;
    }

    setApiError(null);
    register.mutate(values, {
      onSuccess: () => {
        setSuccess(true);
        window.setTimeout(() => router.push("/login"), 2000);
      },
      onError: mapApiErrors,
    });
  }

  const values = form.watch();

  return (
    <FormProvider {...form}>
      <div className="space-y-6">
        <ol className="grid grid-cols-3 gap-2">
          {steps.map((label, index) => (
            <li
              className={`rounded-md border p-3 text-sm ${
                index === step
                  ? "border-primary bg-primary/10 text-primary"
                  : index < step
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-border text-muted-foreground"
              }`}
              key={label}
            >
              <span className="font-semibold">{index + 1}.</span> {label}
            </li>
          ))}
        </ol>
        {apiError ? (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
            {apiError}
          </div>
        ) : null}
        {success ? (
          <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
            Account created. Redirecting to login...
          </div>
        ) : null}
        <form className="space-y-4" noValidate onSubmit={(event) => event.preventDefault()}>
          {step === 0 ? (
            <>
              <FormField<RegisterFormValues> label="Company name" name="companyName" />
              <FormField<RegisterFormValues> label="Country" name="country" />
              <FormField<RegisterFormValues> label="Timezone" name="timezone" />
              <FormField<RegisterFormValues> label="Currency" name="currency" />
            </>
          ) : null}
          {step === 1 ? (
            <>
              <FormField<RegisterFormValues> label="Full name" name="name" />
              <FormField<RegisterFormValues> label="Email" name="email" type="email" />
              <FormField<RegisterFormValues> label="Password" name="password" type="password" />
              <FormField<RegisterFormValues>
                label="Confirm password"
                name="confirmPassword"
                type="password"
              />
            </>
          ) : null}
          {step === 2 ? (
            <dl className="grid gap-3 rounded-md border p-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted-foreground">Company</dt><dd>{values.companyName}</dd></div>
              <div><dt className="text-muted-foreground">Country</dt><dd>{values.country}</dd></div>
              <div><dt className="text-muted-foreground">Timezone</dt><dd>{values.timezone}</dd></div>
              <div><dt className="text-muted-foreground">Currency</dt><dd>{values.currency}</dd></div>
              <div><dt className="text-muted-foreground">Admin</dt><dd>{values.name}</dd></div>
              <div><dt className="text-muted-foreground">Email</dt><dd>{values.email}</dd></div>
            </dl>
          ) : null}
          <div className="flex justify-between gap-3">
            <Button disabled={step === 0 || register.isPending} type="button" variant="outline" onClick={() => setStep((current) => Math.max(current - 1, 0))}>
              Back
            </Button>
            {step < 2 ? (
              <Button type="button" onClick={nextStep}>Next</Button>
            ) : (
              <Button disabled={register.isPending || success} type="button" onClick={submit}>
                {register.isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                Create Account
              </Button>
            )}
          </div>
        </form>
      </div>
    </FormProvider>
  );
}
