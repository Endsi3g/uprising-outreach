import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { UUID } from "crypto";

export interface Skill {
  id: string;
  name: string;
  description: string;
  content: string;
  trigger: string;
  author: string;
  is_active: boolean;
  created_at: string;
}

export interface Connector {
  id: string;
  name: string;
  provider: string;
  status: string;
  icon?: string;
  permissions: any;
}

export function useCustomization() {
  const queryClient = useQueryClient();

  const skills = useQuery<Skill[]>({
    queryKey: ["skills"],
    queryFn: () => apiClient.get("/customization/skills"),
  });

  const connectors = useQuery<Connector[]>({
    queryKey: ["connectors"],
    queryFn: () => apiClient.get("/customization/connectors"),
  });

  const createSkill = useMutation({
    mutationFn: (newSkill: Partial<Skill>) => 
      apiClient.post("/customization/skills", newSkill),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills"] }),
  });

  const updateSkill = useMutation({
    mutationFn: ({ id, ...updates }: Partial<Skill> & { id: string }) =>
      apiClient.patch(`/customization/skills/${id}`, updates),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["skills"] }),
  });

  const updateConnector = useMutation({
    mutationFn: ({ id, permissions }: { id: string, permissions: any }) =>
      apiClient.patch(`/customization/connectors/${id}`, { permissions }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["connectors"] }),
  });

  return {
    skills,
    connectors,
    createSkill,
    updateSkill,
    updateConnector,
  };
}
