<?php

namespace Tests\Feature;

use App\Mail\UserInvitationMail;
use App\Models\Invitation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class InvitationFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_invitation_email_view_can_render(): void
    {
        $rendered = view('emails.user-invitation', [
            'acceptUrl' => 'https://example.com/invitation/token',
        ])->render();

        $this->assertStringContainsString('https://example.com/invitation/token', $rendered);
    }

    public function test_admin_can_invite_and_guest_can_accept_invitation(): void
    {
        Mail::fake();

        $admin = User::factory()->create([
            'email' => 'admin@asfartour.co.id',
        ]);

        $this->actingAs($admin)
            ->post('/admin/administrator/invitations', [
                'email' => 'invited@example.com',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('invitations', [
            'email' => 'invited@example.com',
        ]);

        $invitation = Invitation::query()->where('email', 'invited@example.com')->firstOrFail();
        $token = null;

        Mail::assertSent(UserInvitationMail::class, function (UserInvitationMail $mail) use ($invitation, &$token): bool {
            if ($mail->hasTo($invitation->email) && str_contains($mail->acceptUrl, '/invitation/')) {
                $token = trim((string) str($mail->acceptUrl)->after('/invitation/'));

                return $token !== '';
            }

            return false;
        });

        /** @var string $token */
        $token ??= '';

        $this->post('/logout')->assertRedirect();

        $this->get('/invitation/'.$token)
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page->component('auth/accept-invitation'));

        $this->post('/invitation/'.$token, [
            'name' => 'Invited User',
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ])->assertRedirect('/login');

        $user = User::query()->where('email', 'invited@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('NoAccess'));
        $this->assertNotNull(Role::query()->where('name', 'NoAccess')->first());

        $invitation->refresh();
        $this->assertNotNull($invitation->accepted_at);
    }
}
