<?php

namespace Tests\Feature;

use App\Models\GoalTransfer;
use App\Models\SavingsTransfer;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class GoalsSavingsAllocationTest extends TestCase
{
    use RefreshDatabase;

    public function test_deposit_to_savings_increases_wallet_and_does_not_change_goal_balance(): void
    {
        $user = User::factory()->create();
        $goal = $user->goals()->create([
            'name' => 'Reserva',
            'target_amount' => 1000,
            'current_amount' => 100,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 500,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $goal->refresh();
        $this->assertSame('100.00', $goal->current_amount);
        $this->assertDatabaseCount('savings_transfers', 1);

        $this->actingAs($user)->get('/metas')
            ->assertInertia(fn (Assert $page) => $page
                ->where('savingsWallet.available_balance', 500)
                ->where('savingsWallet.total_deposited', 500)
                ->where('savingsWallet.total_in_goals', 0));
    }

    public function test_savings_to_goal_transfer_updates_wallet_and_goal_completion(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta A',
            'target_amount' => 300,
            'current_amount' => 100,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 500,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 200,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $goal->refresh();
        $this->assertSame('300.00', $goal->current_amount);
        $this->assertTrue($goal->completed);

        $this->actingAs($user)->get('/metas')
            ->assertInertia(fn (Assert $page) => $page
                ->where('savingsWallet.available_balance', 300)
                ->where('savingsWallet.total_in_goals', 200));
    }

    public function test_transfer_to_goal_caps_at_goal_remaining_and_keeps_leftover_in_wallet(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta Cap',
            'target_amount' => 250,
            'current_amount' => 100,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 500,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 400,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $goal->refresh();
        $this->assertSame('250.00', $goal->current_amount);
        $this->assertTrue($goal->completed);
        $this->assertDatabaseHas('goal_transfers', [
            'goal_id' => $goal->id,
            'type' => 'to_goal',
            'amount' => 150,
        ]);

        $this->actingAs($user)->get('/metas')
            ->assertInertia(fn (Assert $page) => $page
                ->where('savingsWallet.available_balance', 350)
                ->where('savingsWallet.total_in_goals', 150));
    }

    public function test_transfer_to_goal_is_rejected_when_amount_exceeds_wallet_balance(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta Sem Saldo',
            'target_amount' => 1000,
            'current_amount' => 0,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 100,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 150,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertSessionHasErrors('amount');

        $goal->refresh();
        $this->assertSame('0.00', $goal->current_amount);
        $this->assertDatabaseCount('goal_transfers', 0);
    }

    public function test_goal_to_savings_transfer_reopens_completed_goal_when_needed(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta Completa',
            'target_amount' => 300,
            'current_amount' => 0,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 300,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 300,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/devolver-para-poupanca", [
            'amount' => 100,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $goal->refresh();
        $this->assertSame('200.00', $goal->current_amount);
        $this->assertFalse($goal->completed);

        $this->actingAs($user)->get('/metas')
            ->assertInertia(fn (Assert $page) => $page
                ->where('savingsWallet.available_balance', 100)
                ->where('savingsWallet.total_in_goals', 200));
    }

    public function test_deleting_goal_transfer_recalculates_goal_and_wallet_balances(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta Delete',
            'target_amount' => 1000,
            'current_amount' => 0,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 500,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 200,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $transfer = GoalTransfer::query()->firstOrFail();

        $this->actingAs($user)->delete("/metas/transferencias/{$transfer->id}")
            ->assertRedirect();

        $goal->refresh();
        $this->assertSame('0.00', $goal->current_amount);
        $this->assertFalse($goal->completed);
        $this->assertDatabaseCount('goal_transfers', 0);

        $this->actingAs($user)->get('/metas')
            ->assertInertia(fn (Assert $page) => $page
                ->where('savingsWallet.available_balance', 500)
                ->where('savingsWallet.total_in_goals', 0));
    }

    public function test_deleting_savings_deposit_is_blocked_when_it_would_make_wallet_negative(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta Protegida',
            'target_amount' => 500,
            'current_amount' => 0,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 500,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 400,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $deposit = SavingsTransfer::query()->firstOrFail();

        $this->actingAs($user)->delete("/economia/{$deposit->id}")
            ->assertSessionHasErrors('savings');

        $this->assertDatabaseHas('savings_transfers', ['id' => $deposit->id]);
    }

    public function test_goals_page_returns_wallet_and_history_props_without_old_allocation_props(): void
    {
        $user = User::factory()->create();

        $goal = $user->goals()->create([
            'name' => 'Meta História',
            'target_amount' => 1000,
            'current_amount' => 0,
            'completed' => false,
        ]);

        $this->actingAs($user)->post('/economia', [
            'amount' => 200,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $this->actingAs($user)->post("/metas/{$goal->id}/transferir-da-poupanca", [
            'amount' => 100,
            'transferred_at' => Carbon::now()->toDateString(),
        ])->assertRedirect();

        $response = $this->actingAs($user)->get('/metas');

        $response->assertOk();
        $response->assertInertia(fn (Assert $page) => $page
            ->component('Goals/Index')
            ->has('savingsWallet')
            ->where('savingsWallet.available_balance', 100)
            ->where('savingsWallet.total_deposited', 200)
            ->where('savingsWallet.total_in_goals', 100)
            ->has('history', 2)
            ->missing('goalSavingsPool')
            ->missing('allocations'));
    }
}
