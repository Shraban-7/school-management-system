import { computed } from 'vue'
import { router, usePage } from '@inertiajs/vue3'

type TranslationTree = Record<string, unknown>

function resolveKey(tree: TranslationTree, key: string): string | null {
    const parts = key.split('.')
    let current: unknown = tree

    for (const part of parts) {
        if (current === null || typeof current !== 'object' || !(part in (current as object))) {
            return null
        }
        current = (current as TranslationTree)[part]
    }

    return typeof current === 'string' ? current : null
}

function applyReplacements(text: string, replacements: Record<string, string | number>): string {
    return Object.entries(replacements).reduce(
        (result, [key, value]) => result.replaceAll(`:${key}`, String(value)),
        text,
    )
}

/**
 * Prefer Bangla bilingual content when locale is bn, otherwise English.
 */
export function bilingual(
    en: string | null | undefined,
    bn: string | null | undefined,
    locale: string = 'en',
): string {
    if (locale === 'bn') {
        return (bn && bn.trim() !== '' ? bn : en) ?? ''
    }

    return (en && en.trim() !== '' ? en : bn) ?? ''
}

export function useI18n() {
    const page = usePage()

    const locale = computed(() => ((page.props as Record<string, unknown>).locale as string) ?? 'en')
    const translations = computed(
        () => ((page.props as Record<string, unknown>).translations as TranslationTree) ?? {},
    )
    const isBangla = computed(() => locale.value === 'bn')

    function t(key: string, replacements: Record<string, string | number> = {}): string {
        const value = resolveKey(translations.value, key) ?? key
        return applyReplacements(value, replacements)
    }

    function bi(en: string | null | undefined, bn: string | null | undefined): string {
        if (isBangla.value) {
            return (bn && bn.trim() !== '' ? bn : en) ?? ''
        }
        return (en && en.trim() !== '' ? en : bn) ?? ''
    }

    function setLocale(next: 'en' | 'bn'): void {
        if (next === locale.value) {
            return
        }

        router.post(
            '/locale',
            { locale: next },
            {
                preserveScroll: true,
                preserveState: false,
            },
        )
    }

    return {
        locale,
        isBangla,
        t,
        bi,
        setLocale,
    }
}

/** Map public nav href → translation key under ui.nav */
export const NAV_LABEL_KEYS: Record<string, string> = {
    '/': 'nav.home',
    '/about': 'nav.about',
    '/admission': 'nav.admission',
    '/fees': 'nav.fees',
    '/facilities': 'nav.facilities',
    '/syllabus': 'nav.syllabus',
    '/notices': 'nav.notices',
    '/teachers': 'nav.teachers',
    '/staff': 'nav.staff',
    '/activities': 'nav.activities',
    '/blog': 'nav.blog',
    '/contact': 'nav.contact',
    '/headmaster': 'nav.headmaster',
}
