const COLORS = {
    red: { start: 0 },
    green: { start: 13 },
    blue: { start: 26 },
    yellow: { start: 39 }
};

const BOARD_LAYOUT = [
    { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 8 },
    { row: 7, col: 8 }, { row: 8, col: 8 },
    { row: 8, col: 7 }, { row: 8, col: 6 },
    { row: 7, col: 6 }
];

const MAIN_PATH = [
    { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 },
    { row: 6, col: 5 }, { row: 5, col: 5 }, { row: 4, col: 5 }, { row: 3, col: 5 }, { row: 2, col: 5 }, { row: 1, col: 5 },
    { row: 1, col: 6 }, { row: 1, col: 7 },
    { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 },
    { row: 6, col: 8 }, { row: 6, col: 9 }, { row: 5, col: 9 }, { row: 4, col: 9 }, { row: 3, col: 9 }, { row: 2, col: 9 }, { row: 1, col: 9 },
    { row: 1, col: 10 }, { row: 1, col: 11 }, { row: 1, col: 12 }, { row: 1, col: 13 },
    { row: 2, col: 13 }, { row: 3, col: 13 }, { row: 4, col: 13 }, { row: 5, col: 13 }, { row: 6, col: 13 },
    { row: 7, col: 14 },
    { row: 8, col: 14 },
    { row: 9, col: 13 }, { row: 10, col: 13 }, { row: 11, col: 13 }, { row: 12, col: 13 }, { row: 13, col: 13 },
    { row: 13, col: 12 }, { row: 13, col: 11 }, { row: 13, col: 10 }, { row: 13, col: 9 },
    { row: 12, col: 9 }, { row: 11, col: 9 }, { row: 10, col: 9 }, { row: 9, col: 9 }, { row: 8, col: 9 },
    { row: 8, col: 8 }, { row: 8, col: 7 },
    { row: 9, col: 7 }, { row: 10, col: 7 }, { row: 11, col: 7 }, { row: 12, col: 7 }, { row: 13, col: 7 },
    { row: 13, col: 6 }, { row: 13, col: 5 }, { row: 13, col: 4 }, { row: 13, col: 3 }, { row: 13, col: 2 }, { row: 13, col: 1 },
    { row: 12, col: 1 }, { row: 11, col: 1 }, { row: 10, col: 1 }, { row: 9, col: 1 }, { row: 8, col: 1 },
    { row: 7, col: 1 }
];

const HOME_PATHS = {
    red: [
        { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }
    ],
    green: [
        { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }
    ],
    blue: [
        { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 }
    ],
    yellow: [
        { row: 12, col: 7 }, { row: 11, col: 7 }, { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 }
    ]
};

const SAFE_SPOTS = [
    { row: 7, col: 1 },
    { row: 1, col: 7 },
    { row: 7, col: 13 },
    { row: 13, col: 7 },
    { row: 7, col: 9 },
    { row: 3, col: 7 },
    { row: 7, col: 5 },
    { row: 11, col: 7 }
];

const BASE_POSITIONS = {
    red: { rowStart: 1, rowEnd: 6, colStart: 1, colEnd: 6 },
    green: { rowStart: 1, rowEnd: 6, colStart: 9, colEnd: 14 },
    blue: { rowStart: 9, rowEnd: 14, colStart: 9, colEnd: 14 },
    yellow: { rowStart: 9, rowEnd: 14, colStart: 1, colEnd: 6 }
};

const HOME_TRIANGLE = {
    red: { rowStart: 1, rowEnd: 6, colStart: 7, colEnd: 7 },
    green: { rowStart: 7, rowEnd: 7, colStart: 9, colEnd: 14 },
    blue: { rowStart: 9, rowEnd: 14, colStart: 7, colEnd: 7 },
    yellow: { rowStart: 7, rowEnd: 7, colStart: 1, colEnd: 6 }
};

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

    Object.keys(BASE_POSITIONS).forEach(color => {
        const pos = BASE_POSITIONS[color];
        
        const baseEl = document.createElement('div');
        baseEl.className = `base ${color}`;
        baseEl.style.gridRow = `${pos.rowStart} / ${pos.rowEnd + 1}`;
        baseEl.style.gridColumn = `${pos.colStart} / ${pos.colEnd + 1}`;

        const inner = document.createElement('div');
        inner.className = 'base-inner';
        for (let i = 0; i < 4; i++) {
            const spot = document.createElement('div');
            spot.className = 'base-spot';
            spot.dataset.baseColor = color;
            spot.dataset.baseIndex = i;
            inner.appendChild(spot);
        }
        baseEl.appendChild(inner);
        board.appendChild(baseEl);
    });

    const pathMap = new Map();
    MAIN_PATH.forEach((coord, index) => {
        const key = `${coord.row}-${coord.col}`;
        pathMap.set(key, { index, type: 'main' });
    });

    Object.keys(HOME_PATHS).forEach(color => {
        HOME_PATHS[color].forEach((coord, index) => {
            const key = `${coord.row}-${coord.col}`;
            pathMap.set(key, { index, type: 'home', color, homeIndex: index });
        });
    });

    const allCoords = new Set();
    MAIN_PATH.forEach(c => allCoords.add(`${c.row}-${c.col}`));
    Object.values(HOME_PATHS).forEach(arr => arr.forEach(c => allCoords.add(`${c.row}-${c.col}`)));

    for (let row = 1; row <= 13; row++) {
        for (let col = 1; col <= 13; col++) {
            const key = `${row}-${col}`;
            if (!allCoords.has(key) && !isBaseArea(row, col)) {
                const cell = document.createElement('div');
                cell.className = 'cell empty-cell';
                cell.style.gridRow = row;
                cell.style.gridColumn = col;
                board.appendChild(cell);
            }
        }
    }

    MAIN_PATH.forEach((coord, index) => {
        const cell = document.createElement('div');
        cell.className = 'cell path-cell';
        cell.style.gridRow = coord.row;
        cell.style.gridColumn = coord.col;
        cell.dataset.pathIndex = index;
        cell.dataset.type = 'main';

        const isSafe = isSafeSpot(coord.row, coord.col);
        if (isSafe) {
            cell.classList.add('safe');
            cell.dataset.safeColor = getSafeColor(index);
            cell.classList.add(`${cell.dataset.safeColor}-safe`);
        }

        board.appendChild(cell);
    });

    Object.keys(HOME_PATHS).forEach(color => {
        HOME_PATHS[color].forEach((coord, index) => {
            const cell = document.createElement('div');
            cell.className = `cell home-cell ${color}-home`;
            cell.style.gridRow = coord.row;
            cell.style.gridColumn = coord.col;
            cell.dataset.type = 'home';
            cell.dataset.color = color;
            cell.dataset.homeIndex = index;
            board.appendChild(cell);
        });
    });

    const center = document.createElement('div');
    center.className = 'center-home';
    center.style.gridRow = '7 / 8';
    center.style.gridColumn = '7 / 8';

    ['red', 'green', 'blue', 'yellow'].forEach(color => {
        const triangle = document.createElement('div');
        triangle.className = `home-triangle ${color}`;
        center.appendChild(triangle);
    });
    board.appendChild(center);
}

function isBaseArea(row, col) {
    return (row >= 1 && row <= 6 && col >= 1 && col <= 6) ||
           (row >= 1 && row <= 6 && col >= 8 && col <= 13) ||
           (row >= 8 && row <= 13 && col >= 1 && col <= 6) ||
           (row >= 8 && row <= 13 && col >= 8 && col <= 13);
}

function isSafeSpot(row, col) {
    return SAFE_SPOTS.some(s => s.row === row && s.col === col);
}

function getSafeColor(pathIndex) {
    const safeMap = { 0: 'red', 8: 'green', 13: 'blue', 21: 'yellow', 26: 'red', 34: 'green', 39: 'blue', 47: 'yellow' };
    return safeMap[pathIndex];
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

function getPathPosition(color, tokenPos) {
    if (tokenPos === -1) return null;
    if (tokenPos >= 51 && tokenPos <= 55) {
        return { type: 'home', color, homeIndex: tokenPos - 51 };
    }
    if (tokenPos === 56) return { type: 'home' };
    
    const startIndex = COLORS[color].start;
    let pathIndex = (startIndex + tokenPos) % 52;
    return { type: 'main', pathIndex };
}

function findCellForPosition(color, position) {
    if (position === -1) return null;
    
    if (position >= 51 && position <= 55) {
        const homeIndex = position - 51;
        const coords = HOME_PATHS[color][homeIndex];
        if (coords) {
            return document.querySelector(`.cell[data-row="${coords.row}"][data-col="${coords.col}"]`);
        }
        return null;
    }
    
    if (position >= 56) {
        return document.querySelector('.center-home');
    }
    
    const startIndex = COLORS[color].start;
    let pathIndex = (startIndex + position) % 52;
    const coords = MAIN_PATH[pathIndex];
    if (coords) {
        return document.querySelector(`.cell[data-row="${coords.row}"][data-col="${coords.col}"]`);
    }
    return null;
}

function renderTokens() {
    document.querySelectorAll('.token').forEach(t => t.remove());

    Object.keys(gameState.tokens).forEach(color => {
        gameState.tokens[color].forEach((pos, index) => {
            createTokenElement(color, pos, index);
        });
    });
}

function createTokenElement(color, position, index) {
    const token = document.createElement('div');
    token.className = `token ${color}`;
    token.dataset.color = color;
    token.dataset.index = index;

    if (position === -1) {
        const baseSpots = document.querySelectorAll(`.base-spot[data-base-color="${color}"]`);
        if (baseSpots[index]) {
            const spot = baseSpots[index];
            if (!spot.querySelector('.token')) {
                token.classList.add('in-base');
                spot.appendChild(token);
            } else {
                const group = spot.querySelector('.token-group') || createTokenGroup(spot);
                token.classList.add('in-base');
                group.appendChild(token);
            }
        }
    } else if (position >= 51 && position <= 55) {
        const homePos = position - 51;
        const coords = HOME_PATHS[color][homePos];
        if (coords) {
            const cell = document.querySelector(`.cell[data-row="${coords.row}"][data-col="${coords.col}"]`);
            if (cell) cell.appendChild(token);
        }
    } else if (position >= 56) {
        const center = document.querySelector('.center-home');
        if (center) center.appendChild(token);
    } else {
        const cell = findCellForPosition(color, position);
        if (cell) {
            const existingTokens = cell.querySelectorAll('.token');
            if (existingTokens.length === 0) {
                cell.appendChild(token);
            } else if (existingTokens.length < 3) {
                let group = cell.querySelector('.token-group');
                if (!group) {
                    group = createTokenGroup(cell);
                    existingTokens.forEach(t => {
                        t.classList.remove('in-base');
                        group.appendChild(t);
                    });
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

function createTokenGroup(container) {
    const group = document.createElement('div');
    group.className = 'token-group';
    container.innerHTML = '';
    container.appendChild(group);
    return group;
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

    positions.forEach((pos, index) => {
        if (canMoveToken(color, index, value)) {
            validMoves.push(index);
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

function canMoveToken(color, index, diceValue) {
    const position = gameState.tokens[color][index];

    if (position === -1) {
        return diceValue === 6;
    }

    if (position >= 51 && position <= 55) {
        const homePos = position - 51;
        return homePos + diceValue <= 4;
    }

    if (position >= 56) {
        return false;
    }

    const startIndex = COLORS[color].start;
    let currentPathIndex = (startIndex + position) % 52;
    let stepsToHome = getStepsToHome(color, currentPathIndex);
    
    return diceValue <= stepsToHome;
}

function getStepsToHome(color, pathIndex) {
    const startIndex = COLORS[color].start;
    let distance = (pathIndex - startIndex + 52) % 52;
    return 51 - distance;
}

function handleTokenClick(color, index) {
    const player = gameState.players[gameState.currentPlayer];
    if (color !== player.color || !gameState.currentDice) return;

    const diceValue = gameState.currentDice;
    if (!canMoveToken(color, index, diceValue)) return;

    moveToken(color, index, diceValue);
}

function moveToken(color, index, diceValue) {
    const positions = gameState.tokens[color];
    const currentPos = positions[index];
    const player = gameState.players[gameState.currentPlayer];

    if (currentPos === -1) {
        positions[index] = 0;
        showMessage(`${player.name} released a token!`, 'bonus');
    } else if (currentPos >= 51 && currentPos <= 55) {
        const newHomePos = currentPos - 51 + diceValue;
        if (newHomePos === 4) {
            positions[index] = 56;
            player.tokensHome++;
            showMessage(`${player.name}'s token reached home!`, 'bonus');
            
            if (player.tokensHome === 4) {
                showWinner();
                return;
            }
        } else {
            positions[index] = 51 + newHomePos;
        }
    } else {
        const startIndex = COLORS[color].start;
        let currentPathIndex = (startIndex + currentPos) % 52;
        const stepsToHome = getStepsToHome(color, currentPathIndex);
        
        if (diceValue > stepsToHome) {
            return;
        }
        
        const newPos = currentPos + diceValue;
        
        if (currentPos + diceValue >= 51) {
            positions[index] = currentPos + diceValue;
            const newHomePos = positions[index] - 51;
            if (newHomePos === 4) {
                positions[index] = 56;
                player.tokensHome++;
                showMessage(`${player.name}'s token reached home!`, 'bonus');
                
                if (player.tokensHome === 4) {
                    showWinner();
                    return;
                }
            }
        } else {
            positions[index] = newPos;
            
            const captured = checkCapture(color, newPos);
            if (captured) {
                showMessage(`${player.name} captured ${captured}'s token!`, 'capture');
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
    const startIndex = COLORS[color].start;
    let pathIndex = (startIndex + tokenPos) % 52;
    
    const safeIndices = [0, 8, 13, 21, 26, 34, 39, 47];
    if (safeIndices.includes(pathIndex)) return null;

    for (const oppColor of Object.keys(gameState.tokens)) {
        if (oppColor === color) continue;
        
        const player = gameState.players.find(p => p.color === oppColor);
        if (!player) continue;

        for (let i = 0; i < gameState.tokens[oppColor].length; i++) {
            const oppPos = gameState.tokens[oppColor][i];
            if (oppPos === -1 || oppPos === 56 || oppPos >= 51) continue;

            const oppStartIndex = COLORS[oppColor].start;
            const oppPathIndex = (oppStartIndex + oppPos) % 52;
            
            if (pathIndex === oppPathIndex) {
                gameState.tokens[oppColor][i] = -1;
                return oppColor;
            }
        }
    }
    return null;
}

function checkBlock(color, tokenPos) {
    const positions = gameState.tokens[color];
    const startIndex = COLORS[color].start;
    let pathIndex = (startIndex + tokenPos) % 52;
    
    let count = 0;
    for (const pos of positions) {
        if (pos === -1 || pos >= 51) continue;
        const pIndex = (startIndex + pos) % 52;
        if (pIndex === pathIndex) count++;
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
