<?php

namespace App\Actions\Agent;

use App\Models\AgentCommission;
use App\Models\AgentPackageFee;
use App\Models\Booking;

class CreateBookingCommission
{
    public function handle(Booking $booking, ?AgentPackageFee $configuredFee = null): ?AgentCommission
    {
        $existingCommission = AgentCommission::query()->where('booking_id', $booking->id)->first();

        if ($booking->status === 'cancelled') {
            if ($existingCommission !== null && $existingCommission->status !== 'paid') {
                $existingCommission->update(['status' => 'cancelled']);
            }

            return $existingCommission;
        }

        if ($booking->agent_profile_id === null || $booking->package_id === null) {
            return null;
        }

        if ($existingCommission !== null && ! in_array($existingCommission->status, ['pending', 'cancelled'], true)) {
            return $existingCommission;
        }

        $usesExistingSnapshot = $existingCommission !== null
            && $existingCommission->agent_profile_id === $booking->agent_profile_id
            && $existingCommission->package_id === $booking->package_id;

        $matchesConfiguredFee = $configuredFee !== null
            && $configuredFee->is_active
            && $configuredFee->agent_profile_id === $booking->agent_profile_id
            && $configuredFee->package_id === $booking->package_id;

        $fee = $usesExistingSnapshot
            ? $existingCommission
            : ($matchesConfiguredFee ? $configuredFee : AgentPackageFee::query()
                ->where('agent_profile_id', $booking->agent_profile_id)
                ->where('package_id', $booking->package_id)
                ->where('is_active', true)
                ->first());

        if ($fee === null) {
            $existingCommission?->update(['status' => 'cancelled']);

            return null;
        }

        $baseAmount = (int) ($booking->agreed_total_amount ?? 0);
        $commissionAmount = $fee->fee_type === 'percentage'
            ? (int) round($baseAmount * ((float) $fee->fee_value / 100))
            : (int) round((float) $fee->fee_value * max((int) $booking->passenger_count, 1));

        return AgentCommission::query()->updateOrCreate(
            ['booking_id' => $booking->id],
            [
                'agent_profile_id' => $booking->agent_profile_id,
                'package_id' => $booking->package_id,
                'fee_type' => $fee->fee_type,
                'fee_value' => $fee->fee_value,
                'base_amount' => $baseAmount,
                'commission_amount' => $commissionAmount,
                'currency' => $booking->agreed_currency ?? 'IDR',
                'status' => 'pending',
                'approved_at' => null,
                'paid_at' => null,
            ],
        );
    }
}
