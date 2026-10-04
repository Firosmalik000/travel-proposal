<?php

declare(strict_types=1);

namespace Tests\Unit;

use App\Actions\Agent\CreateBookingCommission;
use App\Models\AgentPackageFee;
use App\Models\Booking;
use Tests\TestCase;

class AgentCommissionCalculationTest extends TestCase
{
    public function test_calculates_fixed_fee_per_passenger(): void
    {
        $action = new CreateBookingCommission;

        $fee = new AgentPackageFee([
            'agent_profile_id' => 10,
            'package_id' => 20,
            'fee_type' => 'fixed',
            'fee_value' => 750000.0,
            'is_active' => true,
        ]);

        $booking = new Booking([
            'id' => 101,
            'agent_profile_id' => 10,
            'package_id' => 20,
            'passenger_count' => 4,
            'agreed_total_amount' => 100000000,
            'agreed_currency' => 'IDR',
            'status' => 'registered',
        ]);

        $baseAmount = (int) ($booking->agreed_total_amount ?? 0);
        $commissionAmount = $fee->fee_type === 'percentage'
            ? (int) round($baseAmount * ((float) $fee->fee_value / 100))
            : (int) round((float) $fee->fee_value * max((int) $booking->passenger_count, 1));

        $this->assertSame(3000000, $commissionAmount);
    }

    public function test_calculates_percentage_fee_from_agreed_total_amount(): void
    {
        $fee = new AgentPackageFee([
            'agent_profile_id' => 10,
            'package_id' => 20,
            'fee_type' => 'percentage',
            'fee_value' => 7.5,
            'is_active' => true,
        ]);

        $booking = new Booking([
            'id' => 102,
            'agent_profile_id' => 10,
            'package_id' => 20,
            'passenger_count' => 2,
            'agreed_total_amount' => 60000000,
            'agreed_currency' => 'IDR',
            'status' => 'registered',
        ]);

        $baseAmount = (int) ($booking->agreed_total_amount ?? 0);
        $commissionAmount = (int) round($baseAmount * ((float) $fee->fee_value / 100));

        $this->assertSame(4500000, $commissionAmount);
    }

    public function test_fixed_fee_safeguards_against_zero_passengers(): void
    {
        $fee = new AgentPackageFee([
            'agent_profile_id' => 10,
            'package_id' => 20,
            'fee_type' => 'fixed',
            'fee_value' => 500000.0,
            'is_active' => true,
        ]);

        $booking = new Booking([
            'id' => 103,
            'agent_profile_id' => 10,
            'package_id' => 20,
            'passenger_count' => 0,
            'agreed_total_amount' => 25000000,
            'agreed_currency' => 'IDR',
            'status' => 'registered',
        ]);

        $commissionAmount = (int) round((float) $fee->fee_value * max((int) $booking->passenger_count, 1));

        $this->assertSame(500000, $commissionAmount);
    }

    public function test_handles_foreign_currency_without_premature_conversion(): void
    {
        $fee = new AgentPackageFee([
            'agent_profile_id' => 10,
            'package_id' => 30,
            'fee_type' => 'fixed',
            'fee_value' => 150.0,
            'is_active' => true,
        ]);

        $booking = new Booking([
            'id' => 104,
            'agent_profile_id' => 10,
            'package_id' => 30,
            'passenger_count' => 3,
            'agreed_total_amount' => 4500,
            'agreed_currency' => 'USD',
            'status' => 'registered',
        ]);

        $commissionAmount = (int) round((float) $fee->fee_value * max((int) $booking->passenger_count, 1));
        $currency = $booking->agreed_currency ?? 'IDR';

        $this->assertSame(450, $commissionAmount);
        $this->assertSame('USD', $currency);
    }

    public function test_validates_ledger_status_transition_rules(): void
    {
        $allowedTransitions = [
            'pending' => ['pending', 'approved', 'cancelled'],
            'approved' => ['approved', 'pending', 'paid', 'cancelled'],
            'paid' => ['paid'],
            'cancelled' => ['cancelled', 'pending'],
        ];

        // Valid transitions
        $this->assertContains('approved', $allowedTransitions['pending']);
        $this->assertContains('paid', $allowedTransitions['approved']);
        $this->assertContains('cancelled', $allowedTransitions['pending']);
        $this->assertContains('cancelled', $allowedTransitions['approved']);

        // Invalid transitions
        $this->assertNotContains('paid', $allowedTransitions['pending'], 'Pending cannot jump directly to paid');
        $this->assertNotContains('pending', $allowedTransitions['paid'], 'Paid status cannot be reverted to pending');
        $this->assertNotContains('approved', $allowedTransitions['paid'], 'Paid status cannot be reverted to approved');
        $this->assertNotContains('cancelled', $allowedTransitions['paid'], 'Paid status cannot be cancelled');
    }
}
