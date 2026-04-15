"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input, Button, Textarea } from "@/components/ui";
import type { Lead } from "@/types/leads";
import { toast } from "sonner";

interface ComposeEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
}

export function ComposeEmailModal({ isOpen, onClose, lead }: ComposeEmailModalProps) {
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(`Discussion: ProspectOS x ${lead.company_name || "Votre Entreprise"}`);
  const [content, setContent] = useState(
    `Bonjour ${lead.first_name || "l'équipe"},\n\nJ'ai vu votre site ${lead.domain || "internet"} et je pense que nous pourrions vous aider à optimiser votre prospection...\n\nCordialement,`
  );

  const mutation = useMutation({
    mutationFn: () => 
      apiClient.post(`/leads/${lead.id}/email`, {
        subject,
        content,
      }),
    onSuccess: () => {
      toast.success("Email envoyé avec succès !");
      queryClient.invalidateQueries({ queryKey: ["leads", lead.id] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message || "Impossible d'envoyer l'email"}`);
    }
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contacter ${lead.first_name || lead.email}`}>
      <div className="space-y-6 p-2">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
            DESTINATAIRE
          </label>
          <div className="text-sm font-medium text-[--color-text] bg-[--color-surface] p-3 rounded-xl border border-[--color-border]">
            {lead.email}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
            SUJET
          </label>
          <Input 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="Sujet de l'email"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
            MESSAGE
          </label>
          <Textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={8}
            className="font-serif italic"
            placeholder="Votre message ici..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || !subject || !content}
          >
            {mutation.isPending ? "Envoi en cours..." : "Envoyer l'Email"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
