<?php

require_once __DIR__ . '/../../src/logic.php';

$pdo = get_pdo();
$groupId = $_GET['g'] ?? ($_GET['group_id'] ?? '');
$groupId = trim($groupId);

if ($groupId === '') {
    json_response([
        'success' => false,
        'error' => 'Missing group id',
    ], 400);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM groups WHERE group_id = :group_id');
    $stmt->execute([':group_id' => $groupId]);
    $groupRow = $stmt->fetch();
    if (!$groupRow) {
        json_response([
            'success' => false,
            'error' => 'Group not found',
        ], 404);
    }

    $snapshot = fetch_group_snapshot($pdo, $groupId);

    json_response([
        'success' => true,
        'group_id' => $groupId,
        'families' => array_values($snapshot['families']),
        'members' => array_values($snapshot['members']),
        'expenses' => $snapshot['expenses'],
        'default_role_weights' => default_role_weights(),
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'error' => 'Failed to load group',
        'details' => $e->getMessage(),
    ], 500);
}
