<?php

namespace App\Http\Responses;

use Illuminate\Http\RedirectResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): RedirectResponse
    {
        if ($request->user()?->isAgentOnly()) {
            return redirect('/agent');
        }

        if ($request->user()?->isCustomerOnly()) {
            return redirect('/customer');
        }

        return redirect()->intended('/admin');
    }
}
