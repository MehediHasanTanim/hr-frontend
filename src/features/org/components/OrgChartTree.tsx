"use client";

import { type SyntheticEvent, useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import Tree, { type RawNodeDatum, type RenderCustomNodeElementFn } from "react-d3-tree";

import { Button } from "@/components/ui/button";
import type { OrgChartNode } from "@/features/org/types/org.types";

function findNode(root: OrgChartNode, id: string): OrgChartNode | undefined {
  if (root.id === id) {
    return root;
  }
  for (const child of root.children ?? []) {
    const found = findNode(child, id);
    if (found) {
      return found;
    }
  }
  return undefined;
}

function toTreeDatum(node: OrgChartNode): RawNodeDatum {
  const datum: RawNodeDatum = {
    name: node.name,
    attributes: {
      id: node.id,
      jobTitle: node.jobTitle || "Unassigned",
      department: node.department || "No department",
      directReportCount: node.directReportCount,
      headcount: node.headcount,
    },
  };

  if (node.children?.length) {
    datum.children = node.children.map(toTreeDatum);
  }

  return datum;
}

function useContainerSize() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: 960, height: 640 });

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const updateSize = () => {
      const next = element.getBoundingClientRect();
      setSize({ width: next.width || 960, height: next.height || 640 });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return { ref, size };
}

export function OrgChartTree({ data }: { data?: OrgChartNode | undefined }) {
  const [rootId, setRootId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const visibleRoot = useMemo(() => (data && rootId ? findNode(data, rootId) ?? data : data), [data, rootId]);
  const treeData = useMemo(() => (visibleRoot ? toTreeDatum(visibleRoot) : undefined), [visibleRoot]);
  const { ref, size } = useContainerSize();

  const renderNode: RenderCustomNodeElementFn = ({ nodeDatum }) => {
    const attributes = nodeDatum.attributes ?? {};
    const nodeId = String(attributes.id ?? "");
    const jobTitle = String(attributes.jobTitle ?? "Unassigned");
    const department = String(attributes.department ?? "No department");
    const directReportCount = Number(attributes.directReportCount ?? 0);
    const headcount = Number(attributes.headcount ?? 0);

    function drillDown(event: SyntheticEvent) {
      event.stopPropagation();
      if (nodeId) {
        setRootId(nodeId);
      }
    }

    return (
      <g className="outline-none">
        <rect
          className="cursor-pointer"
          fill="hsl(var(--background))"
          height={112}
          rx={8}
          stroke="hsl(var(--border))"
          width={232}
          x={-116}
          y={-52}
          onClick={drillDown}
        />
        <text fill="hsl(var(--foreground))" fontSize={14} fontWeight={600} textAnchor="start" x={-100} y={-22}>{nodeDatum.name}</text>
        <text fill="hsl(var(--muted-foreground))" fontSize={12} textAnchor="start" x={-100} y={-3}>{jobTitle}</text>
        <text fill="hsl(var(--muted-foreground))" fontSize={11} textAnchor="start" x={-100} y={20}>{department}</text>
        <text fill="hsl(var(--foreground))" fontSize={11} textAnchor="start" x={-100} y={42}>Headcount: {headcount}</text>
        <rect fill="hsl(var(--background))" height={22} rx={5} stroke="hsl(var(--border))" width={42} x={58} y={-38} />
        <text fill="hsl(var(--foreground))" fontSize={11} textAnchor="middle" x={79} y={-23}>{directReportCount}</text>
      </g>
    );
  };

  if (!visibleRoot || !treeData) {
    return <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No organization chart data found.</div>;
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-muted-foreground">Headcount overlay: {visibleRoot.headcount}</div>
        <div className="flex gap-2">
          <Button disabled={!rootId} type="button" variant="outline" onClick={() => setRootId(null)}>Reset drill-down</Button>
          <Button aria-label="Zoom out" size="icon-sm" type="button" variant="outline" onClick={() => setZoom((value) => Math.max(0.6, value - 0.1))}><Minus className="size-4" /></Button>
          <Button aria-label="Zoom in" size="icon-sm" type="button" variant="outline" onClick={() => setZoom((value) => Math.min(1.4, value + 0.1))}><Plus className="size-4" /></Button>
        </div>
      </div>
      {visibleRoot.children?.length ? (
        <div className="flex flex-wrap gap-2">
          {visibleRoot.children.map((child) => (
            <Button key={child.id} aria-label={child.name} size="sm" type="button" variant="outline" onClick={() => setRootId(child.id)}>
              {child.jobTitle || child.department || "View team"}
            </Button>
          ))}
        </div>
      ) : null}
      <div ref={ref} className="h-[640px] overflow-hidden rounded-lg border bg-muted/20">
        <Tree
          key={visibleRoot.id}
          centeringTransitionDuration={250}
          collapsible={false}
          data={treeData}
          dimensions={size}
          draggable
          nodeSize={{ x: 280, y: 180 }}
          orientation="vertical"
          pathFunc="step"
          renderCustomNodeElement={renderNode}
          scaleExtent={{ min: 0.6, max: 1.4 }}
          separation={{ siblings: 1.15, nonSiblings: 1.35 }}
          translate={{ x: size.width / 2, y: 80 }}
          zoom={zoom}
          zoomable
        />
      </div>
    </div>
  );
}
