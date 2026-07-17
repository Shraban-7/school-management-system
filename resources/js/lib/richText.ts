/**
 * Prepare admin-entered content for v-html rendering on public pages.
 *
 * New content is stored as HTML (TipTap). Older rows may still hold plain
 * text, so anything without markup is escaped and newline-converted to
 * keep the original formatting.
 */
export function richTextHtml(value: string | null | undefined): string {
    if (!value) {
        return ''
    }

    if (/<[a-z][\s\S]*>/i.test(value)) {
        return value
    }

    const escaped = value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')

    return escaped
        .split(/\n{2,}/)
        .map((paragraph) => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
        .join('')
}

/**
 * Plain-text version of rich content, for teasers/excerpts.
 */
export function richTextPlain(value: string | null | undefined): string {
    if (!value) {
        return ''
    }

    return value
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/\s+/g, ' ')
        .trim()
}
