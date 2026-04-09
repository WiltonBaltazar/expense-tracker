<?php

namespace App\Policies;

use App\Models\SavingsTransfer;
use App\Models\User;

class SavingsTransferPolicy
{
    public function delete(User $user, SavingsTransfer $savingsTransfer): bool
    {
        return $user->id === $savingsTransfer->user_id;
    }
}
