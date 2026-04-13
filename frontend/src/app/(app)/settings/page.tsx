"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, Card, Input, Badge } from "@/components/ui";
import { Spinner } from "@/components/ui/Spinner";
import { Modal } from "@/components/ui/Modal";
import { StatusDot } from "@/components/ui/StatusDot";
import type { SenderAccount } from "@/types/campaigns";

type Tab = "workspace" | "senders" | "members";

interface WorkspaceInfo {
  id: string;
  name: string;
  slug: string;
  timezone: string;
  language: string;
  currency: string;
}

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const SENDER_STATUS_COLOR: Record<string, "green" | "amber" | "red" | "default"> = {
  active: "green",
  pending: "amber",
  error: "red",
  paused: "amber",
  disconnected: "default",
};

export default function SettingsPage() {
  const [tab, setTab] = useState<Tab>("workspace");

  return (
    <div className="p-6 max-w-[900px] mx-auto">
      <PageHeader
        title="Settings"
        description="Workspace configuration, mailbox management, and team members."
      />

      {/* Tab nav */}
      <div
        className="flex gap-1 mb-8 p-1 rounded-xl"
        style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)", width: "fit-content" }}
      >
        {(["workspace", "senders", "members"] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize"
            style={{
              background: tab === t ? "var(--color-surface-white)" : "transparent",
              color: tab === t ? "var(--color-text)" : "var(--color-text-secondary)",
              boxShadow: tab === t ? "var(--shadow-ring)" : "none",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "workspace" && <WorkspaceTab />}
      {tab === "senders" && <SendersTab />}
      {tab === "members" && <MembersTab />}
    </div>
  );
}

/* ─── Workspace Tab ─────────────────────────────────────────────────── */

function WorkspaceTab() {
  const { data: workspace, isLoading } = useQuery<WorkspaceInfo>({
    queryKey: ["workspace"],
    queryFn: () => apiClient.get("/workspaces/me"),
    retry: false,
  });

  if (isLoading) return <div className="flex justify-center py-20"><Spinner size={24} /></div>;

  return (
    <div className="space-y-6">
      <Card padding="md">
        <h2 className="text-base font-medium mb-4" style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}>
          General
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Workspace name</p>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>{workspace?.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Slug</p>
            <p className="text-sm font-mono" style={{ color: "var(--color-text)" }}>{workspace?.slug ?? "—"}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Timezone</p>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>{workspace?.timezone ?? "UTC"}</p>
          </div>
          <div>
            <p className="text-xs font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>Currency</p>
            <p className="text-sm" style={{ color: "var(--color-text)" }}>{workspace?.currency ?? "EUR"}</p>
          </div>
        </div>
      </Card>

      <Card padding="md" style={{ opacity: 0.6 }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-medium mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}>
              ICP Profile
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Define mandatory criteria, bonus signals, and exclusion rules for lead scoring.
            </p>
          </div>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--color-border-warm)", color: "var(--color-text-secondary)" }}
          >
            Phase 2
          </span>
        </div>
      </Card>

      <Card padding="md" style={{ opacity: 0.6 }}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-base font-medium mb-1" style={{ fontFamily: "var(--font-serif)", color: "var(--color-text)" }}>
              Suppression list
            </h2>
            <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
              Domains and email addresses that are globally blocked from outreach.
            </p>
          </div>
          <span
            className="text-xs px-2 py-1 rounded"
            style={{ background: "var(--color-border-warm)", color: "var(--color-text-secondary)" }}
          >
            Phase 2
          </span>
        </div>
      </Card>
    </div>
  );
}

/* ─── Senders Tab ────────────────────────────────────────────────────── */

function SendersTab() {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  const { data: senders, isLoading } = useQuery<SenderAccount[]>({
    queryKey: ["senders"],
    queryFn: () => apiClient.get("/senders"),
    staleTime: 30_000,
  });

  const verifyMutation = useMutation({
    mutationFn: (senderId: string) =>
      apiClient.post(`/senders/${senderId}/verify`),
    onMutate: (id) => setVerifyingId(id),
    onSettled: () => {
      setVerifyingId(null);
      queryClient.invalidateQueries({ queryKey: ["senders"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (senderId: string) => apiClient.delete(`/senders/${senderId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["senders"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Connected mailboxes for outreach sending. SPF, DKIM, and DMARC must be valid before launching a campaign.
        </p>
        <Button variant="primary" size="sm" onClick={() => setIsAddOpen(true)}>
          Add sender
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : !senders || senders.length === 0 ? (
        <Card padding="md">
          <div className="text-center py-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 text-lg"
              style={{ background: "var(--color-border-warm)" }}
            >
              ✉
            </div>
            <p className="text-sm font-medium mb-1" style={{ color: "var(--color-text)" }}>No senders configured</p>
            <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
              Add a sender account to start sending outreach campaigns.
            </p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {senders.map((sender) => (
            <SenderCard
              key={sender.id}
              sender={sender}
              isVerifying={verifyingId === sender.id}
              onVerify={() => verifyMutation.mutate(sender.id)}
              onDelete={() => deleteMutation.mutate(sender.id)}
            />
          ))}
        </div>
      )}

      <AddSenderModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onSuccess={() => {
          setIsAddOpen(false);
          queryClient.invalidateQueries({ queryKey: ["senders"] });
        }}
      />
    </div>
  );
}

interface SenderCardProps {
  sender: SenderAccount;
  isVerifying: boolean;
  onVerify: () => void;
  onDelete: () => void;
}

function SenderCard({ sender, isVerifying, onVerify, onDelete }: SenderCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const dnsOk = sender.spf_valid && sender.dkim_valid && sender.dmarc_policy === "reject";
  const dnsPartial = (sender.spf_valid || sender.dkim_valid) && !dnsOk;

  return (
    <Card padding="none">
      <div className="px-5 py-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0"
              style={{
                background: "var(--color-border-warm)",
                color: "var(--color-text)",
              }}
            >
              {sender.email_address[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                {sender.email_address}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <StatusDot
                  status={SENDER_STATUS_COLOR[sender.status] ?? "default"}
                  label={sender.status}
                />
                <span className="text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                  {sender.provider} · {sender.daily_send_limit}/day
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={onVerify}
              disabled={isVerifying}
            >
              {isVerifying ? <Spinner size={14} /> : "Verify DNS"}
            </Button>
            {confirmDelete ? (
              <div className="flex items-center gap-1">
                <Button variant="danger" size="sm" onClick={onDelete}>
                  Confirm
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(true)}>
                Remove
              </Button>
            )}
          </div>
        </div>

        {/* DNS status row */}
        <div
          className="mt-3 pt-3 flex items-center gap-6"
          style={{ borderTop: "1px solid var(--color-border)" }}
        >
          <DnsChip label="SPF" value={sender.spf_valid} />
          <DnsChip label="DKIM" value={sender.dkim_valid} />
          <Dmarc policy={sender.dmarc_policy} />
          {dnsOk && (
            <span className="ml-auto text-xs font-medium" style={{ color: "#166534" }}>
              ✓ DNS fully valid — ready to send
            </span>
          )}
          {dnsPartial && (
            <span className="ml-auto text-xs" style={{ color: "#92400e" }}>
              DNS partially configured — fix before launching
            </span>
          )}
          {!sender.spf_valid && !sender.dkim_valid && sender.dns_verified_at === null && (
            <span className="ml-auto text-xs" style={{ color: "var(--color-text-tertiary)" }}>
              Run "Verify DNS" to check records
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}

function DnsChip({ label, value }: { label: string; value: boolean | null }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span style={{ color: "var(--color-text-secondary)" }}>{label}</span>
      {value === null ? (
        <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
      ) : value ? (
        <span style={{ color: "#166534" }}>✓</span>
      ) : (
        <span style={{ color: "var(--color-error)" }}>✗</span>
      )}
    </span>
  );
}

function Dmarc({ policy }: { policy: string | null }) {
  return (
    <span className="flex items-center gap-1.5 text-xs">
      <span style={{ color: "var(--color-text-secondary)" }}>DMARC</span>
      {policy === null ? (
        <span style={{ color: "var(--color-text-tertiary)" }}>—</span>
      ) : (
        <span style={{ color: policy === "reject" ? "#166534" : "#92400e" }}>{policy}</span>
      )}
    </span>
  );
}

interface AddSenderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function AddSenderModal({ isOpen, onClose, onSuccess }: AddSenderModalProps) {
  const [form, setForm] = useState({
    email_address: "",
    display_name: "",
    provider: "smtp" as "smtp" | "gmail" | "outlook",
    daily_send_limit: "100",
  });
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () =>
      apiClient.post("/senders", {
        ...form,
        daily_send_limit: parseInt(form.daily_send_limit, 10),
      }),
    onSuccess,
    onError: (err: Error) => setError(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.email_address) return setError("Email address is required.");
    mutation.mutate();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add sender account"
      size="sm"
      footer={
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" size="sm" onClick={onClose}>Cancel</Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={mutation.isPending}>
            {mutation.isPending ? <Spinner size={14} /> : "Add sender"}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          value={form.email_address}
          onChange={(e) => setForm((f) => ({ ...f, email_address: e.target.value }))}
          placeholder="you@yourdomain.com"
        />
        <Input
          label="Display name"
          value={form.display_name}
          onChange={(e) => setForm((f) => ({ ...f, display_name: e.target.value }))}
          placeholder="Your Name"
        />
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>
            Provider
          </label>
          <select
            value={form.provider}
            onChange={(e) => setForm((f) => ({ ...f, provider: e.target.value as typeof form.provider }))}
            className="w-full px-3 py-2 text-sm rounded-lg"
            style={{
              border: "1px solid var(--color-border)",
              background: "var(--color-surface-white)",
              color: "var(--color-text)",
              outline: "none",
            }}
          >
            <option value="smtp">SMTP</option>
            <option value="gmail">Gmail (OAuth)</option>
            <option value="outlook">Outlook (OAuth)</option>
          </select>
        </div>
        <Input
          label="Daily send limit"
          type="number"
          min="1"
          max="500"
          value={form.daily_send_limit}
          onChange={(e) => setForm((f) => ({ ...f, daily_send_limit: e.target.value }))}
        />
        {form.provider !== "smtp" && (
          <div
            className="px-3 py-2 rounded-lg text-xs"
            style={{ background: "#fef3ee", border: "1px solid #fcd9c9", color: "#a0522d" }}
          >
            OAuth connection for {form.provider === "gmail" ? "Gmail" : "Outlook"} will be available in Phase 2 when email sending is implemented.
          </div>
        )}
        {error && (
          <p className="text-xs" style={{ color: "var(--color-error)" }}>{error}</p>
        )}
      </form>
    </Modal>
  );
}

/* ─── Members Tab ────────────────────────────────────────────────────── */

function MembersTab() {
  const { data: members, isLoading } = useQuery<Member[]>({
    queryKey: ["workspace-members"],
    queryFn: () => apiClient.get("/workspaces/me/members"),
    retry: false,
  });

  const ROLE_COLOR: Record<string, "green" | "blue" | "amber" | "default"> = {
    admin: "green",
    manager: "blue",
    sdr: "amber",
    closer: "amber",
    viewer: "default",
    reviewer: "default",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Team members with access to this workspace.
        </p>
        <Button variant="secondary" size="sm" disabled title="Invite available in Phase 2">
          Invite member
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size={24} /></div>
      ) : !members || members.length === 0 ? (
        <Card padding="md">
          <p className="text-sm text-center py-6" style={{ color: "var(--color-text-secondary)" }}>
            No members found.
          </p>
        </Card>
      ) : (
        <Card padding="none">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
                {["Member", "Role", "Joined"].map((col) => (
                  <th
                    key={col}
                    className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr
                  key={member.id}
                  style={{ borderBottom: "1px solid var(--color-border)" }}
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                        style={{ background: "var(--color-border-warm)", color: "var(--color-text)" }}
                      >
                        {(member.full_name ?? member.email)[0].toUpperCase()}
                      </div>
                      <div>
                        {member.full_name && (
                          <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                            {member.full_name}
                          </p>
                        )}
                        <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <Badge color={ROLE_COLOR[member.role] ?? "default"}>{member.role}</Badge>
                  </td>
                  <td className="px-5 py-3 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(member.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
