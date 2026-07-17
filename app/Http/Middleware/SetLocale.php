<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const SESSION_KEY = 'locale';

    /** @var list<string> */
    public const SUPPORTED = ['en', 'bn'];

    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->session()->get(self::SESSION_KEY, config('app.locale', 'en'));

        if (! in_array($locale, self::SUPPORTED, true)) {
            $locale = 'en';
        }

        App::setLocale($locale);

        return $next($request);
    }
}
