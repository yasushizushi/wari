<?php

require_once __DIR__ . '/../../src/logic.php';

$pdo = get_pdo();

try {
    do {
        $groupId = generate_group_id();
        $stmt = $pdo->prepare('SELECT COUNT(*) FROM groups WHERE group_id = :group_id');
        $stmt->execute([':group_id' => $groupId]);
    } while ($stmt->fetchColumn() > 0);

    $stmt = $pdo->prepare('INSERT INTO groups (group_id) VALUES (:group_id)');
    $stmt->execute([':group_id' => $groupId]);

    $relativeUrl = '../?g=' . $groupId;
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https://' : 'http://';
    $host = $_SERVER['HTTP_HOST'] ?? '';
    $basePath = rtrim(dirname($_SERVER['SCRIPT_NAME'], 2), '/\\');
    $basePath = $basePath === '' ? '/' : $basePath . '/';
    $absoluteUrl = $host !== '' ? $protocol . $host . $basePath . '?g=' . $groupId : $relativeUrl;

    json_response([
        'success' => true,
        'group_id' => $groupId,
        'relative_url' => $relativeUrl,
        'absolute_url' => $absoluteUrl,
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'error' => 'Failed to create group',
        'details' => $e->getMessage(),
    ], 500);
}
