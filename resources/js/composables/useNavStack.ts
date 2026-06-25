import { onMounted } from 'vue';
import { useStacks, type StackItem } from '@/lib/stacks';
import type { NavLink, NavAction } from '@/types/nav';
import type { SidebarConfig } from '@/types/sidebar';

export function useNavStack(stackName: string = 'app.nav') {
    const stacks = useStacks();

    return {
        set(links: NavLink[]): void {
            stacks.set<NavLink>(stackName, links);
        },
        add(link: NavLink, position: 'push' | 'prepend' = 'push'): void {
            if (position === 'prepend') {
                stacks.prepend<NavLink>(stackName, link);
            } else {
                stacks.push<NavLink>(stackName, link);
            }
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function useActionStack(stackName: string = 'app.actions') {
    const stacks = useStacks();

    return {
        set(actions: NavAction[]): void {
            stacks.set<NavAction>(stackName, actions);
        },
        add(action: NavAction, position: 'push' | 'prepend' = 'push'): void {
            if (position === 'prepend') {
                stacks.prepend<NavAction>(stackName, action);
            } else {
                stacks.push<NavAction>(stackName, action);
            }
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function useMobileStack(stackName: string = 'app.mobile') {
    const stacks = useStacks();

    return {
        set(links: NavLink[]): void {
            stacks.set<NavLink>(stackName, links);
        },
        add(link: NavLink, position: 'push' | 'prepend' = 'push'): void {
            if (position === 'prepend') {
                stacks.prepend<NavLink>(stackName, link);
            } else {
                stacks.push<NavLink>(stackName, link);
            }
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function useMobileActionStack(stackName: string = 'app.mobile-actions') {
    const stacks = useStacks();

    return {
        set(actions: NavAction[]): void {
            stacks.set<NavAction>(stackName, actions);
        },
        add(action: NavAction, position: 'push' | 'prepend' = 'push'): void {
            if (position === 'prepend') {
                stacks.prepend<NavAction>(stackName, action);
            } else {
                stacks.push<NavAction>(stackName, action);
            }
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function useSidebarStack(stackName: string = 'dashboard.sidebar') {
    const stacks = useStacks();

    return {
        set(items: SidebarConfig): void {
            stacks.set(stackName, items);
        },
        add(item: NavLink, position: 'push' | 'prepend' = 'push'): void {
            if (position === 'prepend') {
                stacks.prepend<NavLink>(stackName, item);
            } else {
                stacks.push<NavLink>(stackName, item);
            }
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function useDashboardHeaderStack(
    stackName: string = 'dashboard.header',
) {
    const stacks = useStacks();

    return {
        set(items: StackItem[]): void {
            stacks.set(stackName, items);
        },
        clear(): void {
            stacks.clear(stackName);
        },
    };
}

export function pushStacksOnMount(name: string, items: StackItem[]): void {
    const stacks = useStacks();
    onMounted(() => {
        stacks.set(name, items);
    });
}
