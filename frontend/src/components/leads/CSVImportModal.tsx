"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadsStore } from "@/store/leads";
import { Modal, Button, Input } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api";

const LEAD_FIELDS = [
  { value: "", label: "— skip —" },
  { value: "email", label: "Email" },
  { value: "first_name", label: "First name" },
  { value: "last_name", label: "Last name" },
  { value: "job_title", label: "Job title" },
  { value: "phone", label: "Phone" },
  { value: "linkedin_url", label: "LinkedIn URL" },
  { value: "company_name", label: "Company name" },
  { value: "domain", label: "Company domain" },
  { value: "source", label: "Source" },
];

export function CSVImportModal() {
  const { isImportModalOpen, closeImportModal } = useLeadsStore();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<"upload" | "mapping" | "importing" | "done">("upload");
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [file, setFile] = useState<File | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReset = () => {
    setStep("upload");
    setCsvHeaders([]);
    setMapping({});
    setFile(null);
    setJobId(null);
    setError(null);
  };

  const handleClose = () => {
    handleReset();
    closeImportModal();
  };

  const parseHeaders = async (f: File) => {
    const text = await f.text();
    const firstLine = text.split("\n")[0];
    const headers = firstLine.split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    return headers;
  };

  const handleFile = async (f: File) => {
    if (!f.name.endsWith(".csv")) {
      setError("Please upload a .csv file");
      return;
    }
    setFile(f);
    setError(null);
    const headers = await parseHeaders(f);
    setCsvHeaders(headers);
    // Auto-map obvious columns
    const autoMap: Record<string, string> = {};
    headers.forEach((h) => {
      const lower = h.toLowerCase();
      if (lower.includes("email")) autoMap[h] = "email";
      else if (lower.includes("first") && lower.includes("name")) autoMap[h] = "first_name";
      else if (lower.includes("last") && lower.includes("name")) autoMap[h] = "last_name";
      else if (lower.includes("company")) autoMap[h] = "company_name";
      else if (lower.includes("linkedin")) autoMap[h] = "linkedin_url";
      else if (lower.includes("phone")) autoMap[h] = "phone";
      else if (lower.includes("title") || lower.includes("position")) autoMap[h] = "job_title";
      else if (lower.includes("domain")) autoMap[h] = "domain";
    });
    setMapping(autoMap);
    setStep("mapping");
  };

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) await handleFile(f);
  }, []);

  const handleImport = async () => {
    if (!file) return;
    setStep("importing");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("column_mapping", JSON.stringify(mapping));

      // Use fetch directly for multipart
      const token = localStorage.getItem("access_token");
      const res = await fetch("/api/v1/leads/import", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      if (!res.ok) throw new Error(`Import failed: ${res.statusText}`);
      const data = await res.json();
      setJobId(data.job_id);
      setStep("done");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Import failed");
      setStep("mapping");
    }
  };

  return (
    <Modal
      open={isImportModalOpen}
      onClose={handleClose}
      title="Import leads from CSV"
      size="lg"
      footer={
        step === "mapping" ? (
          <>
            <Button variant="ghost" size="sm" onClick={() => setStep("upload")}>Back</Button>
            <Button variant="primary" size="sm" onClick={handleImport}>
              Import {csvHeaders.length > 0 ? "→" : ""}
            </Button>
          </>
        ) : step === "done" ? (
          <Button variant="primary" size="sm" onClick={handleClose}>Done</Button>
        ) : undefined
      }
    >
      {step === "upload" && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Upload a CSV file with your leads. You'll map the columns in the next step.
          </p>

          <div
            className="border-2 border-dashed rounded-xl p-10 flex flex-col items-center gap-3 cursor-pointer transition-colors"
            style={{
              borderColor: isDragging ? "var(--color-cta)" : "var(--color-border-warm)",
              background: isDragging ? "#fef3ee" : "var(--color-surface)",
            }}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
              style={{ background: "var(--color-border-warm)" }}
            >
              ↑
            </div>
            <div className="text-center">
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                Drop a CSV file here
              </p>
              <p className="text-xs mt-1" style={{ color: "var(--color-text-secondary)" }}>
                or click to browse
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) await handleFile(f);
              }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>}
        </div>
      )}

      {step === "mapping" && (
        <div className="space-y-4">
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Map each CSV column to a lead field. Columns marked "skip" will be ignored.
          </p>
          <div className="space-y-2">
            {csvHeaders.map((header) => (
              <div key={header} className="flex items-center gap-3">
                <span
                  className="flex-1 text-sm font-medium truncate"
                  style={{ color: "var(--color-text)" }}
                >
                  {header}
                </span>
                <select
                  className="text-sm rounded-md px-2 py-1.5 border"
                  style={{
                    background: "var(--color-surface-white)",
                    borderColor: "var(--color-border-warm)",
                    color: "var(--color-text)",
                    minWidth: "160px",
                  }}
                  value={mapping[header] ?? ""}
                  onChange={(e) => setMapping((m) => ({ ...m, [header]: e.target.value }))}
                >
                  {LEAD_FIELDS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {error && <p className="text-sm" style={{ color: "var(--color-error)" }}>{error}</p>}
        </div>
      )}

      {step === "importing" && (
        <div className="flex flex-col items-center py-10 gap-4">
          <Spinner size={32} />
          <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
            Importing leads…
          </p>
        </div>
      )}

      {step === "done" && (
        <div className="flex flex-col items-center py-10 gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-xl"
            style={{ background: "#ecfdf5", color: "#166534" }}
          >
            ✓
          </div>
          <p className="text-base font-medium" style={{ color: "var(--color-text)" }}>
            Import started
          </p>
          <p className="text-sm text-center" style={{ color: "var(--color-text-secondary)" }}>
            Job <code className="text-xs px-1 py-0.5 rounded" style={{ background: "var(--color-border-warm)" }}>{jobId}</code> is processing in the background. Leads will appear shortly.
          </p>
        </div>
      )}
    </Modal>
  );
}
