"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLeadsStore } from "@/store/leads";
import { Modal, Button, Input } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { apiClient } from "@/lib/api";
import { cn } from "@/lib/utils";

interface ImportResult {
  items_count: number;
  message: string;
}

export function ImportModal() {
  const { isImportModalOpen, closeImportModal } = useLeadsStore();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<"choice" | "apify" | "csv">("choice");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);

  // Apify state
  const [datasetId, setDatasetId] = useState("");
  const [token, setToken] = useState("");

  const handleReset = () => {
    setMode("choice");
    setStatus("idle");
    setErrorMessage(null);
    setResult(null);
    setDatasetId("");
    setToken("");
  };

  const handleClose = () => {
    handleReset();
    closeImportModal();
  };

  const onApifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datasetId) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const data = await apiClient.post<ImportResult>("/leads/import/apify", {
        dataset_id: datasetId,
        token: token || undefined,
      });
      setResult(data);
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
    } catch (err: any) {
      setErrorMessage(err.message || "L'importation Apify a échoué.");
      setStatus("error");
    }
  };

  const onCsvFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setStatus("loading");
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      // Using raw fetch for multipart/form-data
      const accessToken = localStorage.getItem("access_token");
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";
      
      const response = await fetch(`${baseUrl}/leads/import/csv`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Échec de l'importation CSV.");
      }

      const data = await response.json();
      setResult(data);
      setStatus("success");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      queryClient.invalidateQueries({ queryKey: ["leads-stats"] });
    } catch (err: any) {
      setErrorMessage(err.message || "L'importation CSV a échoué.");
      setStatus("error");
    }
  };

  return (
    <Modal
      open={isImportModalOpen}
      onClose={handleClose}
      title="Importer des prospects"
      size="md"
    >
      <div className="py-4">
        {status === "idle" && mode === "choice" && (
          <div className="grid grid-cols-1 gap-4">
            <button
              onClick={() => setMode("apify")}
              className="group p-6 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:bg-[--color-surface-2] transition-all text-left flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-600 flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                A
              </div>
              <div>
                <p className="text-sm font-semibold text-[--color-text]">Apify Dataset API</p>
                <p className="text-xs text-[--color-text-tertiary] mt-0.5">Importez directement via un Dataset ID ou une URL</p>
              </div>
            </button>

            <label className="group p-6 rounded-2xl border border-[--color-border] bg-[--color-surface] hover:bg-[--color-surface-2] transition-all text-left flex items-center gap-4 cursor-pointer">
              <input type="file" className="hidden" accept=".csv" onChange={onCsvFileChange} />
              <div className="w-12 h-12 rounded-xl bg-[--color-cta]/10 text-[--color-cta] flex items-center justify-center text-xl font-bold group-hover:scale-110 transition-transform">
                C
              </div>
              <div>
                <p className="text-sm font-semibold text-[--color-text]">Fichier CSV Apify</p>
                <p className="text-xs text-[--color-text-tertiary] mt-0.5">Glissez-déposez un export CSV pour un mapping auto</p>
              </div>
            </label>
          </div>
        )}

        {status === "idle" && mode === "apify" && (
          <form onSubmit={onApifySubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2">ID du Dataset Apify</label>
                <Input
                  placeholder="ex: hf92k... ou l'URL complète"
                  value={datasetId}
                  onChange={(e) => setDatasetId(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2">Token API (Optionnel)</label>
                <Input
                  type="password"
                  placeholder="Votre token Apify si dataset privé"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setMode("choice")}>Retour</Button>
              <Button variant="primary" className="flex-1" type="submit" disabled={!datasetId}>Lancer l'import</Button>
            </div>
          </form>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center py-10 gap-4">
            <Spinner size={32} />
            <p className="text-sm font-serif italic text-[--color-text-secondary]">
              Intelligence en cours d'ingestion...
            </p>
          </div>
        )}

        {status === "success" && result && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-600 flex items-center justify-center text-2xl mb-4">
              ✺
            </div>
            <h3 className="text-xl font-serif font-medium text-[--color-text] mb-2">Importation Réussie</h3>
            <p className="text-sm text-[--color-text-secondary] mb-6">
              {result.items_count} prospects ont été ajoutés ou mis à jour dans votre espace.
            </p>
            <Button variant="primary" onClick={handleClose}>Fermer</Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-600 flex items-center justify-center text-2xl mb-4">
              ✕
            </div>
            <h3 className="text-xl font-serif font-medium text-[--color-text] mb-2">Erreur d'Importation</h3>
            <p className="text-sm text-red-500 mb-6">{errorMessage}</p>
            <div className="flex gap-3 w-full">
              <Button variant="secondary" className="flex-1" onClick={() => setStatus("idle")}>Réessayer</Button>
              <Button variant="ghost" className="flex-1" onClick={handleClose}>Annuler</Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
