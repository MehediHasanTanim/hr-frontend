"use client";

import type { ComponentProps } from "react";
import {
  Controller,
  useFormContext,
  type FieldValues,
  type Path,
} from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface FormFieldProps<TFieldValues extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name"> {
  name: Path<TFieldValues>;
  label: string;
}

export function FormField<TFieldValues extends FieldValues>({
  name,
  label,
  id,
  className,
  ...inputProps
}: FormFieldProps<TFieldValues>) {
  const {
    control,
    getFieldState,
    formState,
  } = useFormContext<TFieldValues>();
  const fieldState = getFieldState(name, formState);
  const inputId = id ?? name.replaceAll(".", "-");
  const errorId = `${inputId}-error`;
  const errorMessage =
    typeof fieldState.error?.message === "string"
      ? fieldState.error.message
      : undefined;

  return (
    <div className="space-y-2">
      <Label htmlFor={inputId}>{label}</Label>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Input
            id={inputId}
            aria-describedby={errorMessage ? errorId : undefined}
            aria-invalid={Boolean(errorMessage)}
            className={cn(errorMessage && "border-danger", className)}
            {...field}
            value={field.value ?? ""}
            {...inputProps}
          />
        )}
      />
      {errorMessage ? (
        <p id={errorId} className="text-sm text-danger" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
