<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import { useTheme } from '@/composables/useTheme'

const { theme, toggle } = useTheme()
</script>

<template>
    <button
        type="button"
        class="inline-flex h-9 w-9 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
        :aria-label="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
        :title="theme === 'dark' ? 'Light mode' : 'Dark mode'"
        @click="toggle"
    >
        <AppIcon v-if="theme === 'dark'" name="sun" class="h-5 w-5" />
        <AppIcon v-else name="moon" class="h-5 w-5" />
    </button>
</template>
