"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button, Input } from "@/components/ui";
import { useCustomization, Skill, Connector } from "@/store/useCustomization";

type CustomizeTab = "skills" | "connectors";

export default function CustomizePage() {
  const { skills, connectors, createSkill, updateSkill, updateConnector } = useCustomization();
  const [activeTab, setActiveTab] = useState<CustomizeTab>("skills");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isAuthoring, setIsAuthoring] = useState(false);

  const selectedSkill = skills.data?.find(s => s.id === selectedId);
  const selectedConnector = connectors.data?.find(c => c.id === selectedId);

  const renderLanding = () => (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-[--color-bg]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-24 h-24 mb-6 flex items-center justify-center border-2 border-[--color-border] rounded-2xl bg-[--color-surface]"
      >
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M7 20h10" />
          <path d="M12 16v4" />
        </svg>
      </motion.div>
      <h1 className="text-2xl font-serif mb-2">Personnaliser Claude</h1>
      <p className="text-sm text-[--color-text-tertiary] max-w-md mb-12">
        Les compétences, connecteurs et plugins façonnent la manière dont Claude travaille avec vous.
      </p>

      <div className="space-y-4 w-full max-w-md">
        <button 
          onClick={() => setActiveTab("connectors")}
          className="w-full group p-5 rounded-2xl bg-[--color-surface] border border-[--color-border] hover:border-[--color-border-warm] transition-all flex items-center gap-4 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[--color-surface-2] flex items-center justify-center text-xl">🔗</div>
          <div>
            <p className="text-sm font-semibold">Connectez vos applications</p>
            <p className="text-xs text-[--color-text-tertiary]">Permettez à Claude de lire et d'écrire dans les outils que vous utilisez déjà.</p>
          </div>
        </button>
        <button 
          onClick={() => { setActiveTab("skills"); setIsAuthoring(true); }}
          className="w-full group p-5 rounded-2xl bg-[--color-surface] border border-[--color-border] hover:border-[--color-border-warm] transition-all flex items-center gap-4 text-left"
        >
          <div className="w-10 h-10 rounded-lg bg-[--color-surface-2] flex items-center justify-center text-xl">🛠️</div>
          <div>
            <p className="text-sm font-semibold">Créer de nouvelles compétences</p>
            <p className="text-xs text-[--color-text-tertiary]">Apprenez à Claude vos processus, normes d'équipe et expertise.</p>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-[--color-bg] overflow-hidden">
      {/* ── Sub-Sidebar ────────────────────────────────────────── */}
      <aside className="w-[200px] border-r border-[--color-border] px-3 py-6 flex flex-col gap-1">
        <button 
          className="flex items-center gap-2 px-3 py-2 text-sm text-[--color-text-secondary] hover:text-[--color-text] mb-4"
          onClick={() => setSelectedId(null)}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          Personnaliser
        </button>
        
        <button
          onClick={() => { setActiveTab("skills"); setSelectedId(null); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === "skills" ? "bg-[--color-surface-2] text-[--color-text] font-medium" : "text-[--color-text-secondary] hover:bg-[--color-surface]"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
          Compétences
        </button>
        <button
          onClick={() => { setActiveTab("connectors"); setSelectedId(null); }}
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all",
            activeTab === "connectors" ? "bg-[--color-surface-2] text-[--color-text] font-medium" : "text-[--color-text-secondary] hover:bg-[--color-surface]"
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
          Connecteurs
        </button>
      </aside>

      {/* ── List Layout ───────────────────────────────────────── */}
      {!selectedId && !isAuthoring ? renderLanding() : (
        <div className="flex-1 flex overflow-hidden">
          <div className="w-[300px] border-r border-[--color-border] flex flex-col bg-[--color-surface]">
            <div className="p-4 border-b border-[--color-border] flex items-center justify-between">
              <span className="text-sm font-semibold">{activeTab === "skills" ? "Compétences" : "Connecteurs"}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => activeTab === "skills" && setIsAuthoring(true)}
                  className="p-1.5 hover:bg-[--color-surface-2] rounded"
                >
                  ➕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {activeTab === "skills" && skills.data?.map(skill => (
                <button
                  key={skill.id}
                  onClick={() => { setSelectedId(skill.id); setIsAuthoring(false); }}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all flex items-center gap-3",
                    selectedId === skill.id && !isAuthoring ? "bg-[--color-surface-2] text-[--color-text]" : "text-[--color-text-secondary] hover:bg-[--color-surface-2]/50"
                  )}
                >
                  <span className="text-lg opacity-60">📄</span>
                  <span className="truncate">{skill.name}</span>
                </button>
              ))}
              {activeTab === "connectors" && connectors.data?.map(conn => (
                <button
                  key={conn.id}
                  onClick={() => { setSelectedId(conn.id); setIsAuthoring(false); }}
                  className={cn(
                    "w-full px-3 py-2.5 rounded-lg text-left text-sm transition-all flex items-center gap-3",
                    selectedId === conn.id ? "bg-[--color-surface-2] text-[--color-text]" : "text-[--color-text-secondary] hover:bg-[--color-surface-2]/50"
                  )}
                >
                  <span className="text-lg">{conn.icon || "🔗"}</span>
                  <span className="truncate">{conn.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Details Area ───────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto custom-scrollbar p-12 max-w-5xl">
            <AnimatePresence mode="wait">
              {isAuthoring && (
                <SkillAuthoringDrawer 
                  onSave={(s) => { createSkill.mutate(s); setIsAuthoring(false); }}
                  onCancel={() => setIsAuthoring(false)}
                />
              )}
              {!isAuthoring && activeTab === "skills" && selectedSkill && (
                <SkillDetails 
                  skill={selectedSkill} 
                  onToggle={(active) => updateSkill.mutate({ id: selectedSkill.id, is_active: active })}
                />
              )}
              {!isAuthoring && activeTab === "connectors" && selectedConnector && (
                <ConnectorDetails 
                  connector={selectedConnector} 
                  onUpdate={(perms) => updateConnector.mutate({ id: selectedConnector.id, permissions: perms })}
                />
              )}
            </AnimatePresence>
          </main>
        </div>
      )}
    </div>
  );
}

function SkillAuthoringDrawer({ onSave, onCancel }: { onSave: (s: any) => void, onCancel: () => void }) {
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [content, setContent] = useState("");
  const [trigger, setTrigger] = useState("Auto");

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-serif">Créer une compétence</h2>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onCancel}>Annuler</Button>
          <Button variant="primary" onClick={() => onSave({ name, description: desc, content, trigger })}>Enregistrer</Button>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl">
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Nom</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: designer-frontend" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Description</label>
          <Input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="À quoi sert cette compétence ?" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-[--color-text-tertiary]">Instructions (Markdown)</label>
          <textarea 
            value={content} 
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-64 p-4 rounded-xl bg-[--color-surface] border border-[--color-border] text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[--color-cta]"
            placeholder="Écrivez vos instructions ici..."
          />
        </div>
        <div className="flex items-center gap-4">
           {["Auto", "Manuelle", "Commande /"].map(t => (
             <button 
                key={t}
                onClick={() => setTrigger(t)}
                className={cn(
                  "px-4 py-2 rounded-lg text-xs font-medium border transition-all",
                  trigger === t ? "bg-[--color-surface-2] border-[--color-cta] text-[--color-text]" : "border-[--color-border] text-[--color-text-secondary]"
                )}
             >
               {t}
             </button>
           ))}
        </div>
      </div>
    </motion.div>
  );
}

function SkillDetails({ skill, onToggle }: { skill: Skill, onToggle: (active: boolean) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-serif">{skill.name}</h2>
        <div className="flex items-center gap-3">
           <button 
            onClick={() => onToggle(!skill.is_active)}
            className={cn(
              "w-10 h-5 rounded-full relative cursor-pointer transition-colors",
              skill.is_active ? "bg-[--color-cta]" : "bg-[--color-border-warm]"
            )}
           >
              <motion.div 
                animate={{ x: skill.is_active ? 18 : 2 }}
                className="absolute top-0.5 left-0 w-4 h-4 bg-white rounded-full" 
              />
           </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8 mb-12">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[--color-text-tertiary] mb-1">Ajouté par</p>
          <p className="text-sm font-medium">{skill.author}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[--color-text-tertiary] mb-1">Dernière mise à jour</p>
          <p className="text-sm font-medium">{new Date(skill.created_at).toLocaleDateString()}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-[--color-text-tertiary] mb-1">Déclencheur</p>
          <p className="text-sm font-medium">{skill.trigger}</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm font-semibold mb-2 flex items-center gap-2">Description</p>
          <p className="text-sm text-[--color-text-secondary] leading-relaxed">{skill.description}</p>
        </div>
        <div className="p-8 rounded-2xl bg-[--color-surface] border border-[--color-border] min-h-[400px] relative">
          <pre className="text-sm text-[--color-text-secondary] whitespace-pre-wrap font-sans">{skill.content}</pre>
        </div>
      </div>
    </motion.div>
  );
}

function ConnectorDetails({ connector, onUpdate }: { connector: Connector, onUpdate: (perms: any) => void }) {
  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
           <span className="text-4xl">{connector.icon || "🔗"}</span>
           <div>
             <h2 className="text-2xl font-serif leading-tight">{connector.name}</h2>
             <span className="text-[10px] px-1.5 py-0.5 rounded bg-[--color-surface] border border-[--color-border-warm] text-[--color-text-tertiary] font-bold uppercase tracking-wider">Interactif</span>
           </div>
        </div>
      </div>
      <p className="text-sm text-[--color-text-secondary] mb-12 max-w-2xl leading-relaxed">
        Application officielle permettant de connecter vos données avec Claude.
      </p>

      <div className="space-y-8">
         <section>
            <h3 className="text-sm font-bold mb-1">Autorisations des outils</h3>
            <p className="text-xs text-[--color-text-tertiary] mb-6">Choisissez quand Claude est autorisé à utiliser ces outils.</p>
            
            <div className="space-y-4">
               <div className="flex items-center justify-between p-4 rounded-xl bg-[--color-surface] border border-[--color-border]">
                  <span className="text-sm font-medium">Outils interactifs</span>
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-[--color-text-tertiary]">Toujours autoriser</span>
                     <button className="p-1 hover:bg-[--color-surface-2] rounded">✔️</button>
                  </div>
               </div>
            </div>
         </section>
      </div>
    </motion.div>
  );
}
