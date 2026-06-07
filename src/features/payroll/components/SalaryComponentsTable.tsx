"use client";

import { useMemo, useState } from "react";
import { Edit3, Plus, ToggleLeft, ToggleRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToastStore } from "@/stores/toast.store";
import {
  useSalaryComponents,
  useCreateSalaryComponent,
  useUpdateSalaryComponent,
  useToggleSalaryComponentStatus,
} from "@/features/payroll/api/salary-components";
import { SalaryComponentFormDrawer } from "@/features/payroll/components/SalaryComponentFormDrawer";
import type { SalaryComponent } from "@/features/payroll/types";
import type { SalaryComponentFormValues } from "@/features/payroll/schemas/salary-component.schema";
import { cn } from "@/lib/utils";

const typeLabels: Record<string, string> = {
  earning: "Earning",
  deduction: "Deduction",
  employer_contribution: "Employer Contribution",
};

const calcLabels: Record<string, string> = {
  fixed: "Fixed",
  formula: "Formula",
  percentage_of_base: "% of Base",
};

export function SalaryComponentsTable() {
  const { addToast } = useToastStore();
  const [filterType, setFilterType] = useState<string>("all");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editComponent, setEditComponent] = useState<SalaryComponent | null>(null);

  const { data: components = [], isLoading, error } = useSalaryComponents();
  const createMutation = useCreateSalaryComponent();
  const updateMutation = useUpdateSalaryComponent("");
  const toggleMutation = useToggleSalaryComponentStatus();

  const knownCodes = useMemo(
    () => components.map((c) => c.code),
    [components],
  );

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = { all: components.length };
    for (const c of components) {
      counts[c.type] = (counts[c.type] ?? 0) + 1;
    }
    return counts;
  }, [components]);

  const filtered = useMemo(
    () =>
      filterType === "all"
        ? components
        : components.filter((c) => c.type === filterType),
    [components, filterType],
  );

  const tabs = [
    { key: "all", label: "All" },
    { key: "earning", label: "Earnings" },
    { key: "deduction", label: "Deductions" },
    { key: "employer_contribution", label: "Employer Contributions" },
  ];

  function handleCreate() {
    setEditComponent(null);
    setDrawerOpen(true);
  }

  function handleEdit(comp: SalaryComponent) {
    setEditComponent(comp);
    setDrawerOpen(true);
  }

  function handleSubmit(values: SalaryComponentFormValues) {
    if (editComponent) {
      updateMutation.mutate(
        { ...values, id: editComponent.id } as unknown as SalaryComponentFormValues,
        {
          onSuccess: () => {
            addToast({ message: "Component saved", variant: "success" });
            setDrawerOpen(false);
          },
          onError: () => {
            addToast({ message: "Failed to save component", variant: "danger" });
          },
        },
      );
    } else {
      createMutation.mutate(values, {
        onSuccess: () => {
          addToast({ message: "Component created", variant: "success" });
          setDrawerOpen(false);
        },
        onError: () => {
          addToast({ message: "Failed to create component", variant: "danger" });
        },
      });
    }
  }

  function handleToggle(comp: SalaryComponent) {
    if (comp.isActive) {
      const confirmed = window.confirm(
        `This component is used in active structure(s). Deactivating it will not remove it from existing structures but will prevent it from being added to new ones.`,
      );
      if (!confirmed) return;
    }
    toggleMutation.mutate(comp.id, {
      onSuccess: () => {
        addToast({
          message: `Component ${comp.isActive ? "deactivated" : "activated"}`,
          variant: "success",
        });
      },
      onError: () => {
        addToast({ message: "Failed to toggle status", variant: "danger" });
      },
    });
  }

  const isSubmitting =
    createMutation.isPending || updateMutation.isPending;

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Salary Components</h2>
          <Button size="sm" type="button" onClick={handleCreate}>
            <Plus className="mr-1 size-4" />
            Add Component
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 rounded-lg border p-0.5">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={cn(
                "rounded-md px-3 py-1 text-sm font-medium transition-colors",
                filterType === tab.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setFilterType(tab.key)}
            >
              {tab.label}
              <span className="ml-1.5 rounded-full bg-muted px-1.5 py-0.5 text-[10px]">
                {typeCounts[tab.key] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Could not load salary components
          </div>
        ) : filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No components found
          </p>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/60 text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Type</th>
                  <th className="px-3 py-2">Calculation</th>
                  <th className="px-3 py-2">Formula/Value</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((comp) => (
                  <tr key={comp.id} className="hover:bg-muted/20">
                    <td className="px-3 py-3 font-medium">{comp.name}</td>
                    <td className="px-3 py-3">
                      <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">
                        {comp.code}
                      </code>
                    </td>
                    <td className="px-3 py-3">
                      <TypeBadge type={comp.type} />
                    </td>
                    <td className="px-3 py-3">
                      {calcLabels[comp.calculationType]}
                    </td>
                    <td className="px-3 py-3 max-w-[200px]">
                      {comp.calculationType === "formula" && comp.formula ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-default truncate font-mono text-xs">
                              {comp.formula.length > 40
                                ? comp.formula.slice(0, 40) + "…"
                                : comp.formula}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <code className="text-xs">{comp.formula}</code>
                          </TooltipContent>
                        </Tooltip>
                      ) : comp.calculationType === "percentage_of_base" ? (
                        "% of Base"
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <Badge variant={comp.isActive ? "default" : "outline"}>
                        {comp.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex justify-end gap-1">
                        <Button
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                          aria-label={`Edit ${comp.name}`}
                          onClick={() => handleEdit(comp)}
                        >
                          <Edit3 className="size-4" />
                        </Button>
                        <Button
                          size="icon-sm"
                          type="button"
                          variant="ghost"
                          aria-label={
                            comp.isActive
                              ? `Deactivate ${comp.name}`
                              : `Activate ${comp.name}`
                          }
                          onClick={() => handleToggle(comp)}
                        >
                          {comp.isActive ? (
                            <ToggleRight className="size-4 text-green-600" />
                          ) : (
                            <ToggleLeft className="size-4 text-muted-foreground" />
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Drawer */}
        <SalaryComponentFormDrawer
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
            setEditComponent(null);
          }}
          editComponent={editComponent}
          knownCodes={knownCodes}
          onSubmitMutation={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </div>
    </TooltipProvider>
  );
}

function TypeBadge({ type }: { type: string }) {
  const colorMap: Record<string, string> = {
    earning: "bg-green-100 text-green-700 border-green-200",
    deduction: "bg-red-100 text-red-700 border-red-200",
    employer_contribution: "bg-blue-100 text-blue-700 border-blue-200",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full border px-2 py-0.5 text-xs font-medium",
        colorMap[type] ?? "bg-gray-100 text-gray-700",
      )}
    >
      {typeLabels[type] ?? type}
    </span>
  );
}
