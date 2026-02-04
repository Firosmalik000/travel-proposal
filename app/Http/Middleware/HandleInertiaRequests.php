<?php

namespace App\Http\Middleware;

use App\Models\UserAccess;
use Illuminate\Foundation\Inspiring;
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
        [$message, $author] = str(Inspiring::quotes()->random())->explode('-');

        // Get user permissions if logged in
        $userPermissions = null;
        $user = $request->user();

        if ($user) {
            $rawPermissions = UserAccess::getAllAccessForUser($user->id);

            // Transform permissions from object format to array format
            // From: { view: true, create: false }
            // To: ['view']
            $userPermissions = [];
            foreach ($rawPermissions as $menuKey => $permissions) {
                $userPermissions[$menuKey] = array_keys(array_filter($permissions, fn($value) => $value === true));
            }

            // Eager load karyawan relation for avatar
            $user->load('karyawan');
        }

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => $user,
                'permissions' => $userPermissions,
            ],
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
