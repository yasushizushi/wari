<?php

require_once __DIR__ . '/../../src/logic.php';

$pdo = get_pdo();
$input = json_decode(file_get_contents('php://input'), true);
$groupId = null;

if (is_array($input) && isset($input['group_id'])) {
    $groupId = trim((string) $input['group_id']);
}
if ($groupId === null || $groupId === '') {
    $groupId = isset($_GET['g']) ? trim($_GET['g']) : (isset($_GET['group_id']) ? trim($_GET['group_id']) : '');
}

if ($groupId === '') {
    json_response([
        'success' => false,
        'error' => 'Missing group id',
    ], 400);
}

try {
    $stmt = $pdo->prepare('SELECT id FROM groups WHERE group_id = :group_id');
    $stmt->execute([':group_id' => $groupId]);
    if (!$stmt->fetch()) {
        json_response([
            'success' => false,
            'error' => 'Group not found',
        ], 404);
    }

    $result = calculate_settlement($pdo, $groupId);

    json_response([
        'success' => true,
        'group_id' => $groupId,
        'result' => $result,
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'error' => 'Failed to settle group',
        'details' => $e->getMessage(),
    ], 500);
}
