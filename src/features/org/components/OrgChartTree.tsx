"use client";

import { useMemo, useState } from "react";
import { Minus, Plus, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { OrgChartNode } from "@/features/org/types/org.types";

function NodeCard({ node, onDrillDown }: { node: OrgChartNode; onDrillDown: (node: OrgChartNode) => void }) {
  return (
    <button
      className="w-56 rounded-lg border bg-background p-3 text-left shadow-sm hover:border-primary"
      type="button"
      onClick={() => onDrillDown(node)}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-medium">{node.name}</p>
          <p className="text-sm text-muted-foreground">{node.jobTitle || "Unassigned"}</p>
        </div>
        <Badge variant="outline"><Users className="size-3" /> {node.directReportCount}</Badge>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{node.department || "No department"}</p>
      <p className="mt-2 text-xs">Headcount: {node.headcount}</p>
    </button>
  );
}

function TreeBranch({ node, onDrillDown }: { node: OrgChartNode; onDrillDown: (node: OrgChartNode) => void }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <NodeCard node={node} onDrillDown={onDrillDown} />
      {node.children?.length ? (
        <div className="flex min-w-max gap-4 border-t pt-4">
          {node.children.map((child) => <TreeBranch key={child.id} node={child} onDrillDown={onDrillDown} />)}
        </div>
      ) : null}
    </div>
  );
}

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

export function OrgChartTree({ data }: { data?: OrgChartNode | undefined }) {
  const [rootId, setRootId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const visibleRoot = useMemo(() => (data && rootId ? findNode(data, rootId) ?? data : data), [data, rootId]);

  if (!visibleRoot) {
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
      <div className="h-[640px] overflow-auto rounded-lg border bg-muted/20 p-6">
        <div className="min-w-max origin-top-left transition-transform" style={{ transform: `scale(${zoom})` }}>
          <TreeBranch node={visibleRoot} onDrillDown={(node) => setRootId(node.id)} />
        </div>
      </div>
    </div>
  );
}
