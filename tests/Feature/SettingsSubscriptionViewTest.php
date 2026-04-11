<?php

namespace Tests\Feature;

use App\Models\SubscriptionEvent;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class SettingsSubscriptionViewTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_settings_page_exposes_subscription_tab_data_with_history(): void
    {
        $user = User::factory()->create();

        $plan = SubscriptionPlan::query()->create([
            'code' => 'premium',
            'name' => 'Premium',
            'description' => 'Plano premium',
            'price_monthly' => 500,
            'currency' => 'MZN',
            'billing_interval' => 'monthly',
            'duration_months' => 3,
            'is_active' => true,
            'is_free' => false,
            'features' => User::defaultPlanFeatures(),
        ]);

        $user->subscription()->update([
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'started_at' => now()->subMonth(),
            'renews_at' => now()->addMonths(2),
        ]);

        SubscriptionEvent::query()->create([
            'user_id' => $user->id,
            'subscription_plan_id' => $plan->id,
            'event_type' => 'manual_assignment',
            'status' => 'active',
            'amount' => 1500,
            'currency' => 'MZN',
            'note' => 'Subscrição atribuída pelo admin.',
            'occurred_at' => now()->subDays(10),
        ]);

        $this->actingAs($user)
            ->get('/ajustes')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Settings/Edit')
                ->has('setting')
                ->has('subscription')
                ->has('subscription.features')
                ->has('subscriptionHistory', 2));
    }

    public function test_user_can_renew_subscription_from_settings(): void
    {
        $user = User::factory()->create();

        $plan = SubscriptionPlan::query()->create([
            'code' => 'renew-plan',
            'name' => 'Renew Plan',
            'description' => 'Plano de renovação',
            'price_monthly' => 100,
            'currency' => 'MZN',
            'billing_interval' => 'monthly',
            'duration_months' => 3,
            'is_active' => true,
            'is_free' => false,
            'features' => User::defaultPlanFeatures(),
        ]);

        $user->subscription()->update([
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'started_at' => now()->subMonths(4),
            'renews_at' => now()->subDay(),
            'ends_at' => now()->subDay(),
        ]);

        $this->actingAs($user)
            ->post('/ajustes/subscricao/renovar')
            ->assertRedirect();

        $subscription = $user->fresh()->subscription;
        $this->assertNotNull($subscription);
        $this->assertSame('active', $subscription->status);
        $this->assertNotNull($subscription->renews_at);
        $this->assertTrue($subscription->renews_at->greaterThan(now()->addMonths(2)));

        $this->assertDatabaseHas('subscription_events', [
            'user_id' => $user->id,
            'event_type' => 'user_renewal',
            'status' => 'active',
        ]);
    }
}
