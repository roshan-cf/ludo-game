const COLORS = {
    red: { start: 0 },
    green: { start: 13 },
    blue: { start: 26 },
    yellow: { start: 39 }
};

const MAIN_PATH = [
    { r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 },
    { r: 6, c: 5 }, { r: 5, c: 5 }, { r: 4, c: 5 }, { r: 3, c: 5 }, { r: 2, c: 5 }, { r: 1, c: 5 },
    { r: 1, c: 6 }, { r: 1, c: 7 }, { r: 1, c: 8 }, { r: 1, c: 9 },
    { r: 2, c: 9 }, { r: 3, c: 9 }, { r: 4, c: 9 }, { r: 5, c: 9 }, { r: 6, c: 9 },
    { r: 7, c: 10 }, { r: 7, c: 11 }, { r: 7, c: 12 }, { r: 7, c: 13 }, { r: 7, c: 14 },
    { r: 8, c: 14 }, { r: 9, c: 14 },
    { r: 9, c: 13 }, { r: 9, c: 12 }, { r: 9, c: 11 }, { r: 9, c: 10 }, { r: 9, c: 9 },
    { r: 10, c: 9 }, { r: 11, c: 9 }, { r: 12, c: 9 }, { r: 13, c: 9 }, { r: 14, c: 9 },
    { r: 14, c: 8 }, { r: 14, c: 7 }, { r: 14, c: 6 }, { r: 14, c: 5 },
    { r: 13, c: 5 }, { r: 12, c: 5 }, { r: 11, c: 5 }, { r: 10, c: 5 },
    { r: 9, c: 4 }, { r: 9, c: 3 }, { r: 9, c: 2 }, { r: 9, c: 1 },
    { r: 8, c: 1 }
];

const HOME_PATHS = {
    red:    [{r:7,c:7}, {r:6,c:7}, {r:5,c:7}, {r:4,c:7}, {r:3,c:7}, {r:2,c:7}, {r:1,c:7}],
    green:  [{r:7,c:7}, {r:8,c:7}, {r:9,c:7}, {r:10,c:7}, {r:11,c:7}, {r:12,c:7}, {r:13,c:7}],
    blue:   [{r:7,c:7}, {r:7,c:6}, {r:7,c:5}, {r:7,c:4}, {r:7,c:3}, {r:7,c:2}, {r:7,c:1}],
    yellow: [{r:7,c:7}, {r:7,c:8}, {r:7,c:9}, {r:7,c:10}, {r:7,c:11}, {r:7,c:12}, {r:7,c:13}]
};

const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

let gameState = {
    players: [],
    currentPlayer: 0,
    currentDice: null,
    canRoll: true,
    sixCount: 0,
    tokens: {}
};

document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    createBoard();
});

function setupEventListeners() {
    document.querySelectorAll('.count-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.count-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            playerCount = parseInt(e.target.dataset.count);
            updatePlayerInputs();
        });
    });

    document.getElementById('start-game').addEventListener('click', startGame);
    document.getElementById('roll-dice').addEventListener('click', rollDice);
    document.getElementById('dice').addEventListener('click', () => {
        if (gameState.canRoll) rollDice();
    });
    document.getElementById('new-game').addEventListener('click', resetGame);
    document.getElementById('play-again').addEventListener('click', () => {
        document.getElementById('winner-modal').classList.remove('active');
        resetGame();
    });
}

function updatePlayerInputs() {
    const rows = document.querySelectorAll('.player-row');
    const colors = ['red', 'green', 'blue', 'yellow'];
    rows.forEach((row, i) => {
        row.style.display = i < playerCount ? 'flex' : 'none';
        row.dataset.color = colors[i];
    });
}

function createBoard() {
    const board = document.getElementById('ludo-board');
    board.innerHTML = '';

    const bases = [
        { color: 'red', r1: 1, r2: 7, c1: 1, c2: 7 },
        { color: 'green', r1: 1, r2: 7, c1: 9, c2: 15 },
        { color: 'blue', r1: 9, r2: 15, c1: 9, c2: 15 },
        { color: 'yellow', r1: 9, r2: 15, c1: 1, c2: 7 }
    ];

    bases.forEach(base => {
        const baseEl = document.createElement('div');
        baseEl.className = `base ${base.color}`;
        baseEl.style.gridRow = `${base.r1} / ${base.r2}`;
        baseEl.style.gridColumn = `${base.c1} / ${base.c2}`;

        const inner = document.createElement('div');
        inner.className = 'base-inner';
        for (let i = 0; i < 4; i++) {
            const spot = document.createElement('div');
            spot.className = 'base-spot';
            spot.dataset.baseColor = base.color;
            spot.dataset.baseIndex = i;
            inner.appendChild(spot);
        }
        baseEl.appendChild(inner);
        board.appendChild(baseEl);
    });

    MAIN_PATH.forEach((coord, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell path-cell';
        cell.style.gridRow = coord.r;
        cell.style.gridColumn = coord.c;
        cell.dataset.pathIndex = idx;
        
        if (SAFE_POSITIONS.includes(idx)) {
            cell.classList.add('safe');
            const colorMap = {0:'red',8:'green',13:'blue',21:'yellow',26:'red',34:'green',39:'blue',47:'yellow'};
            cell.classList.add(`${colorMap[idx]}-safe`);
        }
        
        board.appendChild(cell);
    });

    Object.keys(HOME_PATHS).forEach(color => {
        HOME_PATHS[color].forEach((coord, idx) => {
            const cell = document.createElement('div');
            cell.className = `cell home-cell ${color}-home`;
            cell.style.gridRow = coord.r;
            cell.style.gridColumn = coord.c;
            cell.dataset.color = color;
            cell.dataset.homeIndex = idx;
            board.appendChild(cell);
        });
    });

    const center = document.createElement('div');
    center.className = 'center-home';
    center.style.gridRow = '7 / 10';
    center.style.gridColumn = '7 / 10';

    ['red', 'green', 'blue', 'yellow'].forEach(color => {
        const tri = document.createElement('div');
        tri.className = `home-triangle ${color}`;
        center.appendChild(tri);
    });
    board.appendChild(center);
}

function startGame() {
    const rows = document.querySelectorAll('.player-row');
    const colors = ['red', 'green', 'blue', 'yellow'];
    gameState.players = [];

    for (let i = 0; i < playerCount; i++) {
        const input = rows[i].querySelector('input');
        gameState.players.push({
            name: input.value || `Player ${i + 1}`,
            color: colors[i],
            tokensHome: 0
        });
    }

    gameState.tokens = {};
    gameState.players.forEach(player => {
        gameState.tokens[player.color] = [-1, -1, -1, -1];
    });

    gameState.currentPlayer = 0;
    gameState.canRoll = true;
    gameState.sixCount = 0;

    renderTokens();
    updateTurnIndicator();

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    showMessage(`${gameState.players[0].name}'s turn - Roll the dice!`);
}

function findCellForPosition(color, position) {
    if (position === -1) return null;
    
    if (position >= 51 && position <= 57) {
        const homeIdx = position - 51;
        const coords = HOME_PATHS[color][homeIdx];
        if (coords) {
            return document.querySelector(`.cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
        }
        if (position === 57) {
            return document.querySelector('.center-home');
        }
        return null;
    }
    
    const startIdx = COLORS[color].start;
    let pathIdx = (startIdx + position) % 52;
    const coords = MAIN_PATH[pathIdx];
    if (coords) {
        return document.querySelector(`.cell[data-row="${coords.r}"][data-col="${coords.c}"]`);
    }
    return null;
}

function renderTokens() {
    document.querySelectorAll('.token').forEach(t => t.remove());

    Object.keys(gameState.tokens).forEach(color => {
        gameState.tokens[color].forEach((pos, idx) => {
            createTokenElement(color, pos, idx);
        });
    });
}

function createTokenElement(color, position, index) {
    const token = document.createElement('div');
    token.className = `token ${color}`;
    token.dataset.color = color;
    token.dataset.index = index;

    if (position === -1) {
        const spots = document.querySelectorAll(`.base-spot[data-base-color="${color}"]`);
        if (spots[index]) {
            const spot = spots[index];
            if (!spot.querySelector('.token')) {
                token.classList.add('in-base');
                spot.appendChild(token);
            } else {
                let group = spot.querySelector('.token-group');
                if (!group) {
                    group = document.createElement('div');
                    group.className = 'token-group';
                    spot.innerHTML = '';
                    spot.appendChild(group);
                }
                token.classList.add('in-base');
                group.appendChild(token);
            }
        }
    } else {
        const cell = findCellForPosition(color, position);
        if (cell) {
            const existing = cell.querySelectorAll('.token');
            if (existing.length === 0) {
                cell.appendChild(token);
            } else if (existing.length < 4) {
                let group = cell.querySelector('.token-group');
                if (!group) {
                    group = document.createElement('div');
                    group.className = 'token-group';
                    existing.forEach(t => {
                        t.classList.remove('in-base');
                        group.appendChild(t);
                    });
                    cell.innerHTML = '';
                    cell.appendChild(group);
                }
                group.appendChild(token);
            }
        }
    }

    token.addEventListener('click', (e) => {
        e.stopPropagation();
        handleTokenClick(color, index);
    });
}

function rollDice() {
    if (!gameState.canRoll) return;

    gameState.canRoll = false;
    document.getElementById('roll-dice').disabled = true;

    const dice = document.getElementById('dice');
    dice.classList.add('rolling');

    const value = Math.floor(Math.random() * 6) + 1;
    gameState.currentDice = value;

    const rotations = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(0deg) rotateY(-90deg)',
        3: 'rotateX(0deg) rotateY(-180deg)',
        4: 'rotateX(0deg) rotateY(90deg)',
        5: 'rotateX(-90deg) rotateY(0deg)',
        6: 'rotateX(90deg) rotateY(0deg)'
    };

    setTimeout(() => {
        dice.classList.remove('rolling');
        dice.style.transform = rotations[value];
        setTimeout(() => handleDiceRoll(value), 300);
    }, 600);
}

function handleDiceRoll(value) {
    const player = gameState.players[gameState.currentPlayer];
    const color = player.color;
    const positions = gameState.tokens[color];
    const validMoves = [];

    positions.forEach((pos, idx) => {
        if (canMoveToken(color, idx, value)) {
            validMoves.push(idx);
        }
    });

    if (validMoves.length === 0) {
        showMessage(`No valid moves for ${player.name}`, '');
        if (value === 6) gameState.sixCount = 0;
        setTimeout(nextTurn, 1000);
        return;
    }

    if (value === 6) {
        gameState.sixCount++;
        if (gameState.sixCount >= 3) {
            showMessage('Three sixes! Turn lost.', '');
            gameState.sixCount = 0;
            setTimeout(nextTurn, 1000);
            return;
        }
        showMessage(`${player.name} rolled a 6! Roll again.`, 'bonus');
        gameState.canRoll = true;
        document.getElementById('roll-dice').disabled = false;
    }

    if (validMoves.length === 1) {
        moveToken(color, validMoves[0], value);
    } else {
        showMessage(`${player.name}: Click a token to move`);
    }
}

function canMoveToken(color, idx, diceValue) {
    const position = gameState.tokens[color][idx];

    if (position === -1) return diceValue === 6;

    if (position >= 51 && position <= 57) {
        const homePos = position - 51;
        return homePos + diceValue <= 6;
    }

    const startIdx = COLORS[color].start;
    let currentPathIdx = (startIdx + position) % 52;
    const stepsToHome = 51 - currentPathIdx;
    
    return diceValue <= stepsToHome;
}

function handleTokenClick(color, index) {
    const player = gameState.players[gameState.currentPlayer];
    if (color !== player.color || !gameState.currentDice) return;

    const diceValue = gameState.currentDice;
    if (!canMoveToken(color, index, diceValue)) return;

    moveToken(color, index, diceValue);
}

function moveToken(color, idx, diceValue) {
    const positions = gameState.tokens[color];
    const currentPos = positions[idx];
    const player = gameState.players[gameState.currentPlayer];

    if (currentPos === -1) {
        positions[idx] = 0;
        showMessage(`${player.name} released a token!`, 'bonus');
    } else if (currentPos >= 51 && currentPos <= 57) {
        const newHomePos = currentPos - 51 + diceValue;
        if (newHomePos === 6) {
            positions[idx] = 57;
            player.tokensHome++;
            showMessage(`${player.name}'s token reached home!`, 'bonus');
            if (player.tokensHome === 4) {
                showWinner();
                return;
            }
        } else {
            positions[idx] = 51 + newHomePos;
        }
    } else {
        const startIdx = COLORS[color].start;
        let currentPathIdx = (startIdx + currentPos) % 52;
        const stepsToHome = 51 - currentPathIdx;
        
        if (diceValue > stepsToHome) return;
        
        const newPos = currentPos + diceValue;
        
        if (currentPos + diceValue >= 51) {
            positions[idx] = currentPos + diceValue;
            const newHomePos = positions[idx] - 51;
            if (newHomePos === 6) {
                positions[idx] = 57;
                player.tokensHome++;
                showMessage(`${player.name}'s token reached home!`, 'bonus');
                if (player.tokensHome === 4) {
                    showWinner();
                    return;
                }
            }
        } else {
            positions[idx] = newPos;
            
            const captured = checkCapture(color, newPos);
            if (captured) {
                showMessage(`${player.name} captured ${captected}'s token!`, 'capture');
            } else if (checkBlock(color, newPos)) {
                showMessage(`${player.name} formed a block!`, 'block');
            }
        }
    }

    renderTokens();

    if (gameState.currentDice !== 6) {
        setTimeout(nextTurn, 500);
    } else {
        gameState.canRoll = true;
        document.getElementById('roll-dice').disabled = false;
    }
}

function checkCapture(color, tokenPos) {
    const startIdx = COLORS[color].start;
    let pathIdx = (startIdx + tokenPos) % 52;
    
    if (SAFE_POSITIONS.includes(pathIdx)) return null;

    for (const oppColor of Object.keys(gameState.tokens)) {
        if (oppColor === color) continue;
        
        const player = gameState.players.find(p => p.color === oppColor);
        if (!player) continue;

        for (let i = 0; i < gameState.tokens[oppColor].length; i++) {
            const oppPos = gameState.tokens[oppColor][i];
            if (oppPos === -1 || oppPos === 57 || oppPos >= 51) continue;

            const oppStartIdx = COLORS[oppColor].start;
            const oppPathIdx = (oppStartIdx + oppPos) % 52;
            
            if (pathIdx === oppPathIdx) {
                gameState.tokens[oppColor][i] = -1;
                return oppColor;
            }
        }
    }
    return null;
}

function checkBlock(color, tokenPos) {
    const positions = gameState.tokens[color];
    const startIdx = COLORS[color].start;
    let pathIdx = (startIdx + tokenPos) % 52;
    
    let count = 0;
    for (const pos of positions) {
        if (pos === -1 || pos >= 51) continue;
        const pIdx = (startIdx + pos) % 52;
        if (pIdx === pathIdx) count++;
    }
    
    return count >= 2;
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % gameState.players.length;
    gameState.currentDice = null;
    gameState.sixCount = 0;
    gameState.canRoll = true;

    updateTurnIndicator();
    const player = gameState.players[gameState.currentPlayer];
    showMessage(`${player.name}'s turn - Roll the dice!`);
    
    document.getElementById('roll-dice').disabled = false;
}

function updateTurnIndicator() {
    const player = gameState.players[gameState.currentPlayer];
    const colorDot = document.querySelector('.current-color-dot');
    const nameEl = document.querySelector('.current-player-name');

    const colorMap = { red: '#E63946', green: '#2A9D8F', blue: '#457B9D', yellow: '#F4A261' };
    colorDot.style.background = colorMap[player.color];
    nameEl.textContent = `${player.name}'s Turn`;
}

function showMessage(msg, type = '') {
    const msgEl = document.getElementById('game-message');
    msgEl.textContent = msg;
    msgEl.className = 'game-message';
    if (type) msgEl.classList.add(type);
}

function showWinner() {
    const winner = gameState.players[gameState.currentPlayer];
    document.getElementById('winner-name').textContent = `${winner.name} (${winner.color.toUpperCase()}) Wins!`;
    document.getElementById('winner-modal').classList.add('active');
}

function resetGame() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');
    document.getElementById('winner-modal').classList.remove('active');
    document.getElementById('dice').style.transform = 'rotateX(0deg) rotateY(0deg)';
    
    const rows = document.querySelectorAll('.player-row');
    rows.forEach((row, i) => {
        row.querySelector('input').value = `Player ${i + 1}`;
    });
}
