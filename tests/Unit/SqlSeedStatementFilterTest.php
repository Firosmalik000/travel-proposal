<?php

namespace Tests\Unit;

use App\Support\SqlSeedStatementFilter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class SqlSeedStatementFilterTest extends TestCase
{
    #[Test]
    public function it_extracts_insert_statements_only(): void
    {
        $sql = implode("\n", [
            '-- comment',
            'CREATE TABLE `users` (`id` bigint);',
            'INSERT INTO `users` VALUES (1, \'admin\');',
            'INSERT INTO `menus` VALUES (2, \'Booking Register\', \'booking_register\');',
        ]);

        $statements = SqlSeedStatementFilter::extractInsertStatements($sql);

        $this->assertCount(2, $statements);
        $this->assertStringContainsString('INSERT INTO `users`', $statements[0]);
        $this->assertStringContainsString('INSERT INTO `menus`', $statements[1]);
    }

    #[Test]
    public function it_can_resolve_table_names(): void
    {
        $table = SqlSeedStatementFilter::resolveTableName('INSERT INTO `menus` VALUES (1, \'Dashboard\');');

        $this->assertSame('menus', $table);
    }

    #[Test]
    public function it_filters_excluded_tables_and_menu_keys(): void
    {
        $excludedTables = ['activity_logs'];
        $excludedMenuKeys = ['booking_register', 'booking_listing', 'booking_custom_requests'];

        $this->assertFalse(SqlSeedStatementFilter::shouldSeedStatement(
            'INSERT INTO `activity_logs` VALUES (1, \'x\');',
            $excludedTables,
            $excludedMenuKeys
        ));

        $this->assertFalse(SqlSeedStatementFilter::shouldSeedStatement(
            'INSERT INTO `menus` VALUES (1, \'Register\', \'booking_register\');',
            $excludedTables,
            $excludedMenuKeys
        ));

        $this->assertTrue(SqlSeedStatementFilter::shouldSeedStatement(
            'INSERT INTO `menus` VALUES (1, \'Dashboard\', \'dashboard\');',
            $excludedTables,
            $excludedMenuKeys
        ));
    }
}
