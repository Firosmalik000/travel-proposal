<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPortalAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_if(
            $request->user()?->isCustomerOnly() || $request->user()?->isAgentOnly(),
            403,
            'Akun ini tidak memiliki akses portal admin.',
        );

        return $next($request);
    }
}
