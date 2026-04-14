"use client";

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Undo, 
  Redo,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null;

  const buttons = [
    {
      icon: <Bold className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive('bold'),
      title: 'Gras'
    },
    {
      icon: <Italic className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive('italic'),
      title: 'Italique'
    },
    {
      icon: <List className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive('bulletList'),
      title: 'Liste à puces'
    },
    {
      icon: <ListOrdered className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive('orderedList'),
      title: 'Liste ordonnée'
    },
    {
      icon: <Quote className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive('blockquote'),
      title: 'Citation'
    },
    {
      icon: <Code className="w-4 h-4" />,
      onClick: () => editor.chain().focus().toggleCodeBlock().run(),
      isActive: editor.isActive('codeBlock'),
      title: 'Bloc de code'
    },
  ];

  return (
    <div className="flex flex-wrap gap-1 p-2 border-b border-[--color-border] bg-[--color-surface]">
      {buttons.map((btn, i) => (
        <button
          key={i}
          onClick={(e) => { e.preventDefault(); btn.onClick(); }}
          className={cn(
            "p-2 rounded-lg transition-colors",
            btn.isActive 
              ? "bg-[--color-cta] text-white" 
              : "text-[--color-text-tertiary] hover:bg-[--color-surface-2] hover:text-[--color-text]"
          )}
          title={btn.title}
        >
          {btn.icon}
        </button>
      ))}
      <div className="w-px h-6 bg-[--color-border] mx-1 self-center" />
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().undo().run(); }}
        className="p-2 rounded-lg text-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-colors"
      >
        <Undo className="w-4 h-4" />
      </button>
      <button
        onClick={(e) => { e.preventDefault(); editor.chain().focus().redo().run(); }}
        className="p-2 rounded-lg text-[--color-text-tertiary] hover:bg-[--color-surface-2] transition-colors"
      >
        <Redo className="w-4 h-4" />
      </button>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[150px] p-4 text-[--color-text] font-sans',
      },
    },
  });

  return (
    <div className="w-full border border-[--color-border] rounded-xl overflow-hidden bg-[--color-bg] focus-within:ring-2 focus-within:ring-[--color-cta]/20 transition-all">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
};
