<?php

declare(strict_types=1);

namespace Tests\Unit;

use PHPUnit\Framework\TestCase;

class LandingEditorUxTest extends TestCase
{
    public function test_landing_editor_has_homepage_section_navigation_and_collapsible_sections(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/LandingPromoEditor.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('Landing Promo Editor (/landing)', $contents);
        $this->assertStringContainsString('Navigasi Cepat Section Landing', $contents);
        $this->assertStringContainsString('Section 01', $contents);
        $this->assertStringContainsString("{isOpen ? 'Tutup' : 'Buka'}", $contents);
        $this->assertStringContainsString('Hero Promo', $contents);
        $this->assertStringContainsString('Paket Pilihan Landing', $contents);
        $this->assertStringContainsString('Termasuk / Tidak Termasuk', $contents);
        $this->assertStringContainsString('Preview', $contents);
        $this->assertStringNotContainsString('Navigasi Landing', $contents);
        $this->assertStringNotContainsString('Footer Landing', $contents);
    }

    public function test_landing_keunggulan_last_item_is_not_locked_from_deletion(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/LandingPromoEditor.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('Tambah Benefit', $contents);
        $this->assertStringContainsString("'reasons.items'", $contents);
        $this->assertStringNotContainsString('disabled={reasonItems.length <= 1}', $contents);
    }

    public function test_landing_promo_editor_exposes_pricing_and_location_sections(): void
    {
        $path = __DIR__.'/../../resources/js/pages/Dashboard/WebsiteManagement/Landing/LandingPromoEditor.tsx';

        $this->assertFileExists($path);

        $contents = file_get_contents($path);

        $this->assertNotFalse($contents);
        $this->assertStringContainsString('Tambah Kartu Harga', $contents);
        $this->assertStringContainsString('Lokasi Kantor', $contents);
        $this->assertStringContainsString('CTA Penutup', $contents);
        $this->assertStringContainsString('Belum ada paket dipilih.', $contents);
        $this->assertStringContainsString('Judul Kecil Testimoni', $contents);
        $this->assertStringContainsString('Judul Tengah', $contents);
        $this->assertStringContainsString('Badge Kecil CTA', $contents);
        $this->assertStringContainsString('Pill Promo Atas', $contents);
        $this->assertStringContainsString('Poin Kepercayaan Hero', $contents);
        $this->assertStringContainsString('Tambah Poin', $contents);
        $this->assertStringContainsString('Belum ada poin kepercayaan.', $contents);
        $this->assertStringContainsString('hero.checklist_items', $contents);
        $this->assertStringNotContainsString("content.hero.checklist_items.join('\\n')", $contents);
        $this->assertStringContainsString('Badge Kecil Sub Judul', $contents);
        $this->assertStringContainsString('Badge Kecil Section', $contents);
        $this->assertStringContainsString('Judul Besar Section', $contents);
        $this->assertStringContainsString('Judul Besar Galeri', $contents);
        $this->assertStringContainsString('Catatan Kecil', $contents);
    }
}
