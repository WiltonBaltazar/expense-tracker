<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\GoalTransferController;
use App\Http\Controllers\IncomeController;
use App\Http\Controllers\Admin\AdminCustomerController;
use App\Http\Controllers\Admin\AdminUserController;
use App\Http\Controllers\Admin\AdminDashboardController;
use App\Http\Controllers\Admin\AdminPlanController;
use App\Http\Controllers\Admin\AdminSubscriptionController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SavingsTransferController;
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
    Route::middleware('feature:dashboard')
        ->get('/dashboard', [DashboardController::class, 'index'])
        ->name('dashboard');

    // Incomes
    Route::middleware('feature:incomes')->group(function () {
        Route::get('/rendas', [IncomeController::class, 'index'])->name('incomes.index');
        Route::post('/rendas', [IncomeController::class, 'store'])->name('incomes.store');
        Route::put('/rendas/{income}', [IncomeController::class, 'update'])->name('incomes.update');
        Route::delete('/rendas/{income}', [IncomeController::class, 'destroy'])->name('incomes.destroy');
    });

    // Expenses
    Route::middleware('feature:expenses')->group(function () {
        Route::get('/despesas', [ExpenseController::class, 'index'])->name('expenses.index');
        Route::post('/despesas', [ExpenseController::class, 'store'])->name('expenses.store');
        Route::put('/despesas/{expense}', [ExpenseController::class, 'update'])->name('expenses.update');
        Route::delete('/despesas/{expense}', [ExpenseController::class, 'destroy'])->name('expenses.destroy');
    });

    // Goals
    Route::middleware('feature:goals')->group(function () {
        Route::get('/metas', [GoalController::class, 'index'])->name('goals.index');
        Route::post('/metas', [GoalController::class, 'store'])->name('goals.store');
        Route::put('/metas/{goal}', [GoalController::class, 'update'])->name('goals.update');
        Route::delete('/metas/{goal}', [GoalController::class, 'destroy'])->name('goals.destroy');
        Route::post('/metas/{goal}/transferir-da-poupanca', [GoalTransferController::class, 'transferFromSavings'])
            ->name('goals.transfer.fromSavings');
        Route::post('/metas/{goal}/devolver-para-poupanca', [GoalTransferController::class, 'transferToSavings'])
            ->name('goals.transfer.toSavings');
        Route::delete('/metas/transferencias/{goalTransfer}', [GoalTransferController::class, 'destroy'])
            ->name('goals.transfer.destroy');
    });

    // Settings
    Route::get('/ajustes', [SettingController::class, 'edit'])->name('settings.edit');
    Route::put('/ajustes', [SettingController::class, 'update'])->name('settings.update');
    Route::post('/ajustes/subscricao/renovar', [SettingController::class, 'renewSubscription'])->name('settings.subscription.renew');

    // Savings transfers
    Route::middleware('feature:savings_wallet')->group(function () {
        Route::post('/economia', [SavingsTransferController::class, 'store'])->name('savings.store');
        Route::delete('/economia/{savingsTransfer}', [SavingsTransferController::class, 'destroy'])->name('savings.destroy');
    });
});

Route::middleware(['auth', 'verified', 'super.admin', 'admin.domain'])
    ->prefix('admin')
    ->name('admin.')
    ->group(function () {
        Route::get('/', fn () => redirect()->route('admin.dashboard'))->name('index');
        Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');
        Route::get('/analytics', [AdminDashboardController::class, 'analytics'])->name('analytics');
        Route::get('/users', [AdminCustomerController::class, 'index'])->name('customers.index');
        Route::get('/subscriptions', [AdminSubscriptionController::class, 'index'])->name('subscriptions.index');
        Route::get('/plans', [AdminPlanController::class, 'index'])->name('plans.index');
        Route::post('/plans', [AdminPlanController::class, 'store'])->name('plans.store');
        Route::put('/plans/{plan}', [AdminPlanController::class, 'update'])->name('plans.update');
        Route::post('/plans/assign-subscription', [AdminPlanController::class, 'assignSubscription'])->name('plans.assignSubscription');
        Route::get('/admin-users', [AdminUserController::class, 'index'])->name('users.index');
        Route::post('/admin-users', [AdminUserController::class, 'store'])->name('users.store');
    });

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
