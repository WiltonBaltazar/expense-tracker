<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionProvisioningTest extends TestCase
{
    use RefreshDatabase;

    public function test_newly_created_user_receives_default_free_subscription(): void
    {
        $user = User::factory()->create();

        $this->assertDatabaseHas('subscription_plans', [
            'code' => 'gratis',
            'name' => 'Gratis',
        ]);

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $user->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('subscription_events', [
            'user_id' => $user->id,
            'event_type' => 'default_plan_assigned',
            'status' => 'active',
        ]);

        $this->assertSame('gratis', $user->fresh()->planCode());
    }

    public function test_registration_flow_provisions_active_subscription(): void
    {
        $response = $this->post('/register', [
            'name' => 'Subscription User',
            'email' => 'subscription-user@example.com',
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $response->assertRedirect(route('dashboard', absolute: false));

        $userId = User::query()
            ->where('email', 'subscription-user@example.com')
            ->value('id');

        $this->assertNotNull($userId);
        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $userId,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('subscription_events', [
            'user_id' => $userId,
            'event_type' => 'default_plan_assigned',
            'status' => 'active',
        ]);
    }
}
