<?php

namespace Tests\Unit;

use App\Http\Responses\LoginResponse;
use Illuminate\Http\Request;
use Tests\TestCase;

class LoginResponseTest extends TestCase
{
    public function test_customer_logins_go_to_the_customer_portal_even_when_admin_was_intended(): void
    {
        $request = Request::create('/login', 'POST');
        $request->setLaravelSession(app('session')->driver());
        $request->session()->put('url.intended', '/admin');
        $request->setUserResolver(fn () => new class
        {
            public function isAgentOnly(): bool
            {
                return false;
            }

            public function isCustomerOnly(): bool
            {
                return true;
            }
        });

        $response = app(LoginResponse::class)->toResponse($request);

        $this->assertSame(url('/customer'), $response->getTargetUrl());
    }

    public function test_agent_logins_go_to_the_agent_portal(): void
    {
        $request = Request::create('/login', 'POST');
        $request->setLaravelSession(app('session')->driver());
        $request->session()->put('url.intended', '/admin');
        $request->setUserResolver(fn () => new class
        {
            public function isAgentOnly(): bool
            {
                return true;
            }

            public function isCustomerOnly(): bool
            {
                return false;
            }
        });

        $response = app(LoginResponse::class)->toResponse($request);

        $this->assertSame(url('/agent'), $response->getTargetUrl());
    }

    public function test_admin_logins_keep_the_intended_url(): void
    {
        $request = Request::create('/login', 'POST');
        $request->setLaravelSession(app('session')->driver());
        $request->session()->put('url.intended', '/admin/booking-management/listing');
        $request->setUserResolver(fn () => new class
        {
            public function isAgentOnly(): bool
            {
                return false;
            }

            public function isCustomerOnly(): bool
            {
                return false;
            }
        });

        $response = app(LoginResponse::class)->toResponse($request);

        $this->assertSame(url('/admin/booking-management/listing'), $response->getTargetUrl());
    }
}
