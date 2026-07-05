// src/features/settings/components/TemplateEditor.tsx
// Sprint 6 1.6.F5-B — Notification template editor

"use client";

import React, { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { templateSchema, type TemplateForm } from "../schemas/template.schema";
import { useSaveTemplate } from "../hooks/useNotificationTemplates";
import type { NotificationTemplate } from "@/types/settings.types";

interface TemplateEditorProps {
  template: NotificationTemplate | null;
  channel: string;
  onMarkDirty: (key: string) => void;
  onMarkClean: (key: string) => void;
}

const CHANNELS = ["email", "sms", "in_app"] as const;

export function TemplateEditor({
  template,
  channel,
  onMarkDirty,
  onMarkClean,
}: TemplateEditorProps) {
  const saveTemplate = useSaveTemplate();
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const [activeChannel, setActiveChannel] = useState(channel);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateSchema),
    values: template
      ? { subject: template.subject ?? "", body: template.body }
      : { subject: "", body: "" },
  });

  const watchedBody = watch("body");

  React.useEffect(() => {
    if (template) {
      const key = `${template.id}-${activeChannel}`;
      if (isDirty) onMarkDirty(key);
      else onMarkClean(key);
    }
  }, [isDirty, template, activeChannel, onMarkDirty, onMarkClean]);

  function insertVariable(variable: string) {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const current = watchedBody ?? "";
    const before = current.slice(0, start);
    const after = current.slice(end);
    const token = `{{${variable}}}`;
    const newValue = before + token + after;
    setValue("body", newValue, { shouldDirty: true });

    // Restore cursor after the inserted token
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + token.length, start + token.length);
    }, 0);
  }

  function onSubmit(data: TemplateForm) {
    if (!template) return;
    saveTemplate.mutate(
      { id: template.id, channel: activeChannel, ...data },
      {
        onSuccess: () => {
          onMarkClean(`${template.id}-${activeChannel}`);
        },
      },
    );
  }

  if (!template) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Select a template to edit.
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="template-editor">
      {/* ─── Channel Tabs ────────────────────────────── */}
      <div className="flex gap-1 border-b" role="tablist">
        {CHANNELS.map((ch) => (
          <button
            key={ch}
            role="tab"
            aria-selected={activeChannel === ch}
            onClick={() => setActiveChannel(ch)}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              activeChannel === ch
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-testid={`channel-tab-${ch}`}
          >
            {ch === "email" ? "Email" : ch === "sms" ? "SMS" : "In-App"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* ─── Subject (email only) ──────────────────── */}
        {activeChannel === "email" && (
          <div className="space-y-1">
            <Label htmlFor="template-subject">Subject</Label>
            <Input
              id="template-subject"
              {...register("subject")}
              placeholder="Email subject line"
              data-testid="template-subject"
            />
          </div>
        )}

        {/* ─── Body ──────────────────────────────────── */}
        <div className="space-y-1">
          <Label htmlFor="template-body">Body</Label>
          <Textarea
            id="template-body"
            {...register("body")}
            ref={bodyRef}
            rows={8}
            placeholder="Template body with {{variables}}"
            data-testid="template-body"
            aria-invalid={!!errors.body}
          />
          {errors.body && (
            <p className="text-xs text-red-500" role="alert">
              {errors.body.message}
            </p>
          )}
        </div>

        {/* ─── Variable Chips ────────────────────────── */}
        {template.availableVariables.length > 0 && (
          <div>
            <p className="mb-1 text-xs text-muted-foreground">Available variables:</p>
            <div className="flex flex-wrap gap-1">
              {template.availableVariables.map((v) => (
                <Badge
                  key={v}
                  variant="outline"
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => insertVariable(v)}
                  data-testid={`variable-chip-${v}`}
                >
                  {`{{${v}}}`}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* ─── Save ──────────────────────────────────── */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={!isDirty || saveTemplate.isPending}
            data-testid="save-template-btn"
          >
            {saveTemplate.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Save Template
          </Button>
        </div>
      </form>
    </div>
  );
}
