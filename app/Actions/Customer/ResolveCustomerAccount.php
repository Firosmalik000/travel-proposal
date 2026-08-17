<?php

namespace App\Actions\Customer;

use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class ResolveCustomerAccount
{
    public function handle(string $name, string $email, string $phone): User
    {
        $normalizedEmail = Str::lower(trim($email));
        $normalizedPhone = $this->normalizePhone($phone);

        return DB::transaction(function () use ($name, $normalizedEmail, $normalizedPhone): User {
            $customer = User::query()->whereRaw('LOWER(email) = ?', [$normalizedEmail])->lockForUpdate()->first();

            if (! $customer) {
                try {
                    $customer = User::query()->create([
                        'name' => trim($name),
                        'full_name' => trim($name),
                        'email' => $normalizedEmail,
                        'password' => Str::password(40),
                    ]);
                } catch (QueryException $exception) {
                    $customer = User::query()->whereRaw('LOWER(email) = ?', [$normalizedEmail])->first();

                    if (! $customer) {
                        throw $exception;
                    }
                }
            }

            Role::query()->firstOrCreate(['name' => 'Customer', 'guard_name' => 'web']);
            $customer->assignRole('Customer');

            $profile = UserProfile::query()->firstOrNew(['user_id' => $customer->id]);
            $profile->full_name ??= trim($name);
            $profile->phone ??= $normalizedPhone;
            $profile->user()->associate($customer);
            $profile->save();

            return $customer;
        });
    }

    public function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D+/', '', trim($phone)) ?? '';

        if (str_starts_with($digits, '0')) {
            return '62'.substr($digits, 1);
        }

        return $digits;
    }
}
