<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * @var array<int, string>
     */
    private array $tables = [
        'menus',
        'activities',
        'travel_products',
        'travel_packages',
        'departure_schedules',
        'package_itineraries',
        'bookings',
        'package_registrations',
        'custom_umroh_requests',
        'articles',
        'gallery_items',
        'page_contents',
        'testimonials',
        'faqs',
        'travel_services',
        'team_members',
        'legal_documents',
        'career_openings',
        'inventory_items',
        'inventory_stock_mutations',
        'invitations',
        'user_profiles',
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasTable($tableName)) {
                continue;
            }

            Schema::table($tableName, function (Blueprint $table) use ($tableName): void {
                if (! Schema::hasColumn($tableName, 'created_at')) {
                    $table->timestamp('created_at')->nullable();
                }

                if (! Schema::hasColumn($tableName, 'updated_at')) {
                    $table->timestamp('updated_at')->nullable();
                }

                if (! Schema::hasColumn($tableName, 'created_by')) {
                    $table->unsignedBigInteger('created_by')->nullable()->index();
                }

                if (! Schema::hasColumn($tableName, 'updated_by')) {
                    $table->unsignedBigInteger('updated_by')->nullable()->index();
                }
            });
        }
    }

    public function down(): void
    {
        // Intentionally left empty to avoid dropping pre-existing audit columns.
    }
};
