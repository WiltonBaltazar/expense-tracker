<?php

namespace App\Policies;

use App\Models\GoalTransfer;
use App\Models\User;

class GoalTransferPolicy
{
    public function delete(User $user, GoalTransfer $goalTransfer): bool
    {
        return $user->id === $goalTransfer->user_id;
    }
}
