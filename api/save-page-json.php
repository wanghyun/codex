<?php
session_start();
if (empty($_SESSION['is_admin'])) {
    http_response_code(403);
    exit;
}
$body = json_decode(file_get_contents('php://input'), true);
$page = preg_replace('/[^a-z0-9\-]/', '', $body['page'] ?? '');
$data = $body['data'] ?? null;
if (!$page || $data === null) {
    http_response_code(400);
    exit;
}
$target = __DIR__ . '/../data/' . $page . '.json';
file_put_contents($target, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
http_response_code(200);
header('Content-Type: application/json');
echo json_encode(['ok' => true]);
