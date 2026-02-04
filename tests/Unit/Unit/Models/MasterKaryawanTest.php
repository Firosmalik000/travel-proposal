<?php

namespace Tests\Unit\Models;

use App\Models\MasterKaryawan;
use App\Models\User;
use App\Models\Department;
use App\Models\Jabatan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class MasterKaryawanTest extends TestCase
{
    use RefreshDatabase;

    public function test_master_karyawan_belongs_to_user()
    {
        $user = User::factory()->create();
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        $karyawan = MasterKaryawan::factory()->create([
            'user_id' => $user->id,
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id
        ]);

        $this->assertInstanceOf(User::class, $karyawan->user);
        $this->assertEquals($user->id, $karyawan->user->id);
    }

    public function test_master_karyawan_belongs_to_department()
    {
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        $karyawan = MasterKaryawan::factory()->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id
        ]);

        $this->assertInstanceOf(Department::class, $karyawan->department);
        $this->assertEquals($department->id, $karyawan->department->id);
    }

    public function test_master_karyawan_belongs_to_jabatan()
    {
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        $karyawan = MasterKaryawan::factory()->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id
        ]);

        $this->assertInstanceOf(Jabatan::class, $karyawan->jabatan);
        $this->assertEquals($jabatan->id, $karyawan->jabatan->id);
    }

    public function test_master_karyawan_can_be_filtered_by_department()
    {
        $department1 = Department::factory()->create();
        $department2 = Department::factory()->create();
        $jabatan1 = Jabatan::factory()->create(['department_id' => $department1->id]);
        $jabatan2 = Jabatan::factory()->create(['department_id' => $department2->id]);

        MasterKaryawan::factory()->count(3)->create([
            'department_id' => $department1->id,
            'jabatan_id' => $jabatan1->id
        ]);

        MasterKaryawan::factory()->count(2)->create([
            'department_id' => $department2->id,
            'jabatan_id' => $jabatan2->id
        ]);

        $karyawanDept1 = MasterKaryawan::byDepartment($department1->id)->get();

        $this->assertCount(3, $karyawanDept1);
    }

    public function test_master_karyawan_can_be_filtered_by_jabatan()
    {
        $department = Department::factory()->create();
        $jabatan1 = Jabatan::factory()->create(['department_id' => $department->id]);
        $jabatan2 = Jabatan::factory()->create(['department_id' => $department->id]);

        MasterKaryawan::factory()->count(3)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan1->id
        ]);

        MasterKaryawan::factory()->count(2)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan2->id
        ]);

        $karyawanJabatan1 = MasterKaryawan::byJabatan($jabatan1->id)->get();

        $this->assertCount(3, $karyawanJabatan1);
    }

    public function test_master_karyawan_can_be_filtered_by_status()
    {
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        MasterKaryawan::factory()->count(3)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'status_karyawan' => 'tetap'
        ]);

        MasterKaryawan::factory()->count(2)->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'status_karyawan' => 'kontrak'
        ]);

        $karyawanTetap = MasterKaryawan::byStatus('tetap')->get();

        $this->assertCount(3, $karyawanTetap);
    }

    public function test_master_karyawan_has_correct_fillable_attributes()
    {
        $karyawan = new MasterKaryawan();

        $fillable = $karyawan->getFillable();

        $this->assertContains('user_id', $fillable);
        $this->assertContains('nik', $fillable);
        $this->assertContains('nama_lengkap', $fillable);
        $this->assertContains('department_id', $fillable);
        $this->assertContains('jabatan_id', $fillable);
        $this->assertContains('is_active', $fillable);
    }

    public function test_master_karyawan_casts_dates_correctly()
    {
        $department = Department::factory()->create();
        $jabatan = Jabatan::factory()->create(['department_id' => $department->id]);

        $karyawan = MasterKaryawan::factory()->create([
            'department_id' => $department->id,
            'jabatan_id' => $jabatan->id,
            'tanggal_lahir' => '1990-01-01',
            'tanggal_mulai_bekerja' => '2020-01-01'
        ]);

        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $karyawan->tanggal_lahir);
        $this->assertInstanceOf(\Illuminate\Support\Carbon::class, $karyawan->tanggal_mulai_bekerja);
    }
}
