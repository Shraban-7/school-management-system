import { onMounted, ref, watch } from 'vue'

export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'theme'

function readInitialTheme(): Theme {
    if (typeof window === 'undefined') {
        return 'light'
    }
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (stored === 'light' || stored === 'dark') {
        return stored
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyTheme(theme: Theme): void {
    if (typeof document === 'undefined') {
        return
    }
    document.documentElement.classList.toggle('dark', theme === 'dark')
}

const theme = ref<Theme>(readInitialTheme())

if (typeof window !== 'undefined') {
    applyTheme(theme.value)

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (window.localStorage.getItem(STORAGE_KEY)) {
            return
        }
        const next: Theme = event.matches ? 'dark' : 'light'
        theme.value = next
        applyTheme(next)
    })
}

watch(theme, (value) => {
    applyTheme(value)
    if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, value)
    }
})

export function useTheme() {
    onMounted(() => {
        applyTheme(theme.value)
    })

    function setTheme(next: Theme): void {
        theme.value = next
    }

    function toggle(): void {
        theme.value = theme.value === 'dark' ? 'light' : 'dark'
    }

    return { theme, setTheme, toggle }
}
