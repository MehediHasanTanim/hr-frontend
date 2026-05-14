"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

import { FormField } from "@/components/forms/FormField";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCompany, useUpdateCompany, useUploadLogo } from "@/features/company/hooks/useCompany";
import { readApiErrorMessage } from "@/lib/api-client";

const profileSchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(4, "Phone is required"),
  logoUrl: z.string().optional(),
});

const localisationSchema = z.object({
  timezone: z.string().min(1, "Timezone is required"),
  currency: z.string().min(1, "Currency is required"),
  dateFormat: z.string().min(1, "Date format is required"),
});

const fiscalYearSchema = z.object({
  fiscalYearStartMonth: z.string().min(1, "Start month is required"),
});

type ProfileValues = z.infer<typeof profileSchema>;
type LocalisationValues = z.infer<typeof localisationSchema>;
type FiscalYearValues = z.infer<typeof fiscalYearSchema>;

const timezones = ["Asia/Dhaka", "UTC", "America/New_York", "Europe/London"];
const currencies = ["USD", "BDT", "EUR", "GBP"];
const dateFormats = ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"];
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function NativeSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <label className="space-y-2">
      <span className="block text-sm font-medium">{label}</span>
      <select
        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

export function CompanySettingsForm() {
  const company = useCompany();
  const updateCompany = useUpdateCompany();
  const uploadLogo = useUploadLogo();
  const [toast, setToast] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const initial = useMemo(() => company.data, [company.data]);
  const profileForm = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "", address: "", phone: "", logoUrl: "" },
  });
  const localisationForm = useForm<LocalisationValues>({
    resolver: zodResolver(localisationSchema),
    defaultValues: { timezone: "Asia/Dhaka", currency: "USD", dateFormat: "YYYY-MM-DD" },
  });
  const fiscalYearForm = useForm<FiscalYearValues>({
    resolver: zodResolver(fiscalYearSchema),
    defaultValues: { fiscalYearStartMonth: "January" },
  });

  useEffect(() => {
    if (!initial) {
      return;
    }
    profileForm.reset({
      name: initial.name,
      address: initial.address,
      phone: initial.phone,
      logoUrl: initial.logoUrl,
    });
    localisationForm.reset({
      timezone: initial.timezone,
      currency: initial.currency,
      dateFormat: initial.dateFormat,
    });
    fiscalYearForm.reset({ fiscalYearStartMonth: initial.fiscalYearStartMonth });
    setLogoPreview(initial.logoUrl);
  }, [fiscalYearForm, initial, localisationForm, profileForm]);

  function saveSection<TValues extends object>(
    values: TValues,
    reset: (values: TValues) => void,
    previous: TValues,
  ) {
    reset(values);
    updateCompany.mutate(values, {
      onSuccess: () => setToast("Settings saved"),
      onError: (error) => {
        reset(previous);
        setToast(readApiErrorMessage(error, "Unable to save settings"));
      },
    });
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="fixed right-4 top-4 z-50 rounded-md border bg-background px-4 py-3 text-sm shadow-md" role="status">
          {toast}
        </div>
      ) : null}
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-lg font-semibold">Company Profile</h2>
        <FormProvider {...profileForm}>
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={profileForm.handleSubmit((values) =>
              saveSection(values, profileForm.reset, {
                name: initial?.name ?? "",
                address: initial?.address ?? "",
                phone: initial?.phone ?? "",
                logoUrl: initial?.logoUrl ?? "",
              }),
            )}
          >
            <FormField<ProfileValues> label="Name" name="name" />
            <FormField<ProfileValues> label="Phone" name="phone" />
            <div className="md:col-span-2"><FormField<ProfileValues> label="Address" name="address" /></div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="logo">Logo</Label>
              <input
                id="logo"
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  const preview = URL.createObjectURL(file);
                  setLogoPreview(preview);
                  uploadLogo.mutate(file, {
                    onSuccess: (url) => profileForm.setValue("logoUrl", url),
                    onError: (error) => setToast(readApiErrorMessage(error, "Logo upload failed")),
                  });
                }}
              />
              {logoPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img alt="Logo preview" className="size-20 rounded-md border object-cover" src={logoPreview} />
              ) : null}
            </div>
            <Button className="md:col-span-2 md:w-fit" disabled={updateCompany.isPending} type="submit">Save profile</Button>
          </form>
        </FormProvider>
      </section>
      <section className="space-y-4 border-b pb-6">
        <h2 className="text-lg font-semibold">Localisation</h2>
        <FormProvider {...localisationForm}>
          <form
            className="grid gap-4 md:grid-cols-3"
            onSubmit={localisationForm.handleSubmit((values) =>
              saveSection(values, localisationForm.reset, {
                timezone: initial?.timezone ?? "Asia/Dhaka",
                currency: initial?.currency ?? "USD",
                dateFormat: initial?.dateFormat ?? "YYYY-MM-DD",
              }),
            )}
          >
            <Controller control={localisationForm.control} name="timezone" render={({ field }) => <NativeSelect label="Timezone" options={timezones} value={field.value} onChange={field.onChange} />} />
            <Controller control={localisationForm.control} name="currency" render={({ field }) => <NativeSelect label="Currency" options={currencies} value={field.value} onChange={field.onChange} />} />
            <Controller control={localisationForm.control} name="dateFormat" render={({ field }) => <NativeSelect label="Date format" options={dateFormats} value={field.value} onChange={field.onChange} />} />
            <Button className="md:col-span-3 md:w-fit" disabled={updateCompany.isPending} type="submit">Save localisation</Button>
          </form>
        </FormProvider>
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold">Fiscal Year</h2>
        <FormProvider {...fiscalYearForm}>
          <form
            className="grid gap-4 md:grid-cols-3"
            onSubmit={fiscalYearForm.handleSubmit((values) =>
              saveSection(values, fiscalYearForm.reset, {
                fiscalYearStartMonth: initial?.fiscalYearStartMonth ?? "January",
              }),
            )}
          >
            <Controller control={fiscalYearForm.control} name="fiscalYearStartMonth" render={({ field }) => <NativeSelect label="Start month" options={months} value={field.value} onChange={field.onChange} />} />
            <Button className="md:col-span-3 md:w-fit" disabled={updateCompany.isPending} type="submit">Save fiscal year</Button>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}
