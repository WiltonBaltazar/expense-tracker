<?php

namespace App\Http\Controllers;

use App\Models\SavingsTransfer;
use App\Services\FinancialSplitterService;
use Illuminate\Http\Request;

class SavingsTransferController extends Controller
{
    public function __construct(
        private FinancialSplitterService $splitter
    ) {}

    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'note' => 'nullable|string|max:255',
            'transferred_at' => 'required|date',
        ]);

        $request->user()->savingsTransfers()->create($validated);

        return redirect()->back()->with('success', 'Depósito na poupança registrado com sucesso.');
    }

    public function destroy(Request $request, SavingsTransfer $savingsTransfer)
    {
        $this->authorize('delete', $savingsTransfer);

        $wallet = $this->splitter->getSavingsWallet($request->user());
        $newBalance = round((float) $wallet['available_balance'] - (float) $savingsTransfer->amount, 2);

        if ($newBalance < 0) {
            return redirect()->back()->withErrors([
                'savings' => 'Não pode remover este depósito porque o saldo da poupança ficaria negativo. Reverta transferências de metas primeiro.',
            ]);
        }

        $savingsTransfer->delete();

        return redirect()->back()->with('success', 'Depósito removido com sucesso.');
    }
}
