<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->enum('frequency_new', [
                'semanal', 'quinzenal', 'mensal', 'bimestral', 'trimestral', 'semestral', 'anual', 'unico',
            ])->default('mensal')->after('frequency');
        });

        DB::table('incomes')->update(['frequency_new' => DB::raw('frequency')]);

        Schema::table('incomes', function (Blueprint $table) {
            $table->dropColumn('frequency');
        });

        Schema::table('incomes', function (Blueprint $table) {
            $table->renameColumn('frequency_new', 'frequency');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('incomes', function (Blueprint $table) {
            $table->enum('frequency_old', [
                'mensal', 'semanal', 'quinzenal', 'anual', 'unico',
            ])->default('mensal')->after('frequency');
        });

        DB::table('incomes')->update(['frequency_old' => DB::raw('frequency')]);

        Schema::table('incomes', function (Blueprint $table) {
            $table->dropColumn('frequency');
        });

        Schema::table('incomes', function (Blueprint $table) {
            $table->renameColumn('frequency_old', 'frequency');
        });
    }
};
