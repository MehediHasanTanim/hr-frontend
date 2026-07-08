// src/features/surveys/components/SurveyBuilder.tsx
// Sprint 10 F4 — Top-level survey builder orchestrator
// Draft state: local Zustand, persisted to backend on explicit "Save"

"use client";

import React, { useState, useCallback } from "react";
import { Loader2, Save, Eye, Send } from "lucide-react";
import { create } from "zustand";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useSaveSurveyMutation } from "@/features/surveys/hooks/useSaveSurveyMutation";
import { useSurveyDraftQuery } from "@/features/surveys/hooks/useSurveyDraftQuery";
import { QuestionTypeSelector } from "./QuestionTypeSelector";
import { QuestionEditorCard } from "./QuestionEditorCard";
import { SurveyPreviewPane } from "./SurveyPreviewPane";
import { LaunchSchedulerModal } from "./LaunchSchedulerModal";
import type {
  SurveyQuestionDraft,
  SurveyQuestionType,
} from "@/features/surveys/types/surveys.types";

// ─── Builder UI State (Zustand) ───────────────────────────────
interface BuilderState {
  isPreview: boolean;
  showLaunchModal: boolean;
  togglePreview: () => void;
  setShowLaunchModal: (v: boolean) => void;
}

const useBuilderStore = create<BuilderState>((set) => ({
  isPreview: false,
  showLaunchModal: false,
  togglePreview: () => set((s) => ({ isPreview: !s.isPreview })),
  setShowLaunchModal: (v) => set({ showLaunchModal: v }),
}));

interface SurveyBuilderProps {
  surveyId?: string;
}

export function SurveyBuilder({ surveyId }: SurveyBuilderProps) {
  const { data: existingSurvey, isLoading: surveyLoading } =
    useSurveyDraftQuery(surveyId ?? "");
  const saveMutation = useSaveSurveyMutation(surveyId);
  const { isPreview, togglePreview, showLaunchModal, setShowLaunchModal } =
    useBuilderStore();

  const [title, setTitle] = useState(existingSurvey?.title ?? "");
  const [description, setDescription] = useState(
    existingSurvey?.description ?? "",
  );
  const [questions, setQuestions] = useState<SurveyQuestionDraft[]>(
    existingSurvey?.questions ?? [],
  );
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [reorderDragId, setReorderDragId] = useState<string | null>(null);

  // Sync with loaded survey
  React.useEffect(() => {
    if (existingSurvey) {
      setTitle(existingSurvey.title);
      setDescription(existingSurvey.description);
      setQuestions(existingSurvey.questions);
    }
  }, [existingSurvey]);

  const handleAddQuestion = useCallback(
    (type: SurveyQuestionType) => {
      const newQ: SurveyQuestionDraft = {
        id: crypto.randomUUID(),
        orderIndex: questions.length,
        prompt: "",
        type,
        options:
          type === "SINGLE_CHOICE" || type === "MULTI_CHOICE" ? [""] : undefined,
        required: true,
      };
      setQuestions((prev) => [...prev, newQ]);
      setShowTypeSelector(false);
    },
    [questions.length],
  );

  const handleUpdateQuestion = useCallback(
    (updated: SurveyQuestionDraft) => {
      setQuestions((prev) =>
        prev.map((q) => (q.id === updated.id ? updated : q)),
      );
    },
    [],
  );

  const handleRemoveQuestion = useCallback((id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  }, []);

  const handleMoveQuestion = useCallback(
    (questionId: string, direction: "up" | "down") => {
      setQuestions((prev) => {
        const idx = prev.findIndex((q) => q.id === questionId);
        if (idx === -1) return prev;
        const newIdx = direction === "up" ? idx - 1 : idx + 1;
        if (newIdx < 0 || newIdx >= prev.length) return prev;
        const copy = [...prev];
        [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
        return copy.map((q, i) => ({ ...q, orderIndex: i }));
      });
    },
    [],
  );

  const handleDragStart = useCallback(
    (e: React.DragEvent, questionId: string) => {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", questionId);
      setReorderDragId(questionId);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetId: string) => {
      e.preventDefault();
      const sourceId = e.dataTransfer.getData("text/plain");
      if (sourceId === targetId) {
        setReorderDragId(null);
        return;
      }
      setQuestions((prev) => {
        const sourceIdx = prev.findIndex((q) => q.id === sourceId);
        const targetIdx = prev.findIndex((q) => q.id === targetId);
        if (sourceIdx === -1 || targetIdx === -1) return prev;
        const copy = [...prev];
        const [moved] = copy.splice(sourceIdx, 1);
        copy.splice(targetIdx, 0, moved);
        return copy.map((q, i) => ({ ...q, orderIndex: i }));
      });
      setReorderDragId(null);
    },
    [],
  );

  const handleSave = useCallback(() => {
    saveMutation.mutate({
      title,
      description,
      questions: questions.map(({ id: _id, ...rest }) => rest),
    });
  }, [title, description, questions, saveMutation]);

  if (surveyLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isLaunched = existingSurvey?.status === "LAUNCHED";
  const isClosed = existingSurvey?.status === "CLOSED";
  const isEditable = !isLaunched && !isClosed;

  return (
    <div data-testid="survey-builder" className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold">
          {surveyId ? "Edit Survey" : "New Survey"}
        </h2>
        <div className="flex items-center gap-2">
          {!isClosed && (
            <button
              type="button"
              data-testid="preview-toggle-btn"
              onClick={togglePreview}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium",
                isPreview
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted transition-colors",
              )}
            >
              <Eye className="h-4 w-4" />
              {isPreview ? "Edit" : "Preview"}
            </button>
          )}

          {isEditable && (
            <button
              type="button"
              data-testid="save-survey-btn"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </button>
          )}

          {existingSurvey && existingSurvey.status === "DRAFT" && (
            <button
              type="button"
              data-testid="launch-survey-btn"
              onClick={() => setShowLaunchModal(true)}
              className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <Send className="h-4 w-4" />
              Launch
            </button>
          )}
        </div>
      </div>

      {/* Preview mode */}
      {isPreview && (
        <SurveyPreviewPane
          title={title}
          description={description}
          questions={questions}
        />
      )}

      {/* Editor mode */}
      {!isPreview && (
        <>
          {isEditable ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Survey Title
                </label>
                <Input
                  value={title}
                  data-testid="survey-title-input"
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q4 Employee Engagement Survey"
                  disabled={!isEditable}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={description}
                  data-testid="survey-description-input"
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Optional description..."
                  disabled={!isEditable}
                />
              </div>

              <div className="space-y-3">
                {questions.map((q, idx) => (
                  <div
                    key={q.id}
                    draggable={isEditable}
                    onDragStart={(e) => handleDragStart(e, q.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, q.id)}
                    onDragEnd={() => setReorderDragId(null)}
                    className={cn(
                      reorderDragId === q.id && "opacity-50",
                    )}
                  >
                    <QuestionEditorCard
                      question={q}
                      index={idx}
                      onChange={handleUpdateQuestion}
                      onRemove={handleRemoveQuestion}
                      isDragging={reorderDragId === q.id}
                      dragHandleProps={isEditable ? {
                        onDragStart: (e) => {
                          e.dataTransfer.effectAllowed = "move";
                          e.dataTransfer.setData("text/plain", q.id);
                          setReorderDragId(q.id);
                        },
                      } : undefined}
                    />
                  </div>
                ))}

                {questions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No questions yet. Add your first question below.
                  </p>
                )}
              </div>

              {showTypeSelector ? (
                <QuestionTypeSelector
                  onSelect={handleAddQuestion}
                />
              ) : (
                <button
                  type="button"
                  data-testid="add-question-btn"
                  onClick={() => setShowTypeSelector(true)}
                  disabled={!isEditable}
                  className="w-full rounded-lg border-2 border-dashed border-muted-foreground/30 p-4 text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary disabled:opacity-50 transition-colors"
                >
                  + Add Question
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">{title}</h3>
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
              <div className="space-y-3 mt-4">
                {questions.map((q, idx) => (
                  <div key={q.id} className="rounded-lg border p-4">
                    <p className="text-sm font-medium">
                      {idx + 1}. {q.prompt}
                      {q.required && (
                        <span className="text-destructive ml-1">*</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {q.type === "LIKERT_5"
                        ? "Rating (1–5)"
                        : q.type === "SINGLE_CHOICE"
                          ? "Single Choice"
                          : q.type === "MULTI_CHOICE"
                            ? "Multi Choice"
                            : "Free Text"}
                    </p>
                  </div>
                ))}
              </div>
              {isLaunched && (
                <p className="text-sm text-amber-600 font-medium mt-4">
                  This survey has been launched. Questions cannot be edited.
                </p>
              )}
              {isClosed && (
                <p className="text-sm text-muted-foreground mt-4">
                  This survey is closed.
                </p>
              )}
            </div>
          )}
        </>
      )}

      {showLaunchModal && existingSurvey && (
        <LaunchSchedulerModal
          surveyId={existingSurvey.id}
          onClose={() => setShowLaunchModal(false)}
        />
      )}
    </div>
  );
}
