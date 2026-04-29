<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->string('content_type')->default('umrah_education')->after('image_path');
            $table->string('status')->default('draft')->after('content_type');
            $table->string('author_name')->nullable()->after('status');
            $table->json('tags')->nullable()->after('author_name');
            $table->string('meta_title')->nullable()->after('tags');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->string('og_image_path')->nullable()->after('meta_description');
            $table->unsignedInteger('reading_time_minutes')->default(1)->after('og_image_path');
            $table->unsignedInteger('views_count')->default(0)->after('reading_time_minutes');

            $table->index(['status', 'published_at']);
            $table->index(['content_type', 'status']);
        });

        DB::table('articles')
            ->orderBy('id')
            ->get()
            ->each(function (object $article): void {
                $status = 'draft';

                if (! $article->is_active) {
                    $status = 'archived';
                } elseif ($article->published_at) {
                    $publishedAt = \Illuminate\Support\Carbon::parse($article->published_at);
                    $status = $publishedAt->isFuture() ? 'scheduled' : 'published';
                }

                DB::table('articles')
                    ->where('id', $article->id)
                    ->update([
                        'status' => $status,
                        'content_type' => 'umrah_education',
                        'author_name' => 'Admin',
                    ]);
            });
    }

    public function down(): void
    {
        Schema::table('articles', function (Blueprint $table) {
            $table->dropIndex(['status', 'published_at']);
            $table->dropIndex(['content_type', 'status']);
            $table->dropColumn([
                'content_type',
                'status',
                'author_name',
                'tags',
                'meta_title',
                'meta_description',
                'og_image_path',
                'reading_time_minutes',
                'views_count',
            ]);
        });
    }
};
