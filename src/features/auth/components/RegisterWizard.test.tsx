import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { RegisterWizard } from "@/features/auth/components/RegisterWizard";
import { apiClient } from "@/lib/api-client";

const push = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("RegisterWizard", () => {
  beforeEach(() => {
    push.mockReset();
    apiClient.defaults.adapter = async (config) => ({
      status: 201,
      statusText: "Created",
      headers: {},
      config,
      data: {},
    });
  });

  it("blocks step navigation until the current step is valid", async () => {
    const user = userEvent.setup();
    renderWithQuery(<RegisterWizard />);

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText(/company name must be/i)).toBeInTheDocument();
    expect(screen.getByText(/Country is required/i)).toBeInTheDocument();
  });

  it("preserves progress and redirects after successful registration", async () => {
    const user = userEvent.setup();
    renderWithQuery(<RegisterWizard />);

    await user.type(screen.getByLabelText(/company name/i), "Acme");
    await user.type(screen.getByLabelText(/country/i), "US");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.type(await screen.findByLabelText(/full name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /next/i }));
    expect(await screen.findByText("Acme")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByText(/account created/i)).toBeInTheDocument();
    await waitFor(() => expect(push).toHaveBeenCalledWith("/login"), { timeout: 3000 });
  }, 8000);

  it("maps API validation errors back to the correct field and step", async () => {
    const user = userEvent.setup();
    apiClient.defaults.adapter = async (config) =>
      Promise.reject({
        isAxiosError: true,
        config,
        response: {
          status: 400,
          statusText: "Bad Request",
          headers: {},
          config,
          data: { email: ["Email already registered"] },
        },
      });
    renderWithQuery(<RegisterWizard />);

    await user.type(screen.getByLabelText(/company name/i), "Acme");
    await user.type(screen.getByLabelText(/country/i), "US");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.type(await screen.findByLabelText(/full name/i), "Ada Lovelace");
    await user.type(screen.getByLabelText(/email/i), "ada@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "password123");
    await user.type(screen.getByLabelText(/confirm password/i), "password123");
    await user.click(screen.getByRole("button", { name: /next/i }));
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(await screen.findByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByText("Email already registered")).toBeInTheDocument();
  });
});
