import '../css/app.css';
import { createInertiaApp, router } from '@inertiajs/react';
import { createRoot } from 'react-dom/client';
import { resetStacks } from './lib/stacks';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

type PageModule = { default: any };
type PageLoader = () => Promise<PageModule>;
const pages = import.meta.glob<PageModule>('./pages/**/*.tsx');

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    progress: { color: '#4B5563' },
    resolve: (name: string) => {
        const candidates = [
            `./pages/${name}.tsx`,
            `./pages/${name}/Index.tsx`,
            `./pages/${name}/index.tsx`,
        ];

        for (const path of candidates) {
            const loader = pages[path] as PageLoader | undefined;
            if (loader) {
                return loader().then((m) => m.default);
            }
        }

        const available = Object.keys(pages).sort().join('\n  ');
        throw new Error(
            `Inertia page not found: "${name}".\n` +
                `Tried:\n  ${candidates.join('\n  ')}\n\n` +
                `Available pages:\n  ${available}`,
        );
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
});

router.on('before', () => {
    resetStacks();
});
