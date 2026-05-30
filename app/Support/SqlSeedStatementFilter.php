<?php

namespace App\Support;

class SqlSeedStatementFilter
{
    /**
     * @return array<int, string>
     */
    public static function extractInsertStatements(string $sqlDump): array
    {
        $statements = [];
        $lines = preg_split('/\r\n|\r|\n/', $sqlDump) ?: [];

        foreach ($lines as $line) {
            $trimmedLine = trim($line);
            if (! str_starts_with($trimmedLine, 'INSERT INTO ')) {
                continue;
            }

            $statements[] = $trimmedLine;
        }

        return $statements;
    }

    public static function resolveTableName(string $insertStatement): ?string
    {
        if (! preg_match('/^INSERT INTO `([^`]+)` /', $insertStatement, $matches)) {
            return null;
        }

        return $matches[1] ?? null;
    }

    /**
     * @param  array<int, string>  $excludedTables
     * @param  array<int, string>  $excludedMenuKeys
     */
    public static function shouldSeedStatement(string $insertStatement, array $excludedTables, array $excludedMenuKeys): bool
    {
        $tableName = self::resolveTableName($insertStatement);
        if ($tableName === null) {
            return false;
        }

        if (in_array($tableName, $excludedTables, true)) {
            return false;
        }

        if ($tableName !== 'menus') {
            return true;
        }

        foreach ($excludedMenuKeys as $excludedMenuKey) {
            if (str_contains($insertStatement, "'".$excludedMenuKey."'")) {
                return false;
            }
        }

        return true;
    }
}
