import { inject, reactive, type App, type InjectionKey } from 'vue'

export type StackItem = object | string | number | boolean | null

export type Stacks = {
    push<T extends StackItem>(name: string, item: T): void
    prepend<T extends StackItem>(name: string, item: T): void
    set<T extends StackItem>(name: string, items: T[]): void
    clear(name: string): void
    reset(): void
    get<T extends StackItem>(name: string): T[]
}

export const STACKS_KEY: InjectionKey<Stacks> = Symbol('stacks')

const state = reactive<Record<string, StackItem[]>>({})

function readArray(name: string): StackItem[] {
    if (!state[name]) {
        state[name] = []
    }
    return state[name]
}

function createStacks(): Stacks {
    return {
        push<T extends StackItem>(name: string, item: T): void {
            readArray(name).push(item)
        },
        prepend<T extends StackItem>(name: string, item: T): void {
            readArray(name).unshift(item)
        },
        set<T extends StackItem>(name: string, items: T[]): void {
            state[name] = items.map((item) => item)
        },
        clear(name: string): void {
            state[name] = []
        },
        reset(): void {
            for (const key of Object.keys(state)) {
                state[key] = []
            }
        },
        get<T extends StackItem>(name: string): T[] {
            return (state[name] ?? []) as T[]
        },
    }
}

export const StacksPlugin = {
    install(app: App): void {
        const stacks = createStacks()
        app.provide(STACKS_KEY, stacks)
        app.config.globalProperties.$stacks = stacks
    },
}

export function useStacks(): Stacks {
    return inject(STACKS_KEY, createStacks())
}

export function resetStacks(): void {
    for (const key of Object.keys(state)) {
        state[key] = []
    }
}
