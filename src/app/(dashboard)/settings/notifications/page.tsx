// src/app/(dashboard)/settings/notifications/page.tsx
// Sprint 6 1.6.F5-B — Notification Templates page

"use client";

import React, { useState } from "react";
import { TemplateList } from "@/features/settings/components/TemplateList";
import { TemplateEditor } from "@/features/settings/components/TemplateEditor";
import { useNotificationTemplates } from "@/features/settings/hooks/useNotificationTemplates";
import type { NotificationTemplate } from "@/types/settings.types";

export default function NotificationsPage() {
  const { data: templates, isLoading } = useNotificationTemplates();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [selectedChannel, setSelectedChannel] = useState("email");
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  function handleSelect(tpl: NotificationTemplate, channel: string) {
    setSelectedTemplate(tpl);
    setSelectedChannel(channel);
    setSelectedKey(`${tpl.id}-${channel}`);
  }

  function handleMarkDirty(key: string) {
    setDirtyKeys((prev) => new Set(prev).add(key));
  }

  function handleMarkClean(key: string) {
    setDirtyKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notification Templates</h1>
        <p className="text-sm text-muted-foreground">
          Edit email, SMS, and in-app notification templates.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="rounded-lg border">
          <TemplateList
            templates={templates ?? []}
            selectedId={selectedKey}
            isLoading={isLoading}
            hasUnsaved={(id) => dirtyKeys.has(id)}
            onSelect={handleSelect}
          />
        </div>
        <div className="rounded-lg border p-4">
          <TemplateEditor
            template={selectedTemplate}
            channel={selectedChannel}
            onMarkDirty={handleMarkDirty}
            onMarkClean={handleMarkClean}
          />
        </div>
      </div>
    </div>
  );
}
