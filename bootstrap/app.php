<?php

use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\SetLocale::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'role' => \App\Http\Middleware\EnsureUserHasRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        // Authenticated users hitting a page/action outside their role get
        // bounced back with a flash error, which the dashboard layout shows
        // as a "not authorized" modal (instead of Laravel's 403 page).
        $exceptions->render(function (HttpException $e, Request $request) {
            if ($e->getStatusCode() === 403 && ! $request->is('api/*') && $request->user() !== null) {
                return redirect()
                    ->route($request->user()->role->value.'.dashboard')
                    ->with('flash.error', 'You are not authorized to access this page or perform this action.');
            }

            return null;
        });
    })->create();
