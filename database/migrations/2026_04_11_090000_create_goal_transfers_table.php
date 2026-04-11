<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('goal_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('goal_id')->constrained()->cascadeOnDelete();
            $table->string('type', 20);
            $table->decimal('amount', 12, 2);
            $table->string('note')->nullable();
            $table->date('transferred_at');
            $table->timestamps();
        });

        if (! Schema::hasTable('goal_savings_allocations')) {
            return;
        }

        $rows = DB::table('goal_savings_allocations')
            ->select([
                'user_id',
                'goal_id',
                'amount',
                'allocated_at',
                'created_at',
                'updated_at',
            ])
            ->orderBy('id')
            ->get();

        foreach ($rows as $row) {
            DB::table('goal_transfers')->insert([
                'user_id' => $row->user_id,
                'goal_id' => $row->goal_id,
                'type' => 'to_goal',
                'amount' => $row->amount,
                'note' => null,
                'transferred_at' => $row->allocated_at,
                'created_at' => $row->created_at ?? now(),
                'updated_at' => $row->updated_at ?? now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('goal_transfers');
    }
};
