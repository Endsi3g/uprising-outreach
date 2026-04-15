import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";

export interface CurrentUser {
  id: string;
  workspace_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
}

export function useCurrentUser() {
  return useQuery<CurrentUser>({
    queryKey: ["current-user"],
    queryFn: () => apiClient.get<CurrentUser>("/auth/me"),
    staleTime: 5 * 60 * 1000, // 5 minutes — user data changes rarely
  });
}
