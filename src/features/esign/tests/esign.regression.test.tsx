/**
 * Regression tests for the eSign module.
 * Tests EsignRequestList, SignerView, SignaturePad, DeclineModal integration.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { EsignRequestList } from "@/features/esign/components/EsignRequestList";
import { SignerView } from "@/features/esign/components/SignerView";

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock("@/features/esign/hooks/useEsignRequests", () => ({
  useEsignRequest: () => ({
    data: {
      id: "esign-1",
      documentId: "doc-1",
      requestedBy: "admin",
      signerEmployeeId: "emp-002",
      status: "PENDING",
      documentSha256AtSign: null,
      declineReason: null,
      expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
      signedAt: null,
      declinedAt: null,
      createdAt: "2025-06-01T10:00:00Z",
      updatedAt: "2025-06-01T10:00:00Z",
    },
    isLoading: false,
    isError: false,
  }),
  useEsignRequests: () => ({
    data: [
      {
        id: "esign-1",
        documentId: "doc-1",
        requestedBy: "admin",
        signerEmployeeId: "emp-002",
        status: "PENDING",
        documentSha256AtSign: null,
        declineReason: null,
        expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(),
        signedAt: null,
        declinedAt: null,
        createdAt: "2025-06-01T10:00:00Z",
        updatedAt: "2025-06-01T10:00:00Z",
      },
    ],
    isLoading: false,
    isError: false,
  }),
  useCreateEsignRequest: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useSignDocument: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useDeclineEsign: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/features/documents/hooks/useDocuments", () => ({
  useSignedUrl: () => ({
    data: { signedUrl: "https://signed.example.com/doc-1", expiresInSeconds: 900 },
    isLoading: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ requestId: "esign-1" }),
}));

// ─── Setup ───────────────────────────────────────────────────────
function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ═══════════════════════════════════════════════════════════════════
describe("eSign Regression Tests", () => {
  describe("EsignRequestList", () => {
    it("renders all status filter buttons", () => {
      renderWithProviders(
        <EsignRequestList
          requests={[]}
          isLoading={false}
          statusFilter="all"
          onStatusFilterChange={vi.fn()}
          onCreateRequest={vi.fn()}
        />,
      );

      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Signed" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Declined" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Expired" })).toBeInTheDocument();
    });

    it("has Create Request button", () => {
      renderWithProviders(
        <EsignRequestList
          requests={[]}
          isLoading={false}
          statusFilter="all"
          onStatusFilterChange={vi.fn()}
          onCreateRequest={vi.fn()}
        />,
      );

      expect(
        screen.getByRole("button", { name: /create request/i }),
      ).toBeInTheDocument();
    });

    it("fires onCreateRequest when button clicked", async () => {
      const onCreateRequest = vi.fn();
      const user = userEvent.setup();
      renderWithProviders(
        <EsignRequestList
          requests={[]}
          isLoading={false}
          statusFilter="all"
          onStatusFilterChange={vi.fn()}
          onCreateRequest={onCreateRequest}
        />,
      );

      await user.click(screen.getByRole("button", { name: /create request/i }));
      expect(onCreateRequest).toHaveBeenCalled();
    });

    it("shows empty state when no requests", () => {
      renderWithProviders(
        <EsignRequestList
          requests={[]}
          isLoading={false}
          statusFilter="all"
          onStatusFilterChange={vi.fn()}
          onCreateRequest={vi.fn()}
        />,
      );

      expect(screen.getByText("No eSign requests found.")).toBeInTheDocument();
    });
  });

  describe("SignerView", () => {
    it("renders PENDING banner", () => {
      renderWithProviders(<SignerView requestId="esign-1" />);

      expect(
        screen.getByText(/This document is awaiting your signature/),
      ).toBeInTheDocument();

      expect(screen.getByText(/Expires/)).toBeInTheDocument();
    });

    it("renders Draw and Type signature tabs", () => {
      renderWithProviders(<SignerView requestId="esign-1" />);

      expect(screen.getByRole("button", { name: "Draw" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Type" })).toBeInTheDocument();
    });

    it("sign button is disabled without signature", () => {
      renderWithProviders(<SignerView requestId="esign-1" />);

      const signBtn = screen.getByRole("button", { name: /sign document/i });
      expect(signBtn).toBeDisabled();
    });

    it("decline button is present and enabled", () => {
      renderWithProviders(<SignerView requestId="esign-1" />);

      const declineBtn = screen.getByRole("button", { name: /decline/i });
      expect(declineBtn).toBeInTheDocument();
      expect(declineBtn).not.toBeDisabled();
    });

    it("opens decline modal on decline click", async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignerView requestId="esign-1" />);

      await user.click(screen.getByRole("button", { name: /decline/i }));

      expect(
        screen.getByRole("heading", { name: /decline signature request/i }),
      ).toBeInTheDocument();
    });

    it("document preview iframe renders", () => {
      renderWithProviders(<SignerView requestId="esign-1" />);

      const iframe = document.querySelector("iframe");
      expect(iframe).toBeInTheDocument();
    });
  });
});
