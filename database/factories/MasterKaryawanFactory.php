<?php

namespace Database\Factories;

use App\Models\MasterKaryawan;
use App\Models\User;
use App\Models\Department;
use App\Models\Jabatan;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\MasterKaryawan>
 */
class MasterKaryawanFactory extends Factory
{
    protected $model = MasterKaryawan::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'nik' => $this->faker->unique()->numerify('########'),
            'nama_lengkap' => $this->faker->name(),
            'nama_panggilan' => $this->faker->firstName(),
            'gender' => $this->faker->randomElement(['L', 'P']),
            'tempat_lahir' => $this->faker->city(),
            'tanggal_lahir' => $this->faker->date(),
            'alamat' => $this->faker->address(),
            'agama' => $this->faker->randomElement(['Islam', 'Kristen', 'Katolik', 'Hindu', 'Buddha']),
            'status_pernikahan' => $this->faker->randomElement(['Belum Menikah', 'Menikah', 'Cerai']),
            'email' => $this->faker->unique()->safeEmail(),
            'no_telp' => $this->faker->phoneNumber(),
            'department_id' => Department::factory(),
            'jabatan_id' => Jabatan::factory(),
            'tanggal_mulai_bekerja' => $this->faker->date(),
            'status_karyawan' => $this->faker->randomElement(['tetap', 'kontrak', 'magang']),
            'is_active' => true,
            'created_by' => 1,
            'updated_by' => 1,
        ];
    }
}
