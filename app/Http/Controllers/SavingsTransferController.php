<?php

namespace App\Http\Controllers;

use App\Models\SavingsTransfer;
use Illuminate\Http\Request;

class SavingsTransferController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'amount'         => 'required|numeric|min:0.01',
            'note'           => 'nullable|string|max:255',
            'transferred_at' => 'required|date',
        ]);

        $request->user()->savingsTransfers()->create($validated);

        return redirect()->back()->with('success', 'Transferência registrada!');
    }

    public function destroy(Request $request, SavingsTransfer $savingsTransfer)
    {
        $this->authorize('delete', $savingsTransfer);

        $savingsTransfer->delete();

        return redirect()->back()->with('success', 'Transferência removida.');
    }
}
