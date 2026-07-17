<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->text('office_hours')->nullable()->after('fee_notes');
            $table->text('contact_intro')->nullable()->after('office_hours');
            $table->string('footer_tagline')->nullable()->after('contact_intro');
            $table->json('nav_menu')->nullable()->after('footer_tagline');
            $table->json('home_ctas')->nullable()->after('nav_menu');
            $table->json('home_sections')->nullable()->after('home_ctas');
            $table->json('facility_items')->nullable()->after('home_sections');
        });
    }

    public function down(): void
    {
        Schema::table('institutions', function (Blueprint $table) {
            $table->dropColumn([
                'office_hours',
                'contact_intro',
                'footer_tagline',
                'nav_menu',
                'home_ctas',
                'home_sections',
                'facility_items',
            ]);
        });
    }
};
