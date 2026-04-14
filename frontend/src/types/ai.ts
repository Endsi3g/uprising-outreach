export type AIModel =
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5"
  | "ollama/llama3"
  | "ollama/mistral";

export const AI_MODELS: { id: AIModel; label: string; badge?: string }[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet", badge: "Recommandé" },
  { id: "claude-haiku-4-5", label: "Claude Haiku", badge: "Rapide" },
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
