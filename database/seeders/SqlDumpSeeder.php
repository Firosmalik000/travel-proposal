<?php

namespace Database\Seeders;

use App\Support\SqlSeedStatementFilter;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class SqlDumpSeeder extends Seeder
{
    /**
     * @var array<int, string>
     */
    private array $excludedTables = [
        'activity_logs',
        'cache',
        'failed_jobs',
        'job_batches',
        'jobs',
        'migrations',
        'password_reset_tokens',
        'sessions',
    ];

    public function run(): void
    {
        $sqlDumpPath = database_path('seeders/data/travel-propasal-data.sql');
        if (! is_file($sqlDumpPath)) {
            throw new RuntimeException('SQL dump file not found: '.$sqlDumpPath);
        }

        $sqlDump = file_get_contents($sqlDumpPath);
        if ($sqlDump === false) {
            throw new RuntimeException('Failed to read SQL dump file: '.$sqlDumpPath);
        }

        $insertStatements = SqlSeedStatementFilter::extractInsertStatements($sqlDump);
        $tablesToSeed = [];
        foreach ($insertStatements as $insertStatement) {
            if (! SqlSeedStatementFilter::shouldSeedStatement($insertStatement, $this->excludedTables, [])) {
                continue;
            }

            $tableName = SqlSeedStatementFilter::resolveTableName($insertStatement);
            if ($tableName === null) {
                continue;
            }

            $tablesToSeed[$tableName] = true;
        }

        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        foreach (array_keys($tablesToSeed) as $tableToSeed) {
            DB::table($tableToSeed)->truncate();
        }

        foreach ($insertStatements as $insertStatement) {
            if (! SqlSeedStatementFilter::shouldSeedStatement($insertStatement, $this->excludedTables, [])) {
                continue;
            }

            DB::statement($insertStatement);
        }
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
    }
}
