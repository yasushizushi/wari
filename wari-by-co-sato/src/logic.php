<?php

require_once __DIR__ . '/db.php';

function json_response(array $data, int $statusCode = 200): void
{
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function generate_group_id(int $length = 6): string
{
    $characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    $max = strlen($characters) - 1;
    $id = '';
    for ($i = 0; $i < $length; $i++) {
        $id .= $characters[random_int(0, $max)];
    }
    return $id;
}

function default_role_weights(): array
{
    return [
        'adult' => 1.0,
        'child' => 0.8,
        'staff' => 1.0,
        'manager' => 1.0,
    ];
}

function default_weight_for_role(string $role): float
{
    $defaults = default_role_weights();
    return $defaults[$role] ?? 1.0;
}

function find_or_create_family(PDO $pdo, string $groupId, ?string $familyName): ?int
{
    if ($familyName === null || $familyName === '') {
        return null;
    }

    $stmt = $pdo->prepare('SELECT id FROM families WHERE group_id = :group_id AND family_name = :family_name LIMIT 1');
    $stmt->execute([
        ':group_id' => $groupId,
        ':family_name' => $familyName,
    ]);
    $existing = $stmt->fetchColumn();
    if ($existing !== false) {
        return (int) $existing;
    }

    $stmt = $pdo->prepare('INSERT INTO families (group_id, family_name) VALUES (:group_id, :family_name)');
    $stmt->execute([
        ':group_id' => $groupId,
        ':family_name' => $familyName,
    ]);

    return (int) $pdo->lastInsertId();
}

function fetch_group_snapshot(PDO $pdo, string $groupId): array
{
    $stmt = $pdo->prepare('SELECT id, family_name FROM families WHERE group_id = :group_id ORDER BY id');
    $stmt->execute([':group_id' => $groupId]);
    $families = $stmt->fetchAll();
    $familyMap = [];
    foreach ($families as $family) {
        $familyId = (int) $family['id'];
        $familyMap[$familyId] = [
            'id' => $familyId,
            'family_name' => $family['family_name'],
        ];
    }

    $stmt = $pdo->prepare('SELECT * FROM members WHERE group_id = :group_id ORDER BY id');
    $stmt->execute([':group_id' => $groupId]);
    $members = $stmt->fetchAll();
    $memberMap = [];
    foreach ($members as &$member) {
        $member['id'] = (int) $member['id'];
        $member['family_id'] = $member['family_id'] !== null ? (int) $member['family_id'] : null;
        $member['weight'] = (float) $member['weight'];
        $memberMap[$member['id']] = $member;
        if ($member['family_id'] !== null && !isset($familyMap[$member['family_id']])) {
            $familyMap[$member['family_id']] = [
                'id' => $member['family_id'],
                'family_name' => 'Family #' . $member['family_id'],
            ];
        }
    }
    unset($member);

    $stmt = $pdo->prepare('SELECT e.*, m.name AS payer_name, m.family_id AS payer_family_id, m.role AS payer_role FROM expenses e INNER JOIN members m ON e.payer_id = m.id WHERE e.group_id = :group_id ORDER BY e.id');
    $stmt->execute([':group_id' => $groupId]);
    $expenses = $stmt->fetchAll();

    $expenseIds = array_map(static fn($exp) => (int) $exp['id'], $expenses);
    $expenseWeightMap = [];
    if (!empty($expenseIds)) {
        $inClause = implode(',', array_fill(0, count($expenseIds), '?'));
        $stmt = $pdo->prepare("SELECT expense_id, member_id, weight FROM expense_weights WHERE expense_id IN ($inClause)");
        $stmt->execute($expenseIds);
        while ($row = $stmt->fetch()) {
            $expenseId = (int) $row['expense_id'];
            $memberId = (int) $row['member_id'];
            $expenseWeightMap[$expenseId][$memberId] = (float) $row['weight'];
        }
    }

    foreach ($expenses as &$expense) {
        $expense['id'] = (int) $expense['id'];
        $expense['payer_id'] = (int) $expense['payer_id'];
        $expense['amount'] = (float) $expense['amount'];
        $expense['weights'] = $expenseWeightMap[$expense['id']] ?? [];
        $expense['created_at'] = $expense['created_at'];
    }
    unset($expense);

    return [
        'families' => $familyMap,
        'members' => $memberMap,
        'expenses' => $expenses,
    ];
}

function calculate_settlement(PDO $pdo, string $groupId): array
{
    $snapshot = fetch_group_snapshot($pdo, $groupId);
    $families = $snapshot['families'];
    $members = $snapshot['members'];
    $expenses = $snapshot['expenses'];

    if (empty($members)) {
        return [
            'participants' => [],
            'total_expenses' => 0,
            'currency' => 'JPY',
        ];
    }

    $participants = [];
    foreach ($families as $familyId => $family) {
        $participants['family_' . $familyId] = [
            'id' => $familyId,
            'type' => 'family',
            'name' => $family['family_name'],
            'members' => [],
            'paid' => 0.0,
            'owed' => 0.0,
        ];
    }

    foreach ($members as $member) {
        $memberKey = $member['family_id'] !== null ? 'family_' . $member['family_id'] : 'member_' . $member['id'];
        if (!isset($participants[$memberKey])) {
            $participants[$memberKey] = [
                'id' => $member['family_id'] ?? $member['id'],
                'type' => $member['family_id'] !== null ? 'family' : 'individual',
                'name' => $member['family_id'] !== null ? ('Family #' . $member['family_id']) : $member['name'],
                'members' => [],
                'paid' => 0.0,
                'owed' => 0.0,
            ];
        }
        $participants[$memberKey]['members'][] = [
            'id' => $member['id'],
            'name' => $member['name'],
            'role' => $member['role'],
            'weight' => $member['weight'],
        ];
    }

    $totalExpenses = 0.0;

    foreach ($expenses as $expense) {
        $totalExpenses += $expense['amount'];
        $weightPerParticipant = [];
        foreach ($members as $memberId => $member) {
            $weight = $expense['weights'][$memberId] ?? $member['weight'];
            if ($weight <= 0) {
                continue;
            }
            $participantKey = $member['family_id'] !== null ? 'family_' . $member['family_id'] : 'member_' . $member['id'];
            if (!isset($weightPerParticipant[$participantKey])) {
                $weightPerParticipant[$participantKey] = 0.0;
            }
            $weightPerParticipant[$participantKey] += $weight;
        }

        $totalWeight = array_sum($weightPerParticipant);
        if ($totalWeight <= 0) {
            continue;
        }

        foreach ($weightPerParticipant as $participantKey => $weightSum) {
            $share = ($weightSum / $totalWeight) * $expense['amount'];
            $participants[$participantKey]['owed'] += $share;
        }

        if (isset($members[$expense['payer_id']])) {
            $payer = $members[$expense['payer_id']];
            $payerKey = $payer['family_id'] !== null ? 'family_' . $payer['family_id'] : 'member_' . $payer['id'];
            $participants[$payerKey]['paid'] += $expense['amount'];
        }
    }

    foreach ($participants as &$participant) {
        $participant['paid'] = round($participant['paid'], 2);
        $participant['owed'] = round($participant['owed'], 2);
        $participant['balance'] = round($participant['paid'] - $participant['owed'], 2);
    }
    unset($participant);

    return [
        'participants' => array_values($participants),
        'total_expenses' => round($totalExpenses, 2),
        'currency' => 'JPY',
    ];
}
