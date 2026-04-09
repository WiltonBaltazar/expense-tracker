<?php

namespace Database\Seeders;

use App\Models\Expense;
use App\Models\Goal;
use App\Models\Income;
use App\Models\User;
use App\Models\UserSetting;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        // Settings: 50/30/20
        UserSetting::create([
            'user_id' => $user->id,
            'needs_pct' => 50,
            'wants_pct' => 30,
            'savings_pct' => 20,
        ]);

        // Incomes — current month
        $now = Carbon::now();

        Income::create([
            'user_id' => $user->id,
            'source' => 'salario',
            'amount' => 25000,
            'frequency' => 'mensal',
            'description' => 'Salario mensal',
            'received_at' => $now->copy()->startOfMonth()->addDays(24),
        ]);

        Income::create([
            'user_id' => $user->id,
            'source' => 'freelance',
            'amount' => 10000,
            'frequency' => 'mensal',
            'description' => 'Projecto freelance',
            'received_at' => $now->copy()->startOfMonth()->addDays(14),
        ]);

        // Previous month incomes (history)
        $lastMonth = $now->copy()->subMonth();

        Income::create([
            'user_id' => $user->id,
            'source' => 'salario',
            'amount' => 25000,
            'frequency' => 'mensal',
            'description' => 'Salario mensal',
            'received_at' => $lastMonth->copy()->startOfMonth()->addDays(24),
        ]);

        Income::create([
            'user_id' => $user->id,
            'source' => 'freelance',
            'amount' => 8000,
            'frequency' => 'mensal',
            'description' => 'Projecto freelance',
            'received_at' => $lastMonth->copy()->startOfMonth()->addDays(10),
        ]);

        // Recurring expenses
        $recurringExpenses = [
            ['Aluguel', 5000, 'Aluguel', 'necessidades', 'mensal'],
            ['Energia (EDM)', 1200, 'Energia', 'necessidades', 'mensal'],
            ['Agua', 400, 'Agua', 'necessidades', 'mensal'],
            ['Internet', 2500, 'Internet', 'necessidades', 'mensal'],
            ['Telefone', 800, 'Telefone', 'necessidades', 'mensal'],
            ['Dizimo', 3500, 'Dizimo', 'necessidades', 'mensal'],
            ['Netflix', 750, 'Assinaturas', 'desejos', 'mensal'],
            ['Seguro auto', 3000, 'Seguros', 'necessidades', 'trimestral'],
        ];

        foreach ($recurringExpenses as [$desc, $amount, $cat, $bucket, $freq]) {
            Expense::create([
                'user_id' => $user->id,
                'description' => $desc,
                'amount' => $amount,
                'category' => $cat,
                'bucket' => $bucket,
                'spent_at' => $now->copy()->startOfMonth(),
                'is_recurring' => true,
                'frequency' => $freq,
            ]);
        }

        // One-time expenses this month
        $oneTimeExpenses = [
            ['Supermercado Shoprite', 3200, 'Alimentacao', 'necessidades', 3],
            ['Farmacia', 650, 'Farmacia', 'necessidades', 5],
            ['Combustivel', 2000, 'Combustivel', 'necessidades', 2],
            ['Combustivel', 1800, 'Combustivel', 'necessidades', 12],
            ['Restaurante com amigos', 1500, 'Restaurantes', 'desejos', 8],
            ['Roupa nova', 2200, 'Vestuario', 'desejos', 10],
            ['Presente aniversario', 800, 'Presentes', 'desejos', 15],
            ['Mercado semanal', 2800, 'Mercado', 'necessidades', 7],
            ['Mercado semanal', 3100, 'Mercado', 'necessidades', 14],
            ['Ofertas igreja', 500, 'Ofertas', 'necessidades', 6],
        ];

        foreach ($oneTimeExpenses as [$desc, $amount, $cat, $bucket, $day]) {
            Expense::create([
                'user_id' => $user->id,
                'description' => $desc,
                'amount' => $amount,
                'category' => $cat,
                'bucket' => $bucket,
                'spent_at' => $now->copy()->startOfMonth()->addDays($day - 1),
                'is_recurring' => false,
                'frequency' => null,
            ]);
        }

        // Goals
        Goal::create([
            'user_id' => $user->id,
            'name' => 'Reserva de emergencia',
            'target_amount' => 150000,
            'current_amount' => 45000,
            'deadline' => $now->copy()->addMonths(12),
        ]);

        Goal::create([
            'user_id' => $user->id,
            'name' => 'Viagem Zanzibar',
            'target_amount' => 80000,
            'current_amount' => 12000,
            'deadline' => $now->copy()->addMonths(8),
        ]);
    }
}
