<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\User;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminPlanController extends Controller
{
    public function index(): Response
    {
        $featureCatalog = $this->assignableFeatureCatalog()
            ->map(fn (array $meta, string $key) => [
                'key' => $key,
                'label' => $meta['label'] ?? $key,
                'description' => $meta['description'] ?? null,
            ])
            ->values()
            ->all();

        $durationOptions = collect(config('subscriptions.duration_options_months', [1, 3, 6, 12]))
            ->map(fn ($months) => (int) $months)
            ->filter(fn (int $months) => $months > 0)
            ->unique()
            ->values()
            ->all();

        $plans = SubscriptionPlan::query()
            ->withCount([
                'subscriptions as subscribers_count' => fn ($query) => $query
                    ->whereHas('user', fn ($userQuery) => $userQuery->where('is_super_admin', false)),
                'subscriptions as active_subscribers_count' => fn ($query) => $query
                    ->where('status', 'active')
                    ->whereHas('user', fn ($userQuery) => $userQuery->where('is_super_admin', false)),
            ])
            ->orderBy('price_monthly')
            ->orderBy('duration_months')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => [
                'id' => $plan->id,
                'code' => $plan->code,
                'name' => $plan->name,
                'description' => $plan->description,
                'price_monthly' => (float) $plan->price_monthly,
                'currency' => $plan->currency,
                'duration_months' => (int) ($plan->duration_months ?? 1),
                'is_active' => (bool) $plan->is_active,
                'is_free' => (bool) $plan->is_free,
                'features' => $this->normalizeFeatures($plan->features),
                'subscribers_count' => (int) $plan->subscribers_count,
                'active_subscribers_count' => (int) $plan->active_subscribers_count,
            ])
            ->values()
            ->all();

        $users = User::query()
            ->where('is_super_admin', false)
            ->with(['subscription.plan:id,name,code'])
            ->select(['id', 'name', 'email'])
            ->orderBy('name')
            ->limit(400)
            ->get()
            ->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'current_plan_name' => $user->subscription?->plan?->name ?? 'Gratis',
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Plans', [
            'adminDomain' => config('admin.domain'),
            'generatedAt' => now()->toIso8601String(),
            'featureCatalog' => $featureCatalog,
            'durationOptions' => $durationOptions,
            'plans' => $plans,
            'users' => $users,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:60|alpha_dash|unique:subscription_plans,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price_monthly' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'duration_months' => 'required|integer|min:1|max:120',
            'is_active' => 'boolean',
            'is_free' => 'boolean',
            'selected_features' => 'nullable|array',
            'selected_features.*' => 'string',
        ]);

        SubscriptionPlan::create([
            'code' => strtolower($validated['code']),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_monthly' => round((float) $validated['price_monthly'], 2),
            'currency' => strtoupper($validated['currency'] ?? 'MZN'),
            'billing_interval' => 'monthly',
            'duration_months' => (int) $validated['duration_months'],
            'is_active' => (bool) ($validated['is_active'] ?? true),
            'is_free' => (bool) ($validated['is_free'] ?? false),
            'features' => $this->buildFeaturesMap($validated['selected_features'] ?? []),
        ]);

        return redirect()->back()->with('success', 'Plano criado com sucesso.');
    }

    public function update(Request $request, SubscriptionPlan $plan): RedirectResponse
    {
        $validated = $request->validate([
            'code' => 'required|string|max:60|alpha_dash|unique:subscription_plans,code,'.$plan->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'price_monthly' => 'required|numeric|min:0',
            'currency' => 'nullable|string|size:3',
            'duration_months' => 'required|integer|min:1|max:120',
            'is_active' => 'boolean',
            'is_free' => 'boolean',
            'selected_features' => 'nullable|array',
            'selected_features.*' => 'string',
        ]);

        $plan->update([
            'code' => strtolower($validated['code']),
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
            'price_monthly' => round((float) $validated['price_monthly'], 2),
            'currency' => strtoupper($validated['currency'] ?? 'MZN'),
            'duration_months' => (int) $validated['duration_months'],
            'is_active' => (bool) ($validated['is_active'] ?? false),
            'is_free' => (bool) ($validated['is_free'] ?? false),
            'features' => $this->buildFeaturesMap($validated['selected_features'] ?? []),
        ]);

        return redirect()->back()->with('success', 'Plano atualizado com sucesso.');
    }

    public function assignSubscription(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'subscription_plan_id' => 'required|exists:subscription_plans,id',
            'started_at' => 'nullable|date',
            'status' => 'nullable|in:active,trialing,canceled',
        ]);

        $user = User::query()->findOrFail($validated['user_id']);
        $plan = SubscriptionPlan::query()->findOrFail($validated['subscription_plan_id']);
        $startedAt = isset($validated['started_at'])
            ? Carbon::parse($validated['started_at'])->startOfDay()
            : now()->startOfDay();

        $durationMonths = max(1, (int) ($plan->duration_months ?? 1));
        $renewsAt = $startedAt->copy()->addMonthsNoOverflow($durationMonths);
        $status = $validated['status'] ?? 'active';

        $previous = UserSubscription::query()->where('user_id', $user->id)->first();

        $subscription = UserSubscription::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'subscription_plan_id' => $plan->id,
                'status' => $status,
                'started_at' => $startedAt,
                'renews_at' => $renewsAt,
                'ends_at' => $status === 'canceled' ? $renewsAt : null,
                'canceled_at' => $status === 'canceled' ? now() : null,
                'metadata' => [
                    'assignment_source' => 'manual_admin_assignment',
                    'assigned_by_user_id' => $request->user()?->id,
                    'duration_months' => $durationMonths,
                ],
            ]
        );

        $eventType = $previous
            ? ($previous->subscription_plan_id === $plan->id ? 'manual_renewal' : 'plan_changed')
            : 'manual_assignment';

        $cycleAmount = round((float) $plan->price_monthly * $durationMonths, 2);

        $user->subscriptionEvents()->create([
            'subscription_plan_id' => $plan->id,
            'event_type' => $eventType,
            'status' => $status,
            'amount' => $cycleAmount > 0 ? $cycleAmount : null,
            'currency' => $plan->currency,
            'note' => "Subscrição manual atribuída por {$durationMonths} mês(es).",
            'occurred_at' => $startedAt,
            'metadata' => [
                'source' => 'manual_admin_assignment',
                'assigned_by_user_id' => $request->user()?->id,
                'duration_months' => $durationMonths,
                'renews_at' => $subscription->renews_at?->toDateString(),
            ],
        ]);

        if ($cycleAmount > 0) {
            $user->subscriptionEvents()->create([
                'subscription_plan_id' => $plan->id,
                'event_type' => 'payment_recorded',
                'status' => $status,
                'amount' => $cycleAmount,
                'currency' => $plan->currency,
                'note' => "Cobrança registada para ciclo de {$durationMonths} mês(es).",
                'occurred_at' => $startedAt,
                'metadata' => [
                    'source' => 'manual_admin_assignment',
                    'price_monthly' => (float) $plan->price_monthly,
                    'duration_months' => $durationMonths,
                ],
            ]);
        }

        if (! $user->subscribed_at) {
            $user->forceFill(['subscribed_at' => $startedAt])->save();
        }

        return redirect()->back()->with('success', 'Subscrição atribuída manualmente com sucesso.');
    }

    /**
     * @param array<string, mixed>|null $features
     * @return array<string, bool>
     */
    private function normalizeFeatures(?array $features): array
    {
        $base = array_fill_keys($this->assignableFeatureCatalog()->keys()->all(), false);

        if (! is_array($features)) {
            return $base;
        }

        foreach ($base as $key => $value) {
            if (array_key_exists($key, $features)) {
                $base[$key] = (bool) $features[$key];
            }
        }

        return $base;
    }

    /**
     * @param array<int, string> $selectedFeatures
     * @return array<string, bool>
     */
    private function buildFeaturesMap(array $selectedFeatures): array
    {
        $allowed = $this->assignableFeatureCatalog()->keys()->all();
        $allowedLookup = array_flip($allowed);
        $selectedLookup = array_flip($selectedFeatures);
        $result = [];

        foreach ($allowed as $featureKey) {
            $result[$featureKey] = isset($selectedLookup[$featureKey]) && isset($allowedLookup[$featureKey]);
        }

        return $result;
    }

    /**
     * @return \Illuminate\Support\Collection<string, array<string, mixed>>
     */
    private function assignableFeatureCatalog()
    {
        return collect(config('subscriptions.features', []))
            ->filter(fn (array $meta) => ($meta['assignable'] ?? true) && (($meta['audience'] ?? 'user') === 'user'));
    }
}
