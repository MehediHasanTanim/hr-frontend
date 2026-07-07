// src/features/lms/courses/components/CourseCard.tsx
// Sprint 9 F1 — Course card with thumbnail, badge, CTA

"use client";

import React from "react";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Course, CourseFormat } from "@/types/lms";

const FORMAT_LABELS: Record<CourseFormat, string> = {
  self_paced: 'Self-paced',
  instructor_led: 'Instructor-led',
  external_link: 'External',
};

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => void;
}

export function CourseCard({ course, onEnroll }: CourseCardProps) {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
      data-testid={`course-card-${course.id}`}
    >
      {/* Thumbnail */}
      <div className="relative h-40 w-full bg-muted">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-10 w-10 text-muted-foreground/50" />
          </div>
        )}
        {course.isMandatory && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white text-xs" data-testid={`mandatory-${course.id}`}>
            Mandatory
          </Badge>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {FORMAT_LABELS[course.format]}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {course.durationMinutes} min
          </span>
        </div>

        <h3 className="text-sm font-semibold leading-tight">{course.title}</h3>

        {course.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{course.description}</p>
        )}

        {/* Skill tags */}
        {course.skillTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {course.skillTags.map((tag) => (
              <Badge key={tag.id} variant="secondary" className="text-xs">
                {tag.name}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-auto pt-2">
          <Button
            size="sm"
            className="w-full"
            onClick={() => onEnroll(course.id)}
            data-testid={`enroll-btn-${course.id}`}
          >
            Enroll
          </Button>
        </div>
      </div>
    </div>
  );
}
