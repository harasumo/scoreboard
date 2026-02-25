let squads = [];

// Слушаем Firebase
window.onCloudUpdate((data) => {
    if (data) {
        squads = data;
    } else {
        // Начальные данные (теперь участники — это объекты с баллами)
        squads = [
            { id: 1, name: "Альфа", members: [{ id: 101, name: "Иван", points: 0 }] }
        ];
        save();
    }
    render();
});

function save() {
    window.saveToCloud(squads);
}

// ДОБАВЛЕНИЕ БАЛЛОВ РЕБЕНКУ
window.changeKidPoints = (squadId, kidId, amount) => {
    const squad = squads.find(s => s.id === squadId);
    const kid = squad.members.find(k => k.id === kidId);
    if (kid) {
        kid.points += amount;
        if (kid.points < 0) kid.points = 0;
        save();
    }
};

// ДОБАВЛЕНИЕ РЕБЕНКА В ОТРЯД
window.addKid = (squadId) => {
    const name = prompt("Имя ребенка:");
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
    const name = prompt("Название отряда:");
    if (name) {
        squads.push({ id: Date.now(), name: name, members: [] });
        save();
    }
};

window.deleteSquad = (id) => {
    if (confirm("Удалить весь отряд?")) {
        squads = squads.filter(s => s.id !== id);
        save();
    }
};

function render() {
    // 1. Считаем Общий Банк и Рейтинг детей
    let totalBank = 0;
    let allKids = [];

    squads.forEach(s => {
        let squadSum = 0;
        (s.members || []).forEach(k => {
            squadSum += k.points;
            allKids.push({ ...k, squadName: s.name });
        });
        s.tempTotal = squadSum; // Запоминаем сумму отряда для сортировки
        totalBank += squadSum;
    });

    // 2. Сортируем отряды по баллам
    squads.sort((a, b) => b.tempTotal - a.tempTotal);
    
    // 3. Сортируем детей для Зала Славы (ТОП-10)
    allKids.sort((a, b) => b.points - a.points);
    const topKids = allKids.slice(0, 10);

    // Отрисовка Банка
    document.getElementById('total-bank').innerText = totalBank.toLocaleString();

    // Отрисовка Зала Славы
    const leaderboardEl = document.getElementById('kids-leaderboard');
    leaderboardEl.innerHTML = topKids.map((k, i) => `
        <div class="top-kid-card">
            <span class="top-kid-rank">#${i + 1}</span>
            <span class="top-kid-name">${k.name}</span>
            <span class="top-kid-points">${k.points}</span>
        </div>
    `).join('') || '<p>Пока здесь пусто...</p>';

    // Отрисовка Отрядов
    const grid = document.getElementById('squads-grid');
    grid.innerHTML = '';

    squads.forEach((squad, i) => {
        const card = document.createElement('div');
        card.className = `squad-card ${i === 0 ? 'top-1' : ''}`;
        card.innerHTML = `
            <div class="rank-badge">${i + 1}</div>
            <h3 class="squad-name">${squad.name}</h3>
            <span class="squad-total-label">Баллы отряда:</span>
            <div class="squad-points">${squad.tempTotal}</div>

            <div class="members-section">
                <strong>Дети в отряде:</strong>
                <div class="members-list" style="margin-top:10px">
                    ${(squad.members || []).map(k => `
                        <div class="member-row">
                            <div class="member-info">
                                <span class="member-name">${k.name}</span>
                                <span class="member-score-badge">${k.points}💰</span>
                            </div>
                            <div class="member-controls">
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 1)">+1</button>
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 5)">+5</button>
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 10)">+10</button>
                                <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, -5)">-5</button>
                                <button class="btn-del-kid" onclick="deleteKid(${squad.id}, ${k.id})">×</button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="btn-add-member" onclick="addKid(${squad.id})">+ Добавить ребенка</button>
            </div>
            <button style="border:none; background:none; color:#ccc; font-size:0.6rem; cursor:pointer; margin-top:15px; width:100%" onclick="deleteSquad(${squad.id})">удалить отряд</button>
        `;
        grid.appendChild(card);
    });
}
