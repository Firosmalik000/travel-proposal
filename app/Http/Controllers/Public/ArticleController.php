<?php

namespace App\Http\Controllers\Public;

use App\Http\Controllers\Controller;
use App\Models\Article;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ArticleController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = [
            'search' => (string) $request->string('search')->value(),
            'content_type' => (string) $request->string('content_type')->value(),
        ];

        $baseQuery = Article::query()
            ->visible()
            ->when($filters['search'] !== '', function ($builder) use ($filters) {
                $search = mb_strtolower($filters['search']);

                $builder->where(function ($innerQuery) use ($search) {
                    $innerQuery
                        ->whereRaw('LOWER(slug) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, "$.id"))) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(title, "$.en"))) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(excerpt, "$.id"))) like ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(JSON_UNQUOTE(JSON_EXTRACT(excerpt, "$.en"))) like ?', ["%{$search}%"]);
                });
            })
            ->when($filters['content_type'] !== '', fn ($builder) => $builder->where('content_type', $filters['content_type']))
            ->latest('published_at');

        $featuredArticle = (clone $baseQuery)
            ->featured()
            ->first();

        $articles = $baseQuery
            ->paginate(9)
            ->withQueryString()
            ->through(fn (Article $article): array => $this->serializeListItem($article));

        return Inertia::render('public/artikel/index', [
            'featuredArticle' => $featuredArticle ? $this->serializeDetailItem($featuredArticle) : null,
            'articles' => $articles,
            'filters' => $filters,
            'contentTypeOptions' => $this->contentTypeOptions(),
        ]);
    }

    public function show(Article $article): Response
    {
        abort_unless($article->isVisible(), 404);

        $article->increment('views_count');
        $article->refresh();

        $relatedArticles = Article::query()
            ->visible()
            ->whereKeyNot($article->id)
            ->where('content_type', $article->content_type)
            ->latest('published_at')
            ->limit(3)
            ->get()
            ->map(fn (Article $relatedArticle): array => $this->serializeListItem($relatedArticle))
            ->all();

        return Inertia::render('public/artikel/show', [
            'article' => $this->serializeDetailItem($article),
            'relatedArticles' => $relatedArticles,
        ]);
    }

    private function serializeListItem(Article $article): array
    {
        return [
            'id' => $article->id,
            'title' => $article->title,
            'slug' => $article->slug,
            'excerpt' => $article->excerpt,
            'image_path' => $article->image_path,
            'content_type' => $article->content_type,
            'author_name' => $article->author_name,
            'tags' => $article->tags ?? [],
            'published_at' => $article->published_at?->toDateTimeString(),
            'reading_time_minutes' => $article->reading_time_minutes,
            'is_featured' => $article->is_featured,
        ];
    }

    private function serializeDetailItem(Article $article): array
    {
        return [
            ...$this->serializeListItem($article),
            'body' => $article->body,
            'meta_title' => $article->meta_title,
            'meta_description' => $article->meta_description,
            'og_image_path' => $article->og_image_path,
            'views_count' => $article->views_count,
        ];
    }

    private function contentTypeOptions(): array
    {
        return [
            ['value' => '', 'label' => 'Semua Artikel'],
            ['value' => Article::TYPE_TRAVEL_UPDATE, 'label' => 'Travel Update'],
            ['value' => Article::TYPE_COMPANY_NEWS, 'label' => 'Company News'],
            ['value' => Article::TYPE_UMRAH_EDUCATION, 'label' => 'Tips Umrah'],
            ['value' => Article::TYPE_GENERAL_NEWS, 'label' => 'General News'],
        ];
    }
}
