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

    public function rules(): array
    {
        $articleId = $this->route('article')?->id;

        return [
            'title_id' => ['nullable', 'string', 'max:255'],
            'title_en' => ['nullable', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('articles', 'slug')->ignore($articleId)],
            'excerpt_id' => ['nullable', 'string'],
            'excerpt_en' => ['nullable', 'string'],
            'body_id' => ['nullable', 'string'],
            'body_en' => ['nullable', 'string'],
            'author_name' => ['nullable', 'string', 'max:255'],
            'content_type' => ['required', 'string', Rule::in(Article::contentTypeOptions())],
            'status' => ['required', 'string', Rule::in(Article::statusOptions())],
            'published_at' => ['nullable', 'date'],
            'is_featured' => ['nullable', 'boolean'],
            'tags' => ['nullable', 'string'],
            'meta_title_id' => ['nullable', 'string', 'max:255'],
            'meta_title_en' => ['nullable', 'string', 'max:255'],
            'meta_description_id' => ['nullable', 'string'],
            'meta_description_en' => ['nullable', 'string'],
            'cover_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
            'og_image' => ['nullable', 'image', 'mimes:png,jpg,jpeg,webp', 'max:4096'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator): void {
            $titleId = trim((string) $this->input('title_id'));
            $titleEn = trim((string) $this->input('title_en'));

            if ($titleId === '' && $titleEn === '') {
                $validator->errors()->add('title_id', 'Minimal satu judul artikel wajib diisi.');
            }

            if ($this->input('status') === Article::STATUS_SCHEDULED && ! $this->filled('published_at')) {
                $validator->errors()->add('published_at', 'Tanggal publikasi wajib diisi untuk artikel scheduled.');
            }
        });
    }
}
