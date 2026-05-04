<?php

namespace App\Http\Requests\Administrator;

use App\Support\MenuPermissionService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateRolePermissionsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->can('menu.role_management.edit') ?? false;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $actions = MenuPermissionService::actions();

        return [
            'access' => ['required', 'array'],
            'access.*' => ['array'],
            'access.*.*' => ['string', Rule::in($actions)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'access.required' => 'Akses wajib diisi.',
            'access.array' => 'Format akses tidak valid.',
        ];
    }
}
