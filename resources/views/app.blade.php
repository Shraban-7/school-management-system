@php
    $siteSchool = null;
    try {
        if (\Illuminate\Support\Facades\Schema::hasTable('institutions')) {
            $siteSchool = \App\Models\Institution::query()->orderBy('id')->first();
        }
    } catch (\Throwable) {
        $siteSchool = null;
    }
    $siteLogo = $siteSchool?->logoUrl();
    $siteTitle = $siteSchool?->name_en ?: config('app.name', 'Laravel');
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @if ($siteLogo)
            <link rel="icon" href="{{ $siteLogo }}">
            <link rel="apple-touch-icon" href="{{ $siteLogo }}">
        @else
            <link rel="icon" href="/favicon.ico" sizes="48x48">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
            <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
            <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
            <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
            <link rel="manifest" href="/site.webmanifest">
        @endif
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)">
        <meta name="theme-color" content="#0f172a" media="(prefers-color-scheme: dark)">

        <script>
            (function () {
                try {
                    var stored = localStorage.getItem('theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var theme = stored || (prefersDark ? 'dark' : 'light');
                    if (theme === 'dark') {
                        document.documentElement.classList.add('dark');
                    }
                } catch (e) {}
            })();
        </script>
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet" />

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $siteTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
