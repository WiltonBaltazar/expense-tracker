<?php

namespace App\Services;

use App\Models\User;
use App\Models\UserSetting;
use Carbon\Carbon;

class FinancialSplitterService
{
    public function getSavingsWallet(User $user): array
    {
        $totalDeposited = (float) $user->savingsTransfers()->sum('amount');
        $totalToGoals = (float) $user->goalTransfers()->where('type', 'to_goal')->sum('amount');
        $totalToSavings = (float) $user->goalTransfers()->where('type', 'to_savings')->sum('amount');

        $totalInGoals = round($totalToGoals - $totalToSavings, 2);
        $availableBalance = round($totalDeposited - $totalInGoals, 2);

        return [
            'total_deposited' => $totalDeposited,
            'total_in_goals' => $totalInGoals,
            'available_balance' => $availableBalance,
        ];
    }

    public function getUnifiedSavingsHistory(User $user, int $limit = 20): array
    {
        $savingsHistory = $user->savingsTransfers()
            ->orderByDesc('transferred_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'entry_type' => 'savings_deposit',
                    'direction' => 'deposit',
                    'title' => 'Depósito na Poupança',
                    'goal_name' => null,
                    'amount' => (float) $transfer->amount,
                    'note' => $transfer->note,
                    'transferred_at' => $transfer->transferred_at?->format('Y-m-d'),
                    'sort_key' => $this->buildSortKey(
                        $transfer->transferred_at?->format('Y-m-d'),
                        $transfer->created_at?->format('H:i:s.u'),
                        $transfer->id
                    ),
                ];
            });

        $goalTransferHistory = $user->goalTransfers()
            ->with('goal:id,name')
            ->orderByDesc('transferred_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get()
            ->map(function ($transfer) {
                return [
                    'id' => $transfer->id,
                    'entry_type' => 'goal_transfer',
                    'direction' => $transfer->type,
                    'title' => $transfer->type === 'to_goal' ? 'Poupança → Meta' : 'Meta → Poupança',
                    'goal_name' => $transfer->goal?->name,
                    'amount' => (float) $transfer->amount,
                    'note' => $transfer->note,
                    'transferred_at' => $transfer->transferred_at?->format('Y-m-d'),
                    'sort_key' => $this->buildSortKey(
                        $transfer->transferred_at?->format('Y-m-d'),
                        $transfer->created_at?->format('H:i:s.u'),
                        $transfer->id
                    ),
                ];
            });

        return $savingsHistory
            ->concat($goalTransferHistory)
            ->sortByDesc('sort_key')
            ->take($limit)
            ->values()
            ->map(function (array $entry) {
                unset($entry['sort_key']);

                return $entry;
            })
            ->all();
    }

    public function getSavingsTransferredForMonth(User $user, ?Carbon $month = null): float
    {
        $month = $month ?? Carbon::now();

        return (float) $user->savingsTransfers()
            ->whereBetween('transferred_at', [
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth(),
            ])
            ->sum('amount');
    }

    public function getIncomeForMonth(User $user, ?Carbon $month = null): float
    {
        $month = $month ?? Carbon::now();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        return $user->incomes()
            ->whereBetween('received_at', [$startOfMonth, $endOfMonth])
            ->get()
            ->sum('amount');
    }

    public function getTotalMonthlyIncome(User $user): float
    {
        return $user->incomes->sum(fn ($income) => $income->monthlyAmount());
    }

    public function getBucketAllocations(User $user): array
    {
        $setting = $user->setting ?? $this->createDefaultSettings($user);
        $totalIncome = $this->getTotalMonthlyIncome($user);

        return [
            'renda_total' => $totalIncome,
            'necessidades' => [
                'percentual' => (float) $setting->needs_pct,
                'valor' => round($totalIncome * (float) $setting->needs_pct / 100, 2),
            ],
            'desejos' => [
                'percentual' => (float) $setting->wants_pct,
                'valor' => round($totalIncome * (float) $setting->wants_pct / 100, 2),
            ],
            'economia' => [
                'percentual' => (float) $setting->savings_pct,
                'valor' => round($totalIncome * (float) $setting->savings_pct / 100, 2),
            ],
        ];
    }

    public function getMonthlyExpensesByBucket(User $user, ?Carbon $month = null): array
    {
        $month = $month ?? Carbon::now();
        $startOfMonth = $month->copy()->startOfMonth();
        $endOfMonth = $month->copy()->endOfMonth();

        // One-time expenses in the month
        $oneTime = $user->expenses()
            ->where('is_recurring', false)
            ->whereBetween('spent_at', [$startOfMonth, $endOfMonth])
            ->get();

        // Recurring expenses that apply to this month
        $recurring = $user->expenses()
            ->where('is_recurring', true)
            ->where('spent_at', '<=', $endOfMonth)
            ->get()
            ->filter(fn ($e) => $e->appliesInMonth($month));

        $all = $oneTime->concat($recurring);

        return [
            'necessidades' => $all->where('bucket', 'necessidades')->sum('amount'),
            'desejos' => $all->where('bucket', 'desejos')->sum('amount'),
            'total' => $all->sum('amount'),
        ];
    }

    public function getBucketStatus(User $user, ?Carbon $month = null): array
    {
        $month = $month ?? Carbon::now();
        $allocations = $this->getBucketAllocations($user);
        $spent = $this->getMonthlyExpensesByBucket($user, $month);

        $savingsAllocated = $allocations['economia']['valor'];
        $savingsTransferred = $this->getSavingsTransferredForMonth($user, $month);

        return [
            'necessidades' => [
                'alocado' => $allocations['necessidades']['valor'],
                'gasto' => $spent['necessidades'],
                'restante' => $allocations['necessidades']['valor'] - $spent['necessidades'],
            ],
            'desejos' => [
                'alocado' => $allocations['desejos']['valor'],
                'gasto' => $spent['desejos'],
                'restante' => $allocations['desejos']['valor'] - $spent['desejos'],
            ],
            'economia' => [
                'alocado' => $savingsAllocated,
                'transferido' => $savingsTransferred,
                'restante' => round($savingsAllocated - $savingsTransferred, 2),
            ],
        ];
    }

    public function calculateGoalEta(
        User $user,
        float $remainingAmount,
        float $goalSavingsPct = 100,
        ?float $monthlySavingsTotal = null
    ): ?array {
        $totalMonthlySavings = $monthlySavingsTotal ?? $this->getBucketAllocations($user)['economia']['valor'];
        $perGoalSavings = round($totalMonthlySavings * $goalSavingsPct / 100, 2);

        if ($perGoalSavings <= 0) {
            return null;
        }

        $months = ceil($remainingAmount / $perGoalSavings);
        $etaDate = Carbon::now()->addMonths((int) $months);

        return [
            'meses' => (int) $months,
            'data_estimada' => $etaDate->format('d/m/Y'),
            'economia_mensal' => $perGoalSavings,
            'economia_mensal_total' => $totalMonthlySavings,
            'savings_pct' => $goalSavingsPct,
        ];
    }

    public function calculateFastTrack(
        User $user,
        float $remainingAmount,
        float $redirectAmount,
        float $goalSavingsPct = 100,
        ?float $monthlySavingsTotal = null
    ): ?array {
        $totalMonthlySavings = $monthlySavingsTotal ?? $this->getBucketAllocations($user)['economia']['valor'];
        $perGoalSavings = round($totalMonthlySavings * $goalSavingsPct / 100, 2);
        $newSavings = $perGoalSavings + $redirectAmount;

        if ($newSavings <= 0) {
            return null;
        }

        $normalMonths = $perGoalSavings > 0 ? ceil($remainingAmount / $perGoalSavings) : null;
        $fastMonths = ceil($remainingAmount / $newSavings);

        return [
            'meses_normal' => $normalMonths ? (int) $normalMonths : null,
            'meses_fast_track' => (int) $fastMonths,
            'dias_economizados' => $normalMonths ? (int) (($normalMonths - $fastMonths) * 30) : null,
            'nova_economia_mensal' => $newSavings,
            'data_estimada' => Carbon::now()->addMonths((int) $fastMonths)->format('d/m/Y'),
        ];
    }

    public function getWeeklyBudget(User $user, ?Carbon $week = null): array
    {
        $week = $week ?? Carbon::now();
        $startOfWeek = $week->copy()->startOfWeek(); // Monday
        $endOfWeek = $week->copy()->endOfWeek();   // Sunday

        $allocations = $this->getBucketAllocations($user);
        $monthlyWants = $allocations['desejos']['valor'];
        $weeklyAllowance = round($monthlyWants / 4.33, 2);

        // Only count one-time wants expenses; recurring ones are fixed commitments
        $spent = (float) $user->expenses()
            ->where('bucket', 'desejos')
            ->where('is_recurring', false)
            ->whereBetween('spent_at', [$startOfWeek, $endOfWeek])
            ->sum('amount');

        return [
            'allowance' => $weeklyAllowance,
            'spent' => $spent,
            'remaining' => round($weeklyAllowance - $spent, 2),
            'pct_spent' => $weeklyAllowance > 0 ? min(100, round(($spent / $weeklyAllowance) * 100)) : 0,
            'week_start' => $startOfWeek->format('d/m'),
            'week_end' => $endOfWeek->format('d/m'),
        ];
    }

    public function getTopWantsExpenses(User $user, ?Carbon $month = null, int $limit = 5): array
    {
        $month = $month ?? Carbon::now();

        return $user->expenses()
            ->where('bucket', 'desejos')
            ->whereBetween('spent_at', [
                $month->copy()->startOfMonth(),
                $month->copy()->endOfMonth(),
            ])
            ->orderByDesc('amount')
            ->limit($limit)
            ->get()
            ->toArray();
    }

    private function createDefaultSettings(User $user): UserSetting
    {
        return $user->setting()->firstOrCreate([], [
            'needs_pct' => 50,
            'wants_pct' => 30,
            'savings_pct' => 20,
        ]);
    }

    private function buildSortKey(?string $date, ?string $time, int $id): string
    {
        $safeDate = $date ?? '0000-00-00';
        $safeTime = $time ?? '00:00:00.000000';

        return sprintf('%s %s %020d', $safeDate, $safeTime, $id);
    }
}
