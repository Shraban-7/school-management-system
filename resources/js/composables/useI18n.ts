import { router, usePage } from '@inertiajs/react';
import { useCallback } from 'react';

type TranslationTree = Record<string, unknown>;

function resolveKey(tree: TranslationTree, key: string): string | null {
    const parts = key.split('.');
    let current: unknown = tree;

    for (const part of parts) {
        if (
            current === null ||
            typeof current !== 'object' ||
            !(part in (current as object))
        ) {
            return null;
        }
        current = (current as TranslationTree)[part];
    }

    return typeof current === 'string' ? current : null;
}

function applyReplacements(
    text: string,
    replacements: Record<string, string | number>,
): string {
    return Object.entries(replacements).reduce(
        (result, [key, value]) => result.replaceAll(`:${key}`, String(value)),
        text,
    );
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
        return (bn && bn.trim() !== '' ? bn : en) ?? '';
    }

    return (en && en.trim() !== '' ? en : bn) ?? '';
}

export function useI18n() {
    const page = usePage();
    const props = page.props as Record<string, unknown>;
    const locale = (props.locale as string) ?? 'en';
    const translations = (props.translations as TranslationTree) ?? {};
    const isBangla = locale === 'bn';

    const t = useCallback(
        (
            key: string,
            replacements: Record<string, string | number> = {},
            fallback?: string,
        ): string => {
            const resolved = resolveKey(translations, key);
            const value = resolved ?? (fallback !== undefined ? fallback : key);
            return applyReplacements(value, replacements);
        },
        [translations],
    );

    const bi = useCallback(
        (en: string | null | undefined, bn: string | null | undefined): string => {
            if (isBangla) {
                return (bn && bn.trim() !== '' ? bn : en) ?? '';
            }
            return (en && en.trim() !== '' ? en : bn) ?? '';
        },
        [isBangla],
    );

    const formatNumber = useCallback(
        (num: number | string | null | undefined): string => {
            if (num === null || num === undefined) return '';
            if (!isBangla) return String(num);
            const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
            return String(num).replace(/[0-9]/g, (d) => bnDigits[Number(d)]);
        },
        [isBangla],
    );

    const formatDate = useCallback(
        (
            dateInput: Date | string | number | null | undefined,
            options?: Intl.DateTimeFormatOptions,
        ): string => {
            if (!dateInput) return '';
            try {
                const d =
                    typeof dateInput === 'string' || typeof dateInput === 'number'
                        ? new Date(dateInput)
                        : dateInput;
                return new Intl.DateTimeFormat(isBangla ? 'bn-BD' : 'en-US', options ?? {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                }).format(d);
            } catch {
                return String(dateInput);
            }
        },
        [isBangla],
    );

    const setLocale = useCallback(
        (next: 'en' | 'bn'): void => {
            if (next === locale) {
                return;
            }

            router.post(
                '/locale',
                { locale: next },
                {
                    preserveScroll: true,
                    preserveState: false,
                },
            );
        },
        [locale],
    );

    return {
        locale,
        isBangla,
        t,
        bi,
        formatNumber,
        formatDate,
        setLocale,
    };
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
};
