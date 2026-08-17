<?php

namespace App\Http\Middleware;

use App\Models\AgentProfile;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class TrackAgentReferral
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->is('admin/*', 'dashboard/*', 'agent/*', 'customer/*')) {
            return $next($request);
        }

        $queryCode = strtoupper(trim((string) $request->query('ref', '')));
        $storedCode = strtoupper(trim((string) ($request->session()->get('agent_referral_code') ?: $request->cookie('agent_referral_code', ''))));
        $candidateCode = $queryCode !== '' ? $queryCode : $storedCode;

        if ($candidateCode !== '') {
            $isValid = AgentProfile::query()
                ->where('referral_code', $candidateCode)
                ->where('is_active', true)
                ->exists();

            if ($isValid) {
                $request->session()->put('agent_referral_code', $candidateCode);
                Cookie::queue('agent_referral_code', $candidateCode, 60 * 24 * 30);
            } elseif ($queryCode === '') {
                $request->session()->forget('agent_referral_code');
                Cookie::queue(Cookie::forget('agent_referral_code'));
            }
        }

        return $next($request);
    }
}
