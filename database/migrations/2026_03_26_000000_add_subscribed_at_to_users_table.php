<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->timestamp('subscribed_at')->nullable()->after('email_verified_at');
        });

        // Set subscribed_at for existing users to their created_at date
        DB::table('users')->whereNull('subscribed_at')->update([
            'subscribed_at' => DB::raw('created_at'),
        ]);
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('subscribed_at');
        });
    }
};
