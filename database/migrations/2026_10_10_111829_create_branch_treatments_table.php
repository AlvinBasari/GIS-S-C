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
        Schema::create('branch_treatments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('branches')->cascadeOnDelete();
            $table->foreignId('master_treatment_id')->nullable()->constrained('master_treatments')->nullOnDelete();
            $table->enum('treatment_type', ['UMUM', 'KHUSUS'])->default('UMUM');
            $table->string('name');
            $table->string('category');
            $table->text('description');
            $table->decimal('price', 12, 2);
            $table->string('est_duration');
            $table->boolean('is_available')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->string('badge_label')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_treatments');
    }
};
