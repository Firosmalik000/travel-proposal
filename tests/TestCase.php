<?php

namespace Tests;

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use RuntimeException;

abstract class TestCase extends BaseTestCase
{
    public function createApplication(): Application
    {
        $testingConfigCache = dirname(__DIR__).'/bootstrap/cache/config.testing.php';

        putenv("APP_CONFIG_CACHE={$testingConfigCache}");
        $_ENV['APP_CONFIG_CACHE'] = $testingConfigCache;
        $_SERVER['APP_CONFIG_CACHE'] = $testingConfigCache;

        $application = parent::createApplication();
        $connection = (string) $application['config']->get('database.default');
        $database = (string) $application['config']->get("database.connections.{$connection}.database");

        if ($database !== 'travel_propposal_codex_testing') {
            throw new RuntimeException(
                "Test dibatalkan: koneksi database aktif '{$database}' bukan database testing yang diizinkan.",
            );
        }

        return $application;
    }

    protected function setUp(): void
    {
        parent::setUp();
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }
}
