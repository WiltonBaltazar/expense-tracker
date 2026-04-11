<?php

namespace App\Http\Controllers;

use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SettingController extends Controller
{
    public function edit(Request $request)
    {
        $user = $request->user();
        $user->loadMissing(['subscription.plan', 'subscriptionEvents.plan']);

        $setting = $user->setting ?? $user->setting()->firstOrCreate([], [
            'needs_pct' => 50,
            'wants_pct' => 30,
            'savings_pct' => 20,
        ]);

        $plan = $user->subscription?->plan;
        $featureCatalog = $this->userFeatureCatalog();
        $features = collect($user->planFeatures())
            ->filter(fn (bool $enabled, string $key) => array_key_exists($key, $featureCatalog))
            ->map(function (bool $enabled, string $key) use ($featureCatalog) {
                $meta = $featureCatalog[$key];

                return [
                    'key' => $key,
                    'label' => $meta['label'] ?? $key,
                    'enabled' => $enabled,
                ];
            })
            ->values()
            ->all();

        $subscriptionHistory = $user->subscriptionEvents()
            ->with(['plan:id,code,name,currency,duration_months'])
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit(80)
            ->get()
            ->map(function ($event) {
                return [
                    'id' => $event->id,
                    'event_type' => $event->event_type,
                    'event_label' => $this->eventLabel((string) $event->event_type),
                    'status' => $event->status,
                    'amount' => $event->amount !== null ? (float) $event->amount : null,
                    'currency' => $event->currency,
                    'note' => $event->note,
                    'occurred_at' => $event->occurred_at?->toIso8601String(),
                    'plan' => [
                        'code' => $event->plan?->code,
                        'name' => $event->plan?->name,
                        'duration_months' => $event->plan?->duration_months,
                    ],
                ];
            })
            ->values()
            ->all();

        $renewsAt = $user->subscription?->renews_at;
        $daysUntilExpiry = null;
        $canRenew = true;

        if ($renewsAt instanceof Carbon && $renewsAt->isFuture()) {
            $daysUntilExpiry = (int) ceil($renewsAt->diffInSeconds(now()) / 86400);
            $canRenew = $daysUntilExpiry <= 5;
        }

        return Inertia::render('Settings/Edit', [
            'setting' => $setting,
            'subscription' => [
                'status' => $user->subscription?->status ?? 'active',
                'started_at' => $user->subscription?->started_at?->toIso8601String(),
                'renews_at' => $renewsAt?->toIso8601String(),
                'can_renew' => $canRenew,
                'days_until_expiry' => $daysUntilExpiry,
                'plan' => [
                    'code' => $plan?->code ?? 'gratis',
                    'name' => $plan?->name ?? 'Gratis',
                    'price_monthly' => (float) ($plan?->price_monthly ?? 0),
                    'currency' => $plan?->currency ?? 'MZN',
                    'duration_months' => (int) ($plan?->duration_months ?? 1),
                ],
                'features' => $features,
            ],
            'subscriptionHistory' => $subscriptionHistory,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'needs_pct' => 'required|numeric|min:0|max:100',
            'wants_pct' => 'required|numeric|min:0|max:100',
            'savings_pct' => 'required|numeric|min:0|max:100',
        ]);

        $total = $validated['needs_pct'] + $validated['wants_pct'] + $validated['savings_pct'];

        if (abs($total - 100) > 0.01) {
            return redirect()->back()->withErrors([
                'needs_pct' => 'A soma dos percentuais deve ser exatamente 100%.',
            ]);
        }

        $request->user()->setting()->updateOrCreate(
            ['user_id' => $request->user()->id],
            $validated
        );

        return redirect()->back()->with('success', 'Configurações atualizadas com sucesso!');
    }

    public function renewSubscription(Request $request)
    {
        $user = $request->user();
        $user->loadMissing(['subscription.plan']);
        $user->ensureDefaultSubscription();
        $user->refresh()->loadMissing(['subscription.plan']);

        $subscription = $user->subscription;
        $plan = $subscription?->plan;

        if (! $subscription || ! $plan) {
            return redirect()->back()->with('error', 'Não foi possível renovar a subscrição agora.');
        }

        // Gate: only allow renewal within the last 5 days of the plan
        $currentRenewsAt = $subscription->renews_at;
        $remainingDays = 0;

        if ($currentRenewsAt instanceof Carbon && $currentRenewsAt->isFuture()) {
            $remainingDays = (int) ceil($currentRenewsAt->diffInSeconds(now()) / 86400);

            if ($remainingDays > 5) {
                return redirect()->back()->with(
                    'error',
                    "A renovação só está disponível nos últimos 5 dias do plano. Faltam {$remainingDays} dias para o vencimento."
                );
            }
        }

        $durationMonths = max(1, (int) ($plan->duration_months ?? 1));

        // Base from current expiry so any remaining days carry over automatically
        $baseDate = $currentRenewsAt instanceof Carbon && $currentRenewsAt->isFuture()
            ? $currentRenewsAt->copy()
            : now()->startOfDay();

        $nextRenewal = $baseDate->copy()->addMonthsNoOverflow($durationMonths);

        $subscription->forceFill([
            'status'     => 'active',
            'started_at' => $subscription->started_at ?? now()->startOfDay(),
            'renews_at'  => $nextRenewal,
            'ends_at'    => null,
            'canceled_at' => null,
        ])->save();

        $cycleAmount = round((float) $plan->price_monthly * $durationMonths, 2);

        $carryNote = $remainingDays > 0
            ? " Os {$remainingDays} dia(s) restantes foram adicionados ao novo período."
            : '';

        $user->subscriptionEvents()->create([
            'subscription_plan_id' => $plan->id,
            'event_type' => 'user_renewal',
            'status' => 'active',
            'amount' => $cycleAmount > 0 ? $cycleAmount : null,
            'currency' => $plan->currency,
            'note' => "Renovação feita pelo utilizador por {$durationMonths} mês(es).{$carryNote}",
            'occurred_at' => now(),
            'metadata' => [
                'source' => 'self_service_renewal',
                'duration_months' => $durationMonths,
                'remaining_days_carried' => $remainingDays,
                'renews_at' => $nextRenewal->toDateString(),
            ],
        ]);

        if ($cycleAmount > 0) {
            $user->subscriptionEvents()->create([
                'subscription_plan_id' => $plan->id,
                'event_type' => 'payment_recorded',
                'status' => 'active',
                'amount' => $cycleAmount,
                'currency' => $plan->currency,
                'note' => "Pagamento registado para renovação de {$durationMonths} mês(es).",
                'occurred_at' => now(),
                'metadata' => [
                    'source' => 'self_service_renewal',
                    'price_monthly' => (float) $plan->price_monthly,
                    'duration_months' => $durationMonths,
                ],
            ]);
        }

        return redirect()->back()->with('success', 'Subscrição renovada com sucesso.');
    }

    private function eventLabel(string $type): string
    {
        return match ($type) {
            'default_plan_assigned' => 'Plano padrão atribuído',
            'plan_assigned_backfill' => 'Plano migrado',
            'manual_assignment' => 'Subscrição atribuída',
            'manual_renewal' => 'Subscrição renovada',
            'plan_changed' => 'Plano alterado',
            'payment_recorded' => 'Pagamento registado',
            'user_renewal' => 'Renovação do utilizador',
            default => str_replace('_', ' ', ucfirst($type)),
        };
    }

    /**
     * @return array<string, array<string, mixed>>
     */
    private function userFeatureCatalog(): array
    {
        return collect(config('subscriptions.features', []))
            ->filter(fn (array $meta) => ($meta['assignable'] ?? true) && (($meta['audience'] ?? 'user') === 'user'))
            ->all();
    }
}
