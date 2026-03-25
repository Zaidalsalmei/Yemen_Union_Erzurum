<?php
require 'vendor/autoload.php';

use App\Core\Database;
use App\Repositories\UserRepository;

$db = Database::getInstance()->getConnection();
$repo = new UserRepository();

try {
    $filters = ['search' => 'Ahmed'];
    $result = $repo->getAll($filters, 1, 5);
    echo "SUCCESS\n";
    print_r($result);
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
    echo $e->getTraceAsString() . "\n";
}
