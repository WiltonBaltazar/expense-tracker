<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use App\Models\UserSubscription;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminSubscriptionController extends Controller
{
    public function index(): Response
    {
        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();

        $totalSubscribers = $this->customerSubscriptions()->count();
        $activeSubscribers = $this->customerSubscriptions()->where('status', 'active')->count();
        $newSubscribersMonth = $this->customerSubscriptions()->whereBetween('started_at', [$monthStart, $monthEnd])->count();
        $canceledMonth = $this->customerSubscriptions()->whereBetween('canceled_at', [$monthStart, $monthEnd])->count();

        $freeSubscribers = $this->customerSubscriptions()
            ->whereHas('plan', fn ($query) => $query->where('code', 'gratis'))
            ->count();

        $paidSubscribers = $this->customerSubscriptions()
            ->where('status', 'active')
            ->whereHas('plan', fn ($query) => $query->where('price_monthly', '>', 0))
            ->count();

        $mrr = (float) $this->customerSubscriptions()
            ->where('status', 'active')
            ->join('subscription_plans', 'user_subscriptions.subscription_plan_id', '=', 'subscription_plans.id')
            ->where('subscription_plans.price_monthly', '>', 0)
            ->sum('subscription_plans.price_monthly');

        $plans = SubscriptionPlan::query()
            ->withCount([
                'subscriptions as subscribers_count' => fn ($query) => $query
                    ->whereHas('user', fn ($userQuery) => $userQuery->where('is_super_admin', false)),
                'subscriptions as active_subscribers_count' => fn ($query) => $query
                    ->where('status', 'active')
                    ->whereHas('user', fn ($userQuery) => $userQuery->where('is_super_admin', false)),
            ])
            ->orderBy('price_monthly')
            ->get()
            ->map(fn (SubscriptionPlan $plan) => [
                'id' => $plan->id,
                'code' => $plan->code,
                'name' => $plan->name,
                'price_monthly' => (float) $plan->price_monthly,
                'currency' => $plan->currency,
                'is_free' => (bool) $plan->is_free,
                'is_active' => (bool) $plan->is_active,
                'subscribers_count' => (int) $plan->subscribers_count,
                'active_subscribers_count' => (int) $plan->active_subscribers_count,
                'features_count' => is_array($plan->features) ? count($plan->features) : 0,
            ])
            ->values()
            ->all();

        $series = collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($now) {
                $month = $now->copy()->subMonths($monthsAgo);
                $start = $month->copy()->startOfMonth();
                $end = $month->copy()->endOfMonth();

                return [
                    'month' => $month->format('M Y'),
                    'new_subscriptions' => $this->customerSubscriptions()->whereBetween('started_at', [$start, $end])->count(),
                    'canceled_subscriptions' => $this->customerSubscriptions()->whereBetween('canceled_at', [$start, $end])->count(),
                ];
            })
            ->values()
            ->all();

        $subscriptions = $this->customerSubscriptions()
            ->with([
                'user:id,name,email,created_at',
                'plan:id,code,name,price_monthly,currency,is_free',
            ])
            ->latest('started_at')
            ->limit(300)
            ->get()
            ->map(fn (UserSubscription $subscription) => [
                'id' => $subscription->id,
                'status' => $subscription->status,
                'started_at' => $subscription->started_at?->format('Y-m-d'),
                'renews_at' => $subscription->renews_at?->format('Y-m-d'),
                'canceled_at' => $subscription->canceled_at?->format('Y-m-d'),
                'user' => [
                    'id' => $subscription->user?->id,
                    'name' => $subscription->user?->name,
                    'email' => $subscription->user?->email,
                    'joined_at' => $subscription->user?->created_at?->format('Y-m-d'),
                ],
                'plan' => [
                    'code' => $subscription->plan?->code ?? 'gratis',
                    'name' => $subscription->plan?->name ?? 'Gratis',
                    'price_monthly' => (float) ($subscription->plan?->price_monthly ?? 0),
                    'currency' => $subscription->plan?->currency ?? 'MZN',
                    'is_free' => (bool) ($subscription->plan?->is_free ?? true),
                ],
            ])
            ->values()
            ->all();

        return Inertia::render('Admin/Subscriptions', [
            'adminDomain' => config('admin.domain'),
            'generatedAt' => $now->toIso8601String(),
            'stats' => [
                'total_subscribers' => $totalSubscribers,
                'active_subscribers' => $activeSubscribers,
                'new_subscribers_month' => $newSubscribersMonth,
                'canceled_subscribers_month' => $canceledMonth,
                'free_subscribers' => $freeSubscribers,
                'paid_subscribers' => $paidSubscribers,
                'mrr' => round($mrr, 2),
                'paid_ratio' => $totalSubscribers > 0 ? round(($paidSubscribers / $totalSubscribers) * 100, 1) : 0.0,
            ],
            'plans' => $plans,
            'series' => $series,
            'subscriptions' => $subscriptions,
        ]);
    }

    private function customerSubscriptions()
    {
        return UserSubscription::query()
            ->whereHas('user', fn ($query) => $query->where('is_super_admin', false));
    }
}
