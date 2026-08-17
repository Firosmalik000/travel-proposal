<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAgentAccess
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless(
            $request->user()?->hasRole('Agent') && $request->user()?->agentProfile?->is_active,
            403,
            'Akun ini tidak memiliki akses portal agent.',
        );

        return $next($request);
    }
}
