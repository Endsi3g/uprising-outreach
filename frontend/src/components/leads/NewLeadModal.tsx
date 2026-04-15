"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api";
import { Modal } from "@/components/ui/Modal";
import { Input, Button } from "@/components/ui";
import { toast } from "sonner";

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewLeadModal({ isOpen, onClose }: NewLeadModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    company_name: "",
    job_title: "",
    domain: "",
  });

  const mutation = useMutation({
    mutationFn: () => apiClient.post("/leads", formData),
    onSuccess: () => {
      toast.success("Lead ajouté avec succès !");
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      onClose();
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        company_name: "",
        job_title: "",
        domain: "",
      });
    },
    onError: (error: any) => {
      toast.error(`Erreur: ${error.message || "Impossible d'ajouter le lead"}`);
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un nouveau prospect">
      <div className="space-y-6 p-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
              PRÉNOM
            </label>
            <Input name="first_name" value={formData.first_name} onChange={handleChange} placeholder="Jean" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
              NOM
            </label>
            <Input name="last_name" value={formData.last_name} onChange={handleChange} placeholder="Dupont" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
            EMAIL
          </label>
          <Input name="email" value={formData.email} onChange={handleChange} placeholder="jean.dupont@entreprise.com" type="email" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
              ENTREPRISE
            </label>
            <Input name="company_name" value={formData.company_name} onChange={handleChange} placeholder="Acme Corp" />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
              POSTE
            </label>
            <Input name="job_title" value={formData.job_title} onChange={handleChange} placeholder="CEO" />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-[--color-text-tertiary] mb-2 block">
            DOMAINE (SANS HTTP)
          </label>
          <Input name="domain" value={formData.domain} onChange={handleChange} placeholder="entreprise.com" />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="secondary" onClick={onClose} disabled={mutation.isPending}>
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={() => mutation.mutate()} 
            disabled={mutation.isPending || !formData.email || !formData.company_name}
          >
            {mutation.isPending ? "Création..." : "Ajouter le Prospect"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
