<?php

namespace Database\Factories;

use App\Models\Article;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Article>
 */
class ArticleFactory extends Factory
{
    protected $model = Article::class;

    public function definition(): array
    {
        $title = fake()->sentence(4);

        return [
            'slug' => Str::slug($title).'-'.fake()->unique()->numberBetween(100, 999),
            'title' => $title,
            'excerpt' => fake()->sentence(10),
            'body' => fake()->paragraphs(4, true),
            'image_path' => '/images/dummy.jpg',
            'content_type' => 'umrah_education',
            'status' => 'published',
            'author_name' => fake()->name(),
            'tags' => ['umrah', 'travel'],
            'meta_title' => $title,
            'meta_description' => fake()->sentence(12),
            'og_image_path' => '/images/dummy.jpg',
            'reading_time_minutes' => fake()->numberBetween(2, 8),
            'views_count' => fake()->numberBetween(0, 500),
            'published_at' => now()->subDays(fake()->numberBetween(1, 30)),
            'is_featured' => false,
            'is_active' => true,
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => [
            'status' => 'draft',
            'published_at' => null,
            'is_active' => true,
        ]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => [
            'status' => 'scheduled',
            'published_at' => now()->addDays(3),
            'is_active' => true,
        ]);
    }

    public function archived(): static
    {
        return $this->state(fn (): array => [
            'status' => 'archived',
            'is_active' => false,
        ]);
    }

    public function featured(): static
    {
        return $this->state(fn (): array => [
            'is_featured' => true,
        ]);
    }
}
