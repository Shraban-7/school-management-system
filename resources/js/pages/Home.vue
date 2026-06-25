<script setup lang="ts">
import { Head } from '@inertiajs/vue3'
import AppLayout from '@/layouts/AppLayout.vue'

defineOptions({ layout: AppLayout })
</script>

<template>
    <Head title="Home" />
    <h1 class="text-5xl font-bold">Welcome to the SMS App</h1>
</template>
