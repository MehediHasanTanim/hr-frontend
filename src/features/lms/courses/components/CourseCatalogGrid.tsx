// src/features/lms/courses/components/CourseCatalogGrid.tsx
// Sprint 9 F1 — Course catalog grid with filters, pagination, and enrollment

"use client";

import React from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useCoursesQuery, useEnrollMutation } from "../api";
import { CourseCard } from "./CourseCard";
import { CourseFilterBar } from "./CourseFilterBar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { SearchX } from "lucide-react";
import type { CourseListFilters } from "@/types/lms";

function parseFilters(params: URLSearchParams): CourseListFilters {
  return {
    search: params.get("search") ?? undefined,
    category: params.get("category") ?? undefined,
    format: (params.get("format") as CourseListFilters["format"]) ?? undefined,
    isMandatory: params.get("mandatory") === "true" ? true : undefined,
    page: Number(params.get("page") ?? "1"),
    limit: 12,
  };
}

export function CourseCatalogGrid() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const filters = parseFilters(new URLSearchParams(searchParams?.toString() ?? ""));
  const { data, isLoading, isError, refetch } = useCoursesQuery(filters);
  const enroll = useEnrollMutation();
  const courses = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / (filters.limit ?? 12));

  function updateFilters(partial: Partial<CourseListFilters>) {
    const next = new URLSearchParams(searchParams?.toString() ?? "");
    Object.entries(partial).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") next.delete(k);
      else next.set(k, String(v));
    });
    if (partial.page === undefined) next.set("page", "1"); // reset page on filter change
    router.push(`?${next.toString()}`);
  }

  return (
    <div className="space-y-6" data-testid="course-catalog">
      <CourseFilterBar filters={filters} onChange={updateFilters} />

      {isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <p className="text-sm text-muted-foreground">Failed to load courses.</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="course-grid-loading">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center" data-testid="course-grid-empty">
          <SearchX className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No courses match your filters.</p>
          <Button variant="outline" size="sm" onClick={() => router.push("?")}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-testid="course-grid">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={(id) => enroll.mutate(id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={filters.page === 1}
                onClick={() => updateFilters({ page: (filters.page ?? 1) - 1 })}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {filters.page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={(filters.page ?? 1) >= totalPages}
                onClick={() => updateFilters({ page: (filters.page ?? 1) + 1 })}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
