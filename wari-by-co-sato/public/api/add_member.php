<?php

require_once __DIR__ . '/../../src/logic.php';

$pdo = get_pdo();
$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    $input = $_POST;
}

$groupId = trim($input['group_id'] ?? '');
$name = trim($input['name'] ?? '');
$role = trim($input['role'] ?? '');
$weight = $input['weight'] ?? null;
$familyId = isset($input['family_id']) ? (int) $input['family_id'] : null;
$familyName = isset($input['family_name']) ? trim($input['family_name']) : '';

if ($groupId === '' || $name === '' || $role === '') {
    json_response([
        'success' => false,
        'error' => 'group_id, name, role are required',
    ], 400);
}

$validRoles = ['adult', 'child', 'staff', 'manager'];
if (!in_array($role, $validRoles, true)) {
    json_response([
        'success' => false,
        'error' => 'Invalid role value',
    ], 400);
}

try {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM groups WHERE group_id = :group_id');
    $stmt->execute([':group_id' => $groupId]);
    if ($stmt->fetchColumn() == 0) {
        json_response([
            'success' => false,
            'error' => 'Group not found',
        ], 404);
    }

    if ($weight === null || $weight === '') {
        $weight = default_weight_for_role($role);
    }
    $weight = (float) $weight;

    if (in_array($role, ['staff', 'manager'], true)) {
        $familyId = null;
    } else {
        if ($familyId !== null) {
            $stmt = $pdo->prepare('SELECT COUNT(*) FROM families WHERE id = :id AND group_id = :group_id');
            $stmt->execute([
                ':id' => $familyId,
                ':group_id' => $groupId,
            ]);
            if ($stmt->fetchColumn() == 0) {
                $familyId = null;
            }
        }
        if ($familyId === null) {
            $fallbackFamilyName = $familyName !== '' ? $familyName : ($name . '家');
            $familyId = find_or_create_family($pdo, $groupId, $fallbackFamilyName);
        }
    }

    $stmt = $pdo->prepare('INSERT INTO members (group_id, family_id, name, role, weight) VALUES (:group_id, :family_id, :name, :role, :weight)');
    $stmt->execute([
        ':group_id' => $groupId,
        ':family_id' => $familyId,
        ':name' => $name,
        ':role' => $role,
        ':weight' => $weight,
    ]);

    $memberId = (int) $pdo->lastInsertId();

    json_response([
        'success' => true,
        'member_id' => $memberId,
        'family_id' => $familyId,
        'weight' => $weight,
    ]);
} catch (Throwable $e) {
    json_response([
        'success' => false,
        'error' => 'Failed to add member',
        'details' => $e->getMessage(),
    ], 500);
}
