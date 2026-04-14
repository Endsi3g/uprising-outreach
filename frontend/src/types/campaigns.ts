export type CampaignStatus = "draft" | "active" | "paused" | "completed" | "archived";

export interface Campaign {
  id: string;
  workspace_id: string;
  name: string;
  objective: string | null;
  status: CampaignStatus;
  created_at: string;
  launched_at: string | null;
}

export interface SenderAccount {
  id: string;
  workspace_id: string;
  email_address: string;
  display_name: string;
  provider: "gmail" | "outlook" | "smtp";
  status: "pending" | "active" | "paused" | "error" | "disconnected";
  spf_valid: boolean | null;
  dkim_valid: boolean | null;
  dmarc_policy: string | null;
  dns_verified_at: string | null;
  daily_send_limit: number;
  warmup_status: string | null;
  created_at: string;
}
