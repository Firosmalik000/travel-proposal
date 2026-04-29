<?php

namespace App\Http\Requests\Administrator;

use App\Models\Article;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreArticleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    protected function prepareForValidation(): void
    {
        $fallbackMap = [
            'title' => 'title_id',
            'excerpt' => 'excerpt_id',
            'body' => 'body_id',
            'meta_title' => 'meta_title_id',
            'meta_description' => 'meta_description_id',
        ];

        foreach ($fallbackMap as $target => $fallback) {
            if (! $this->filled($target) && $this->filled($fallback)) {
                $this->merge([
                    $target => (string) $this->input($fallback),
                ]);
            }
        }
    }

    public function rules(): array
    {
        $articleId = $this->route('article')?->id;

        return [
            'title' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($articleId)],
            'excerpt' => ['nullable', 'string'],
            'body' => ['nullable', 'string'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'content_type' => ['required', 'string', Rule::in(Article::contentTypeOptions())],
            'status' => ['required', 'string', Rule::in(Article::statusOptions())],
            'published_at' => ['nullable', 'date'],
            'is_featured' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'string'],
            'meta_title' => ['nullable', 'string', 'max:255'],
            'meta_description' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'og_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $title = trim((string) $this->input('title'));

            if ($title === '') {
                $validator->errors()->add('title', 'Judul artikel wajib diisi.');
            }

            if ($this->input('status') === Article::STATUS_SCHEDULED && ! $this->filled('published_at')) {
                $validator->errors()->add('published_at', 'Tanggal publikasi wajib diisi untuk artikel scheduled.');
            }
        });
    }
}
