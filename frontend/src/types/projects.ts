export interface ProjectFile {
  id: string;
  project_id: string;
  filename: string;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  memory: string | null;
  is_favorite: boolean;
  workspace_id: string;
  created_at: string;
  updated_at: string;
  files: ProjectFile[];
}

export interface ProjectSnippet {
  id: string;
  name: string;
  description: string | null;
  is_favorite: boolean;
  updated_at: string;
}
