<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\SavingsTransferController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Incomes
    Route::get('/rendas', [IncomeController::class, 'index'])->name('incomes.index');
    Route::post('/rendas', [IncomeController::class, 'store'])->name('incomes.store');
    Route::put('/rendas/{income}', [IncomeController::class, 'update'])->name('incomes.update');
    Route::delete('/rendas/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');

    // Expenses
    Route::get('/despesas', [ExpenseController::class, 'index'])->name('expenses.index');
    Route::post('/despesas', [ExpenseController::class, 'store'])->name('expenses.store');
    Route::put('/despesas/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
    Route::delete('/despesas/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');

    // Goals
    Route::get('/metas', [GoalController::class, 'index'])->name('goals.index');
    Route::post('/metas', [GoalController::class, 'store'])->name('goals.store');
    Route::put('/metas/{goal}', [GoalController::class, 'update'])->name('goals.update');
    Route::delete('/metas/{goal}', [GoalController::class, 'destroy'])->name('goals.destroy');
    Route::post('/metas/simular', [GoalController::class, 'simulate'])->name('goals.simulate');
    Route::put('/metas-alocacao', [GoalController::class, 'updateAllocations'])->name('goals.allocations');

    // Settings
    Route::get('/ajustes', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/ajustes', [SettingController::class, 'update'])->name('settings.update');

    // Savings transfers
    Route::post('/economia', [SavingsTransferController::class, 'store'])->name('savings.store');
    Route::delete('/economia/{savingsTransfer}', [SavingsTransferController::class, 'destroy'])->name('savings.destroy');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
