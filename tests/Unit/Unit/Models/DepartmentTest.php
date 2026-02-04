<?php

namespace Tests\Unit\Models;

use App\Models\Department;
use App\Models\Jabatan;
use App\Models\MasterKaryawan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DepartmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_department_has_many_jabatan()
    {
        $department = Department::factory()->create();
        Jabatan::factory()->count(3)->create(['department_id' => $department->id]);

        $this->assertCount(3, $department->jabatan);
        $this->assertInstanceOf(Jabatan::class, $department->jabatan->first());
    }

    public function test_department_has_many_karyawan()
    {
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        MasterKaryawan::factory()->count(5)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id
        ]);

        $this->assertCount(5, $department->karyawan);
        $this->assertInstanceOf(MasterKaryawan::class, $department->karyawan->first());
    }

    public function test_department_has_correct_fillable_attributes()
    {
        $department = new Department();

        $fillable = $department->getFillable();

        $this->assertContains('code', $fillable);
        $this->assertContains('name', $fillable);
        $this->assertContains('description', $fillable);
        $this->assertContains('is_active', $fillable);
    }

    public function test_department_casts_is_active_to_boolean()
    {
        $department = Department::factory()->create(['is_active' => 1]);

        $this->assertIsBool($department->is_active);
        $this->assertTrue($department->is_active);
    }

    public function test_department_can_be_created_with_valid_data()
    {
        $department = Department::factory()->create([
            'code' => 'IT',
            'name' => 'Information Technology',
            'description' => 'IT Department',
            'is_active' => true
        ]);

        $this->assertDatabaseHas('departments', [
            'code' => 'IT',
            'name' => 'Information Technology'
        ]);
    }
}
