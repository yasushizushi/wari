<?php

require_once __DIR__ . '/../../src/logic.php';

$pdo = get_pdo();
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$groupId = trim($input['group_id'] ?? '');
$payerId = isset($input['payer_id']) ? (int) $input['payer_id'] : 0;
$amount = isset($input['amount']) ? (int) $input['amount'] : 0;
$description = trim($input['description'] ?? '');
$weights = isset($input['weights']) && is_array($input['weights']) ? $input['weights'] : [];

if ($groupId === '' || $payerId <= 0 || $amount <= 0) {
    json_response([
        'success' => false,
        'error' => 'group_id, payer_id, amount are required and amount must be positive',
    ], 400);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM groups WHERE group_id = :group_id');
    $stmt->execute([':group_id' => $groupId]);
    if ($stmt->fetchColumn() == 0) {
        $pdo->rollBack();
        json_response([
            'success' => false,
            'error' => 'Group not found',
        ], 404);
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM members WHERE id = :id AND group_id = :group_id');
    $stmt->execute([
        ':id' => $payerId,
        ':group_id' => $groupId,
    ]);
    if ($stmt->fetchColumn() == 0) {
        $pdo->rollBack();
        json_response([
            'success' => false,
            'error' => 'Payer not found in this group',
        ], 404);
    }

    $stmt = $pdo->prepare('INSERT INTO expenses (group_id, payer_id, amount, description, created_at) VALUES (:group_id, :payer_id, :amount, :description, NOW())');
    $stmt->execute([
        ':group_id' => $groupId,
        ':payer_id' => $payerId,
        ':amount' => $amount,
        ':description' => $description,
    ]);

    $expenseId = (int) $pdo->lastInsertId();

    if (!empty($weights)) {
        $weightStmt = $pdo->prepare('SELECT id FROM members WHERE group_id = :group_id');
        $weightStmt->execute([':group_id' => $groupId]);
        $validMemberIds = array_map('intval', array_column($weightStmt->fetchAll(), 'id'));
        $validMemberSet = array_flip($validMemberIds);

        $insertStmt = $pdo->prepare('INSERT INTO expense_weights (expense_id, member_id, weight) VALUES (:expense_id, :member_id, :weight)');
        foreach ($weights as $item) {
            if (!is_array($item)) {
                continue;
            }
            $memberId = isset($item['member_id']) ? (int) $item['member_id'] : 0;
            $weightValue = isset($item['weight']) ? (float) $item['weight'] : null;
            if ($memberId <= 0 || $weightValue === null) {
                continue;
            }
            if (!isset($validMemberSet[$memberId])) {
                continue;
            }
            $insertStmt->execute([
                ':expense_id' => $expenseId,
                ':member_id' => $memberId,
                ':weight' => $weightValue,
            ]);
        }
    }

    $pdo->commit();

    json_response([
        'success' => true,
        'expense_id' => $expenseId,
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    json_response([
        'success' => false,
        'error' => 'Failed to add expense',
        'details' => $e->getMessage(),
    ], 500);
}
