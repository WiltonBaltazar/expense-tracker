<?php

namespace App\Http\Controllers;

use App\Models\Goal;
use App\Models\GoalTransfer;
use App\Services\FinancialSplitterService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoalTransferController extends Controller
{
    public function __construct(
        private FinancialSplitterService $splitter
    ) {}

    public function transferFromSavings(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'transferred_at' => 'required|date',
            'note' => 'nullable|string|max:255',
        ]);

        $user = $request->user();
        $availableBalance = (float) $this->splitter->getSavingsWallet($user)['available_balance'];
        $requestedAmount = round((float) $validated['amount'], 2);

        if ($requestedAmount > $availableBalance) {
            return redirect()->back()->withErrors([
                'amount' => 'Saldo insuficiente na poupança para esta transferência.',
            ]);
        }

        $remainingAmount = max(0, round((float) $goal->target_amount - (float) $goal->current_amount, 2));

        if ($remainingAmount <= 0) {
            return redirect()->back()->withErrors([
                'amount' => 'Esta meta já foi concluída.',
            ]);
        }

        $transferAmount = min($requestedAmount, $remainingAmount);

        DB::transaction(function () use ($goal, $transferAmount, $validated, $user) {
            GoalTransfer::create([
                'user_id' => $user->id,
                'goal_id' => $goal->id,
                'type' => 'to_goal',
                'amount' => $transferAmount,
                'note' => $validated['note'] ?? null,
                'transferred_at' => $validated['transferred_at'],
            ]);

            $newAmount = round((float) $goal->current_amount + $transferAmount, 2);
            $goal->current_amount = $newAmount;
            $goal->completed = $newAmount >= (float) $goal->target_amount;
            $goal->save();
        });

        $message = $transferAmount < $requestedAmount
            ? 'Transferência concluída. O valor foi ajustado ao restante da meta.'
            : 'Transferência da poupança para a meta realizada com sucesso.';

        return redirect()->back()->with('success', $message);
    }

    public function transferToSavings(Request $request, Goal $goal)
    {
        $this->authorize('update', $goal);

        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'transferred_at' => 'required|date',
            'note' => 'nullable|string|max:255',
        ]);

        $requestedAmount = round((float) $validated['amount'], 2);
        $goalCurrentAmount = round((float) $goal->current_amount, 2);

        if ($requestedAmount > $goalCurrentAmount) {
            return redirect()->back()->withErrors([
                'amount' => 'O valor deve ser menor ou igual ao saldo atual da meta.',
            ]);
        }

        DB::transaction(function () use ($request, $goal, $requestedAmount, $validated) {
            GoalTransfer::create([
                'user_id' => $request->user()->id,
                'goal_id' => $goal->id,
                'type' => 'to_savings',
                'amount' => $requestedAmount,
                'note' => $validated['note'] ?? null,
                'transferred_at' => $validated['transferred_at'],
            ]);

            $newAmount = max(0, round((float) $goal->current_amount - $requestedAmount, 2));
            $goal->current_amount = $newAmount;

            if ($goal->completed && $newAmount < (float) $goal->target_amount) {
                $goal->completed = false;
            }

            $goal->save();
        });

        return redirect()->back()->with('success', 'Valor devolvido da meta para a poupança com sucesso.');
    }

    public function destroy(Request $request, GoalTransfer $goalTransfer)
    {
        $this->authorize('delete', $goalTransfer);

        $wallet = $this->splitter->getSavingsWallet($request->user());
        $goalTransferAmount = round((float) $goalTransfer->amount, 2);

        if ($goalTransfer->type === 'to_savings' && round((float) $wallet['available_balance'] - $goalTransferAmount, 2) < 0) {
            return redirect()->back()->withErrors([
                'history' => 'Não pode remover esta movimentação porque o saldo da poupança ficaria negativo.',
            ]);
        }

        DB::transaction(function () use ($goalTransfer) {
            $goal = $goalTransfer->goal()->lockForUpdate()->first();

            if (! $goal) {
                $goalTransfer->delete();

                return;
            }

            $amount = round((float) $goalTransfer->amount, 2);

            if ($goalTransfer->type === 'to_goal') {
                $newAmount = max(0, round((float) $goal->current_amount - $amount, 2));
                $goal->current_amount = $newAmount;

                if ($goal->completed && $newAmount < (float) $goal->target_amount) {
                    $goal->completed = false;
                }
            } else {
                $newAmount = round((float) $goal->current_amount + $amount, 2);
                $goal->current_amount = $newAmount;

                if (! $goal->completed && $newAmount >= (float) $goal->target_amount) {
                    $goal->completed = true;
                }
            }

            $goal->save();
            $goalTransfer->delete();
        });

        return redirect()->back()->with('success', 'Movimentação removida e saldo atualizado com sucesso.');
    }
}
