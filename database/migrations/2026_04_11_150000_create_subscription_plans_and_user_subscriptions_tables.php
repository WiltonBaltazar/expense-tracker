<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->decimal('price_monthly', 12, 2)->default(0);
            $table->string('currency', 3)->default('MZN');
            $table->string('billing_interval')->default('monthly');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_free')->default(false);
            $table->json('features')->nullable();
            $table->timestamps();
        });

        Schema::create('user_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subscription_plan_id')->nullable()->constrained('subscription_plans')->nullOnDelete();
            $table->string('status')->default('active');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('renews_at')->nullable();
            $table->timestamp('trial_ends_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->timestamp('canceled_at')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->unique('user_id');
            $table->index('status');
            $table->index('started_at');
            $table->index('subscription_plan_id');
        });

        $now = now();
        $defaultFeatures = json_encode([
            'dashboard' => true,
            'incomes' => true,
            'expenses' => true,
            'goals' => true,
            'savings_wallet' => true,
        ]);

        $freePlanId = DB::table('subscription_plans')
            ->where('code', 'gratis')
            ->value('id');

        if (! $freePlanId) {
            $freePlanId = DB::table('subscription_plans')->insertGetId([
                'code' => 'gratis',
                'name' => 'Gratis',
                'description' => 'Plano gratuito com todas as funcionalidades disponíveis.',
                'price_monthly' => 0,
                'currency' => 'MZN',
                'billing_interval' => 'monthly',
                'is_active' => true,
                'is_free' => true,
                'features' => $defaultFeatures,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        DB::table('users')
            ->select(['id', 'subscribed_at', 'created_at'])
            ->orderBy('id')
            ->chunkById(500, function ($users) use ($freePlanId, $now): void {
                $ids = collect($users)->pluck('id')->all();
                $existingIds = DB::table('user_subscriptions')
                    ->whereIn('user_id', $ids)
                    ->pluck('user_id')
                    ->all();

                $existingLookup = array_flip($existingIds);
                $records = [];

                foreach ($users as $user) {
                    if (array_key_exists($user->id, $existingLookup)) {
                        continue;
                    }

                    $startedAt = $user->subscribed_at ?? $user->created_at ?? $now;

                    $records[] = [
                        'user_id' => $user->id,
                        'subscription_plan_id' => $freePlanId,
                        'status' => 'active',
                        'started_at' => $startedAt,
                        'created_at' => $now,
                        'updated_at' => $now,
                    ];
                }

                if (! empty($records)) {
                    DB::table('user_subscriptions')->insert($records);
                }
            });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_subscriptions');
        Schema::dropIfExists('subscription_plans');
    }
};
