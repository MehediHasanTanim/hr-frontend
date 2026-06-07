"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { StructureComponent } from "@/features/payroll/types";

interface SortableComponentRowProps {
  item: StructureComponent & { localDefaultValue?: number };
  onRemove: (componentId: string) => void;
  onDefaultValueChange: (componentId: string, value: number) => void;
  formulaError?: string;
}

export function SortableComponentRow({
  item,
  onRemove,
  onDefaultValueChange,
  formulaError,
}: SortableComponentRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.componentId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const comp = item.component;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg border bg-background px-2 py-2"
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label={`Drag ${comp.name}`}
      >
        <GripVertical className="size-4" />
      </button>

      {/* Name & Code */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{comp.name}</p>
        <p className="text-xs text-muted-foreground">{comp.code}</p>
      </div>

      {/* Value Input */}
      <div className="w-32">
        {comp.calculationType === "fixed" && (
          <div className="relative">
            <span className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              ₹
            </span>
            <Input
              type="number"
              min={0}
              step={0.01}
              className="h-7 pl-5 text-xs"
              placeholder="0.00"
              value={item.localDefaultValue ?? item.defaultValue ?? ""}
              onChange={(e) =>
                onDefaultValueChange(
                  item.componentId,
                  Number(e.target.value) || 0,
                )
              }
            />
          </div>
        )}

        {comp.calculationType === "formula" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block cursor-default truncate font-mono text-xs text-muted-foreground">
                  {comp.formula ? (
                    comp.formula.length > 20
                      ? comp.formula.slice(0, 20) + "…"
                      : comp.formula
                  ) : (
                    "No formula"
                  )}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <code className="text-xs">{comp.formula}</code>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {comp.calculationType === "percentage_of_base" && (
          <div className="relative">
            <Input
              type="number"
              min={0}
              max={100}
              step={0.5}
              className="h-7 pr-6 text-xs"
              placeholder="%"
              value={item.localDefaultValue ?? item.defaultValue ?? ""}
              onChange={(e) =>
                onDefaultValueChange(
                  item.componentId,
                  Number(e.target.value) || 0,
                )
              }
            />
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
              %
            </span>
          </div>
        )}
      </div>

      {/* Formula error */}
      {formulaError && (
        <span className="text-xs text-destructive">{formulaError}</span>
      )}

      {/* Remove */}
      <Button
        size="icon-xs"
        type="button"
        variant="ghost"
        aria-label={`Remove ${comp.name}`}
        onClick={() => onRemove(item.componentId)}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
}
