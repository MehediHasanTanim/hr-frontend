"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export interface LoginFormProps {
  onSubmit: (values: LoginFormValues) => void | Promise<void>;
}

export function LoginForm({ onSubmit }: LoginFormProps) {
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  return (
    <FormProvider {...form}>
      <form
        className="space-y-4"
        noValidate
        onSubmit={form.handleSubmit(onSubmit)}
      >
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
        <Button type="submit">Sign in</Button>
      </form>
    </FormProvider>
  );
}
