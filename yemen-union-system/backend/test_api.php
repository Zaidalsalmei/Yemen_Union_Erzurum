<?php

$url = 'http://localhost:8000/api/users?search=Ahm';
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// Because of auth, we might get 401. But let's see.
echo curl_exec($ch);
