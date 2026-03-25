<?php
$data = ['phone_number' => '05376439951', 'password' => 'Doll7722['];
$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data),
        'ignore_errors' => true,
    ]
];
$context  = stream_context_create($options);
$result = file_get_contents('http://localhost:8000/api/auth/login', false, $context);
echo "Result:\n$result\n";
