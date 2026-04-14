export type AIModel =
  | "prospectos-ai-core"
  | "prospectos-ai-fast"
  | "claude-sonnet-4-6"
  | "claude-3-5-haiku-20241022"
  | "ollama/llama3"
  | "ollama/mistral";

export const AI_MODELS: { id: AIModel; label: string; badge?: string }[] = [
  { id: "prospectos-ai-core", label: "ProspectOS Core", badge: "Recommandé" },
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", badge: "Premium Cloud" },
  { id: "claude-3-5-haiku-20241022", label: "Claude Haiku", badge: "Rapide Cloud" },
  { id: "prospectos-ai-fast", label: "ProspectOS Fast", badge: "Alternatif" },
  { id: "ollama/llama3", label: "Llama 3", badge: "Local" },
  { id: "ollama/mistral", label: "Mistral", badge: "Local" },
];

export type MessageRole = "user" | "assistant";

export interface ToolUseEvent {
  name: string;
  call_id: string;
  input: Record<string, unknown>;
}

export interface ToolResultEvent {
  call_id: string;
  name: string;
  output: Record<string, unknown>;
}

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  tool_uses?: ToolUseEvent[];
  tool_results?: ToolResultEvent[];
  streaming?: boolean;
}

export interface Conversation {
  id: string;
  model: AIModel;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface PageContext {
  page?: string;
  selected_lead_ids?: string[];
}
