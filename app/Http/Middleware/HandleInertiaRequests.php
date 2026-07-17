<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $school = null;

        try {
            if (\Illuminate\Support\Facades\Schema::hasTable('institutions')) {
                $school = \App\Models\Institution::query()->orderBy('id')->first()?->toPublicArray();
            }
        } catch (\Throwable) {
            $school = null;
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'locale' => app()->getLocale(),
            'translations' => trans('ui'),
            'school' => $school,
            'auth' => [
                'user' => $request->user(),
            ],
            // Always share the full menu for the logged-in role so the
            // sidebar never loses items, regardless of which page rendered.
            'sidebar' => function () use ($request) {
                $role = $request->user()?->role?->value;

                return $role
                    ? app(\App\Http\Controllers\DashboardController::class)->fullSidebar($role)
                    : [];
            },
            'flash' => [
                'message' => fn () => $request->session()->get('flash.message'),
                'error' => fn () => $request->session()->get('flash.error'),
            ],
        ];
    }
}
