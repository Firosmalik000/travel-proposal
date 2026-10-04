<?php

namespace App\Services;

use App\Models\FinancialBudget;
use DomainException;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class FinancialBudgetService
{
    /** @param array<string, mixed> $data */
    public function create(array $data): FinancialBudget
    {
        return DB::transaction(function () use ($data): FinancialBudget {
            $budget = FinancialBudget::query()->create([
                ...collect($data)->except('lines')->all(),
                'budget_number' => 'BGT-'.now()->format('Ymd').'-'.Str::upper((string) Str::ulid()),
                'status' => 'draft',
            ]);

            $budget->lines()->createMany($data['lines']);

            return $budget->load(['lines.account', 'package']);
        });
    }

    /** @param array<string, mixed> $data */
    public function update(FinancialBudget $budget, array $data): FinancialBudget
    {
        return DB::transaction(function () use ($budget, $data): FinancialBudget {
            $lockedBudget = FinancialBudget::query()->lockForUpdate()->findOrFail($budget->id);
            if ($lockedBudget->status !== 'draft') {
                throw new DomainException('Hanya anggaran berstatus draft yang dapat diubah.');
            }

            $lockedBudget->update(collect($data)->except('lines')->all());
            $lockedBudget->lines()->delete();
            $lockedBudget->lines()->createMany($data['lines']);

            return $lockedBudget->load(['lines.account', 'package']);
        });
    }

    public function transition(FinancialBudget $budget, string $status): FinancialBudget
    {
        return DB::transaction(function () use ($budget, $status): FinancialBudget {
            $lockedBudget = FinancialBudget::query()->lockForUpdate()->findOrFail($budget->id);

            if ($status === 'approved' && $lockedBudget->status === 'draft') {
                $lockedBudget->update(['status' => 'approved', 'approved_by' => Auth::id(), 'approved_at' => now()]);

                return $lockedBudget->fresh();
            }

            if ($status === 'closed' && $lockedBudget->status === 'approved') {
                $lockedBudget->update(['status' => 'closed', 'closed_by' => Auth::id(), 'closed_at' => now()]);

                return $lockedBudget->fresh();
            }

            throw new DomainException('Perubahan status anggaran tidak valid untuk kondisi saat ini.');
        });
    }
}
