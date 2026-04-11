<?php

namespace Tests\Feature;

use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class AdminDashboardAccessTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_super_admin_can_access_admin_dashboard(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get('/admin/dashboard')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Dashboard')
                ->has('generatedAt')
                ->has('stats')
                ->has('series')
                ->missing('featureAdoption')
                ->missing('adminUsers')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_super_admin_can_access_admin_analytics_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get('/admin/analytics')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Analytics')
                ->has('generatedAt')
                ->has('stats')
                ->has('series')
                ->has('activitySeries')
                ->has('featureAdoption')
                ->has('goalCompletion')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_super_admin_can_access_admin_users_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get('/admin/admin-users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/AdminUsers')
                ->has('generatedAt')
                ->has('adminUsers')
                ->has('adminDomains')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_super_admin_can_access_app_users_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        User::factory()->count(3)->create();

        $this->actingAs($superAdmin)
            ->get('/admin/users')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Users')
                ->has('generatedAt')
                ->has('stats')
                ->has('users')
                ->has('planDistribution')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_super_admin_can_access_subscriptions_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        User::factory()->count(2)->create();

        $this->actingAs($superAdmin)
            ->get('/admin/subscriptions')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Subscriptions')
                ->has('generatedAt')
                ->has('stats')
                ->has('plans')
                ->has('series')
                ->has('subscriptions')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_super_admin_can_access_plans_page(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        User::factory()->count(2)->create();

        $this->actingAs($superAdmin)
            ->get('/admin/plans')
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('Admin/Plans')
                ->has('generatedAt')
                ->has('featureCatalog')
                ->has('durationOptions')
                ->has('plans')
                ->has('users')
                ->where('adminDomain', config('admin.domain')));
    }

    public function test_non_super_admin_cannot_access_admin_dashboard(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get('/admin/dashboard')
            ->assertForbidden();
    }

    public function test_super_admin_is_redirected_to_configured_admin_domain_when_host_mismatches(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->get('http://example.test/admin/dashboard?tab=overview')
            ->assertRedirect('http://'.config('admin.domain').'/admin/dashboard?tab=overview');
    }

    public function test_super_admin_can_create_another_admin_user(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post('/admin/admin-users', [
                'name' => 'Admin Novo',
                'email' => 'novo-admin@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'admin_domain' => 'wiltonvm.click',
            ])->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'novo-admin@example.com',
            'name' => 'Admin Novo',
            'is_super_admin' => true,
            'admin_domain' => 'wiltonvm.click',
        ]);

        $newAdminId = User::query()
            ->where('email', 'novo-admin@example.com')
            ->value('id');

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $newAdminId,
            'status' => 'active',
        ]);
    }

    public function test_regular_user_cannot_create_admin_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->post('/admin/admin-users', [
                'name' => 'Admin Ilegal',
                'email' => 'ilegal@example.com',
                'password' => 'password123',
                'password_confirmation' => 'password123',
            ])->assertForbidden();
    }

    public function test_super_admin_can_create_plan_with_duration_and_features(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();

        $this->actingAs($superAdmin)
            ->post('/admin/plans', [
                'code' => 'pro',
                'name' => 'Plano Pro',
                'description' => 'Plano com recursos premium',
                'price_monthly' => 1499.99,
                'currency' => 'MZN',
                'duration_months' => 3,
                'is_active' => true,
                'is_free' => false,
                'selected_features' => ['dashboard', 'incomes', 'expenses'],
            ])
            ->assertRedirect();

        $plan = SubscriptionPlan::query()->where('code', 'pro')->first();

        $this->assertNotNull($plan);
        $this->assertSame(3, (int) $plan->duration_months);
        $this->assertTrue((bool) ($plan->features['dashboard'] ?? false));
        $this->assertFalse((bool) ($plan->features['goals'] ?? true));
    }

    public function test_super_admin_can_assign_subscription_manually_to_user(): void
    {
        $superAdmin = User::factory()->superAdmin()->create();
        $customer = User::factory()->create();
        $plan = SubscriptionPlan::query()->create([
            'code' => 'biannual',
            'name' => 'Biannual',
            'price_monthly' => 250,
            'currency' => 'MZN',
            'billing_interval' => 'monthly',
            'duration_months' => 6,
            'is_active' => true,
            'is_free' => false,
            'features' => User::defaultPlanFeatures(),
        ]);

        $this->actingAs($superAdmin)
            ->post('/admin/plans/assign-subscription', [
                'user_id' => $customer->id,
                'subscription_plan_id' => $plan->id,
                'started_at' => '2026-01-10',
                'status' => 'active',
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('user_subscriptions', [
            'user_id' => $customer->id,
            'subscription_plan_id' => $plan->id,
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('subscription_events', [
            'user_id' => $customer->id,
            'subscription_plan_id' => $plan->id,
            'event_type' => 'plan_changed',
            'status' => 'active',
        ]);

        $this->assertDatabaseHas('subscription_events', [
            'user_id' => $customer->id,
            'subscription_plan_id' => $plan->id,
            'event_type' => 'payment_recorded',
            'status' => 'active',
        ]);

        $subscription = $customer->fresh()->subscription;
        $this->assertNotNull($subscription);
        $this->assertSame('2026-07-10', $subscription->renews_at?->toDateString());
    }
}
