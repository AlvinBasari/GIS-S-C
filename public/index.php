<?php

if (! getenv('PHPRC') && file_exists('/home/alvin/.local/etc/php.ini')) {
    putenv('PHPRC=/home/alvin/.local/etc/php.ini');
    $_ENV['PHPRC'] = '/home/alvin/.local/etc/php.ini';
    $_SERVER['PHPRC'] = '/home/alvin/.local/etc/php.ini';
}
if (file_exists('/home/alvin/.local/usr/lib/x86_64-linux-gnu')) {
    $ld = '/home/alvin/.local/usr/lib/x86_64-linux-gnu:/home/alvin/.local/usr/lib:'.(getenv('LD_LIBRARY_PATH') ?: '');
    putenv("LD_LIBRARY_PATH={$ld}");
    $_ENV['LD_LIBRARY_PATH'] = $ld;
    $_SERVER['LD_LIBRARY_PATH'] = $ld;
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Determine if the application is in maintenance mode...
if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

// Register the Composer autoloader...
require __DIR__.'/../vendor/autoload.php';

// Bootstrap Laravel and handle the request...
/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
