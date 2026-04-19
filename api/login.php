<?php
session_start();
$body = json_decode(file_get_contents('php://input'), true);
$password = $body['password'] ?? '';
if ($password === 'admin1234') {
    $_SESSION['is_admin'] = true;
    http_response_code(200);
    echo json_encode(['ok' => true]);
    exit;
}
http_response_code(401);
echo json_encode(['ok' => false]);
