"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui";
import { ProjectSnippet } from "@/types/projects";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: ProjectSnippet;
  isExample?: boolean;
}

export function ProjectCard({ project, isExample }: ProjectCardProps) {
  const updatedAt = new Date(project.updated_at);
  const timeAgo = formatDistanceToNow(updatedAt, { addSuffix: true, locale: fr });

  return (
    <Link href={`/projects/${project.id}`}>
      <motion.div
        whileHover={{ y: -2, borderColor: "var(--color-border-warm)" }}
        className="group h-full p-6 bg-[--color-surface] border border-[--color-border] rounded-2xl flex flex-col transition-all cursor-pointer hover:shadow-whisper"
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-base font-medium text-[--color-text] group-hover:text-[--color-cta] transition-colors line-clamp-1">
            {project.name}
          </h3>
          {project.is_favorite && (
            <Star className="w-4 h-4 fill-[--color-cta] text-[--color-cta]" />
          )}
        </div>

        {isExample && (
          <div className="mb-4">
            <Badge variant="secondary" className="bg-[--color-surface-2] text-[--color-text-tertiary] border-none font-normal">
              Projet exemple
            </Badge>
          </div>
        )}

        <p className="text-sm text-[--color-text-secondary] flex-1 line-clamp-4 leading-relaxed font-serif italic mb-6">
          {project.description || "Aucune description fournie pour ce projet."}
        </p>

        <div className="flex items-center gap-2 mt-auto text-[10px] uppercase tracking-wider font-medium text-[--color-text-tertiary]">
          <span>Mis à jour {timeAgo}</span>
        </div>
      </motion.div>
    </Link>
  );
}
