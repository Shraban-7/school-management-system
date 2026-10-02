import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Heading2,
    Heading3,
    Italic,
    List,
    ListOrdered,
    Minus,
    Redo2,
    Strikethrough,
    TextQuote,
    Undo2,
} from 'lucide-react';

interface RichTextEditorProps {
    value?: string;
    modelValue?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    invalid?: boolean;
}

export default function RichTextEditor({
    value = '',
    modelValue = '',
    onChange,
    placeholder = '',
    invalid = false,
}: RichTextEditorProps) {
    const content = value || modelValue || '';

    const editor = useEditor({
        extensions: [StarterKit],
        content,
        editorProps: {
            attributes: {
                class: 'rich-text min-h-40 px-3 py-2 text-sm focus:outline-none',
            },
        },
        onUpdate: ({ editor }) => {
            onChange?.(editor.isEmpty ? '' : editor.getHTML());
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content || '');
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div
            className={`rounded-lg border bg-white dark:bg-slate-900 ${
                invalid
                    ? 'border-rose-400 dark:border-rose-700'
                    : 'border-slate-200 dark:border-slate-700'
            }`}
        >
            <div className="flex flex-wrap items-center gap-1 border-b border-slate-200 p-1.5 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('bold')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Bold"
                >
                    <Bold className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('italic')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Italic"
                >
                    <Italic className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('strike')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Strikethrough"
                >
                    <Strikethrough className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('heading', { level: 2 })
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Heading 2"
                >
                    <Heading2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('heading', { level: 3 })
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Heading 3"
                >
                    <Heading3 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('bulletList')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Bullet List"
                >
                    <List className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('orderedList')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Ordered List"
                >
                    <ListOrdered className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={`rounded p-1.5 transition ${
                        editor.isActive('blockquote')
                            ? 'bg-slate-200 text-slate-900 dark:bg-slate-700 dark:text-white'
                            : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                    title="Blockquote"
                >
                    <TextQuote className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().setHorizontalRule().run()}
                    className="rounded p-1.5 text-slate-600 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Horizontal Line"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="rounded p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Undo"
                >
                    <Undo2 className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="rounded p-1.5 text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-400 dark:hover:bg-slate-800"
                    title="Redo"
                >
                    <Redo2 className="h-4 w-4" />
                </button>
            </div>
            <EditorContent editor={editor} />
        </div>
    );
}
