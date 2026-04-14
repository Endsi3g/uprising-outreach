"use client";

import { motion, AnimatePresence } from "framer-motion";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  AlertCircle, 
  Server,
  ChevronRight,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

export type PlanStatus = "pending" | "in-progress" | "done" | "error";

export interface PlanTask {
  id: string;
  label: string;
  status: PlanStatus;
  description?: string;
  subTasks?: PlanTask[];
  mcpServers?: string[];
}

interface AgentPlannerProps {
  tasks: PlanTask[];
  onClose?: () => void;
}

export function AgentPlanner({ tasks, onClose }: AgentPlannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden max-w-2xl w-full mx-auto"
    >
      {/* Header */}
      <div className="bg-zinc-900 px-6 py-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="relative">
             <div className="absolute inset-0 rounded-full bg-blue-400 blur-sm animate-pulse opacity-50" />
             <div className="relative w-2 h-2 rounded-full bg-blue-400" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Agent Plan</span>
        </div>
        <div className="flex items-center gap-4">
           <button className="text-white/60 hover:text-white transition-colors">
             <motion.div initial={{ rotate: 0 }} whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Clock className="w-4 h-4" />
             </motion.div>
           </button>
           {onClose && (
             <button onClick={onClose} className="text-white/60 hover:text-white">
               ✕
             </button>
           )}
        </div>
      </div>

      {/* Content */}
      <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
        {tasks.map((task) => (
          <PlanSection key={task.id} task={task} />
        ))}
      </div>

      {/* Footer Info */}
      <div className="bg-zinc-50 border-t border-zinc-100 px-8 py-4 flex items-center justify-between">
        <p className="text-[10px] text-zinc-400 font-medium uppercase tracking-widest">Autonomous Thinking Active</p>
        <div className="flex gap-2">
           <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
           <div className="w-1 h-1 rounded-full bg-blue-300 animate-pulse delay-75" />
           <div className="w-1 h-1 rounded-full bg-blue-200 animate-pulse delay-150" />
        </div>
      </div>
    </motion.div>
  );
}

function PlanSection({ task }: { task: PlanTask }) {
  const isPending = task.status === "pending";
  const isInProgress = task.status === "in-progress";
  const isDone = task.status === "done";
  const isError = task.status === "error";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between group">
        <div className="flex items-center gap-4">
          <StatusIcon status={task.status} />
          <h3 className={cn(
            "text-base font-semibold transition-colors",
            isDone ? "text-zinc-900" : (isInProgress ? "text-blue-600" : "text-zinc-400")
          )}>
            {task.label}
          </h3>
        </div>
        <Badge status={task.status} />
      </div>

      <AnimatePresence>
        {task.subTasks && task.subTasks.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            className="pl-12 space-y-3 relative"
          >
            {/* Thread line */}
            <div className="absolute left-[2.35rem] top-0 bottom-4 w-px bg-zinc-100" />
            
            {task.subTasks.map((sub, idx) => (
              <div key={sub.id} className="relative">
                <div className="flex items-start gap-4">
                   <div className="mt-1">
                      <StatusIcon status={sub.status} size="sm" />
                   </div>
                   <div className="flex-1 space-y-1">
                      <p className={cn(
                        "text-sm font-medium",
                        sub.status === "done" ? "text-zinc-600" : (sub.status === "in-progress" ? "text-blue-500" : "text-zinc-400")
                      )}>
                        {sub.label}
                      </p>
                      {sub.description && (
                        <p className="text-xs text-zinc-400 leading-relaxed max-w-md">
                          {sub.description}
                        </p>
                      )}
                      {sub.mcpServers && sub.mcpServers.length > 0 && (
                        <div className="flex items-center gap-3 pt-1">
                          <span className="text-[10px] font-bold text-zinc-300 uppercase">MCP Servers:</span>
                          <div className="flex gap-2">
                             {sub.mcpServers.map(s => (
                               <div key={s} className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-[10px] text-zinc-500 font-medium">
                                 <Server className="w-2.5 h-2.5" />
                                 {s}
                               </div>
                             ))}
                          </div>
                        </div>
                      )}
                   </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatusIcon({ status, size = "md" }: { status: PlanStatus; size?: "sm" | "md" }) {
  const s = size === "sm" ? "w-4 h-4" : "w-6 h-6";
  const dotS = size === "sm" ? "w-1.5 h-1.5" : "w-2.5 h-2.5";
  
  if (status === "done") return <CheckCircle2 className={cn(s, "text-emerald-500")} />;
  if (status === "error") return <AlertCircle className={cn(s, "text-rose-500")} />;
  if (status === "in-progress") {
    return (
      <div className={cn(s, "relative flex items-center justify-center")}>
        <div className="absolute inset-0 rounded-full border-2 border-blue-100" />
        <div className="absolute inset-0 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
        <div className={cn(dotS, "rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]")} />
      </div>
    );
  }
  return <Circle className={cn(s, "text-zinc-200")} />;
}

function Badge({ status }: { status: PlanStatus }) {
  if (status === "pending") return <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300 bg-zinc-50 px-2 py-0.5 rounded-md">pending</span>;
  if (status === "in-progress") return <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 bg-blue-50 px-2 py-0.5 rounded-md">in-progress</span>;
  if (status === "done") return <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md">complete</span>;
  return null;
}
