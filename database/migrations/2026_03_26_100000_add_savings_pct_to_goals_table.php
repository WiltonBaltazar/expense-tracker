<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->decimal('savings_pct', 5, 2)->default(0)->after('completed');
        });

        // Distribute evenly among active goals per user
        $users = DB::table('goals')
            ->where('completed', false)
            ->select('user_id')
            ->distinct()
            ->pluck('user_id');

        foreach ($users as $userId) {
            $activeGoals = DB::table('goals')
                ->where('user_id', $userId)
                ->where('completed', false)
                ->pluck('id');

            if ($activeGoals->isNotEmpty()) {
                $pct = round(100 / $activeGoals->count(), 2);
                DB::table('goals')
                    ->whereIn('id', $activeGoals)
                    ->update(['savings_pct' => $pct]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropColumn('savings_pct');
        });
    }
};
