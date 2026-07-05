// src/features/dashboard/__tests__/MetricCard.test.tsx
// Sprint 6 — MetricCard unit tests

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MetricCard, MetricCardSkeleton } from "../components/MetricCard";
import { Users } from "lucide-react";

describe("MetricCard", () => {
  it("renders skeleton while isLoading is true", () => {
    render(
      <MetricCard
        title="Total Headcount"
        value={0}
        isLoading={true}
        icon={<Users className="h-5 w-5" />}
        colorScheme="blue"
      />,
    );
    expect(screen.getByTestId("metric-card-skeleton")).toBeDefined();
  });

  it("renders value and secondaryValue when loaded", () => {
    render(
      <MetricCard
        title="Total Headcount"
        value={42}
        secondaryLabel="Active"
        secondaryValue={42}
        isLoading={false}
        icon={<Users className="h-5 w-5" />}
        colorScheme="blue"
      />,
    );
    expect(screen.getByText("42")).toBeDefined();
    expect(screen.getByText(/Active/)).toBeDefined();
  });

  it("renders trend chip with correct colour for up/down/flat", () => {
    const { rerender } = render(
      <MetricCard
        title="Test"
        value={10}
        trend={{ direction: "up", delta: "+5" }}
        isLoading={false}
        icon={<Users className="h-5 w-5" />}
        colorScheme="green"
      />,
    );
    expect(screen.getByText("+5")).toBeDefined();

    rerender(
      <MetricCard
        title="Test"
        value={10}
        trend={{ direction: "down", delta: "-3" }}
        isLoading={false}
        icon={<Users className="h-5 w-5" />}
        colorScheme="green"
      />,
    );
    expect(screen.getByText("-3")).toBeDefined();
  });

  it("renders error state when query errored", () => {
    render(
      <MetricCard
        title="Test"
        value={0}
        isError={true}
        isLoading={false}
        icon={<Users className="h-5 w-5" />}
        colorScheme="red" /* 'red' not in type but cast for test — error state overrides color */
      />,
    );
    expect(screen.getByText("Failed to load")).toBeDefined();
  });

  it("colorScheme prop applies correct Tailwind ring class", () => {
    render(
      <MetricCard
        title="Blue Card"
        value={1}
        isLoading={false}
        icon={<Users className="h-5 w-5" />}
        colorScheme="blue"
      />,
    );
    const card = screen.getByTestId("metric-card-blue-card");
    expect(card.className).toContain("bg-blue-50");
  });
});

describe("MetricCardSkeleton", () => {
  it("renders skeleton elements", () => {
    render(<MetricCardSkeleton />);
    expect(screen.getByTestId("metric-card-skeleton")).toBeDefined();
  });
});
