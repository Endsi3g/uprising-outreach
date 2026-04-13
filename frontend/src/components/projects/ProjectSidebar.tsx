"use client";

import { useState } from "react";
import { User, FileText, Plus, X, Lock, Paperclip } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button, Textarea } from "@/components/ui";
import { Project, ProjectFile } from "@/types/projects";
import { apiClient } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ProjectSidebarProps {
  project: Project;
}

export function ProjectSidebar({ project }: ProjectSidebarProps) {
  const queryClient = useQueryClient();
  const [instructions, setInstructions] = useState(project.instructions || "");
  const [isEditingInstructions, setIsEditingInstructions] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data: Partial<Project>) => 
      apiClient.patch<Project>(`/projects/${project.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
      setIsEditingInstructions(false);
    }
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiClient.postMultipart<ProjectFile>(`/projects/${project.id}/files`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
    }
  });

  const deleteFileMutation = useMutation({
    mutationFn: (fileId: string) => 
      apiClient.delete(`/projects/${project.id}/files/${fileId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", project.id] });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <div className="w-80 border-l border-[--color-border] bg-[--color-bg] overflow-y-auto custom-scrollbar flex flex-col h-full">
      {/* Memory Section */}
      <div className="p-6 border-b border-[--color-border]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">
            Mémoire
          </h4>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[--color-surface-2] text-[--color-text-tertiary] text-[10px] font-medium">
            <User size={10} />
            <span>Vous uniquement</span>
          </div>
        </div>
        <p className="text-xs text-[--color-text-secondary] leading-relaxed italic font-serif">
          {project.memory || "La mémoire du projet s'affichera ici après quelques conversations."}
        </p>
      </div>

      {/* Instructions Section */}
      <div className="p-6 border-b border-[--color-border]">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">
            Instructions
          </h4>
          <button 
            onClick={() => setIsEditingInstructions(!isEditingInstructions)}
            className="text-[--color-text-tertiary] hover:text-[--color-cta] transition-colors"
          >
            <Paperclip size={14} className={isEditingInstructions ? "rotate-45" : ""} />
          </button>
        </div>
        
        {isEditingInstructions ? (
          <div className="space-y-3">
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Ajoutez des instructions personnalisées..."
              className="text-xs min-h-[120px] bg-[--color-surface] border-[--color-border] font-serif"
            />
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="primary" 
                className="flex-1 text-[10px]"
                onClick={() => updateMutation.mutate({ instructions })}
                disabled={updateMutation.isPending}
              >
                Sauvegarder
              </Button>
              <Button 
                size="sm" 
                variant="secondary" 
                className="flex-1 text-[10px]"
                onClick={() => {
                  setInstructions(project.instructions || "");
                  setIsEditingInstructions(false);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[--color-text-secondary] leading-relaxed line-clamp-6">
            {project.instructions || "Ajoutez des instructions spécifiques pour orienter les réponses de l'IA dans ce projet."}
          </p>
        )}
      </div>

      {/* Files Section */}
      <div className="p-6 flex-1">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary]">
            Fichiers
          </h4>
          <label className="cursor-pointer text-[--color-text-tertiary] hover:text-[--color-cta] transition-colors">
            <Plus size={16} />
            <input 
              type="file" 
              className="hidden" 
              onChange={handleFileUpload}
              disabled={uploadMutation.isPending}
            />
          </label>
        </div>

        {project.files && project.files.length > 0 ? (
          <div className="space-y-2">
            {project.files.map((file) => (
              <div 
                key={file.id} 
                className="group flex items-center justify-between p-2 rounded-lg bg-[--color-surface] border border-[--color-border] hover:border-[--color-border-warm] transition-all"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <FileText size={14} className="text-[--color-cta] flex-shrink-0" />
                  <span className="text-xs text-[--color-text-secondary] truncate">
                    {file.filename}
                  </span>
                </div>
                <button 
                  onClick={() => deleteFileMutation.mutate(file.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[--color-surface-2] rounded transition-all text-[--color-text-tertiary]"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 p-8 rounded-2xl border border-dashed border-[--color-border] flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-[--color-surface] rounded-xl flex items-center justify-center mb-4 border border-[--color-border]">
              <FileText size={20} className="text-[--color-text-tertiary]" />
            </div>
            <p className="text-[11px] text-[--color-text-tertiary] leading-relaxed">
              Ajoutez des PDF, des documents ou autres textes à référencer dans ce projet.
            </p>
          </div>
        )}
        
        {uploadMutation.isPending && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[10px] text-[--color-text-tertiary] animate-pulse">
            <span className="w-1.5 h-1.5 bg-[--color-cta] rounded-full" />
            Téléchargement en cours...
          </div>
        )}
      </div>
    </div>
  );
}
