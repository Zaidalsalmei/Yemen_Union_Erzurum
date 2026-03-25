<?php
/**
 * PHP Built-in Server Router
 * This file MUST be in /backend/public/ for correct routing
 * 
 * Usage: php -S localhost:8000 -t public public/router.php
 */

declare(strict_types=1);

// Get the request URI
$uri = urldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// Prevent infinite loops - if we're already at index.php, don't redirect
if ($uri === '/index.php') {
    require_once __DIR__ . '/index.php';
    return;
}

// Check if file exists in public directory (static files)
$publicPath = __DIR__ . $uri;
if ($uri !== '/' && is_file($publicPath)) {
    // Return false to let PHP serve the static file directly
    return false;
}

// All other requests go to index.php (API routes)
$_SERVER['SCRIPT_NAME'] = '/index.php';
$_SERVER['PHP_SELF'] = '/index.php';

require_once __DIR__ . '/index.php';
