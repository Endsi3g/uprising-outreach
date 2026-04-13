"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input, Button, Modal, Textarea } from "@/components/ui";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { ProjectSnippet, Project } from "@/types/projects";
import { Search, Plus, Filter, LayoutGrid, List } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("activity");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New project form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const { data: projects, isLoading } = useQuery<ProjectSnippet[]>({
    queryKey: ["projects", search, sortBy],
    queryFn: () => apiClient.get<ProjectSnippet[]>(`/projects?search=${search}&sort_by=${sortBy}`),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; description: string }) => 
      apiClient.post<Project>("/projects", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setIsCreateModalOpen(false);
      setNewName("");
      setNewDesc("");
    }
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      createMutation.mutate({ name: newName, description: newDesc });
    }
  };

  return (
    <div className="flex flex-col h-full bg-[--color-bg]">
      <div className="flex-1 p-8 lg:p-12 overflow-auto custom-scrollbar">
        <div className="max-w-6xl mx-auto">
          <PageHeader
            title="Projets"
            description="Organisez vos conversations et documents par projet pour une intelligence ciblée."
            actions={
              <Button 
                variant="primary" 
                size="md" 
                onClick={() => setIsCreateModalOpen(true)}
                className="gap-2 shadow-sm"
              >
                <Plus size={18} />
                Nouveau projet
              </Button>
            }
          />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 mt-8">
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-tertiary]" />
              <Input
                placeholder="Rechercher des projets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-[--color-surface] border-[--color-border] focus:border-[--color-cta] transition-all"
              />
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs font-medium text-[--color-text-tertiary] uppercase tracking-wider">Trier par</span>
              <select 
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent border-none text-sm font-medium text-[--color-text] focus:ring-0 cursor-pointer hover:text-[--color-cta] transition-colors"
              >
                <option value="activity">Activité</option>
                <option value="name">Nom</option>
                <option value="created">Date de création</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-64 rounded-2xl skeleton" />
              ))}
            </div>
          ) : projects && projects.length > 0 ? (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-[--color-surface] border border-[--color-border] rounded-3xl flex items-center justify-center mb-6 text-[--color-text-tertiary]">
                <LayoutGrid size={32} />
              </div>
              <h3 className="text-xl font-serif font-medium text-[--color-text] mb-2">Aucun projet trouvé</h3>
              <p className="text-[--color-text-tertiary] max-w-sm mb-8">
                {search ? "Aucun projet ne correspond à votre recherche." : "Commencez par créer votre premier projet pour organiser votre travail."}
              </p>
              {!search && (
                <Button variant="secondary" onClick={() => setIsCreateModalOpen(true)}>
                  Créer un projet
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Create Project Modal */}
      <Modal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)}
        title="Nouveau Projet"
      >
        <form onSubmit={handleCreate} className="space-y-6 pt-2">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">
              Nom du projet
            </label>
            <Input 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Ex: ProspectOS Development"
              required
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">
              Description (optionnel)
            </label>
            <Textarea 
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="De quoi parle ce projet ?"
              className="min-h-[100px] font-serif"
            />
          </div>
          <div className="flex gap-3 pt-4 border-t border-[--color-border]">
            <Button 
              type="button" 
              variant="secondary" 
              className="flex-1" 
              onClick={() => setIsCreateModalOpen(false)}
            >
              Annuler
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              className="flex-1 shadow-md"
              disabled={createMutation.isPending || !newName.trim()}
            >
              {createMutation.isPending ? "Création..." : "Créer le projet"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
