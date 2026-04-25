import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Link as LinkIcon, Quote, Heading2, Heading3, Undo, Redo, Minus } from 'lucide-react'

const Btn = ({ onClick, active, title, children }) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className={`p-1.5 rounded transition-colors ${active ? 'bg-emerald-100 text-emerald-700' : 'text-gray-500 hover:bg-gray-200'}`}
  >
    {children}
  </button>
)

export default function RichTextEditor({ value, onChange, placeholder = 'Tulis konten...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: 'text-emerald-600 underline' } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none min-h-[220px] px-3 py-2 focus:outline-none',
      },
    },
  })

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  if (!editor) return null

  const setLink = () => {
    const prev = editor.getAttributes('link').href
    const url = prompt('Masukkan URL:', prev || 'https://')
    if (url === null) return
    if (url === '') { editor.chain().focus().unsetLink().run(); return }
    editor.chain().focus().setLink({ href: url }).run()
  }

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500 bg-white">
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Garis Pemisah"><Minus className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <Btn onClick={setLink} active={editor.isActive('link')} title="Tambah Link"><LinkIcon className="w-3.5 h-3.5" /></Btn>
        <div className="w-px h-4 bg-gray-300 mx-0.5" />
        <Btn onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo className="w-3.5 h-3.5" /></Btn>
        <Btn onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo className="w-3.5 h-3.5" /></Btn>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
