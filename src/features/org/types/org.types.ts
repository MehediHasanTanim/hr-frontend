export interface Department {
  id: string;
  name: string;
  code?: string;
  parentId?: string | null;
  status: "active" | "inactive";
  headId?: string;
  headName?: string;
  children?: Department[];
}

export interface OrgChartNode {
  id: string;
  name: string;
  jobTitle?: string;
  department?: string;
  directReportCount: number;
  headcount: number;
  children?: OrgChartNode[];
}
