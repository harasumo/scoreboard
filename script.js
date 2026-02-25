// Тестовые данные для начала
let squads = JSON.parse(localStorage.getItem('aschool_data')) || [
    { id: 1, name: "Альфа-Пантеры", points: 150, members: ["Никита", "Софья"] },
    { id: 2, name: "Зеленые Драконы", points: 120, members: ["Артем", "Ева"] }
];

function save() {
    localStorage.setItem('aschool_data', JSON.stringify(squads));
    render();
}

function updatePoints(id, amount) {
    const squad = squads.find(s => s.id === id);
    if (squad) {
        squad.points += amount;
        if (squad.points < 0) squad.points = 0;
        const el = document.getElementById(`points-${id}`);
        el.classList.add('pulse');
        setTimeout(() => el.classList.remove('pulse'), 500);
        save();
    }
}

document.getElementById('add-squad-btn').onclick = () => {
    const name = prompt("Название нового отряда:");
    if (name) {
        squads.push({ id: Date.now(), name, points: 0, members: [] });
        save();
    }
};

function deleteSquad(id) {
    if (confirm("Удалить этот отряд?")) {
        squads = squads.filter(s => s.id !== id);
        save();
    }
}

function addMember(squadId) {
    const name = prompt("Имя участника:");
    if (name) {
        squads.find(s => s.id === squadId).members.push(name);
        save();
    }
}

function deleteMember(squadId, index) {
    squads.find(s => s.id === squadId).members.splice(index, 1);
    save();
}

function editName(id) {
    const squad = squads.find(s => s.id === id);
    const n = prompt("Новое название:", squad.name);
    if (n) { squad.name = n; save(); }
}

function render() {
    squads.sort((a, b) => b.points - a.points);
    const grid = document.getElementById('squads-grid');
    const bank = document.getElementById('total-bank');
    grid.innerHTML = '';
    let total = 0;

    squads.forEach((squad, i) => {
        total += squad.points;
        const card = document.createElement('div');
        card.className = `squad-card ${i === 0 ? 'top-1' : ''}`;
        card.innerHTML = `
            <div class="rank-badge">${i + 1}</div>
            <div class="squad-name" onclick="editName(${squad.id})">${squad.name}</div>
            <div class="squad-points" id="points-${squad.id}">${squad.points}</div>
            <div class="score-controls">
                <button class="btn-score" onclick="updatePoints(${squad.id}, 1)">+1</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, 5)">+5</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, 10)">+10</button>
                <button class="btn-score" onclick="updatePoints(${squad.id}, -5)">-5</button>
            </div>
            <div class="members-section">
                <strong>Состав:</strong>
                ${squad.members.map((m, mi) => `
                    <div class="member-item">
                        ${m} <span style="cursor:pointer;color:red" onclick="deleteMember(${squad.id}, ${mi})">×</span>
                    </div>
                `).join('')}
                <button class="btn-add-member" onclick="addMember(${squad.id})">+ Добавить</button>
            </div>
            <button class="btn-delete-squad" onclick="deleteSquad(${squad.id})">Удалить отряд</button>
        `;
        grid.appendChild(card);
    });
    bank.innerText = total;
}

render();