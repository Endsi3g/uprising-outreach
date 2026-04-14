"use client";

import type React from "react";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Plus,
  SlidersHorizontal,
  ArrowUp,
  X,
  FileText,
  ImageIcon,
  Video,
  Music,
  Archive,
  ChevronDown,
  Check,
  Loader2,
  AlertCircle,
  Copy,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

// Types
export interface FileWithPreview {
  id: string;
  file: File;
  preview?: string;
  type: string;
  uploadStatus: "pending" | "uploading" | "complete" | "error";
  uploadProgress?: number;
  abortController?: AbortController;
  textContent?: string;
}

export interface PastedContent {
  id: string;
  content: string;
  timestamp: Date;
  wordCount: number;
}

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  badge?: string;
}

interface ChatInputProps {
  onSendMessage?: (
    message: string,
    files: FileWithPreview[],
    pastedContent: PastedContent[]
  ) => void;
  disabled?: boolean;
  placeholder?: string;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  acceptedFileTypes?: string[];
  models?: ModelOption[];
  defaultModel?: string;
  onModelChange?: (modelId: string) => void;
}

// Constants
const MAX_FILES = 10;
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const PASTE_THRESHOLD = 200; // characters threshold for showing as pasted content
const DEFAULT_MODELS_INTERNAL: ModelOption[] = [
  {
    id: "prospectos-ai-core",
    name: "ProspectOS Core",
    description: "Modèle équilibré",
    badge: "Recommandé",
  },
  {
    id: "prospectos-ai-fast",
    name: "ProspectOS Fast",
    description: "Réponses rapides",
  },
];

// File type helpers
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
};

const getFileTypeLabel = (type: string): string => {
  const parts = type.split("/");
  let label = parts[parts.length - 1].toUpperCase();
  if (label.length > 7 && label.includes("-")) {
    label = label.substring(0, label.indexOf("-"));
  }
  if (label.length > 10) {
    label = label.substring(0, 10) + "...";
  }
  return label;
};

const isTextualFile = (file: File): boolean => {
  const textualTypes = [
    "text/",
    "application/json",
    "application/xml",
    "application/javascript",
    "application/typescript",
  ];
  const textualExtensions = [
    "txt", "md", "py", "js", "ts", "jsx", "tsx", "html", "htm", "css", 
    "scss", "sass", "json", "xml", "yaml", "yml", "csv", "sql", "sh", 
    "php", "rb", "go", "java", "c", "cpp", "rs", "swift", "kt"
  ];
  const isTextualMimeType = textualTypes.some((type) =>
    file.type.toLowerCase().startsWith(type)
  );
  const extension = file.name.split(".").pop()?.toLowerCase() || "";
  return isTextualMimeType || textualExtensions.includes(extension);
};

const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || "");
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

const getFileExtension = (filename: string): string => {
  const extension = filename.split(".").pop()?.toUpperCase() || "FICHIER";
  return extension.length > 8 ? extension.substring(0, 8) + "..." : extension;
};

// --- Custom Base Button for Icons ---
const IconButton = ({ children, onClick, disabled, className, title }: any) => (
  <button
    disabled={disabled}
    onClick={onClick}
    title={title}
    className={cn(
      "h-9 w-9 p-0 flex items-center justify-center rounded-md text-[--color-text-tertiary] hover:text-[--color-text] hover:bg-[--color-surface-2] transition-colors disabled:opacity-50 flex-shrink-0 cursor-pointer",
      className
    )}
  >
    {children}
  </button>
);

// File Preview Component
const FilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const isImage = file.type.startsWith("image/");
  if (isTextualFile(file.file)) {
    return <TextualFilePreviewCard file={file} onRemove={onRemove} />;
  }

  return (
    <div className={cn("relative group bg-[--color-surface-white] border border-[--color-border] w-fit rounded-lg p-3 w-[125px] h-[125px] shadow-sm flex-shrink-0 overflow-hidden", isImage ? "p-0" : "p-3")}>
      <div className="flex items-start gap-3 w-full h-full overflow-hidden">
        {isImage && file.preview ? (
          <div className="relative size-full rounded-md overflow-hidden bg-[--color-surface-2]">
            <img src={file.preview} alt={file.file.name} className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="flex-1 min-w-0 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-1">
              <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-b to-[--color-surface-2] from-transparent overflow-hidden border-t">
                <p className="absolute bottom-2 left-2 capitalize text-[--color-text] text-xs bg-[--color-surface-white] border border-[--color-border] px-2 py-1 rounded-md">
                  {getFileTypeLabel(file.type)}
                </p>
              </div>
              {file.uploadStatus === "uploading" && <Loader2 className="h-3.5 w-3.5 animate-spin text-[--color-cta]" />}
              {file.uploadStatus === "error" && <AlertCircle className="h-3.5 w-3.5 text-[--color-error]" />}
            </div>
            <p className="max-w-[90%] text-xs font-medium text-[--color-text] truncate" title={file.file.name}>{file.file.name}</p>
            <p className="text-[10px] text-[--color-text-secondary] mt-1">{formatFileSize(file.file.size)}</p>
          </div>
        )}
      </div>
      <button
        className="absolute top-1 right-1 h-6 w-6 flex items-center justify-center bg-[--color-surface] rounded-md border border-[--color-border] opacity-0 group-hover:opacity-100 text-[--color-text] hover:bg-[--color-surface-2] transition-opacity"
        onClick={() => onRemove(file.id)}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// Textual File Preview Component
const TextualFilePreviewCard: React.FC<{
  file: FileWithPreview;
  onRemove: (id: string) => void;
}> = ({ file, onRemove }) => {
  const previewText = file.textContent?.slice(0, 150) || "";
  const needsTruncation = (file.textContent?.length || 0) > 150;

  return (
    <div className="bg-[--color-surface-white] border border-[--color-border] relative rounded-lg p-3 w-[125px] h-[125px] shadow-sm flex-shrink-0 overflow-hidden">
      <div className="text-[9px] text-[--color-text-secondary] whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {file.textContent ? (
          <>{previewText}{needsTruncation && "..."}</>
        ) : (
          <div className="flex items-center justify-center h-full text-[--color-text-tertiary]"><Loader2 className="h-4 w-4 animate-spin" /></div>
        )}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-t from-[--color-surface-white] via-[rgba(255,255,255,0.7)] to-transparent overflow-hidden">
        <p className="capitalize text-[--color-text] text-xs bg-[--color-surface-2] border border-[--color-border] px-2 py-1 rounded-md z-10 font-medium">
          {getFileExtension(file.file.name)}
        </p>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-1 right-1 z-20">
          <button className="h-6 w-6 flex items-center justify-center bg-[--color-surface-white] rounded-md border border-[--color-border] shadow-sm text-[--color-text]" onClick={() => onRemove(file.id)}>
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Pasted Content Card
const PastedContentCard: React.FC<{
  content: PastedContent;
  onRemove: (id: string) => void;
}> = ({ content, onRemove }) => {
  const previewText = content.content.slice(0, 150);
  const needsTruncation = content.content.length > 150;

  return (
    <div className="bg-[--color-surface-white] border border-[--color-border] relative rounded-lg w-[125px] h-[125px] p-3 shadow-sm flex-shrink-0 overflow-hidden">
      <div className="text-[9px] text-[--color-text-secondary] whitespace-pre-wrap break-words max-h-24 overflow-y-auto custom-scrollbar">
        {previewText}{needsTruncation && "..."}
      </div>
      <div className="group absolute flex justify-start items-end p-2 inset-0 bg-gradient-to-t from-[--color-surface-white] via-[rgba(255,255,255,0.7)] to-transparent overflow-hidden">
        <p className="capitalize text-[--color-text] text-xs bg-[--color-surface-2] border border-[--color-border] px-2 py-1 rounded-md z-10 font-medium">Texte</p>
        <div className="group-hover:opacity-100 opacity-0 transition-opacity duration-300 flex items-center gap-0.5 absolute top-1 right-1 z-20">
          <button className="h-6 w-6 flex items-center justify-center bg-[--color-surface-white] rounded-md border border-[--color-border] shadow-sm text-[--color-text]" onClick={() => onRemove(content.id)}>
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Model Selector Dropdown
const ModelSelectorDropdown: React.FC<{
  models: ModelOption[];
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}> = ({ models, selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedModelData = models.find((m) => m.id === selectedModel) || models[0];
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="h-9 px-2.5 text-sm font-medium text-[--color-text-secondary] hover:text-[--color-text] hover:bg-[--color-surface-2] rounded-md transition-colors flex items-center gap-1 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate max-w-[150px] sm:max-w-[200px]">{selectedModelData.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 bg-[--color-surface-white] border border-[--color-border] rounded-xl shadow-[--shadow-card] z-20 p-2 text-[--color-text]">
          {models.map((model) => (
            <button
              key={model.id}
              className={cn(
                "w-full text-left p-2.5 rounded-lg hover:bg-[--color-surface-2] transition-colors flex items-center justify-between cursor-pointer",
                model.id === selectedModel && "bg-[--color-surface-2]"
              )}
              onClick={() => { onModelChange(model.id); setIsOpen(false); }}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{model.name}</span>
                  {model.badge && (
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold tracking-wider bg-[--color-surface-2] text-[--color-cta] rounded">
                      {model.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[--color-text-tertiary] mt-0.5">{model.description}</p>
              </div>
              {model.id === selectedModel && <Check className="h-4 w-4 text-[--color-cta] flex-shrink-0" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const ClaudeChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Comment puis-je vous aider ?",
  maxFiles = MAX_FILES,
  maxFileSize = MAX_FILE_SIZE,
  acceptedFileTypes,
  models = DEFAULT_MODELS_INTERNAL,
  defaultModel,
  onModelChange,
}) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [pastedContent, setPastedContent] = useState<PastedContent[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedModel, setSelectedModel] = useState(defaultModel || models[0]?.id || "");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const maxHeight = 200;
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, maxHeight)}px`;
    }
  }, [message]);

  const handleFileSelect = useCallback((selectedFiles: FileList | null) => {
    if (!selectedFiles) return;
    const filesToAdd = Array.from(selectedFiles).slice(0, maxFiles - files.length);
    const newFiles = filesToAdd.map((file) => ({
      id: Math.random().toString(),
      file,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      type: file.type || "application/octet-stream",
      uploadStatus: "pending" as const,
      uploadProgress: 0,
    }));

    setFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((fileToUpload) => {
      if (isTextualFile(fileToUpload.file)) {
        readFileAsText(fileToUpload.file).then((textContent) => {
          setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, textContent, uploadStatus: "complete" } : f));
        });
      } else {
        setTimeout(() => {
          setFiles((prev) => prev.map((f) => f.id === fileToUpload.id ? { ...f, uploadStatus: "complete" } : f));
        }, 500);
      }
    });
  }, [files.length, maxFiles]);

  const handleSend = useCallback(() => {
    if (disabled || (!message.trim() && files.length === 0 && pastedContent.length === 0)) return;
    onSendMessage?.(message, files, pastedContent);
    setMessage("");
    setFiles([]);
    setPastedContent([]);
  }, [message, files, pastedContent, disabled, onSendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasContent = message.trim() || files.length > 0 || pastedContent.length > 0;

  return (
    <div className="relative w-full max-w-[760px] mx-auto">
      {isDragging && (
        <div className="absolute inset-0 z-50 bg-[--color-surface-2] bg-opacity-90 border-2 border-dashed border-[--color-cta] rounded-2xl flex items-center justify-center">
          <p className="text-[--color-cta] font-medium flex items-center gap-2"><ImageIcon className="h-5 w-5" /> Glissez vos fichiers ici</p>
        </div>
      )}

      <div 
        className="bg-[--color-bg] border border-[--color-border] rounded-2xl shadow-[--shadow-card] flex flex-col transition-all focus-within:shadow-[--shadow-ring-focus] focus-within:border-transparent"
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileSelect(e.dataTransfer.files); }}
      >
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full text-[15px] p-4 bg-transparent outline-none resize-none text-[--color-text] placeholder:text-[--color-text-tertiary] custom-scrollbar rounded-t-2xl min-h-[56px]"
          rows={1}
        />

        {(files.length > 0 || pastedContent.length > 0) && (
          <div className="flex gap-3 px-4 pb-3 overflow-x-auto custom-scrollbar">
            {pastedContent.map((content) => <PastedContentCard key={content.id} content={content} onRemove={(id) => setPastedContent(p => p.filter(c => c.id !== id))} />)}
            {files.map((file) => <FilePreviewCard key={file.id} file={file} onRemove={(id) => setFiles(p => p.filter(f => f.id !== id))} />)}
          </div>
        )}

        <div className="flex items-center justify-between px-3 pb-3">
          <div className="flex items-center gap-1">
            <IconButton onClick={() => fileInputRef.current?.click()} title="Joindre des fichiers"><Plus className="h-5 w-5" /></IconButton>
          </div>
          <div className="flex items-center gap-3">
            <ModelSelectorDropdown models={models} selectedModel={selectedModel} onModelChange={setSelectedModel} />
            <Button
              variant="primary"
              size="sm"
              disabled={!hasContent || disabled}
              onClick={handleSend}
              className={cn("h-8 w-8 !p-0 flex items-center justify-center rounded-lg transition-transform", hasContent && "bg-[--color-cta] text-white", !hasContent && "bg-[--color-surface-2] border border-[--color-border] text-[--color-text-tertiary]")}
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={(e) => { handleFileSelect(e.target.files); if (e.target) e.target.value = ""; }} />
    </div>
  );
};
