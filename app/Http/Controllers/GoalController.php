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

        $goals = $user->goals()
            ->orderByDesc('created_at')
            ->get()
            ->map(function (Goal $goal) {
                return [
                    ...$goal->toArray(),
                    'progresso' => round($goal->progressPercentage(), 1),
                    'restante' => $goal->remainingAmount(),
                ];
            })
            ->values();

        return Inertia::render('Goals/Index', [
            'goals' => $goals,
            'savingsWallet' => $this->splitter->getSavingsWallet($user),
            'history' => $this->splitter->getUnifiedSavingsHistory($user, 25),
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

        $validated['current_amount'] = $validated['current_amount'] ?? 0;
        $validated['completed'] = (float) $validated['current_amount'] >= (float) $validated['target_amount'];

        $request->user()->goals()->create($validated);

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

        $validated['current_amount'] = $validated['current_amount'] ?? 0;

        if (! array_key_exists('completed', $validated)) {
            $validated['completed'] = (float) $validated['current_amount'] >= (float) $validated['target_amount'];
        }

        $goal->update($validated);

        return redirect()->back()->with('success', 'Meta atualizada com sucesso!');
    }

    public function destroy(Goal $goal)
    {
        $this->authorize('delete', $goal);

        $goal->delete();

        return redirect()->back()->with('success', 'Meta removida com sucesso!');
    }
}
