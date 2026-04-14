export type OpportunityStage =
  | "new_reply"
  | "interested"
  | "qualified"
  | "meeting_booked"
  | "proposal_sent"
  | "won"
  | "lost";

export interface Opportunity {
  id: string;
  lead_id: string;
  stage: OpportunityStage;
  estimated_value: number | null;
  probability: number | null;
  expected_close_date: string | null;
  notes: string | null;
  source_campaign: string | null;
  created_at: string;
}
