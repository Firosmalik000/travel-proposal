<?php

namespace Tests\Unit\Models;

use App\Models\SlipGaji;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SlipGajiTest extends TestCase
{
    use RefreshDatabase;

    public function test_slip_gaji_belongs_to_user()
    {
        $user = User::factory()->create();
        $slipGaji = SlipGaji::factory()->create(['user_id' => $user->id]);

        $this->assertInstanceOf(User::class, $slipGaji->user);
        $this->assertEquals($user->id, $slipGaji->user->id);
    }

    public function test_slip_gaji_calculates_totals_correctly()
    {
        $slipGaji = new SlipGaji([
            'pendapatan' => [
                ['name' => 'Gaji Pokok', 'amount' => 5000000],
                ['name' => 'Tunjangan', 'amount' => 1000000]
            ],
            'potongan' => [
                ['name' => 'BPJS', 'amount' => 100000],
                ['name' => 'PPh', 'amount' => 200000]
            ]
        ]);

        $slipGaji->calculateTotals();

        $this->assertEquals(6000000, $slipGaji->total_pendapatan);
        $this->assertEquals(300000, $slipGaji->total_potongan);
        $this->assertEquals(5700000, $slipGaji->gaji_bersih);
    }

    public function test_slip_gaji_has_draft_scope()
    {
        SlipGaji::factory()->count(3)->create(['status' => 'draft']);
        SlipGaji::factory()->count(2)->create(['status' => 'approved']);

        $draftSlips = SlipGaji::draft()->get();

        $this->assertCount(3, $draftSlips);
    }

    public function test_slip_gaji_has_approved_scope()
    {
        SlipGaji::factory()->count(3)->create(['status' => 'draft']);
        SlipGaji::factory()->count(2)->create(['status' => 'approved']);

        $approvedSlips = SlipGaji::approved()->get();

        $this->assertCount(2, $approvedSlips);
    }

    public function test_slip_gaji_has_sent_scope()
    {
        SlipGaji::factory()->count(3)->create(['status' => 'sent']);
        SlipGaji::factory()->count(2)->create(['status' => 'draft']);

        $sentSlips = SlipGaji::sent()->get();

        $this->assertCount(3, $sentSlips);
    }

    public function test_slip_gaji_casts_dates_correctly()
    {
        $slipGaji = SlipGaji::factory()->create([
            'period_start' => '2024-01-01',
            'period_end' => '2024-01-31'
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $slipGaji->period_start);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $slipGaji->period_end);
    }

    public function test_slip_gaji_casts_pendapatan_to_array()
    {
        $pendapatan = [
            ['name' => 'Gaji Pokok', 'amount' => 5000000],
            ['name' => 'Tunjangan', 'amount' => 1000000]
        ];

        $slipGaji = SlipGaji::factory()->create(['pendapatan' => $pendapatan]);

        $this->assertIsArray($slipGaji->pendapatan);
        $this->assertCount(2, $slipGaji->pendapatan);
    }

    public function test_slip_gaji_has_correct_fillable_attributes()
    {
        $slipGaji = new SlipGaji();

        $fillable = $slipGaji->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('period_start', $fillable);
        $this->assertContains('period_end', $fillable);
        $this->assertContains('pendapatan', $fillable);
        $this->assertContains('potongan', $fillable);
        $this->assertContains('status', $fillable);
    }
}
