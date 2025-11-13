<?php
$groupId = isset($_GET['g']) ? htmlspecialchars($_GET['g'], ENT_QUOTES, 'UTF-8') : '';
?>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Wari by Co-Sato</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
    <header>
        <h1>Wari by Co-Sato 🍀</h1>
    </header>

    <main>
        <section id="landingView" class="view active">
            <div class="card hero">
                <h2>🚀 かんたん割り勘をスタート</h2>
                <p>レンタルサーバーにアップするだけでそのまま使えるシンプル設計です。</p>
                <button id="createGroupBtn">✨ グループを新規作成する</button>
                <div class="result" id="createGroupResult"></div>
            </div>
            <div class="card">
                <h2>🔑 既存グループに参加</h2>
                <form id="loadGroupForm">
                    <label for="groupIdInput">グループIDを入力</label>
                    <div class="input-row">
                        <input type="text" id="groupIdInput" name="group_id" value="<?= $groupId ?>" required>
                        <button type="submit" class="secondary">🚪 開く</button>
                    </div>
                </form>
                <div class="tip">URLの末尾 <code>?g=xxxxxx</code> をコピーして家族にシェアしましょう！</div>
            </div>
        </section>

        <section id="dashboard" class="view">
            <div class="dashboard-header">
                <div class="badge">現在のグループ ID: <span id="activeGroupId">--</span></div>
                <div class="dashboard-actions">
                    <button id="copyGroupUrl" class="secondary">🔗 URLをコピー</button>
                    <button id="backToStart" class="ghost">🏠 トップに戻る</button>
                </div>
            </div>

            <div class="grid">
                <section class="card span-2" id="group-summary">
                    <h2>📋 グループのようす</h2>
                    <div id="groupSummary" class="summary"></div>
                </section>

                <section class="card" id="add-member">
                    <h2>👥 メンバー登録</h2>
                    <form id="memberForm">
                        <input type="hidden" name="group_id" id="memberGroupId" value="<?= $groupId ?>">

                        <label for="memberName">お名前</label>
                        <input type="text" id="memberName" name="name" placeholder="例：さとう さん" required>

                        <label for="memberRole">役割</label>
                        <select id="memberRole" name="role" required>
                            <option value="adult">大人</option>
                            <option value="child">子ども</option>
                            <option value="staff">学生スタッフ</option>
                            <option value="manager">管理人</option>
                        </select>

                        <label for="memberFamilyName">家族名（大人・子ども）</label>
                        <input type="text" id="memberFamilyName" name="family_name" placeholder="例：佐藤家">

                        <div class="slider-field">
                            <div class="slider-header">
                                <span>🎚️ 負担率 <span id="memberWeightValue">1.0</span></span>
                                <button type="button" id="resetMemberWeight" class="chip ghost">既定に戻す</button>
                            </div>
                            <input type="range" id="memberWeight" name="weight" min="0" max="2.5" step="0.1" value="1.0">
                            <p class="tip small">役割ごとの既定値をベースに細かく調整できます。</p>
                        </div>

                        <button type="submit">🎉 メンバーを追加</button>
                    </form>
                    <div class="result" id="memberResult"></div>
                </section>

                <section class="card" id="add-expense">
                    <h2>💰 支払い登録</h2>
                    <form id="expenseForm">
                        <input type="hidden" name="group_id" id="expenseGroupId" value="<?= $groupId ?>">

                        <label for="payerId">立替者（メンバーID）</label>
                        <input type="number" id="payerId" name="payer_id" placeholder="例：1" required>

                        <label for="amount">金額（円）</label>
                        <input type="number" id="amount" name="amount" placeholder="例：5000" required>

                        <label for="description">メモ</label>
                        <input type="text" id="description" name="description" placeholder="例：BBQ食材費">

                        <div class="slider-field">
                            <div class="slider-header">
                                <span>🌈 参加メンバーの負担率</span>
                                <button type="button" id="resetExpenseWeights" class="chip ghost">リセット</button>
                            </div>
                            <div id="expenseWeightsContainer" class="weights-grid"></div>
                            <p class="tip small">スライダーで調整すると個別負担率が自動で登録されます。</p>
                        </div>

                        <button type="submit">🧾 支払いを保存</button>
                    </form>
                    <div class="result" id="expenseResult"></div>
                </section>

                <section class="card span-2" id="settle">
                    <h2>✅ 精算する</h2>
                    <button id="settleBtn">🧮 精算を実行</button>
                    <div class="result" id="settleResult"></div>
                    <div class="table-wrapper">
                        <table id="settleTable" class="hidden">
                            <thead>
                                <tr>
                                    <th>対象</th>
                                    <th>支払額</th>
                                    <th>負担額</th>
                                    <th>差額 (支払 - 負担)</th>
                                </tr>
                            </thead>
                            <tbody></tbody>
                        </table>
                    </div>
                </section>
            </div>
        </section>
    </main>

    <footer>
        <small>&copy; <?= date('Y') ?> Wari by Co-Sato</small>
    </footer>

    <script>
        const initialGroupId = "<?= $groupId ?>";
    </script>
    <script src="assets/js/app.js"></script>
</body>
</html>
