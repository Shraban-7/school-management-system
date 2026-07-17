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
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        @endif

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

        @fonts

        @vite(['resources/css/app.css', 'resources/js/app.ts', "resources/js/pages/{$page['component']}.vue"])
        <x-inertia::head>
            <title>{{ $siteTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
