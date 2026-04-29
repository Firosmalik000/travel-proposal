<?php

namespace App\Models;

use App\Traits\NormalizesLocalizedStrings;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faq extends Model
{
    use HasFactory;
    use NormalizesLocalizedStrings;

    protected $fillable = [
        'question',
        'answer',
        'sort_order',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function setQuestionAttribute(mixed $value): void
    {
        $this->attributes['question'] = $this->normalizeLocalizedString($value);
    }

    public function setAnswerAttribute(mixed $value): void
    {
        $this->attributes['answer'] = $this->normalizeLocalizedString($value);
    }
}
