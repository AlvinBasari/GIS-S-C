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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('courier_name')->nullable()->after('status');
            $table->string('technician_name')->nullable()->after('courier_name');
            $table->string('payment_status')->default('UNPAID')->after('total_price');
            $table->string('payment_method')->nullable()->after('payment_status');
            $table->text('diagnosis_notes')->nullable()->after('notes');
            $table->timestamp('warranty_until')->nullable()->after('completed_at');
        });

        Schema::table('order_items', function (Blueprint $table) {
            $table->string('brand_model')->nullable()->after('treatment_name');
            $table->string('color')->nullable()->after('brand_model');
            $table->string('material')->nullable()->after('color');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn(['brand_model', 'color', 'material']);
        });

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'courier_name',
                'technician_name',
                'payment_status',
                'payment_method',
                'diagnosis_notes',
                'warranty_until',
            ]);
        });
    }
};
