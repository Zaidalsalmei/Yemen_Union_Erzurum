<?php
require 'vendor/autoload.php';

use App\Core\Database;
use App\Repositories\UserRepository;

$repo = new UserRepository();

try {
    $filters = ['status' => null, 'search' => '1'];
    echo "Testing with '1'...\n";
    $result = $repo->getAll($filters, 1, 5);
    echo "SUCCESS\n";
    print_r($result);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
