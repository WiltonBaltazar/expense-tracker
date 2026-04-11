<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->string('event_type', 60);
            $table->string('status', 40)->nullable();
            $table->decimal('amount', 12, 2)->nullable();
            $table->string('currency', 3)->nullable();
            $table->string('note')->nullable();
            $table->timestamp('occurred_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'occurred_at']);
            $table->index('event_type');
        });

        $now = now();

        DB::table('user_subscriptions')
            ->select(['id', 'user_id', 'subscription_plan_id', 'status', 'started_at', 'created_at'])
            ->orderBy('id')
            ->chunkById(500, function ($subscriptions) use ($now): void {
                $records = [];

                foreach ($subscriptions as $subscription) {
                    $records[] = [
                        'user_id' => $subscription->user_id,
                        'subscription_plan_id' => $subscription->subscription_plan_id,
                        'event_type' => 'plan_assigned_backfill',
                        'status' => $subscription->status,
                        'note' => 'Evento inicial migrado do registo atual de subscrição.',
                        'occurred_at' => $subscription->started_at ?? $subscription->created_at ?? $now,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (! empty($records)) {
                    DB::table('subscription_events')->insert($records);
                }
            }, 'id');
    }

    public function down(): void
    {
        Schema::dropIfExists('subscription_events');
    }
};
