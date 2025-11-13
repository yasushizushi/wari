const apiBase = 'api/';

const createGroupBtn = document.getElementById('createGroupBtn');
const createGroupResult = document.getElementById('createGroupResult');
const landingView = document.getElementById('landingView');
const dashboard = document.getElementById('dashboard');
const loadGroupForm = document.getElementById('loadGroupForm');
const groupIdInput = document.getElementById('groupIdInput');
const activeGroupIdDisplay = document.getElementById('activeGroupId');
const copyGroupUrlBtn = document.getElementById('copyGroupUrl');
const backToStartBtn = document.getElementById('backToStart');
const groupSummary = document.getElementById('groupSummary');
const memberForm = document.getElementById('memberForm');
const memberResult = document.getElementById('memberResult');
const memberGroupId = document.getElementById('memberGroupId');
const memberRoleSelect = document.getElementById('memberRole');
const memberWeightSlider = document.getElementById('memberWeight');
const memberWeightValue = document.getElementById('memberWeightValue');
const resetMemberWeightBtn = document.getElementById('resetMemberWeight');
const expenseForm = document.getElementById('expenseForm');
const expenseResult = document.getElementById('expenseResult');
const expenseGroupId = document.getElementById('expenseGroupId');
const expenseWeightsContainer = document.getElementById('expenseWeightsContainer');
const resetExpenseWeightsBtn = document.getElementById('resetExpenseWeights');
const settleBtn = document.getElementById('settleBtn');
const settleResult = document.getElementById('settleResult');
const settleTable = document.getElementById('settleTable');

let defaultRoleWeights = {
    adult: 1.0,
    child: 0.8,
    staff: 1.0,
    manager: 1.0,
};
let currentGroupId = '';
let currentGroupData = null;

function formatJson(obj) {
    return `<pre>${JSON.stringify(obj, null, 2)}</pre>`;
}

function showView(view) {
    if (landingView) landingView.classList.remove('active');
    if (dashboard) dashboard.classList.remove('active');
    if (view) view.classList.add('active');
}

function setActiveGroup(groupId) {
    currentGroupId = groupId;
    if (groupIdInput) groupIdInput.value = groupId;
    if (memberGroupId) memberGroupId.value = groupId;
    if (expenseGroupId) expenseGroupId.value = groupId;
    if (settleBtn) settleBtn.dataset.groupId = groupId;
    if (activeGroupIdDisplay) activeGroupIdDisplay.textContent = groupId || '--';
}

function enterDashboard(groupId) {
    setActiveGroup(groupId);
    showView(dashboard);
}

async function createGroup() {
    createGroupResult.textContent = '作成中...';
    try {
        const res = await fetch(`${apiBase}create_group.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || 'グループ作成に失敗しました');
        }
        createGroupResult.innerHTML = `
            <div class="tip">
                🎉 新しいグループができました！<br>
                <strong>ID:</strong> ${data.group_id}<br>
                <strong>URL:</strong> <a href="${data.relative_url}" target="_blank">こちらを共有</a>
            </div>
        `;
        enterDashboard(data.group_id);
        await loadGroup();
    } catch (error) {
        createGroupResult.textContent = error.message;
    }
}

function buildRoleLabel(role) {
    const roleMap = {
        adult: '🧑 大人',
        child: '🧒 子ども',
        staff: '🎓 学生スタッフ',
        manager: '🛠 管理人',
    };
    return roleMap[role] || role;
}

function renderGroupSummary(data) {
    if (!groupSummary) return;
    if (!data) {
        groupSummary.innerHTML = '<p class="tip">グループを読み込むとメンバーや支払いの状況が表示されます。</p>';
        return;
    }

    const families = data.families || [];
    const members = data.members || [];
    const expenses = data.expenses || [];

    const familyMembers = new Map();
    members.forEach((member) => {
        if (member.family_id) {
            if (!familyMembers.has(member.family_id)) {
                familyMembers.set(member.family_id, []);
            }
            familyMembers.get(member.family_id).push(member);
        }
    });

    const familyList = families.map((family) => {
        const count = familyMembers.get(family.id)?.length || 0;
        return `<li><span>🏡 ${family.family_name}</span><span>${count}人</span></li>`;
    }).join('');

    const memberList = members.map((member) => {
        const label = buildRoleLabel(member.role);
        const family = member.family_id ? (families.find((f) => f.id === member.family_id)?.family_name || `Family #${member.family_id}`) : '個人精算';
        const weightValue = Number(member.weight ?? defaultRoleWeights[member.role] ?? 1);
        return `<li><span>${label} ${member.name}</span><span class="slider-value">${weightValue.toFixed(1)}</span><span>${family}</span></li>`;
    }).join('');

    const expenseList = expenses.slice().reverse().map((expense) => {
        const date = expense.created_at ? new Date(expense.created_at).toLocaleString('ja-JP') : '';
        return `<li><span>💸 ${expense.description || '支払い'}</span><span>${Math.round(expense.amount)}円</span><span class="muted">${date}</span></li>`;
    }).join('');

    groupSummary.innerHTML = `
        <div>
            <h3>👨‍👩‍👧‍👦 家族一覧 (${families.length} 家族)</h3>
            <ul>${familyList || '<li>まだ登録がありません</li>'}</ul>
        </div>
        <div>
            <h3>🧑‍🤝‍🧑 メンバー (${members.length} 人)</h3>
            <ul>${memberList || '<li>まだメンバーがいません</li>'}</ul>
        </div>
        <div>
            <h3>💵 支払い履歴 (${expenses.length} 件)</h3>
            <ul>${expenseList || '<li>まだ支払いが登録されていません</li>'}</ul>
        </div>
    `;
}

function updateMemberWeightDisplay() {
    if (!memberWeightSlider || !memberWeightValue) return;
    memberWeightValue.textContent = parseFloat(memberWeightSlider.value).toFixed(1);
}

function resetMemberWeightToDefault() {
    if (!memberWeightSlider || !memberRoleSelect) return;
    const role = memberRoleSelect.value;
    const defaultValue = defaultRoleWeights[role] ?? 1.0;
    memberWeightSlider.value = defaultValue;
    updateMemberWeightDisplay();
}

function updateMemberWeightForRole() {
    resetMemberWeightToDefault();
}

function buildExpenseWeightItem(member) {
    const wrapper = document.createElement('div');
    wrapper.className = 'weight-item';

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.innerHTML = `${buildRoleLabel(member.role)} ${member.name}`;
    const valueTag = document.createElement('span');
    valueTag.className = 'slider-value';

    const slider = document.createElement('input');
    slider.type = 'range';
    slider.min = '0';
    slider.max = '3';
    slider.step = '0.1';
    slider.value = (member.weight ?? defaultRoleWeights[member.role] ?? 1).toFixed(1);
    slider.dataset.memberId = String(member.id);

    const updateValue = () => {
        valueTag.textContent = parseFloat(slider.value).toFixed(1);
    };

    slider.addEventListener('input', updateValue);
    updateValue();

    header.appendChild(title);
    header.appendChild(valueTag);
    wrapper.appendChild(header);
    wrapper.appendChild(slider);

    return wrapper;
}

function populateExpenseWeightSliders(members) {
    if (!expenseWeightsContainer) return;
    expenseWeightsContainer.innerHTML = '';
    if (!members || members.length === 0) {
        expenseWeightsContainer.innerHTML = '<p class="tip small">メンバーを追加するとここで負担率を調整できます。</p>';
        return;
    }
    const fragment = document.createDocumentFragment();
    members.forEach((member) => {
        fragment.appendChild(buildExpenseWeightItem(member));
    });
    expenseWeightsContainer.appendChild(fragment);
}

function resetExpenseWeights() {
    if (!currentGroupData || !expenseWeightsContainer) return;
    const members = currentGroupData.members || [];
    populateExpenseWeightSliders(members);
}

async function loadGroup(event) {
    if (event && typeof event.preventDefault === 'function') {
        event.preventDefault();
    }
    const groupId = (groupIdInput?.value || currentGroupId || '').trim();
    if (!groupId) {
        if (groupSummary) {
            groupSummary.innerHTML = '<p class="tip">グループIDを入力してください。</p>';
        }
        return;
    }

    try {
        if (groupSummary) {
            groupSummary.innerHTML = '<p class="tip">読み込み中です…</p>';
        }
        const res = await fetch(`${apiBase}get_group.php?g=${encodeURIComponent(groupId)}`);
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || 'グループ情報を取得できませんでした');
        }
        defaultRoleWeights = data.default_role_weights ?? defaultRoleWeights;
        currentGroupData = data;
        enterDashboard(groupId);
        renderGroupSummary(data);
        populateExpenseWeightSliders(data.members);
        resetMemberWeightToDefault();
    } catch (error) {
        if (groupSummary) {
            groupSummary.innerHTML = `<p class="tip">${error.message}</p>`;
        }
    }
}

async function addMember(event) {
    event.preventDefault();
    const formData = new FormData(memberForm);
    const payload = Object.fromEntries(formData.entries());
    payload.weight = payload.weight ? parseFloat(payload.weight) : undefined;

    if (!payload.group_id) {
        memberResult.textContent = '先にグループIDを入力してください。';
        return;
    }

    memberResult.textContent = '送信中...';
    try {
        const res = await fetch(`${apiBase}add_member.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || 'メンバー登録に失敗しました');
        }
        memberResult.innerHTML = `🎉 登録完了: メンバーID <strong>${data.member_id}</strong>`;
        memberForm.reset();
        memberGroupId.value = payload.group_id;
        resetMemberWeightToDefault();
        await loadGroup();
    } catch (error) {
        memberResult.textContent = error.message;
    }
}

function collectExpenseWeights() {
    if (!expenseWeightsContainer || !currentGroupData) return [];
    const members = currentGroupData.members || [];
    const memberMap = new Map(members.map((member) => [member.id, member]));
    const sliders = expenseWeightsContainer.querySelectorAll('input[type="range"][data-member-id]');
    return Array.from(sliders).map((slider) => {
        const memberId = parseInt(slider.dataset.memberId || '0', 10);
        const base = memberMap.get(memberId);
        const sliderWeight = parseFloat(slider.value);
        const baseWeight = Number(base?.weight ?? (base ? defaultRoleWeights[base.role] : 1));
        return {
            member_id: memberId,
            weight: sliderWeight,
            changed: Math.abs(sliderWeight - baseWeight) > 0.001,
        };
    }).filter((item) => item.member_id && item.weight >= 0 && item.changed)
        .map(({ member_id, weight }) => ({ member_id, weight }));
}

async function addExpense(event) {
    event.preventDefault();
    const formData = new FormData(expenseForm);
    const payload = Object.fromEntries(formData.entries());
    payload.amount = payload.amount ? parseInt(payload.amount, 10) : 0;
    payload.payer_id = payload.payer_id ? parseInt(payload.payer_id, 10) : 0;
    payload.weights = collectExpenseWeights();

    if (!payload.group_id) {
        expenseResult.textContent = '先にグループIDを入力してください。';
        return;
    }

    expenseResult.textContent = '送信中...';
    try {
        const res = await fetch(`${apiBase}add_expense.php`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || '支払い登録に失敗しました');
        }
        expenseResult.innerHTML = `💾 登録完了: 支払いID <strong>${data.expense_id}</strong>`;
        expenseForm.reset();
        expenseGroupId.value = payload.group_id;
        resetExpenseWeights();
        await loadGroup();
    } catch (error) {
        expenseResult.textContent = error.message;
    }
}

function renderSettlementTable(result) {
    const tbody = settleTable.querySelector('tbody');
    tbody.innerHTML = '';
    if (!result || !Array.isArray(result.participants) || result.participants.length === 0) {
        settleTable.classList.add('hidden');
        return;
    }
    result.participants.forEach((participant) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${participant.name}</td>
            <td>${Math.round(participant.paid)}</td>
            <td>${Math.round(participant.owed)}</td>
            <td>${Math.round(participant.balance)}</td>
        `;
        tbody.appendChild(tr);
    });
    settleTable.classList.remove('hidden');
}

async function settleUp() {
    const groupId = settleBtn.dataset.groupId || groupIdInput.value.trim();
    if (!groupId) {
        settleResult.textContent = '先にグループを読み込んでください。';
        return;
    }
    settleResult.textContent = '計算中...';
    try {
        const res = await fetch(`${apiBase}settle_up.php?g=${encodeURIComponent(groupId)}`);
        const data = await res.json();
        if (!data.success) {
            throw new Error(data.error || '精算に失敗しました');
        }
        settleResult.innerHTML = formatJson(data.result);
        renderSettlementTable(data.result);
    } catch (error) {
        settleResult.textContent = error.message;
        settleTable.classList.add('hidden');
    }
}

function copyGroupUrl() {
    if (!currentGroupId) return;
    const url = `${window.location.origin}${window.location.pathname}?g=${currentGroupId}`;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            copyGroupUrlBtn.textContent = '✅ コピーしました！';
            setTimeout(() => {
                copyGroupUrlBtn.textContent = '🔗 URLをコピー';
            }, 2000);
        }).catch(() => {
            window.prompt('以下のURLをコピーしてください', url);
        });
    } else {
        window.prompt('以下のURLをコピーしてください', url);
    }
}

function goBackToLanding() {
    showView(landingView);
}

if (createGroupBtn) createGroupBtn.addEventListener('click', createGroup);
if (loadGroupForm) loadGroupForm.addEventListener('submit', loadGroup);
if (memberForm) memberForm.addEventListener('submit', addMember);
if (expenseForm) expenseForm.addEventListener('submit', addExpense);
if (settleBtn) settleBtn.addEventListener('click', settleUp);
if (copyGroupUrlBtn) copyGroupUrlBtn.addEventListener('click', copyGroupUrl);
if (backToStartBtn) backToStartBtn.addEventListener('click', goBackToLanding);
if (memberWeightSlider) memberWeightSlider.addEventListener('input', updateMemberWeightDisplay);
if (memberRoleSelect) memberRoleSelect.addEventListener('change', updateMemberWeightForRole);
if (resetMemberWeightBtn) resetMemberWeightBtn.addEventListener('click', resetMemberWeightToDefault);
if (resetExpenseWeightsBtn) resetExpenseWeightsBtn.addEventListener('click', resetExpenseWeights);

updateMemberWeightDisplay();

if (typeof initialGroupId === 'string' && initialGroupId) {
    enterDashboard(initialGroupId);
    loadGroup();
} else {
    showView(landingView);
}
