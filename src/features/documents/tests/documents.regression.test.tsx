/**
 * Regression tests for the Documents module.
 * Tests integration of multiple components working together.
 * Maps to: FE-DOC-001
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { DocumentVault } from "@/features/documents/components/DocumentVault";
import { DocumentList } from "@/features/documents/components/DocumentList";
import { DocumentUploadDropzone } from "@/features/documents/components/DocumentUploadDropzone";

// ─── Mocks ───────────────────────────────────────────────────────
const mockUploadMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockSignedUrlRefetch = vi.fn();

vi.mock("@/features/documents/hooks/useDocuments", () => ({
  useDocuments: (employeeId: string, category?: string) => ({
    data: [
      {
        id: "doc-1",
        employeeId: "emp-001",
        category: "CONTRACT",
        originalName: "employment_contract.pdf",
        mimeType: "application/pdf",
        sizeBytes: 1024000,
        version: 1,
        sha256Hash: "abc123",
        description: "Standard contract",
        uploadedBy: "admin",
        createdAt: "2025-01-15T10:00:00Z",
      },
      {
        id: "doc-2",
        employeeId: "emp-001",
        category: "CERTIFICATE",
        originalName: "degree_cert.pdf",
        mimeType: "application/pdf",
        sizeBytes: 2048000,
        version: 2,
        sha256Hash: "def456",
        description: null,
        uploadedBy: "admin",
        createdAt: "2025-02-20T10:00:00Z",
      },
      {
        id: "doc-3",
        employeeId: "emp-001",
        category: "NID",
        originalName: "national_id.png",
        mimeType: "image/png",
        sizeBytes: 512000,
        version: 1,
        sha256Hash: "ghi789",
        description: null,
        uploadedBy: null,
        createdAt: "2025-03-10T10:00:00Z",
      },
    ],
    isLoading: false,
  }),
  useUploadDocument: () => ({
    mutate: mockUploadMutate,
    isPending: false,
    uploadProgress: 0,
    isError: false,
    error: null,
  }),
  useSignedUrl: () => ({
    refetch: mockSignedUrlRefetch.mockResolvedValue({
      data: { signedUrl: "https://signed.example.com/doc.pdf", expiresInSeconds: 900 },
    }),
    isFetching: false,
    data: null,
  }),
  useDeleteDocument: () => ({
    mutate: mockDeleteMutate,
    isPending: false,
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), back: vi.fn() }),
  useParams: () => ({ employeeId: "emp-001" }),
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
  mockUploadMutate.mockReset();
  mockDeleteMutate.mockReset();
  mockSignedUrlRefetch.mockReset();
  mockSignedUrlRefetch.mockResolvedValue({
    data: { signedUrl: "https://signed.example.com/doc.pdf", expiresInSeconds: 900 },
  });
});

// ═══════════════════════════════════════════════════════════════════
describe("Documents Regression Tests", () => {
  describe("FE-DOC-001: Document Vault Integration", () => {
    it("renders full document vault with all category tabs", () => {
      renderWithProviders(<DocumentVault employeeId="emp-001" userRole="HR_ADMIN" />);

      // Title
      expect(screen.getByText("Document Vault")).toBeInTheDocument();

      // All 6 category filter tabs
      expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Contract" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "NID" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Certificate" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Payslip" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Other" })).toBeInTheDocument();

      // Upload button
      expect(screen.getByRole("button", { name: /upload document/i })).toBeInTheDocument();
    });

    it("toggles upload section on button click", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DocumentVault employeeId="emp-001" userRole="HR_ADMIN" />);

      // Click upload button
      const uploadBtn = screen.getByRole("button", { name: /upload document/i });
      await user.click(uploadBtn);

      // Upload dropzone visible
      expect(screen.getByText(/Drag & drop a file here/)).toBeInTheDocument();

      // Button text changes to Cancel
      expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

      // Click Cancel hides dropzone
      await user.click(screen.getByRole("button", { name: "Cancel" }));
      expect(screen.queryByText(/Drag & drop a file here/)).not.toBeInTheDocument();
    });

    it("shows all document rows with correct structure", () => {
      renderWithProviders(<DocumentVault employeeId="emp-001" userRole="HR_ADMIN" />);

      // Document names visible
      expect(screen.getByText("employment_contract.pdf")).toBeInTheDocument();
      expect(screen.getByText("degree_cert.pdf")).toBeInTheDocument();
      expect(screen.getByText("national_id.png")).toBeInTheDocument();

      // Category badges
      expect(screen.getByText("CONTRACT")).toBeInTheDocument();
      expect(screen.getByText("CERTIFICATE")).toBeInTheDocument();
      const nidElements = screen.getAllByText("NID");
      expect(nidElements.length).toBeGreaterThanOrEqual(1);

      // Version info — v1 and v2 appear on multiple rows
      const v1Elements = screen.getAllByText("v1");
      expect(v1Elements.length).toBeGreaterThanOrEqual(1);
      const v2Elements = screen.getAllByText("v2");
      expect(v2Elements.length).toBeGreaterThanOrEqual(1);

      // Download buttons
      const downloadButtons = screen.getAllByRole("button", { name: /download/i });
      expect(downloadButtons.length).toBeGreaterThanOrEqual(2);
    });

    it("shows correct file size formatting", () => {
      renderWithProviders(<DocumentVault employeeId="emp-001" userRole="HR_ADMIN" />);

      const kbElements = screen.getAllByText(/KB/);
      expect(kbElements.length).toBeGreaterThanOrEqual(1);
      const mbElements = screen.getAllByText(/MB/);
      expect(mbElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText(/MB/)).toBeInTheDocument();
    });

    it("shows delete buttons for HR_ADMIN", () => {
      renderWithProviders(<DocumentVault employeeId="emp-001" userRole="HR_ADMIN" />);

      const deleteButtons = screen.getAllByLabelText("Delete document");
      expect(deleteButtons.length).toBeGreaterThanOrEqual(1);
    });

    it("delete triggers inline confirmation flow", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DocumentList employeeId="emp-001" userRole="HR_ADMIN" />);

      // Click delete
      const deleteBtn = screen.getAllByLabelText("Delete document")[0];
      if (deleteBtn) {
        await user.click(deleteBtn);

        // Confirmation text appears
        expect(screen.getByText(/Delete this document?/)).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();

        // Cancel hides confirmation
        await user.click(screen.getByRole("button", { name: "Cancel" }));
        expect(screen.queryByText(/Delete this document?/)).not.toBeInTheDocument();
      }
    });

    it("download button triggers signed URL fetch", async () => {
      const user = userEvent.setup();
      renderWithProviders(<DocumentList employeeId="emp-001" userRole="HR_ADMIN" />);

      const downloadBtn = screen.getAllByRole("button", { name: /download/i })[0];
      if (downloadBtn) {
        await user.click(downloadBtn);
        // Signed URL should have been requested
        expect(mockSignedUrlRefetch).toHaveBeenCalled();
      }
    });
  });

  describe("FE-DOC-001: Document Upload Dropzone", () => {
    it("renders with all form fields", () => {
      renderWithProviders(<DocumentUploadDropzone employeeId="emp-001" />);

      expect(screen.getByText(/Drag & drop a file here/)).toBeInTheDocument();
      expect(screen.getByLabelText("Category")).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/add a brief description/i)).toBeInTheDocument();
    });

    it("submit button is disabled without file", () => {
      renderWithProviders(<DocumentUploadDropzone employeeId="emp-001" />);

      const submitBtn = screen.getByRole("button", { name: /upload document/i });
      expect(submitBtn).toBeDisabled();
    });

    it("category selector has all 5 options", () => {
      renderWithProviders(<DocumentUploadDropzone employeeId="emp-001" />);

      const select = screen.getByLabelText("Category") as HTMLSelectElement;
      expect(select.options.length).toBe(5);
      expect(Array.from(select.options).map((o) => o.value)).toEqual([
        "CONTRACT",
        "NID",
        "CERTIFICATE",
        "PAYSLIP",
        "OTHER",
      ]);
    });
  });
});
