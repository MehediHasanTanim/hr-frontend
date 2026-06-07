"use client";

import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToastStore } from "@/stores/toast.store";
import { useSalaryComponents } from "@/features/payroll/api/salary-components";
import {
  useCreateSalaryStructure,
  useUpdateSalaryStructure,
} from "@/features/payroll/api/salary-structures";
import { SortableComponentRow } from "@/features/payroll/components/SortableComponentRow";
import { LiveGrossPreview } from "@/features/payroll/components/LiveGrossPreview";
import type { SalaryStructure, StructureComponent } from "@/features/payroll/types";
import { cn } from "@/lib/utils";

interface CanvasItem {
  componentId: string;
  component: StructureComponent["component"];
  sortOrder: number;
  defaultValue: number;
  localDefaultValue?: number;
}

export function SalaryStructureBuilder({
  editStructure,
  onSuccess,
}: {
  editStructure?: SalaryStructure | null;
  onSuccess?: () => void;
}) {
  const { addToast } = useToastStore();
  const isEdit = Boolean(editStructure);
  const [name, setName] = useState(editStructure?.name ?? "");
  const [description, setDescription] = useState(
    editStructure?.description ?? "",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [canvasItems, setCanvasItems] = useState<CanvasItem[]>(
    () =>
      editStructure?.components.map((sc) => ({
        componentId: sc.componentId,
        component: sc.component,
        sortOrder: sc.sortOrder,
        defaultValue: sc.defaultValue,
      })) ?? [],
  );

  const { data: allComponents = [], isLoading } = useSalaryComponents();
  const createMutation = useCreateSalaryStructure();
  const updateMutation = useUpdateSalaryStructure(editStructure?.id ?? "");

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const addedIds = useMemo(
    () => new Set(canvasItems.map((i) => i.componentId)),
    [canvasItems],
  );

  const filteredComponents = useMemo(
    () =>
      allComponents.filter(
        (c) =>
          c.isActive &&
          (c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.code.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [allComponents, searchQuery],
  );

  const groupedComponents = useMemo(() => {
    const groups: Record<string, typeof allComponents> = {};
    for (const c of filteredComponents) {
      if (!groups[c.type]) groups[c.type] = [];
      groups[c.type].push(c);
    }
    return groups;
  }, [filteredComponents]);

  function addComponent(componentId: string) {
    const comp = allComponents.find((c) => c.id === componentId);
    if (!comp || addedIds.has(componentId)) return;
    setCanvasItems((prev) => [
      ...prev,
      {
        componentId,
        component: comp,
        sortOrder: prev.length + 1,
        defaultValue: 0,
      },
    ]);
  }

  function removeComponent(componentId: string) {
    setCanvasItems((prev) =>
      prev
        .filter((i) => i.componentId !== componentId)
        .map((i, idx) => ({ ...i, sortOrder: idx + 1 })),
    );
  }

  function handleDefaultValueChange(componentId: string, value: number) {
    setCanvasItems((prev) =>
      prev.map((i) =>
        i.componentId === componentId
          ? { ...i, localDefaultValue: value, defaultValue: value }
          : i,
      ),
    );
  }

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCanvasItems((prev) => {
      const oldIndex = prev.findIndex((i) => i.componentId === active.id);
      const newIndex = prev.findIndex((i) => i.componentId === over.id);
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reordered = [...prev];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      return reordered.map((i, idx) => ({ ...i, sortOrder: idx + 1 }));
    });
  }, []);

  const isSubmitting = createMutation.isPending || updateMutation.isPending;
  const canSubmit =
    name.trim().length >= 2 && canvasItems.length > 0 && !isSubmitting;

  async function handleSave() {
    if (!canSubmit) return;

    const payload = {
      name: name.trim(),
      description: description.trim() || undefined,
      components: canvasItems.map((item) => ({
        componentId: item.componentId,
        sortOrder: item.sortOrder,
        defaultValue: item.defaultValue,
      })),
    };

    const mutation = isEdit
      ? updateMutation.mutateAsync(payload)
      : createMutation.mutateAsync(payload);

    try {
      await mutation;
      addToast({ message: "Structure saved", variant: "success" });
      onSuccess?.();
    } catch {
      addToast({ message: "Failed to save structure", variant: "danger" });
    }
  }

  return (
    <div className="flex gap-6">
      {/* Left: Component Picker */}
      <div className="w-[380px] shrink-0 space-y-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-7 pl-7 text-xs"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          Object.entries(groupedComponents).map(([type, comps]) => (
            <div key={type}>
              <p
                className={cn(
                  "mb-1 text-xs font-semibold",
                  type === "earning" && "text-green-700",
                  type === "deduction" && "text-red-700",
                  type === "employer_contribution" && "text-blue-700",
                )}
              >
                {type === "earning"
                  ? "Earnings"
                  : type === "deduction"
                    ? "Deductions"
                    : "Employer Contributions"}
              </p>
              <div className="space-y-1">
                {comps.map((comp) => (
                  <div
                    key={comp.id}
                    className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-1.5 text-sm",
                      addedIds.has(comp.id)
                        ? "bg-muted/30 text-muted-foreground"
                        : "bg-background hover:bg-muted/20",
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{comp.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {comp.code}
                      </p>
                    </div>
                    {addedIds.has(comp.id) ? (
                      <span className="text-xs text-muted-foreground">
                        Added
                      </span>
                    ) : (
                      <Button
                        size="xs"
                        type="button"
                        variant="ghost"
                        onClick={() => addComponent(comp.id)}
                      >
                        <Plus className="mr-1 size-3" />
                        Add
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Right: Canvas */}
      <div className="flex-1 space-y-4">
        {/* Structure name / description */}
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="struct-name">Structure Name *</Label>
            <Input
              id="struct-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Standard Full-Time"
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="struct-desc">Description</Label>
            <textarea
              id="struct-desc"
              rows={2}
              maxLength={500}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </div>

        {/* Drag-drop canvas */}
        {canvasItems.length === 0 ? (
          <div className="flex items-center justify-center rounded-lg border-2 border-dashed p-8 text-sm text-muted-foreground">
            Add components from the left panel to build your structure
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={canvasItems.map((i) => i.componentId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {canvasItems.map((item) => (
                  <SortableComponentRow
                    key={item.componentId}
                    item={item}
                    onRemove={removeComponent}
                    onDefaultValueChange={handleDefaultValueChange}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Live Preview */}
        <LiveGrossPreview
          components={canvasItems.map((item) => ({
            id: item.componentId,
            componentId: item.componentId,
            component: item.component,
            sortOrder: item.sortOrder,
            defaultValue: item.defaultValue,
          }))}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.history.back()}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!canSubmit}
            onClick={handleSave}
          >
            {isSubmitting ? "Saving..." : isEdit ? "Save Changes" : "Create Structure"}
          </Button>
        </div>
      </div>
    </div>
  );
}
