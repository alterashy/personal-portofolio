import React, { useRef, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Bold, Italic, Code, Heading1, Heading2, List, ListOrdered, Image as ImageIcon, Undo, Redo, Loader2 } from 'lucide-react';

interface TipTapEditorProps {
  content: string;
  onChange?: (newContent: string) => void;
}

export const TipTapEditor: React.FC<TipTapEditorProps> = ({ content, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ inline: true }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[250px] p-4 text-slate-200 text-sm leading-relaxed',
      },
    },
  });

  if (!editor) {
    return <div className="p-4 text-xs text-slate-500">Loading editor...</div>;
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        editor.chain().focus().setImage({ src: data.url }).run();
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading file');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="border border-white/10 rounded-xl overflow-hidden bg-black/40 backdrop-blur-md">
      {/* Hidden File Input for Image Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-white/5 border-b border-white/10 text-slate-300">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bold') ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('italic') ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('code') ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Code"
        >
          <Code className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('bulletList') ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${editor.isActive('orderedList') ? 'bg-purple-600/40 text-purple-200' : ''}`}
          title="Ordered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1 text-xs text-purple-300 font-medium"
          title="Upload Image to Supabase"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
          ) : (
            <ImageIcon className="w-4 h-4" />
          )}
          <span>Upload Image</span>
        </button>

        <div className="w-px h-5 bg-white/10 mx-1"></div>

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors ml-auto"
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />
    </div>
  );
};
