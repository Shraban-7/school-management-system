export type StackItem = object | string | number | boolean | null;

export type Stacks = {
    push<T extends StackItem>(name: string, item: T): void;
    prepend<T extends StackItem>(name: string, item: T): void;
    set<T extends StackItem>(name: string, items: T[]): void;
    clear(name: string): void;
    reset(): void;
    get<T extends StackItem>(name: string): T[];
    subscribe(listener: () => void): () => void;
};

const store: Record<string, StackItem[]> = {};
const listeners = new Set<() => void>();

function notify() {
    listeners.forEach((listener) => listener());
}

function readArray(name: string): StackItem[] {
    if (!store[name]) {
        store[name] = [];
    }
    return store[name];
}

export const stacks: Stacks = {
    push<T extends StackItem>(name: string, item: T): void {
        readArray(name).push(item);
        notify();
    },
    prepend<T extends StackItem>(name: string, item: T): void {
        readArray(name).unshift(item);
        notify();
    },
    set<T extends StackItem>(name: string, items: T[]): void {
        store[name] = items.map((item) => item);
        notify();
    },
    clear(name: string): void {
        store[name] = [];
        notify();
    },
    reset(): void {
        for (const key of Object.keys(store)) {
            store[key] = [];
        }
        notify();
    },
    get<T extends StackItem>(name: string): T[] {
        return (store[name] ?? []) as T[];
    },
    subscribe(listener: () => void): () => void {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};

export function useStacks(): Stacks {
    return stacks;
}

export function resetStacks(): void {
    stacks.reset();
}
