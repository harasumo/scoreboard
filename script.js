let squads = [];

// Подключаемся к Firebase
window.onCloudUpdate((data) => {
    if (data) {
        squads = data;
    } else {
        // Если база пустая, создаем демо-отряд
        squads = [{ id: Date.now(), name: "Отряд №1", members: [] }];
        save();
    }
    render();
});

function save() {
    window.saveToCloud(squads);
}

// УПРАВЛЕНИЕ БАЛЛАМИ РЕБЕНКА
window.changeKidPoints = (squadId, kidId, amount) => {
    const squad = squads.find(s => s.id === squadId);
    if (squad) {
        const kid = squad.members.find(k => k.id === kidId);
        if (kid) {
            kid.points += amount;
            if (kid.points < 0) kid.points = 0;
            save();
        }
    }
};

// ДОБАВЛЕНИЕ РЕБЕНКА
window.addKid = (squadId) => {
    const name = prompt("Введите имя ребенка:");
    if (name) {
        const squad = squads.find(s => s.id === squadId);
        if (!squad.members) squad.members = [];
        squad.members.push({
            id: Date.now(),
            name: name,
            points: 0
        });
        save();
    }
};

// УДАЛЕНИЕ РЕБЕНКА
window.deleteKid = (squadId, kidId) => {
    if (confirm("Удалить ребенка из списка?")) {
        const squad = squads.find(s => s.id === squadId);
        squad.members = squad.members.filter(k => k.id !== kidId);
        save();
    }
};

// УПРАВЛЕНИЕ ОТРЯДАМИ
document.getElementById('add-squad-btn').onclick = () => {
    const name = prompt("Название нового отряда:");
    if (name) {
        squads.push({ id: Date.now(), name: name, members: [] });
        save();
    }
};

window.deleteSquad = (id) => {
    if (confirm("Внимание! Весь отряд и баллы детей будут удалены. Продолжить?")) {
        squads = squads.filter(s => s.id !== id);
        save();
    }
};

window.editSquadName = (id) => {
    const squad = squads.find(s => s.id === id);
    const n = prompt("Новое название отряда:", squad.name);
    if (n) { squad.name = n; save(); }
};

// ГЛАВНАЯ ФУНКЦИЯ ОТРИСОВКИ
function render() {
    let globalTotal = 0;
    let allKidsList = [];

    // Предварительный расчет сумм отрядов и сбор всех детей
    squads.forEach(s => {
        let squadSum = 0;
        (s.members || []).forEach(k => {
            squadSum += k.points;
            allKidsList.push({ ...k, squadName: s.name });
        });
        s.currentSum = squadSum;
        globalTotal += squadSum;
    });

    // 1. Сортируем отряды по убыванию баллов
    squads.sort((a, b) => b.currentSum - a.currentSum);

    // 2. Сортируем детей для вертикального ТОПа (Топ-10)
    allKidsList.sort((a, b) => b.points - a.points);
    const top10Kids = allKidsList.slice(0, 10);

    // Обновляем Общий Банк
    document.getElementById('total-bank').innerText = globalTotal.toLocaleString();

    // Отрисовка вертикального ТОПа детей
    const leaderboardEl = document.getElementById('kids-leaderboard');
    leaderboardEl.innerHTML = top10Kids.map((k, i) => `
        <div class="top-kid-card">
            <div class="top-kid-left">
                <span class="top-kid-rank">#${i + 1}</span>
                <div>
                    <span class="top-kid-name">${k.name}</span>
                    <span class="top-kid-squad">${k.squadName}</span>
                </div>
            </div>
            <span class="top-kid-points">${k.points} 💰</span>
        </div>
    `).join('') || '<p style="text-align:center; opacity:0.5">Добавьте детей в отряды...</p>';

    // Отрисовка карточек отрядов
    const grid = document.getElementById('squads-grid');
    grid.innerHTML = '';

    squads.forEach((squad, i) => {
        const card = document.createElement('div');
        card.className = `squad-card ${i === 0 ? 'top-1' : ''}`;
        card.innerHTML = `
            <div class="rank-badge">${i + 1}</div>
            <h3 class="squad-name" onclick="editSquadName(${squad.id})">${squad.name} ✏️</h3>
            <span class="squad-total-label">Сумма баллов:</span>
            <div class="squad-points">${squad.currentSum}</div>

            <div class="members-section">
                <strong>Участники:</strong>
                <div style="margin-top:10px">
                    ${(squad.members || []).map(k => `
                        <div class="member-row">
                            <div class="member-info">
                                <span class="member-name">${k.name}</span>
                                <span class="member-score-badge">${k.points} 💰</span>
                            </div>
                            <div class="member-controls">
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 1)">+1</button>
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 5)">+5</button>
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, -5)">-5</button>
                                <button class="btn-del" onclick="deleteKid(${squad.id}, ${k.id})">×</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-kid" onclick="addKid(${squad.id})">+ Добавить ребенка</button>
            </div>
            <button style="border:none; background:none; color:#ccc; font-size:0.6rem; cursor:pointer; margin-top:20px; width:100%; text-decoration:underline" onclick="deleteSquad(${squad.id})">удалить весь отряд</button>
        `;
        grid.appendChild(card);
    });
}
