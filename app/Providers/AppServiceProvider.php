<?php

namespace App\Providers;

use App\Models\User;
use App\Services\ActivityLogService;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * @var array<string, array<int, string>>
     */
    private static array $tableColumnsCache = [];

    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::before(function (User $user): ?bool {
            return $user->isSuperAdmin() ? true : null;
        });

        Event::listen(Login::class, function (Login $event): void {
            $request = request();
            if (! $request instanceof Request) {
                return;
            }

            app(ActivityLogService::class)->log([
                'user_id' => $event->user->id,
                'event_type' => 'login',
                'module' => 'auth',
                'menu_key' => null,
                'method' => $request->method(),
                'route_name' => $request->route()?->getName(),
                'url' => $request->path(),
                'description' => 'User login ke sistem.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        Event::listen(Logout::class, function (Logout $event): void {
            $request = request();
            if (! $request instanceof Request) {
                return;
            }

            app(ActivityLogService::class)->log([
                'user_id' => $event->user?->id,
                'event_type' => 'logout',
                'module' => 'auth',
                'menu_key' => null,
                'method' => $request->method(),
                'route_name' => $request->route()?->getName(),
                'url' => $request->path(),
                'description' => 'User logout dari sistem.',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]);
        });

        Model::creating(function (Model $model): void {
            $user = auth()->user();
            if (! $user) {
                return;
            }

            if ($this->tableHasColumn($model, 'created_by') && ! $model->getAttribute('created_by')) {
                $model->setAttribute('created_by', $user->getAuthIdentifier());
            }

            if ($this->tableHasColumn($model, 'updated_by') && ! $model->getAttribute('updated_by')) {
                $model->setAttribute('updated_by', $user->getAuthIdentifier());
            }
        });

        Model::updating(function (Model $model): void {
            $user = auth()->user();
            if (! $user) {
                return;
            }

            if ($this->tableHasColumn($model, 'updated_by')) {
                $model->setAttribute('updated_by', $user->getAuthIdentifier());
            }
        });
    }

    private function tableHasColumn(Model $model, string $column): bool
    {
        $connectionName = $model->getConnectionName() ?? config('database.default');
        $table = $model->getTable();
        $cacheKey = $connectionName.':'.$table;

        if (! array_key_exists($cacheKey, self::$tableColumnsCache)) {
            self::$tableColumnsCache[$cacheKey] = Schema::connection($connectionName)->getColumnListing($table);
        }

        return in_array($column, self::$tableColumnsCache[$cacheKey], true);
    }
}
