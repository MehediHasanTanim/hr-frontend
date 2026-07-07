// src/features/lms/courses/components/CourseFilterBar.tsx
// Sprint 9 F1 — Course filters: search, category, format, mandatory toggle

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import type { CourseListFilters, CourseFormat } from "@/types/lms";

interface CourseFilterBarProps {
  filters: CourseListFilters;
  onChange: (partial: Partial<CourseListFilters>) => void;
}

export function CourseFilterBar({ filters, onChange }: CourseFilterBarProps) {
  const [search, setSearch] = useState(filters.search ?? "");

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== (filters.search ?? "")) {
        onChange({ search: search || undefined });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-wrap items-center gap-3" data-testid="course-filter-bar">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search courses..."
          className="pl-9"
          data-testid="course-search"
        />
      </div>

      <Select
        value={filters.category ?? ""}
        onValueChange={(v) => onChange({ category: v || undefined })}
      >
        <SelectTrigger className="w-[140px]" data-testid="course-category-filter">
          <SelectValue placeholder="All categories" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All categories</SelectItem>
          <SelectItem value="compliance">Compliance</SelectItem>
          <SelectItem value="technical">Technical</SelectItem>
          <SelectItem value="soft_skills">Soft Skills</SelectItem>
          <SelectItem value="leadership">Leadership</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.format ?? ""}
        onValueChange={(v) => onChange({ format: (v || undefined) as CourseFormat | undefined })}
      >
        <SelectTrigger className="w-[140px]" data-testid="course-format-filter">
          <SelectValue placeholder="All formats" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All formats</SelectItem>
          <SelectItem value="self_paced">Self-paced</SelectItem>
          <SelectItem value="instructor_led">Instructor-led</SelectItem>
          <SelectItem value="external_link">External</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-2">
        <Switch
          id="mandatory-filter"
          checked={filters.isMandatory ?? false}
          onCheckedChange={(v) => onChange({ isMandatory: v || undefined })}
          data-testid="course-mandatory-filter"
        />
        <Label htmlFor="mandatory-filter" className="text-sm">Mandatory only</Label>
      </div>
    </div>
  );
}
