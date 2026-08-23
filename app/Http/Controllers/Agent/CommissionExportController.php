<?php

namespace App\Http\Controllers\Agent;

use App\Http\Controllers\Controller;
use App\Http\Requests\Agent\IndexPortalRecordsRequest;
use App\Models\AgentCommission;
use Symfony\Component\HttpFoundation\StreamedResponse;

class CommissionExportController extends Controller
{
    /**
     * Handle the incoming request.
     */
    public function __invoke(IndexPortalRecordsRequest $request): StreamedResponse
    {
        $agent = $request->user()->agentProfile;
        $filters = $request->validated();
        $query = AgentCommission::query()
            ->where('agent_profile_id', $agent->id)
            ->with(['booking:id,booking_code,full_name,passenger_count', 'package:id,code,name'])
            ->when($filters['search'] ?? null, fn ($query, string $search) => $query->whereHas('booking', function ($bookingQuery) use ($search): void {
                $bookingQuery->where('booking_code', 'like', "%{$search}%")->orWhere('full_name', 'like', "%{$search}%");
            }))
            ->when($filters['status'] ?? null, fn ($query, string $status) => $query->where('status', $status))
            ->when($filters['from'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '>=', $date))
            ->when($filters['to'] ?? null, fn ($query, string $date) => $query->whereDate('created_at', '<=', $date));

        return response()->streamDownload(function () use ($query): void {
            $stream = fopen('php://output', 'wb');
            if ($stream === false) {
                return;
            }

            fwrite($stream, "\xEF\xBB\xBF");
            fputcsv($stream, ['Booking', 'Customer', 'Package', 'Pax', 'Tipe Fee', 'Nilai Fee', 'Dasar', 'Komisi', 'Mata Uang', 'Status', 'Disetujui', 'Dibayar', 'Catatan']);

            $query->chunkById(200, function ($commissions) use ($stream): void {
                foreach ($commissions as $commission) {
                    fputcsv($stream, [
                        $this->spreadsheetSafe($commission->booking?->booking_code),
                        $this->spreadsheetSafe($commission->booking?->full_name),
                        $this->spreadsheetSafe(data_get($commission->package?->name, 'id', $commission->package?->code)),
                        (int) ($commission->booking?->passenger_count ?? 0),
                        $commission->fee_type,
                        (float) $commission->fee_value,
                        (int) $commission->base_amount,
                        (int) $commission->commission_amount,
                        $commission->currency,
                        $commission->status,
                        $commission->approved_at?->toDateTimeString(),
                        $commission->paid_at?->toDateTimeString(),
                        $this->spreadsheetSafe($commission->notes),
                    ]);
                }
            }, 'id');

            fclose($stream);
        }, 'komisi-agent-'.now()->format('Ymd-His').'.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    private function spreadsheetSafe(?string $value): string
    {
        $value = (string) $value;

        return preg_match('/^[=+\-@]/', ltrim($value)) === 1 ? "'".$value : $value;
    }
}
