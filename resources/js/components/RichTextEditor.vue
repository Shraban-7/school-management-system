<script setup lang="ts">
import { watch, type FunctionalComponent } from 'vue'
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
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
    Underline,
    Undo2,
} from '@lucide/vue'

const props = withDefaults(
    defineProps<{
        modelValue: string
        placeholder?: string
        invalid?: boolean
    }>(),
    {
        placeholder: '',
        invalid: false,
    },
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string): void
}>()

const editor = useEditor({
    content: props.modelValue,
    extensions: [StarterKit],
    editorProps: {
        attributes: {
            class: 'rich-text min-h-40 px-3 py-2 text-sm focus:outline-none',
        },
    },
    onUpdate: ({ editor }) => {
        emit('update:modelValue', editor.isEmpty ? '' : editor.getHTML())
    },
})

watch(
    () => props.modelValue,
    (value) => {
        if (editor.value && value !== editor.value.getHTML()) {
            editor.value.commands.setContent(value || '')
        }
    },
)

interface ToolButton {
    icon: FunctionalComponent
    title: string
    action: () => void
    isActive?: () => boolean
    isDisabled?: () => boolean
}

const buttons: ToolButton[] = [
    {
        icon: Bold,
        title: 'Bold',
        action: () => editor.value?.chain().focus().toggleBold().run(),
        isActive: () => editor.value?.isActive('bold') ?? false,
    },
    {
        icon: Italic,
        title: 'Italic',
        action: () => editor.value?.chain().focus().toggleItalic().run(),
        isActive: () => editor.value?.isActive('italic') ?? false,
    },
    {
        icon: Underline,
        title: 'Underline',
        action: () => editor.value?.chain().focus().toggleUnderline().run(),
        isActive: () => editor.value?.isActive('underline') ?? false,
    },
    {
        icon: Strikethrough,
        title: 'Strikethrough',
        action: () => editor.value?.chain().focus().toggleStrike().run(),
        isActive: () => editor.value?.isActive('strike') ?? false,
    },
    {
        icon: Heading2,
        title: 'Heading',
        action: () =>
            editor.value?.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: () => editor.value?.isActive('heading', { level: 2 }) ?? false,
    },
    {
        icon: Heading3,
        title: 'Subheading',
        action: () =>
            editor.value?.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: () => editor.value?.isActive('heading', { level: 3 }) ?? false,
    },
    {
        icon: List,
        title: 'Bullet list',
        action: () => editor.value?.chain().focus().toggleBulletList().run(),
        isActive: () => editor.value?.isActive('bulletList') ?? false,
    },
    {
        icon: ListOrdered,
        title: 'Numbered list',
        action: () => editor.value?.chain().focus().toggleOrderedList().run(),
        isActive: () => editor.value?.isActive('orderedList') ?? false,
    },
    {
        icon: TextQuote,
        title: 'Quote',
        action: () => editor.value?.chain().focus().toggleBlockquote().run(),
        isActive: () => editor.value?.isActive('blockquote') ?? false,
    },
    {
        icon: Minus,
        title: 'Divider',
        action: () => editor.value?.chain().focus().setHorizontalRule().run(),
    },
    {
        icon: Undo2,
        title: 'Undo',
        action: () => editor.value?.chain().focus().undo().run(),
        isDisabled: () => !(editor.value?.can().undo() ?? false),
    },
    {
        icon: Redo2,
        title: 'Redo',
        action: () => editor.value?.chain().focus().redo().run(),
        isDisabled: () => !(editor.value?.can().redo() ?? false),
    },
]
</script>

<template>
    <div
        :class="[
            'mt-1 overflow-hidden rounded-md border bg-white transition focus-within:ring-2 focus-within:ring-accent-500/20 dark:bg-slate-950',
            invalid
                ? 'border-rose-500'
                : 'border-slate-200 focus-within:border-accent-500 dark:border-slate-700',
        ]"
    >
        <div
            class="flex flex-wrap items-center gap-0.5 border-b border-slate-200 bg-slate-50 px-2 py-1.5 dark:border-slate-700 dark:bg-slate-900"
        >
            <button
                v-for="button in buttons"
                :key="button.title"
                type="button"
                :title="button.title"
                :disabled="button.isDisabled?.() ?? false"
                :class="[
                    'inline-flex h-7 w-7 items-center justify-center rounded transition disabled:cursor-not-allowed disabled:opacity-40',
                    button.isActive?.()
                        ? 'bg-accent-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-800',
                ]"
                @click="button.action()"
            >
                <component :is="button.icon" class="h-4 w-4" :stroke-width="2" />
            </button>
        </div>

        <EditorContent :editor="editor" />
    </div>
</template>
