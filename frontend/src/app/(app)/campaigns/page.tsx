"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Input } from "@/components/ui";
import { Modal } from "@/components/ui";
import { RichTextEditor } from "@/components/ui/RichTextEditor";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api";
import { Spinner } from "@/components/ui/Spinner";

// ── Types ────────────────────────────────────────────────────────────────────

interface Step {
  id?: string;
  position: number;
  step_type: "email" | "wait";
  subject?: string;
  body_html?: string;
  body_text?: string;
  delay_days: number;
  delay_hours: number;
  // UI-only
  title?: string;
  template?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: "draft" | "active" | "paused" | "completed" | "archived";
  sender_account_id?: string;
  description?: string;
  leads_count: number;
  sent_count: number;
  reply_count: number;
  open_count: number;
  created_at: string;
  steps: Step[];
}

interface SenderAccount {
  id: string;
  email_address: string;
  display_name: string;
  provider: string;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Brouillon",
  active: "Actif",
  paused: "Pausé",
  completed: "Terminé",
  archived: "Archivé",
};
const STATUS_COLOR: Record<string, string> = {
  draft: "bg-[--color-surface-2] text-[--color-text-tertiary]",
  active: "bg-green-500/10 text-green-600",
  paused: "bg-amber-500/10 text-amber-600",
  completed: "bg-blue-500/10 text-blue-600",
  archived: "bg-[--color-surface-2] text-[--color-text-tertiary]",
};

// ── Main Page ────────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const qc = useQueryClient();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");

  // Load campaigns list
  const { data: campaigns = [], isLoading } = useQuery<Campaign[]>({
    queryKey: ["campaigns"],
    queryFn: () => apiClient.get<Campaign[]>("/campaigns"),
    retry: false,
  });

  // Load senders for the launch modal
  const { data: senders = [] } = useQuery<SenderAccount[]>({
    queryKey: ["senders"],
    queryFn: () => apiClient.get<SenderAccount[]>("/senders"),
    retry: false,
  });

  const selected = campaigns.find(c => c.id === selectedId) ?? null;

  const createMutation = useMutation({
    mutationFn: (name: string) =>
      apiClient.post<Campaign>("/campaigns", { name, steps: [] }),
    onSuccess: (campaign) => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      setSelectedId(campaign.id);
      setIsCreating(false);
      setNewName("");
    },
  });

  return (
    <div className="flex h-full bg-[--color-bg] overflow-hidden">
      {/* ── Campaign list sidebar ───────────────────────────────────────────── */}
      <aside className="w-[220px] flex-shrink-0 border-r border-[--color-border] flex flex-col h-full">
        <div className="flex items-center justify-between px-4 py-4 border-b border-[--color-border]">
          <span className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">
            Campagnes
          </span>
          <button
            onClick={() => setIsCreating(true)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-[--color-surface-2] text-[--color-text-tertiary] hover:text-[--color-text] transition-all"
            title="Nouvelle campagne"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar py-2">
          {isLoading && (
            <div className="flex justify-center py-8"><Spinner /></div>
          )}
          {!isLoading && campaigns.length === 0 && (
            <div className="px-4 py-8 text-center text-xs text-[--color-text-tertiary]">
              Aucune campagne.<br />Créez-en une.
            </div>
          )}
          {campaigns.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedId(c.id)}
              className={cn(
                "w-full px-4 py-3 text-left transition-colors",
                selectedId === c.id
                  ? "bg-[--color-surface]"
                  : "hover:bg-[--color-surface-2]/50"
              )}
            >
              <p className="text-xs font-medium truncate text-[--color-text]">{c.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-semibold", STATUS_COLOR[c.status])}>
                  {STATUS_LABEL[c.status]}
                </span>
                <span className="text-[10px] text-[--color-text-tertiary]">
                  {c.leads_count} leads
                </span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ── Main area ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {selected ? (
          <CampaignBuilder
            campaign={selected}
            senders={senders}
            onUpdate={() => qc.invalidateQueries({ queryKey: ["campaigns"] })}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-[--color-surface] border border-[--color-border] flex items-center justify-center mb-4 text-2xl">
              ✉
            </div>
            <h2 className="text-xl font-serif mb-2">Sélectionnez une campagne</h2>
            <p className="text-sm text-[--color-text-tertiary] max-w-xs mb-6">
              Choisissez une campagne existante ou créez-en une nouvelle.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsCreating(true)}>
              + Nouvelle campagne
            </Button>
          </div>
        )}
      </div>

      {/* ── Create modal ──────────────────────────────────────────────────── */}
      <Modal open={isCreating} onClose={() => setIsCreating(false)} title="Nouvelle campagne">
        <div className="pt-2 pb-4 space-y-4">
          <Input
            autoFocus
            placeholder="Nom de la campagne"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && newName.trim() && createMutation.mutate(newName.trim())}
          />
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setIsCreating(false)}>Annuler</Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={!newName.trim() || createMutation.isPending}
              onClick={() => createMutation.mutate(newName.trim())}
            >
              {createMutation.isPending ? "Création…" : "Créer"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ── Campaign Builder ──────────────────────────────────────────────────────────

function CampaignBuilder({
  campaign,
  senders,
  onUpdate,
}: {
  campaign: Campaign;
  senders: SenderAccount[];
  onUpdate: () => void;
}) {
  const qc = useQueryClient();
  const [name, setName] = useState(campaign.name);
  const [isEditingName, setIsEditingName] = useState(false);
  const [steps, setSteps] = useState<Step[]>(
    campaign.steps.length > 0
      ? campaign.steps
      : []
  );
  const [isLaunchOpen, setIsLaunchOpen] = useState(false);
  const [editingStepIdx, setEditingStepIdx] = useState<number | null>(null);
  const [selectedSenderId, setSelectedSenderId] = useState<string>(
    campaign.sender_account_id ?? senders[0]?.id ?? ""
  );

  const saveMutation = useMutation({
    mutationFn: () =>
      apiClient.patch(`/campaigns/${campaign.id}`, {
        name,
        sender_account_id: selectedSenderId || null,
        steps: steps.map((s, i) => ({
          position: i,
          step_type: s.step_type,
          subject: s.subject ?? s.title ?? "",
          body_html: s.body_html ?? s.template ?? "",
          body_text: s.body_text ?? "",
          delay_days: s.delay_days ?? 0,
          delay_hours: s.delay_hours ?? 0,
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      onUpdate();
    },
  });

  const launchMutation = useMutation({
    mutationFn: () =>
      apiClient.post(`/campaigns/${campaign.id}/launch`, { lead_ids: [] }),
    onSuccess: (res: any) => {
      setIsLaunchOpen(false);
      qc.invalidateQueries({ queryKey: ["campaigns"] });
      onUpdate();
    },
  });

  const addStep = (type: "email" | "wait") => {
    setSteps(prev => [
      ...prev,
      {
        position: prev.length,
        step_type: type,
        title: type === "email" ? "Nouvel Email" : "Nouvelle Attente",
        subject: type === "email" ? "" : undefined,
        body_html: type === "email" ? "" : undefined,
        delay_days: type === "wait" ? 3 : 0,
        delay_hours: 0,
      },
    ]);
  };

  const removeStep = (idx: number) => setSteps(prev => prev.filter((_, i) => i !== idx));
  const updateStep = (idx: number, patch: Partial<Step>) =>
    setSteps(prev => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));

  const editingStep = editingStepIdx !== null ? steps[editingStepIdx] : null;
  const isSent = campaign.status === "active" || campaign.status === "completed";

  return (
    <div className="flex flex-col h-full bg-[--color-bg]">
      {/* Header */}
      <div className="px-8 pt-6 pb-4 border-b border-[--color-border] flex-shrink-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            {isEditingName ? (
              <input
                autoFocus
                value={name}
                onChange={e => setName(e.target.value)}
                onBlur={() => setIsEditingName(false)}
                onKeyDown={e => e.key === "Enter" && setIsEditingName(false)}
                className="text-xl font-medium font-serif bg-transparent border-b border-[--color-cta] outline-none text-[--color-text]"
              />
            ) : (
              <h1
                onClick={() => setIsEditingName(true)}
                className="text-xl font-medium font-serif text-[--color-text] cursor-pointer hover:text-[--color-cta] transition-colors"
              >
                {name}
              </h1>
            )}
            <span className={cn("text-xs px-2 py-0.5 rounded font-semibold", STATUS_COLOR[campaign.status])}>
              {STATUS_LABEL[campaign.status]}
            </span>
          </div>
          <div className="flex gap-2 items-center">
            {senders.length > 0 && (
              <select
                value={selectedSenderId}
                onChange={e => setSelectedSenderId(e.target.value)}
                className="text-xs px-3 py-1.5 rounded-lg border border-[--color-border] bg-[--color-surface] text-[--color-text] outline-none focus:border-[--color-cta]"
              >
                <option value="">— Expéditeur —</option>
                {senders.filter(s => s.status === "active" && s.provider !== "facebook").map(s => (
                  <option key={s.id} value={s.id}>{s.display_name || s.email_address}</option>
                ))}
              </select>
            )}
            <Button variant="secondary" size="sm" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Sauvegarde…" : "Sauvegarder"}
            </Button>
            {campaign.status === "draft" && (
              <Button variant="primary" size="sm" onClick={() => setIsLaunchOpen(true)}>
                Lancer la campagne
              </Button>
            )}
          </div>
        </div>

        {/* Stats bar */}
        {isSent && (
          <div className="flex gap-6 mt-3">
            {[
              { label: "Leads", value: campaign.leads_count },
              { label: "Envoyés", value: campaign.sent_count },
              { label: "Réponses", value: campaign.reply_count },
              { label: "Ouverts", value: campaign.open_count },
            ].map(s => (
              <div key={s.label}>
                <p className="text-[10px] uppercase tracking-widest text-[--color-text-tertiary]">{s.label}</p>
                <p className="text-sm font-semibold text-[--color-text]">{s.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sequence builder */}
      <div className="flex-1 overflow-y-auto px-8 pb-32 custom-scrollbar">
        <div className="max-w-2xl mx-auto py-10">
          <LayoutGroup id={`campaign-${campaign.id}`}>
            <div className="relative">
              <div className="flex justify-center mb-10">
                <motion.div
                  layout
                  className="px-4 py-2 rounded-full bg-[--color-surface-2] border border-[--color-border] text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                  Début de la séquence
                </motion.div>
              </div>

              <AnimatePresence mode="popLayout">
                {steps.map((step, idx) => (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    className="relative"
                  >
                    {idx > 0 && (
                      <div className="flex justify-center py-2">
                        <div className="w-px h-6 bg-[--color-border]" />
                      </div>
                    )}

                    <div className={cn(
                      "group relative rounded-2xl border p-6 transition-all duration-300",
                      step.step_type === "email"
                        ? "bg-[--color-bg] border-[--color-border] shadow-sm hover:shadow-md"
                        : "bg-[--color-surface] border-dashed border-[--color-border]"
                    )}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center text-xl",
                            step.step_type === "email" ? "bg-[--color-surface-2] text-[--color-cta]" : "bg-[--color-surface-white] text-[--color-text-tertiary]"
                          )}>
                            {step.step_type === "email" ? "✉" : "⏳"}
                          </div>
                          <div>
                            <input
                              value={step.title || (step.step_type === "email" ? step.subject || "" : `Attendre ${step.delay_days}j`)}
                              onChange={e => updateStep(idx, { title: e.target.value, subject: e.target.value })}
                              className="text-sm font-semibold text-[--color-text] bg-transparent outline-none border-b border-transparent hover:border-[--color-border] transition-colors"
                            />
                            <p className="text-[10px] text-[--color-text-tertiary] uppercase tracking-widest font-bold mt-0.5">
                              {step.step_type === "email" ? "Envoi Email" : "Délai"}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeStep(idx)}
                          className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all text-[--color-text-tertiary]"
                        >
                          ✕
                        </button>
                      </div>

                      {step.step_type === "email" ? (
                        <div
                          role="button"
                          tabIndex={0}
                          className="p-4 rounded-xl bg-[--color-surface] border border-[--color-border-subtle] flex items-center justify-between hover:bg-[--color-surface-2] transition-colors cursor-pointer"
                          onClick={() => setEditingStepIdx(idx)}
                          onKeyDown={e => (e.key === "Enter" || e.key === " ") && setEditingStepIdx(idx)}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">📄</span>
                            <span className="text-sm text-[--color-text-secondary]">
                              {step.body_html ? "Template configuré" : "Cliquez pour éditer le template"}
                            </span>
                          </div>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[--color-cta]">Éditer</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 px-1">
                          <span className="text-[11px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">Attendre:</span>
                          <input
                            type="number"
                            min={0}
                            value={step.delay_days}
                            onChange={e => updateStep(idx, { delay_days: Number(e.target.value) })}
                            className="bg-transparent text-sm font-semibold text-[--color-text] outline-none border-b border-[--color-border] w-16 text-center focus:border-[--color-cta]"
                          />
                          <span className="text-sm text-[--color-text-tertiary]">jour(s)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-center py-3">
                      <div className="w-px h-6 bg-[--color-border]" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Add step buttons */}
              <motion.div layout className="flex items-center justify-center gap-4 mt-2">
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addStep("email")}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[--color-surface] border border-[--color-border] text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] hover:text-[--color-cta] hover:border-[--color-cta] transition-all shadow-sm"
                >
                  <span>+</span> Email
                </motion.button>
                <motion.button
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addStep("wait")}
                  className="flex items-center gap-2.5 px-6 py-3 rounded-full bg-[--color-surface] border border-[--color-border] text-xs font-bold uppercase tracking-widest text-[--color-text-secondary] hover:text-[--color-text] transition-all shadow-sm"
                >
                  <span>+</span> Attente
                </motion.button>
              </motion.div>
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Launch modal */}
      <Modal open={isLaunchOpen} onClose={() => setIsLaunchOpen(false)} title="Lancer la campagne">
        <div className="pt-2 pb-4 space-y-4">
          {!selectedSenderId && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-sm text-amber-700">
              Aucun expéditeur sélectionné. Choisissez un compte Gmail/Outlook connecté.
            </div>
          )}
          <p className="text-sm text-[--color-text-secondary]">
            Lancer <strong>{name}</strong> ? Les emails seront envoyés à tous les leads
            <strong> RAW / ENRICHED / SCORED</strong> de votre workspace.
          </p>
          {steps.filter(s => s.step_type === "email").length === 0 && (
            <p className="text-sm text-red-500">Ajoutez au moins un pas Email avant de lancer.</p>
          )}
          <div className="flex gap-3 pt-2 border-t border-[--color-border]">
            <Button variant="secondary" className="flex-1" onClick={() => setIsLaunchOpen(false)}>Annuler</Button>
            <Button
              variant="primary"
              className="flex-1"
              disabled={
                launchMutation.isPending ||
                !selectedSenderId ||
                steps.filter(s => s.step_type === "email").length === 0
              }
              onClick={() => saveMutation.mutateAsync().then(() => launchMutation.mutate())}
            >
              {launchMutation.isPending ? "Lancement…" : "Confirmer le lancement"}
            </Button>
          </div>
          {launchMutation.isError && (
            <p className="text-xs text-red-500 text-center">
              Erreur: {String((launchMutation.error as any)?.message ?? "Inconnu")}
            </p>
          )}
        </div>
      </Modal>

      {/* Template editor modal */}
      <Modal
        open={editingStepIdx !== null}
        onClose={() => setEditingStepIdx(null)}
        title="Éditeur de template"
      >
        {editingStep && (
          <div className="pt-4 pb-2 space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Objet</label>
              <Input
                value={editingStep.subject || ""}
                onChange={e => updateStep(editingStepIdx!, { subject: e.target.value, title: e.target.value })}
                placeholder="Objet de l'email…"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Corps</label>
              <RichTextEditor
                value={editingStep.body_html || "<p>Bonjour {{first_name}},</p>"}
                onChange={val => updateStep(editingStepIdx!, { body_html: val })}
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => setEditingStepIdx(null)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
