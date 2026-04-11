<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_super_admin')->default(false)->after('subscribed_at');
            $table->string('admin_domain')->nullable()->after('is_super_admin');

            $table->index('is_super_admin');
            $table->index('admin_domain');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex(['is_super_admin']);
            $table->dropIndex(['admin_domain']);
            $table->dropColumn(['is_super_admin', 'admin_domain']);
        });
    }
};
