<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

withDefaults(
    defineProps<{
        placeholder?: string
        collapsed?: boolean
    }>(),
    {
        placeholder: 'Search…',
        collapsed: false,
    },
)
</script>

<template>
    <label
        :class="[
            'group flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 transition focus-within:border-accent-500 focus-within:ring-2 focus-within:ring-accent-500/20 dark:border-slate-700 dark:bg-slate-900',
            collapsed ? 'h-9 w-9 justify-center px-0' : 'h-9 w-full max-w-sm',
        ]"
    >
        <AppIcon name="search" class="h-4 w-4 shrink-0 text-slate-400 group-focus-within:text-accent-500" />
        <input
            v-if="!collapsed"
            type="search"
            :placeholder="placeholder"
            class="w-full border-0 bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-0 dark:text-slate-100 dark:placeholder-slate-500"
        />
    </label>
</template>
