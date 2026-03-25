<?php
$hash = '$2y$10$XuDh34AYdSYn9Wrk9sMXAOS71/XlAjUsTREEg1If.8Xv1UmdJDy91S';
$password = 'password';

if (password_verify($password, $hash)) {
    echo "PASSWORD MATCHES\n";
} else {
    echo "PASSWORD DOES NOT MATCH\n";
}

// Generate new hash
$newHash = password_hash('password', PASSWORD_BCRYPT);
echo "New hash: $newHash\n";
