let squads = [];

// Подключаемся к облаку
window.onCloudUpdate((data) => {
    if (data) {
        squads = data;
    } else {
        // Если база пуста (первый запуск)
        squads = [
            { id: 1, name: "Первый Отряд", points: 0, members: [], history: [] }
        ];
        save();
    }
    render();
});

function save() {
    window.saveToCloud(squads);
}

// Функции обновления
window.updatePoints = (id, amount) => {
    const squad = squads.find(s => s.id === id);
    if (squad) {
        squad.points += amount;
        if (squad.points < 0) squad.points = 0;

        if (!squad.history) squad.history = [];
        squad.history.unshift({
            amount: amount > 0 ? `+${amount}` : amount,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        if (squad.history.length > 10) squad.history.pop();
        
        save();
    }
};

window.addMember = (squadId) => {
    const name = prompt("Имя нового участника:");
    if (name) {
        const squad = squads.find(s => s.id === squadId);
        if (!squad.members) squad.members = [];
        squad.members.push(name);
        save();
    }
};

window.deleteMember = (squadId, index) => {
    squads.find(s => s.id === squadId).members.splice(index, 1);
    save();
};

window.showHistory = (id) => {
    const squad = squads.find(s => s.id === id);
    if (!squad.history || squad.history.length === 0) return alert("История пуста");
    alert(`История ${squad.name}:\n` + squad.history.map(h => `[${h.time}] ${h.amount} баллов`).join('\n'));
};

window.editSquadName = (id) => {
    const squad = squads.find(s => s.id === id);
    const newName = prompt("Новое название отряда:", squad.name);
    if (newName) {
        squad.name = newName;
        save();
    }
};

document.getElementById('add-squad-btn').onclick = () => {
    const name = prompt("Название нового отряда:");
    if (name) {
        squads.push({ id: Date.now(), name, points: 0, members: [], history: [] });
        save();
    }
};

window.deleteSquad = (id) => {
    if (confirm("Удалить этот отряд полностью?")) {
        squads = squads.filter(s => s.id !== id);
        save();
    }
};

// Функция отрисовки интерфейса
function render() {
    squads.sort((a, b) => b.points - a.points);
    const grid = document.getElementById('squads-grid');
    grid.innerHTML = '';
    let total = 0;

    squads.forEach((squad, i) => {
        total += squad.points;
        const card = document.createElement('div');
        card.className = `squad-card ${i === 0 ? 'top-1' : ''}`;
        card.innerHTML = `
            <div class="rank-badge">${i + 1}</div>
            <div class="squad-name" onclick="editSquadName(${squad.id})">${squad.name} ✏️</div>
            <div class="squad-points" id="points-${squad.id}">${squad.points}</div>
            <div class="score-controls">
                <button class="btn-score" onclick="updatePoints(${squad.id}, 1)">+1</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, 5)">+5</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, 10)">+10</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, -5)">-5</button>
            </div>
            <div style="text-align:center; margin-bottom:10px">
                <button onclick="showHistory(${squad.id})" style="background:none; border:none; color:var(--accent-purple); cursor:pointer; font-size:0.8rem; text-decoration:underline;">📜 История баллов</button>
            </div>
            <div class="members-section">
                <strong>Состав:</strong>
                ${(squad.members || []).map((m, mi) => `
                    <div class="member-item">
                        ${m} <span style="cursor:pointer;color:red" onclick="deleteMember(${squad.id}, ${mi})">×</span>
                    </div>
                `).join('')}
                <button class="btn-add-member" onclick="addMember(${squad.id})">+ Добавить участника</button>
            </div>
            <button class="btn-delete-squad" onclick="deleteSquad(${squad.id})">Удалить отряд</button>
        `;
        grid.appendChild(card);
    });
    document.getElementById('total-bank').innerText = total.toLocaleString();
}
