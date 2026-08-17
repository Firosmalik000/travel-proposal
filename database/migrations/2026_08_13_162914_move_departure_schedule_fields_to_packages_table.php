<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->date('start_date')->nullable()->after('departure_city');
            $table->date('end_date')->nullable()->after('start_date');
            $table->unsignedInteger('seats_total')->default(0)->after('end_date');
            $table->unsignedInteger('seats_available')->default(0)->after('seats_total');
            $table->string('booking_status', 20)->default('open')->after('seats_available');
            $table->string('departure_notes')->nullable()->after('booking_status');
            $table->index(['start_date', 'is_active']);
            $table->index(['booking_status', 'is_active']);
        });

        if (! Schema::hasTable('departure_schedules')) {
            return;
        }

        DB::transaction(function (): void {
            $packageIds = DB::table('departure_schedules')
                ->whereNotNull('package_id')
                ->distinct()
                ->pluck('package_id');

            foreach ($packageIds as $packageId) {
                $package = DB::table('packages')->where('id', $packageId)->first();
                if ($package === null) {
                    continue;
                }

                $schedules = DB::table('departure_schedules')
                    ->where('package_id', $packageId)
                    ->orderBy('departure_date')
                    ->orderBy('id')
                    ->get();

                foreach ($schedules as $index => $schedule) {
                    $targetPackageId = (int) $packageId;

                    if ($index > 0) {
                        $targetPackageId = $this->clonePackageForSchedule((array) $package, (array) $schedule);
                        $this->moveScheduleReferences((int) $packageId, $targetPackageId, (int) $schedule->id);

                        DB::table('departure_schedules')
                            ->where('id', $schedule->id)
                            ->update(['package_id' => $targetPackageId]);
                    }

                    DB::table('packages')->where('id', $targetPackageId)->update([
                        'departure_city' => $schedule->departure_city,
                        'start_date' => $schedule->departure_date,
                        'end_date' => $schedule->return_date,
                        'seats_total' => $schedule->seats_total,
                        'seats_available' => $schedule->seats_available,
                        'booking_status' => $schedule->status,
                        'departure_notes' => $schedule->notes,
                        'is_active' => (bool) $schedule->is_active,
                        'updated_at' => now(),
                    ]);

                    $this->syncPackageSeatAvailability($targetPackageId, (string) $schedule->status);
                }
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('packages', function (Blueprint $table) {
            $table->dropIndex(['start_date', 'is_active']);
            $table->dropIndex(['booking_status', 'is_active']);
            $table->dropColumn([
                'start_date',
                'end_date',
                'seats_total',
                'seats_available',
                'booking_status',
                'departure_notes',
            ]);
        });
    }

    /** @param array<string, mixed> $package @param array<string, mixed> $schedule */
    private function clonePackageForSchedule(array $package, array $schedule): int
    {
        unset($package['id']);

        $dateSuffix = str_replace('-', '', (string) $schedule['departure_date']);
        $package['code'] = $this->uniqueValue('packages', 'code', $package['code'].'-'.$dateSuffix);
        $package['slug'] = $this->uniqueValue('packages', 'slug', $package['slug'].'-'.$dateSuffix);
        $package['created_at'] = now();
        $package['updated_at'] = now();

        $newPackageId = (int) DB::table('packages')->insertGetId($package);

        $this->cloneRows('package_product', 'package_id', (int) $schedule['package_id'], $newPackageId);
        $this->cloneItineraries((int) $schedule['package_id'], $newPackageId);

        return $newPackageId;
    }

    private function cloneItineraries(int $sourcePackageId, int $targetPackageId): void
    {
        if (! Schema::hasTable('package_itineraries')) {
            return;
        }

        foreach (DB::table('package_itineraries')->where('package_id', $sourcePackageId)->get() as $itinerary) {
            $itineraryData = (array) $itinerary;
            $sourceItineraryId = (int) $itineraryData['id'];
            unset($itineraryData['id']);
            $itineraryData['package_id'] = $targetPackageId;
            $targetItineraryId = (int) DB::table('package_itineraries')->insertGetId($itineraryData);

            if (Schema::hasTable('package_itinerary_product')) {
                $this->cloneRows('package_itinerary_product', 'package_itinerary_id', $sourceItineraryId, $targetItineraryId);
            }
        }
    }

    private function cloneRows(string $table, string $foreignKey, int $sourceId, int $targetId): void
    {
        if (! Schema::hasTable($table)) {
            return;
        }

        foreach (DB::table($table)->where($foreignKey, $sourceId)->get() as $row) {
            $data = (array) $row;
            unset($data['id']);
            $data[$foreignKey] = $targetId;
            DB::table($table)->insert($data);
        }
    }

    private function moveScheduleReferences(int $sourcePackageId, int $targetPackageId, int $scheduleId): void
    {
        foreach (['bookings', 'package_registrations', 'package_cost_calculations', 'hotel_assignments', 'testimonials'] as $table) {
            if (! Schema::hasTable($table) || ! Schema::hasColumn($table, 'departure_schedule_id') || ! Schema::hasColumn($table, 'package_id')) {
                continue;
            }

            DB::table($table)
                ->where('package_id', $sourcePackageId)
                ->where('departure_schedule_id', $scheduleId)
                ->update(['package_id' => $targetPackageId]);
        }
    }

    private function syncPackageSeatAvailability(int $packageId, string $scheduleStatus): void
    {
        $package = DB::table('packages')->where('id', $packageId)->first(['seats_total']);
        if ($package === null) {
            return;
        }

        $registeredPax = Schema::hasTable('bookings')
            ? (int) DB::table('bookings')
                ->where('package_id', $packageId)
                ->where('status', 'registered')
                ->sum('passenger_count')
            : 0;
        $availableSeats = max((int) $package->seats_total - $registeredPax, 0);

        DB::table('packages')->where('id', $packageId)->update([
            'seats_available' => $availableSeats,
            'booking_status' => $scheduleStatus === 'closed'
                ? 'closed'
                : ($availableSeats > 0 ? 'open' : 'full'),
        ]);
    }

    private function uniqueValue(string $table, string $column, string $base): string
    {
        $candidate = $base;
        $suffix = 2;

        while (DB::table($table)->where($column, $candidate)->exists()) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
};
