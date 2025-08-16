import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { useEffect } from 'react'

const MenuBar = ({ editor }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="tiptap-menu-bar">
            <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active' : ''}
            >
                <strong>B</strong>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active' : ''}
            >
                <em>I</em>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                className={editor.isActive('underline') ? 'is-active' : ''}
            >
                <u>U</u>
            </button>
            <button
                onClick={() => editor.chain().focus().toggleStrike().run()}
                disabled={!editor.can().chain().focus().toggleStrike().run()}
                className={editor.isActive('strike') ? 'is-active' : ''}
            >
                <s>S</s>
            </button>

            <span className="separator" />

            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            >
                H1
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            >
                H2
            </button>
            <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            >
                H3
            </button>

            <span className="separator" />

            <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
                UL
            </button>
            <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
                OL
            </button>

            <span className="separator" />

            <button
                onClick={() => editor.chain().focus().setLink({ href: '' }).run()}
                className={editor.isActive('link') ? 'is-active' : ''}
            >
                Link
            </button>
            <button
                onClick={() => editor.chain().focus().setImage({ src: '' }).run()}
            >
                Image
            </button>

            <span className="separator" />

            <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().undo()}
            >
                Undo
            </button>
            <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().redo()}
            >
                Redo
            </button>
        </div>
    )
}

export default function RichTextEditor({ value, onChange, placeholder }) {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Image,
            Link.configure({
                openOnClick: false,
            }),
        ],
        content: value,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'tiptap-editor',
                placeholder: placeholder || 'Write something...',
            },
        },
    })

    useEffect(() => {
        if (editor && value !== editor.getHTML()) {
            editor.commands.setContent(value)
        }
    }, [value, editor])

    return (
        <div className="tiptap-container">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />

            <style jsx>{`
                .tiptap-container {
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
                
                .tiptap-menu-bar {
                    padding: 0.5rem;
                    display: flex;
                    flex-wrap: wrap;
                    gap: 0.5rem;
                    border-bottom: 1px solid #ddd;
                    background: #f8f9fa;
                }
                
                .tiptap-menu-bar button {
                    background: white;
                    border: 1px solid #ddd;
                    border-radius: 3px;
                    padding: 0.25rem 0.5rem;
                    cursor: pointer;
                }
                
                .tiptap-menu-bar button:hover {
                    background: #eee;
                }
                
                .tiptap-menu-bar button.is-active {
                    background: #ddd;
                }
                
                .tiptap-menu-bar .separator {
                    width: 1px;
                    background: #ddd;
                    margin: 0 0.25rem;
                }
                
                .tiptap-editor {
                    padding: 1rem;
                    min-height: 200px;
                    outline: none;
                }
                
                .tiptap-editor:empty:before {
                    content: attr(placeholder);
                    color: #6c757d;
                    pointer-events: none;
                    display: block;
                }
            `}</style>
        </div>
    )
}