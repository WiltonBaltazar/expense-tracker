<?php

namespace Tests\Feature;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SubscriptionFeatureAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_is_redirected_when_feature_is_disabled_by_plan(): void
    {
        $user = User::factory()->create();

        $features = User::defaultPlanFeatures();
        $features['incomes'] = false;

        $restrictedPlan = SubscriptionPlan::query()->create([
            'code' => 'restricted',
            'name' => 'Restricted',
            'price_monthly' => 0,
            'currency' => 'MZN',
            'billing_interval' => 'monthly',
            'duration_months' => 1,
            'is_active' => true,
            'is_free' => false,
            'features' => $features,
        ]);

        $user->subscription()->update([
            'subscription_plan_id' => $restrictedPlan->id,
            'status' => 'active',
        ]);

        $this->actingAs($user)
            ->get('/rendas')
            ->assertRedirect(route('settings.edit', absolute: false));
    }

    public function test_user_keeps_access_even_if_subscription_cycle_is_expired(): void
    {
        $user = User::factory()->create();

        $plan = SubscriptionPlan::query()->create([
            'code' => 'expired-cycle',
            'name' => 'Expired Cycle',
            'price_monthly' => 0,
            'currency' => 'MZN',
            'billing_interval' => 'monthly',
            'duration_months' => 1,
            'is_active' => true,
            'is_free' => false,
            'features' => User::defaultPlanFeatures(),
        ]);

        $user->subscription()->update([
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
            'started_at' => now()->subMonths(2),
            'renews_at' => now()->subMonth(),
            'ends_at' => now()->subMonth(),
        ]);

        $this->actingAs($user)
            ->get('/rendas')
            ->assertOk();
    }
}
