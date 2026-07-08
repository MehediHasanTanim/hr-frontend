// src/features/surveys/__tests__/surveys.regression.test.tsx
// Sprint 10 — Survey Builder & Response Unit Tests (Vitest + RTL)

import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RatingStarsInput } from "@/features/surveys/components/widgets/RatingStarsInput";
import { SingleChoiceInput } from "@/features/surveys/components/widgets/SingleChoiceInput";
import { MultiChoiceInput } from "@/features/surveys/components/widgets/MultiChoiceInput";
import { FreeTextInput } from "@/features/surveys/components/widgets/FreeTextInput";
import { SubmitConfirmation } from "@/features/surveys/components/SubmitConfirmation";
import { QuestionTypeSelector } from "@/features/surveys/components/QuestionTypeSelector";
import { QuestionEditorCard } from "@/features/surveys/components/QuestionEditorCard";
import {
  surveyQuestionSchema,
  submitSurveyResponseSchema,
} from "@/features/surveys/schemas/survey.schema";
import type { SurveyQuestionDraft } from "@/features/surveys/types/surveys.types";

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

// ─── RatingStarsInput (accessibility-critical) ─────────────────
describe("RatingStarsInput", () => {
  it("renders 5 stars with radiogroup role", () => {
    render(<RatingStarsInput value={null} onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByRole("radiogroup")).toBeDefined();
    const stars = screen.getAllByRole("radio");
    expect(stars).toHaveLength(5);
  });

  it("calls onChange when a star is clicked", async () => {
    const onChange = vi.fn();
    render(<RatingStarsInput value={null} onChange={onChange} questionId="q1" />);
    await userEvent.click(screen.getByTestId("star-q1-3"));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("fills stars up to the selected value", () => {
    render(<RatingStarsInput value={3} onChange={vi.fn()} questionId="q1" />);
    const star4 = screen.getByTestId("star-q1-4");
    // 4th star should not be filled when value is 3
    expect(star4.ariaChecked).toBe("false");
  });

  it("is keyboard-accessible — ArrowRight moves focus", async () => {
    const onChange = vi.fn();
    render(<RatingStarsInput value={null} onChange={onChange} questionId="q1" />);
    const star1 = screen.getByTestId("star-q1-1");
    star1.focus();
    fireEvent.keyDown(star1, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("is keyboard-accessible — ArrowUp on star 3 goes to star 2", async () => {
    const onChange = vi.fn();
    render(<RatingStarsInput value={3} onChange={onChange} questionId="q1" />);
    const star3 = screen.getByTestId("star-q1-3");
    star3.focus();
    fireEvent.keyDown(star3, { key: "ArrowUp" });
    // ArrowUp on index 2 → goes to index 1 → calls onChange(2)
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it("disables when disabled prop is true", () => {
    render(<RatingStarsInput value={null} onChange={vi.fn()} questionId="q1" disabled />);
    const stars = screen.getAllByRole("radio");
    stars.forEach((star) => {
      expect(star).toBeDisabled();
    });
  });

  it("shows value text when selected", () => {
    render(<RatingStarsInput value={4} onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByText("4 / 5")).toBeDefined();
  });
});

// ─── SingleChoiceInput ─────────────────────────────────────────
describe("SingleChoiceInput", () => {
  const options = ["Option A", "Option B", "Option C"];

  it("renders all options as radio buttons", () => {
    render(<SingleChoiceInput options={options} value={null} onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByText("Option A")).toBeDefined();
    expect(screen.getByText("Option B")).toBeDefined();
    expect(screen.getByText("Option C")).toBeDefined();
  });

  it("calls onChange when an option is selected", async () => {
    const onChange = vi.fn();
    render(<SingleChoiceInput options={options} value={null} onChange={onChange} questionId="q1" />);
    await userEvent.click(screen.getByTestId("radio-q1-0"));
    expect(onChange).toHaveBeenCalledWith("Option A");
  });

  it("highlights the selected option", () => {
    render(<SingleChoiceInput options={options} value="Option B" onChange={vi.fn()} questionId="q1" />);
    const radio = screen.getByTestId("radio-q1-1") as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });
});

// ─── MultiChoiceInput ──────────────────────────────────────────
describe("MultiChoiceInput", () => {
  const options = ["Red", "Green", "Blue"];

  it("renders all options as checkboxes", () => {
    render(<MultiChoiceInput options={options} value={[]} onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByText("Red")).toBeDefined();
    expect(screen.getByText("Green")).toBeDefined();
    expect(screen.getByText("Blue")).toBeDefined();
  });

  it("adds option when checked", async () => {
    const onChange = vi.fn();
    render(<MultiChoiceInput options={options} value={[]} onChange={onChange} questionId="q1" />);
    await userEvent.click(screen.getByTestId("checkbox-q1-0"));
    expect(onChange).toHaveBeenCalledWith(["Red"]);
  });

  it("removes option when unchecked", async () => {
    const onChange = vi.fn();
    render(<MultiChoiceInput options={options} value={["Red", "Green"]} onChange={onChange} questionId="q1" />);
    await userEvent.click(screen.getByTestId("checkbox-q1-0"));
    expect(onChange).toHaveBeenCalledWith(["Green"]);
  });
});

// ─── FreeTextInput ─────────────────────────────────────────────
describe("FreeTextInput", () => {
  it("renders textarea with placeholder", () => {
    render(<FreeTextInput value="" onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByPlaceholderText("Type your answer...")).toBeDefined();
  });

  it("calls onChange on input", async () => {
    const onChange = vi.fn();
    render(<FreeTextInput value="" onChange={onChange} questionId="q1" />);
    await userEvent.type(screen.getByTestId("free-text-q1"), "Hello");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows character count", () => {
    render(<FreeTextInput value="Hello" onChange={vi.fn()} questionId="q1" />);
    expect(screen.getByText("5 / 2000")).toBeDefined();
  });
});

// ─── SubmitConfirmation ────────────────────────────────────────
describe("SubmitConfirmation", () => {
  it("renders anonymous confirmation message — never includes employee name", () => {
    render(<SubmitConfirmation />);
    expect(screen.getByText("Your response has been submitted anonymously.")).toBeDefined();
    // Must NOT contain "Thanks, [Name]" or any personalization
    expect(screen.queryByText(/Thanks,/)).toBeNull();
  });
});

// ─── QuestionTypeSelector ──────────────────────────────────────
describe("QuestionTypeSelector", () => {
  it("renders all question type options", () => {
    render(<QuestionTypeSelector onSelect={vi.fn()} />);
    expect(screen.getByTestId("question-type-LIKERT_5")).toBeDefined();
    expect(screen.getByTestId("question-type-SINGLE_CHOICE")).toBeDefined();
    expect(screen.getByTestId("question-type-MULTI_CHOICE")).toBeDefined();
    expect(screen.getByTestId("question-type-FREE_TEXT")).toBeDefined();
  });

  it("calls onSelect with the selected type", async () => {
    const onSelect = vi.fn();
    render(<QuestionTypeSelector onSelect={onSelect} />);
    await userEvent.click(screen.getByTestId("question-type-LIKERT_5"));
    expect(onSelect).toHaveBeenCalledWith("LIKERT_5");
  });
});

// ─── QuestionEditorCard ────────────────────────────────────────
describe("QuestionEditorCard", () => {
  const baseQ: SurveyQuestionDraft = {
    id: "q1",
    orderIndex: 0,
    prompt: "How satisfied are you?",
    type: "LIKERT_5",
    required: true,
  };

  it("renders question prompt and type label", () => {
    render(
      <QuestionEditorCard question={baseQ} index={0} onChange={vi.fn()} onRemove={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByDisplayValue("How satisfied are you?")).toBeDefined();
    expect(screen.getByText("Question 1 — Rating")).toBeDefined();
  });

  it("shows options input for choice questions", () => {
    const choiceQ: SurveyQuestionDraft = {
      ...baseQ,
      type: "SINGLE_CHOICE",
      options: ["Option 1"],
    };
    render(
      <QuestionEditorCard question={choiceQ} index={1} onChange={vi.fn()} onRemove={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.getByTestId("add-option-q1")).toBeDefined();
  });

  it("does not show options for LIKERT_5 type", () => {
    render(
      <QuestionEditorCard question={baseQ} index={0} onChange={vi.fn()} onRemove={vi.fn()} />,
      { wrapper: Wrapper },
    );
    expect(screen.queryByTestId("add-option-q1")).toBeNull();
  });

  it("calls onRemove when remove button is clicked", async () => {
    const onRemove = vi.fn();
    render(
      <QuestionEditorCard question={baseQ} index={0} onChange={vi.fn()} onRemove={onRemove} />,
      { wrapper: Wrapper },
    );
    await userEvent.click(screen.getByTestId("remove-question-q1"));
    expect(onRemove).toHaveBeenCalledWith("q1");
  });
});

// ─── Zod Schemas ────────────────────────────────────────────────
describe("survey schemas", () => {
  it("surveyQuestionSchema requires options for SINGLE_CHOICE", () => {
    const result = surveyQuestionSchema.safeParse({
      prompt: "Pick one",
      type: "SINGLE_CHOICE",
      required: true,
    });
    expect(result.success).toBe(false);
  });

  it("surveyQuestionSchema accepts choice with options", () => {
    const result = surveyQuestionSchema.safeParse({
      prompt: "Pick one",
      type: "SINGLE_CHOICE",
      options: ["A", "B"],
      required: true,
    });
    expect(result.success).toBe(true);
  });

  it("surveyQuestionSchema accepts FREE_TEXT without options", () => {
    const result = surveyQuestionSchema.safeParse({
      prompt: "Comments?",
      type: "FREE_TEXT",
      required: false,
    });
    expect(result.success).toBe(true);
  });

  // ── CRITICAL: Anonymity contract ──────────────────────────────
  it("submitSurveyResponseSchema has NO employeeId field", () => {
    const hasEmployeeId = "employeeId" in submitSurveyResponseSchema.shape;
    expect(hasEmployeeId).toBe(false);
  });

  it("submitSurveyResponseSchema accepts valid anonymous payload", () => {
    const result = submitSurveyResponseSchema.safeParse({
      surveyId: "550e8400-e29b-41d4-a716-446655440000",
      answers: [
        {
          questionId: "550e8400-e29b-41d4-a716-446655440001",
          answer: 5,
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});
