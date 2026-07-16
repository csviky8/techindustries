<?php

namespace App\Providers;

use Illuminate\Database\Connection;
use Illuminate\Database\Connectors\PostgresConnector;
use Illuminate\Support\ServiceProvider;
use PDO;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        if (env('DB_PGSQL_OPTIONS')) {
            $this->app->bind('db.connector.pgsql', function () {
                return new class extends PostgresConnector {
                    public function connect(array $config): PDO
                    {
                        $dsn = $this->getDsn($config);
                        $dsn .= ';options=' . env('DB_PGSQL_OPTIONS');
                        $options = $this->getOptions($config);
                        return $this->createConnection($dsn, $config, $options);
                    }
                };
            });
        }
    }

    public function boot(): void
    {
        //
    }
}
