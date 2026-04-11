<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Expense;
use App\Models\Goal;
use App\Models\GoalTransfer;
use App\Models\Income;
use App\Models\SavingsTransfer;
use App\Models\User;
use Carbon\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class AdminDashboardController extends Controller
{
    public function index(): Response
    {
        $insights = $this->buildInsights();

        return Inertia::render('Admin/Dashboard', [
            'adminDomain' => config('admin.domain'),
            'generatedAt' => $insights['generatedAt'],
            'stats' => $insights['stats'],
            'series' => $insights['series'],
        ]);
    }

    public function analytics(): Response
    {
        $insights = $this->buildInsights();

        return Inertia::render('Admin/Analytics', [
            'adminDomain' => config('admin.domain'),
            'generatedAt' => $insights['generatedAt'],
            'stats' => $insights['stats'],
            'series' => $insights['series'],
            'activitySeries' => $insights['activitySeries'],
            'featureAdoption' => $insights['featureAdoption'],
            'goalCompletion' => $insights['goalCompletion'],
        ]);
    }

    private function calculatePercentChange(float $previous, float $current): float
    {
        if ($previous == 0.0) {
            return $current > 0 ? 100.0 : 0.0;
        }

        return round((($current - $previous) / abs($previous)) * 100, 1);
    }

    private function toPercentage(int $count, int $total): float
    {
        if ($total === 0) {
            return 0.0;
        }

        return round(($count / $total) * 100, 1);
    }

    /**
     * @return array<string, mixed>
     */
    private function buildInsights(): array
    {
        $now = Carbon::now();
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfMonth();
        $lastMonthStart = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $lastMonthEnd = $now->copy()->subMonthNoOverflow()->endOfMonth();
        $windowStart = $now->copy()->subDays(29)->startOfDay();
        $windowEnd = $now->copy()->endOfDay();

        $monthlyIncome = (float) Income::query()
            ->whereBetween('received_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $monthlyExpense = (float) Expense::query()
            ->whereBetween('spent_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $lastMonthlyIncome = (float) Income::query()
            ->whereBetween('received_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $lastMonthlyExpense = (float) Expense::query()
            ->whereBetween('spent_at', [$lastMonthStart, $lastMonthEnd])
            ->sum('amount');

        $totalDeposited = (float) SavingsTransfer::query()->sum('amount');
        $goalToSavings = (float) GoalTransfer::query()->where('type', 'to_savings')->sum('amount');
        $savingsToGoal = (float) GoalTransfer::query()->where('type', 'to_goal')->sum('amount');
        $savingsWalletBalance = round($totalDeposited + $goalToSavings - $savingsToGoal, 2);

        $toGoalThisMonth = (float) GoalTransfer::query()
            ->where('type', 'to_goal')
            ->whereBetween('transferred_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $toSavingsThisMonth = (float) GoalTransfer::query()
            ->where('type', 'to_savings')
            ->whereBetween('transferred_at', [$monthStart, $monthEnd])
            ->sum('amount');

        $totalGoals = Goal::query()->count();
        $completedGoals = Goal::query()->where('completed', true)->count();
        $goalCompletionRate = $totalGoals > 0
            ? round(($completedGoals / $totalGoals) * 100, 1)
            : 0.0;

        $totalUsers = User::query()->count();
        $newUsersThisMonth = User::query()
            ->whereBetween('created_at', [$monthStart, $monthEnd])
            ->count();

        $incomes30dCount = Income::query()->whereBetween('received_at', [$windowStart, $windowEnd])->count();
        $expenses30dCount = Expense::query()->whereBetween('spent_at', [$windowStart, $windowEnd])->count();
        $savings30dCount = SavingsTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->count();
        $goalTransfers30dCount = GoalTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->count();

        $activeUserIds = collect()
            ->merge(Income::query()->whereBetween('received_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(Expense::query()->whereBetween('spent_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(SavingsTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->merge(GoalTransfer::query()->whereBetween('transferred_at', [$windowStart, $windowEnd])->pluck('user_id')->all())
            ->filter()
            ->unique()
            ->values();

        $activeUsers30d = $activeUserIds->count();
        $events30d = $incomes30dCount + $expenses30dCount + $savings30dCount + $goalTransfers30dCount;

        $stats = [
            'total_users' => $totalUsers,
            'new_users_month' => $newUsersThisMonth,
            'super_admins' => User::query()->where('is_super_admin', true)->count(),
            'active_users_30d' => $activeUsers30d,
            'engagement_ratio_30d' => $this->toPercentage($activeUsers30d, $totalUsers),
            'avg_events_per_active_user_30d' => $activeUsers30d > 0 ? round($events30d / $activeUsers30d, 1) : 0.0,
            'active_goals' => Goal::query()->where('completed', false)->count(),
            'completed_goals' => $completedGoals,
            'goal_completion_rate' => $goalCompletionRate,
            'monthly_income' => round($monthlyIncome, 2),
            'monthly_income_change' => $this->calculatePercentChange($lastMonthlyIncome, $monthlyIncome),
            'monthly_expense' => round($monthlyExpense, 2),
            'monthly_expense_change' => $this->calculatePercentChange($lastMonthlyExpense, $monthlyExpense),
            'savings_wallet_balance' => $savingsWalletBalance,
            'savings_total_deposited' => round($totalDeposited, 2),
            'transfer_to_goals_month' => round($toGoalThisMonth, 2),
            'transfer_to_savings_month' => round($toSavingsThisMonth, 2),
            'net_goal_funding_month' => round($toGoalThisMonth - $toSavingsThisMonth, 2),
        ];

        $series = collect(range(5, 0))
            ->map(function (int $monthsAgo) use ($now) {
                $month = $now->copy()->subMonths($monthsAgo);
                $start = $month->copy()->startOfMonth();
                $end = $month->copy()->endOfMonth();

                return [
                    'month' => $month->format('M Y'),
                    'income' => (float) Income::query()
                        ->whereBetween('received_at', [$start, $end])
                        ->sum('amount'),
                    'expense' => (float) Expense::query()
                        ->whereBetween('spent_at', [$start, $end])
                        ->sum('amount'),
                    'new_users' => User::query()
                        ->whereBetween('created_at', [$start, $end])
                        ->count(),
                ];
            })
            ->values()
            ->all();

        $activitySeries = collect(range(13, 0))
            ->map(function (int $daysAgo) use ($now) {
                $date = $now->copy()->subDays($daysAgo)->startOfDay();
                $start = $date->copy()->startOfDay();
                $end = $date->copy()->endOfDay();

                return [
                    'date' => $date->format('d/m'),
                    'incomes' => Income::query()->whereBetween('received_at', [$start, $end])->count(),
                    'expenses' => Expense::query()->whereBetween('spent_at', [$start, $end])->count(),
                    'savings_deposits' => SavingsTransfer::query()->whereBetween('transferred_at', [$start, $end])->count(),
                    'goal_transfers' => GoalTransfer::query()->whereBetween('transferred_at', [$start, $end])->count(),
                ];
            })
            ->values()
            ->all();

        $usersWithIncomes = Income::query()->distinct()->count('user_id');
        $usersWithExpenses = Expense::query()->distinct()->count('user_id');
        $usersWithGoals = Goal::query()->distinct()->count('user_id');
        $usersWithSavings = SavingsTransfer::query()->distinct()->count('user_id');

        $featureAdoption = [
            [
                'label' => 'Utilizadores com rendas',
                'count' => $usersWithIncomes,
                'percentage' => $this->toPercentage($usersWithIncomes, $totalUsers),
            ],
            [
                'label' => 'Utilizadores com despesas',
                'count' => $usersWithExpenses,
                'percentage' => $this->toPercentage($usersWithExpenses, $totalUsers),
            ],
            [
                'label' => 'Utilizadores com metas',
                'count' => $usersWithGoals,
                'percentage' => $this->toPercentage($usersWithGoals, $totalUsers),
            ],
            [
                'label' => 'Utilizadores com depósitos na poupança',
                'count' => $usersWithSavings,
                'percentage' => $this->toPercentage($usersWithSavings, $totalUsers),
            ],
        ];

        return [
            'generatedAt' => $now->toIso8601String(),
            'stats' => $stats,
            'series' => $series,
            'activitySeries' => $activitySeries,
            'featureAdoption' => $featureAdoption,
            'goalCompletion' => [
                ['name' => 'Concluídas', 'value' => $completedGoals],
                ['name' => 'Ativas', 'value' => max(0, $totalGoals - $completedGoals)],
            ],
        ];
    }
}
