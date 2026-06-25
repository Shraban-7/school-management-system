<script setup lang="ts">
import { Form, Head } from '@inertiajs/vue3'
import AuthLayout from '@/layouts/AuthLayout.vue'

defineOptions({ layout: AuthLayout })
</script>

<template>
    <Head title="Login" />

    <div class="text-center">
        <h1 class="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Sign in to your account
        </h1>
        <p class="mt-2 text-sm text-slate-600">
            Enter your phone number and password to continue.
        </p>
    </div>

    <Form
        action="/login"
        method="post"
        #default="{ errors, processing }"
        class="space-y-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
    >
        <div>
            <label for="phone" class="block text-sm font-medium text-slate-700">
                Phone number
            </label>
            <input
                id="phone"
                name="phone"
                type="tel"
                inputmode="tel"
                autocomplete="tel"
                required
                autofocus
                placeholder="+8801XXXXXXXXX"
                :class="[
                    'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
                    errors.phone
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200',
                ]"
            />
            <p v-if="errors.phone" class="mt-1 text-sm text-red-600">
                {{ errors.phone }}
            </p>
        </div>

        <div>
            <label for="password" class="block text-sm font-medium text-slate-700">
                Password
            </label>
            <input
                id="password"
                name="password"
                type="password"
                autocomplete="current-password"
                required
                :class="[
                    'mt-1 block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition focus:outline-none focus:ring-2',
                    errors.password
                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                        : 'border-slate-300 focus:border-slate-900 focus:ring-slate-200',
                ]"
            />
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                {{ errors.password }}
            </p>
        </div>

        <div class="flex items-center">
            <input
                id="remember"
                name="remember"
                type="checkbox"
                value="1"
                class="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500"
            />
            <label for="remember" class="ml-2 block text-sm text-slate-700">
                Remember me
            </label>
        </div>

        <button
            type="submit"
            :disabled="processing"
            class="flex w-full justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {{ processing ? 'Signing in…' : 'Sign in' }}
        </button>
    </Form>
</template>
