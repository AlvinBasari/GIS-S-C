<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->text('gmaps_opening_hours_text')->nullable()->after('weekend_close_hour');
            $table->json('operating_hours_daily')->nullable()->after('gmaps_opening_hours_text');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['gmaps_opening_hours_text', 'operating_hours_daily']);
        });
    }
};
