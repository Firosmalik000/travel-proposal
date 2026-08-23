<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\ShowReferralQrCodeRequest;
use App\Models\AgentPackageFee;
use App\Models\TravelPackage;
use Endroid\QrCode\Color\Color;
use Endroid\QrCode\Encoding\Encoding;
use Endroid\QrCode\ErrorCorrectionLevel;
use Endroid\QrCode\QrCode;
use Endroid\QrCode\RoundBlockSizeMode;
use Endroid\QrCode\Writer\SvgWriter;
use Symfony\Component\HttpFoundation\Response;

class ReferralQrCodeController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(ShowReferralQrCodeRequest $request, ?TravelPackage $travelPackage = null): Response
    {
        $agent = $request->user()->agentProfile;

        if ($travelPackage !== null) {
            abort_unless(AgentPackageFee::query()
                ->where('agent_profile_id', $agent->id)
                ->where('package_id', $travelPackage->id)
                ->where('is_active', true)
                ->exists(), 404);
        }

        $path = $travelPackage?->slug ? '/paket-umroh/'.$travelPackage->slug : '/paket-umroh';
        $referralUrl = url($path).'?ref='.$agent->referral_code;
        $result = (new SvgWriter)->write(new QrCode(
            data: $referralUrl,
            encoding: new Encoding('UTF-8'),
            errorCorrectionLevel: ErrorCorrectionLevel::High,
            size: 360,
            margin: 20,
            roundBlockSizeMode: RoundBlockSizeMode::Margin,
            foregroundColor: new Color(13, 92, 82),
            backgroundColor: new Color(255, 255, 255),
        ));
        $filename = 'referral-'.strtolower($travelPackage?->code ?? $agent->referral_code).'.svg';

        return response($result->getString(), 200, [
            'Content-Type' => $result->getMimeType(),
            'Content-Disposition' => ($request->boolean('download') ? 'attachment' : 'inline').'; filename="'.$filename.'"',
            'Cache-Control' => 'private, max-age=300',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
