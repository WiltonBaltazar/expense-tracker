<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Services\FinancialSplitterService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GoalController extends Controller
{
    public function __construct(
        private FinancialSplitterService $splitter
    ) {}

    public function index(Request $request)
    {
        $user = $request->user();
        $user->load(['incomes', 'setting']);

        $allGoals = $user->goals()->orderByDesc('created_at')->get();

        $goals = $allGoals->map(function ($goal) use ($user) {
            $eta = $goal->completed
                ? null
                : $this->splitter->calculateGoalEta($user, $goal->remainingAmount(), (float) $goal->savings_pct);
            $fastTrack = $goal->completed
                ? null
                : $this->splitter->calculateFastTrack($user, $goal->remainingAmount(), 100, (float) $goal->savings_pct);

            return [
                ...$goal->toArray(),
                'progresso' => round($goal->progressPercentage(), 1),
                'restante' => $goal->remainingAmount(),
                'eta' => $eta,
                'fast_track' => $fastTrack,
            ];
        });

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'allocations' => $this->splitter->getBucketAllocations($user),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date|after:today',
        ]);

        $user = $request->user();
        $user->goals()->create($validated);

        $this->redistributeEvenly($user);

        return redirect()->back()->with('success', 'Meta criada com sucesso!');
    }

    public function update(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_amount' => 'required|numeric|min:0.01',
            'current_amount' => 'nullable|numeric|min:0',
            'deadline' => 'nullable|date',
            'completed' => 'nullable|boolean',
        ]);

        $wasActive = !$goal->completed;
        $goal->update($validated);
        $isActive = !$goal->completed;

        // Redistribute if goal was completed or reactivated
        if ($wasActive !== $isActive) {
            $this->redistributeEvenly($goal->user);
        }

        return redirect()->back()->with('success', 'Meta atualizada com sucesso!');
    }

    public function destroy(Goal $goal)
    {
        $this->authorize('delete', $goal);

        $user = $goal->user;
        $wasActive = !$goal->completed;

        $goal->delete();

        if ($wasActive) {
            $this->redistributeEvenly($user);
        }

        return redirect()->back()->with('success', 'Meta removida com sucesso!');
    }

    public function simulate(Request $request)
    {
        $user = $request->user();
        $user->load(['incomes', 'setting']);

        $validated = $request->validate([
            'remaining_amount' => 'required|numeric|min:0.01',
            'redirect_amount' => 'required|numeric|min:0',
            'savings_pct' => 'required|numeric|min:0|max:100',
        ]);

        $fastTrack = $this->splitter->calculateFastTrack(
            $user,
            $validated['remaining_amount'],
            $validated['redirect_amount'],
            $validated['savings_pct']
        );

        return response()->json($fastTrack);
    }

    public function updateAllocations(Request $request)
    {
        $user = $request->user();

        $validated = $request->validate([
            'allocations' => 'required|array',
            'allocations.*.id' => 'required|integer|exists:goals,id',
            'allocations.*.savings_pct' => 'required|numeric|min:0|max:100',
        ]);

        // Verify all goals belong to this user
        $goalIds = collect($validated['allocations'])->pluck('id');
        $userGoalIds = $user->goals()->where('completed', false)->pluck('id');

        if ($goalIds->diff($userGoalIds)->isNotEmpty()) {
            abort(403);
        }

        // Verify percentages sum to ~100
        $totalPct = collect($validated['allocations'])->sum('savings_pct');
        if (abs($totalPct - 100) > 0.5) {
            return response()->json(['error' => 'As porcentagens devem somar 100%.'], 422);
        }

        foreach ($validated['allocations'] as $allocation) {
            Goal::where('id', $allocation['id'])->update([
                'savings_pct' => $allocation['savings_pct'],
            ]);
        }

        return redirect()->back()->with('success', 'Alocacao atualizada com sucesso!');
    }

    private function redistributeEvenly($user): void
    {
        $activeGoals = $user->goals()->where('completed', false)->get();

        if ($activeGoals->isEmpty()) {
            return;
        }

        $pct = round(100 / $activeGoals->count(), 2);

        foreach ($activeGoals as $goal) {
            $goal->update(['savings_pct' => $pct]);
        }
    }
}
