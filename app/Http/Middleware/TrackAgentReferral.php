<?php

namespace App\Http\Middleware;

use App\Actions\Agent\RecordAgentReferralVisit;
use App\Models\AgentProfile;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

class TrackAgentReferral
{
    public function __construct(private readonly RecordAgentReferralVisit $recordAgentReferralVisit) {}

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
            $agent = AgentProfile::query()
                ->where('referral_code', $candidateCode)
                ->where('is_active', true)
                ->first();

            if ($agent !== null) {
                $request->session()->put('agent_referral_code', $candidateCode);
                Cookie::queue('agent_referral_code', $candidateCode, 60 * 24 * 30);
                if ($queryCode !== '' && $this->shouldRecordVisit($request)) {
                    try {
                        $this->recordAgentReferralVisit->handle($request, $agent);
                    } catch (Throwable $exception) {
                        Log::warning('Agent referral visit tracking failed.', [
                            'agent_profile_id' => $agent->id,
                            'exception' => $exception::class,
                        ]);
                    }
                }
            } elseif ($queryCode === '') {
                $request->session()->forget('agent_referral_code');
                Cookie::queue(Cookie::forget('agent_referral_code'));
            }
        }

        return $next($request);
    }

    private function shouldRecordVisit(Request $request): bool
    {
        if (! $request->isMethod('GET')) {
            return false;
        }

        $userAgent = strtolower((string) $request->userAgent());

        return $userAgent === '' || preg_match('/bot|crawler|spider|preview|facebookexternalhit|whatsapp|telegrambot/', $userAgent) !== 1;
    }
}
