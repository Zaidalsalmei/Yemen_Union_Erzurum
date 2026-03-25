<?php
/**
 * PHP Built-in Server Router
 * Routes all requests to index.php except static files
 */

// Get the request URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// If the file exists, let PHP serve it directly
if ($uri !== '/' && file_exists(__DIR__ . '/public' . $uri)) {
    return false;
}

// Otherwise, include index.php
$_SERVER['SCRIPT_NAME'] = '/index.php';
require_once __DIR__ . '/public/index.php';
