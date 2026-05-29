"use client";

import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { employeeFormSchema, type EmployeeFormValues } from "@/features/employees/schemas/employee.schema";
import type { Employee, EmployeeFormPayload } from "@/features/employees/types/employee.types";

const employeeTypes = ["full_time", "part_time", "contractor", "intern"];
const statuses = ["active", "inactive", "on_leave", "terminated"];
const genders = ["female", "male", "non_binary", "prefer_not_to_say"];

export const emptyEmployeeFormValues: EmployeeFormValues = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  dateOfBirth: "",
  gender: "",
  nationalId: "",
  passportNumber: "",
  employeeNumber: "",
  employeeType: "",
  status: "active",
  joiningDate: "",
  probationEndDate: "",
  workEmail: "",
  departmentId: "",
  jobTitle: "",
  payGrade: "",
  managerId: "",
  location: "",
  bankName: "",
  branchName: "",
  accountHolderName: "",
  accountNumber: "",
  routingNumber: "",
};

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function SelectField({
  name,
  labelText,
  options,
}: {
  name: keyof EmployeeFormValues;
  labelText: string;
  options: { value: string; label: string }[];
}) {
  return (
    <Controller
      name={name}
      render={({ field, fieldState }) => (
        <label className="space-y-2">
          <span className="block text-sm font-medium">{labelText}</span>
          <select
            aria-label={labelText}
            aria-invalid={Boolean(fieldState.error)}
            className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
            value={field.value}
            onChange={field.onChange}
          >
            {options.map((option) => (
              <option key={option.value || "empty"} value={option.value}>{option.label}</option>
            ))}
          </select>
          {fieldState.error?.message ? <p className="text-sm text-danger" role="alert">{fieldState.error.message}</p> : null}
        </label>
      )}
    />
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 border-b pb-6 last:border-b-0">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{children}</div>
    </section>
  );
}

function toFormValues(employee?: Employee): EmployeeFormValues {
  return {
    ...emptyEmployeeFormValues,
    firstName: employee?.firstName ?? "",
    lastName: employee?.lastName ?? "",
    email: employee?.email ?? "",
    phone: employee?.phone ?? "",
    dateOfBirth: employee?.dateOfBirth ?? "",
    gender: employee?.gender ?? "",
    nationalId: employee?.nationalId ?? "",
    passportNumber: employee?.passportNumber ?? "",
    employeeNumber: employee?.employeeNumber ?? "",
    employeeType: employee?.employeeType ?? "",
    status: employee?.status ?? "active",
    joiningDate: employee?.joiningDate ?? "",
    probationEndDate: employee?.probationEndDate ?? "",
    workEmail: employee?.workEmail ?? "",
    departmentId: employee?.departmentId ?? "",
    jobTitle: employee?.jobTitle ?? "",
    payGrade: employee?.payGrade ?? "",
    managerId: employee?.managerId ?? "",
    location: employee?.location ?? "",
    bankName: employee?.bankName ?? "",
    branchName: employee?.branchName ?? "",
    accountHolderName: employee?.accountHolderName ?? "",
    accountNumber: employee?.accountNumber ?? "",
    routingNumber: employee?.routingNumber ?? "",
  };
}

export function EmployeeForm({
  employee,
  departments = [],
  managers = [],
  isSaving = false,
  onSubmit,
  onSaveDraft,
}: {
  employee?: Employee;
  departments?: { id: string; name: string }[];
  managers?: { id: string; name: string }[];
  isSaving?: boolean;
  onSubmit: (values: EmployeeFormPayload) => void | Promise<void>;
  onSaveDraft?: (values: EmployeeFormValues) => void;
}) {
  const defaultValues = useMemo(() => toFormValues(employee), [employee]);
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues,
    mode: "onSubmit",
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <FormProvider {...form}>
      <form className="space-y-6" noValidate onSubmit={form.handleSubmit((values) => onSubmit(values as EmployeeFormPayload))}>
        <Section title="Personal Information">
          <FormField<EmployeeFormValues> label="First name" name="firstName" />
          <FormField<EmployeeFormValues> label="Last name" name="lastName" />
          <FormField<EmployeeFormValues> label="Email" name="email" type="email" />
          <FormField<EmployeeFormValues> label="Phone" name="phone" />
          <FormField<EmployeeFormValues> label="Date of birth" name="dateOfBirth" type="date" />
          <SelectField labelText="Gender" name="gender" options={[{ value: "", label: "Select gender" }, ...genders.map((value) => ({ value, label: label(value) }))]} />
          <FormField<EmployeeFormValues> label="National ID" name="nationalId" />
          <FormField<EmployeeFormValues> label="Passport number" name="passportNumber" />
        </Section>

        <Section title="Employment Information">
          <FormField<EmployeeFormValues> label="Employee number" name="employeeNumber" />
          <SelectField labelText="Employee type" name="employeeType" options={[{ value: "", label: "Select type" }, ...employeeTypes.map((value) => ({ value, label: label(value) }))]} />
          <SelectField labelText="Employment status" name="status" options={[{ value: "", label: "Select status" }, ...statuses.map((value) => ({ value, label: label(value) }))]} />
          <FormField<EmployeeFormValues> label="Joining date" name="joiningDate" type="date" />
          <FormField<EmployeeFormValues> label="Probation end date" name="probationEndDate" type="date" />
          <FormField<EmployeeFormValues> label="Work email" name="workEmail" type="email" />
        </Section>

        <Section title="Organization Assignment">
          <SelectField labelText="Department" name="departmentId" options={[{ value: "", label: "Select department" }, ...departments.map((department) => ({ value: department.id, label: department.name }))]} />
          <FormField<EmployeeFormValues> label="Job title" name="jobTitle" />
          <FormField<EmployeeFormValues> label="Pay grade" name="payGrade" />
          <SelectField labelText="Manager" name="managerId" options={[{ value: "", label: "No manager" }, ...managers.map((manager) => ({ value: manager.id, label: manager.name }))]} />
          <FormField<EmployeeFormValues> label="Location" name="location" />
        </Section>

        <Section title="Bank Details">
          <FormField<EmployeeFormValues> label="Bank name" name="bankName" />
          <FormField<EmployeeFormValues> label="Branch name" name="branchName" />
          <FormField<EmployeeFormValues> label="Account holder name" name="accountHolderName" />
          <FormField<EmployeeFormValues> label="Account number" name="accountNumber" />
          <FormField<EmployeeFormValues> label="Routing number" name="routingNumber" />
        </Section>

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={() => onSaveDraft?.(form.getValues())}>Save draft</Button>
          <Button disabled={isSaving} type="submit">{isSaving ? "Saving..." : "Save employee"}</Button>
        </div>
      </form>
    </FormProvider>
  );
}
