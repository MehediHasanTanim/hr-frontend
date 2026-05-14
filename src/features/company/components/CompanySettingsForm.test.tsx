import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CompanySettingsForm } from "@/features/company/components/CompanySettingsForm";
import { apiClient } from "@/lib/api-client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

function renderWithQuery(ui: React.ReactNode) {
  return render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      {ui}
    </QueryClientProvider>,
  );
}

describe("CompanySettingsForm", () => {
  beforeEach(() => {
    apiClient.defaults.adapter = async (config) => {
      if (config.method === "get") {
        return {
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: {
            name: "Acme",
            address: "1 Main St",
            phone: "12345",
            logoUrl: "",
            timezone: "UTC",
            currency: "USD",
            dateFormat: "YYYY-MM-DD",
            fiscalYearStartMonth: "January",
          },
        };
      }
      return { status: 200, statusText: "OK", headers: {}, config, data: {} };
    };
  });

  it("saves each section independently and shows a toast", async () => {
    const user = userEvent.setup();
    renderWithQuery(<CompanySettingsForm />);

    await screen.findByDisplayValue("Acme");
    await user.click(screen.getByRole("button", { name: /save profile/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Settings saved");
    await user.click(screen.getByRole("button", { name: /save localisation/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Settings saved");
    await user.click(screen.getByRole("button", { name: /save fiscal year/i }));
    expect(await screen.findByRole("status")).toHaveTextContent("Settings saved");
  });

  it("renders logo preview before upload", async () => {
    const user = userEvent.setup();
    URL.createObjectURL = vi.fn(() => "blob:preview");
    renderWithQuery(<CompanySettingsForm />);

    const input = await screen.findByLabelText(/logo/i);
    await user.upload(input, new File(["logo"], "logo.png", { type: "image/png" }));

    expect(await screen.findByAltText(/logo preview/i)).toHaveAttribute("src", "blob:preview");
  });

  it("shows an error toast and reverts the edited section when save fails", async () => {
    const user = userEvent.setup();
    apiClient.defaults.adapter = async (config) => {
      if (config.method === "get") {
        return {
          status: 200,
          statusText: "OK",
          headers: {},
          config,
          data: {
            name: "Acme",
            address: "1 Main St",
            phone: "12345",
            logoUrl: "",
            timezone: "UTC",
            currency: "USD",
            dateFormat: "YYYY-MM-DD",
            fiscalYearStartMonth: "January",
          },
        };
      }
      return Promise.reject({
        isAxiosError: true,
        config,
        response: {
          status: 500,
          statusText: "Server Error",
          headers: {},
          config,
          data: { detail: "Unable to save profile" },
        },
      });
    };
    renderWithQuery(<CompanySettingsForm />);

    const name = await screen.findByDisplayValue("Acme");
    await user.clear(name);
    await user.type(name, "Changed Co");
    await user.click(screen.getByRole("button", { name: /save profile/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("Unable to save profile");
    expect(await screen.findByDisplayValue("Acme")).toBeInTheDocument();
  });
});
