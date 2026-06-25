import '../css/app.css'
import { router } from '@inertiajs/vue3'
import { createInertiaApp } from '@inertiajs/vue3'
import { createApp, h, type DefineComponent } from 'vue'
import { StacksPlugin, resetStacks } from './lib/stacks'

const appName = import.meta.env.VITE_APP_NAME || 'Laravel'

type PageModule = { default: DefineComponent }
type PageLoader = () => Promise<PageModule>
const pages = import.meta.glob<PageModule>('./pages/**/*.vue')

type InertiaResolver = (name: string) => DefineComponent | Promise<DefineComponent>

const resolvePage: InertiaResolver = (name: string) => {
    const candidates = [
        `./pages/${name}.vue`,
        `./pages/${name}/Index.vue`,
        `./pages/${name}/index.vue`,
    ]

    for (const path of candidates) {
        const loader = pages[path] as PageLoader | undefined

        if (loader) {
            return loader().then((m) => m.default)
        }
    }

    const available = Object.keys(pages).sort().join('\n  ')

    throw new Error(
        `Inertia page not found: "${name}".\n` +
            `Tried:\n  ${candidates.join('\n  ')}\n\n` +
            `Available pages:\n  ${available}`,
    )
}

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: { color: '#4B5563' },
    resolve: resolvePage,
    setup({ el, App, props, plugin }) {
        const app = createApp({ render: () => h(App, props) })
        app.use(plugin)
        app.use(StacksPlugin)
        app.mount(el)
    },
})

router.on('before', () => {
    resetStacks()
})
