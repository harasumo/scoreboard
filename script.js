let squads = [];

window.onCloudUpdate((data) => {
    if (data) {
        squads = data;
    } else {
        squads = [{ id: Date.now(), name: "Отряд №1", members: [] }];
        save();
    }
    render();
});

function save() {
    window.saveToCloud(squads);
}

// Кнопки быстрой прибавки (+1, +5)
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

// РУЧНОЙ ВВОД: СКОЛЬКО БАЛЛОВ ДОБАВИТЬ
window.addKidPointsManual = (squadId, kidId) => {
    const squad = squads.find(s => s.id === squadId);
    const kid = squad.members.find(k => k.id === kidId);
    if (kid) {
        const input = prompt(`Сколько баллов начислить для ${kid.name}?\n(Например: 15 или -10)`);
        if (input !== null && input !== "" && !isNaN(input)) {
            kid.points += parseInt(input);
            if (kid.points < 0) kid.points = 0;
            save();
        }
    }
};

window.addKid = (squadId) => {
    const name = prompt("Имя ребенка:");
    if (name) {
        const squad = squads.find(s => s.id === squadId);
        if (!squad.members) squad.members = [];
        squad.members.push({ id: Date.now(), name: name, points: 0 });
        save();
    }
};

window.deleteKid = (squadId, kidId) => {
    if (confirm("Удалить ребенка?")) {
        const squad = squads.find(s => s.id === squadId);
        squad.members = squad.members.filter(k => k.id !== kidId);
        save();
    }
};

document.getElementById('add-squad-btn').onclick = () => {
    const name = prompt("Название отряда:");
    if (name) { squads.push({ id: Date.now(), name: name, members: [] }); save(); }
};

window.deleteSquad = (id) => {
    if (confirm("Удалить весь отряд?")) { squads = squads.filter(s => s.id !== id); save(); }
};

window.editSquadName = (id) => {
    const squad = squads.find(s => s.id === id);
    const n = prompt("Новое название отряда:", squad.name);
    if (n) { squad.name = n; save(); }
};

function render() {
    let globalTotal = 0;
    let allKidsList = [];

    squads.forEach(s => {
        let squadSum = 0;
        (s.members || []).forEach(k => {
            squadSum += k.points;
            allKidsList.push({ ...k, squadName: s.name });
        });
        s.currentSum = squadSum;
        globalTotal += squadSum;
    });

    squads.sort((a, b) => b.currentSum - a.currentSum);
    allKidsList.sort((a, b) => b.points - a.points);
    const top10Kids = allKidsList.slice(0, 10);

    document.getElementById('total-bank').innerText = globalTotal.toLocaleString();

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
    `).join('') || '<p style="text-align:center; opacity:0.5; color:white">Добавьте участников...</p>';

    const grid = document.getElementById('squads-grid');
    grid.innerHTML = '';

    squads.forEach((squad, i) => {
        const card = document.createElement('div');
        card.className = `squad-card ${i === 0 ? 'top-1' : ''}`;
        card.innerHTML = `
            <h3 class="squad-name" style="cursor:pointer" onclick="editSquadName(${squad.id})">${squad.name} ✏️</h3>
            <div class="squad-points">${squad.currentSum}</div>

            <div class="members-section">
                ${(squad.members || []).map(k => `
                    <div class="member-row">
                        <div class="member-info">
                            <span class="member-name">${k.name}</span>
                            <div class="member-score-display">${k.points} 💰</div>
                        </div>
                        <div class="member-controls">
                            <button class="btn-manual" onclick="addKidPointsManual(${squad.id}, ${k.id})">+...</button>
                            <button class="btn-mini" onclick="changeKidPoints(${squad.id}, ${k.id}, 5)">+5</button>
                            <button class="btn-del" onclick="deleteKid(${squad.id}, ${k.id})">×</button>
                        </div>
                    </div>
                `).join('')}
                <button class="btn-add-kid" onclick="addKid(${squad.id})">+ Ребенок</button>
            </div>
            <button style="border:none; background:none; color:#94a3b8; font-size:0.6rem; cursor:pointer; margin-top:15px; width:100%; text-decoration:underline" onclick="deleteSquad(${squad.id})">удалить отряд</button>
        `;
        grid.appendChild(card);
    });
}
