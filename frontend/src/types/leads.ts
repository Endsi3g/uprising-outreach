export interface Lead {
  id: string;
  workspace_id: string;
  company_id: string | null;
  contact_id: string | null;
  owner_id: string | null;
  status: LeadStatus;
  temperature: "cold" | "warm" | "hot";
  score: number | null;
  source: string | null;
  notes: string | null;
  enrichment_status: string | null;
  next_action: string | null;
  created_at: string;
  updated_at: string;
}

export type LeadStatus =
  | "raw"
  | "enriching"
  | "enriched"
  | "scored"
  | "in_sequence"
  | "replied"
  | "converted"
  | "suppressed";

export interface PageInfo {
  next_cursor: string | null;
  has_more: boolean;
  total_count: number;
}

export interface Page<T> {
  data: T[];
  pagination: PageInfo;
}
