<?php

namespace App\Policies;

use App\Models\BudgetLimit;
use App\Models\User;

class BudgetLimitPolicy
{
    public function update(User $user, BudgetLimit $budgetLimit): bool
    {
        return $user->id === $budgetLimit->user_id;
    }

    public function delete(User $user, BudgetLimit $budgetLimit): bool
    {
        return $user->id === $budgetLimit->user_id;
    }
}
