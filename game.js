// Ludo Game - Complete Implementation
// Board: 15x15 grid with 52 main path cells + 5 home path cells per color

const PATH_COORDS = [
    // Starting from Red's entry (row 7, col 1), going clockwise
    {r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}, {r:7,c:6},  // 0-5
    {r:6,c:6}, {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6},  // 6-11
    {r:1,c:7}, {r:1,c:8}, {r:1,c:9},                                     // 12-14
    {r:2,c:9}, {r:3,c:9}, {r:4,c:9}, {r:5,c:9}, {r:6,c:9}, {r:7,c:9}, // 15-20
    {r:7,c:10}, {r:7,c:11}, {r:7,c:12}, {r:7,c:13}, {r:7,c:14}, {r:7,c:15}, // 21-26
    {r:8,c:15}, {r:9,c:15},                                              // 27-28
    {r:9,c:14}, {r:9,c:13}, {r:9,c:12}, {r:9,c:11}, {r:9,c:10}, {r:9,c:9}, // 29-34
    {r:10,c:9}, {r:11,c:9}, {r:12,c:9}, {r:13,c:9}, {r:14,c:9}, {r:15,c:9}, // 35-40
    {r:15,c:8}, {r:15,c:7}, {r:15,c:6},                                 // 41-43
    {r:14,c:6}, {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, // 44-49
    {r:9,c:5}, {r:9,c:4}, {r:9,c:3}, {r:9,c:2},                         // 50-53
    {r:8,c:1}                                                              // 54 (returns to start)
];

// Safe positions on main path
const SAFE_POSITIONS = [0, 8, 13, 21, 26, 34, 39, 47];

// Color configurations - start position on main path
const COLORS = {
    red: { 
        name: 'red', 
        start: 0, 
        homePath: [
            {r:7,c:6}, {r:7,c:5}, {r:7,c:4}, {r:7,c:3}, {r:7,c:2}
        ]
    },
    green: { 
        name: 'green', 
        start: 13, 
        homePath: [
            {r:6,c:10}, {r:5,c:10}, {r:4,c:10}, {r:3,c:10}, {r:2,c:10}
        ]
    },
    yellow: { 
        name: 'yellow', 
        start: 26, 
        homePath: [
            {r:10,c:7}, {r:11,c:7}, {r:12,c:7}, {r:13,c:7}, {r:14,c:7}
        ]
    },
    blue: { 
        name: 'blue', 
        start: 39, 
        homePath: [
            {r:8,c:7}, {r:9,c:7}, {r:10,c:7}, {r:11,c:7}, {r:12,c:7}
        ]
    }
};

// Game State
let gameState = {
    players: [],
    currentPlayer: 0,
    diceValue: 0,
    canRoll: true,
    waitingForMove: false,
    sixCount: 0
};

let playerCount = 3;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    createBoard();
});

function setupEventListeners() {
    // Player count selection
    document.querySelectorAll('.player-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.player-btn').forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            playerCount = parseInt(e.target.dataset.players);
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
    const colors = ['red', 'green', 'yellow', 'blue'];
    document.querySelectorAll('.input-row').forEach((row, i) => {
        row.style.display = i < playerCount ? 'flex' : 'none';
    });
}

function createBoard() {
    const board = document.getElementById('ludo-board');
    board.innerHTML = '';

    // Create base corners
    const baseColors = ['red', 'green', 'yellow', 'blue'];
    baseColors.forEach(color => {
        const base = document.createElement('div');
        base.className = `base base-${color}`;
        
        const inner = document.createElement('div');
        inner.className = 'base-inner';
        for (let i = 0; i < 4; i++) {
            const spot = document.createElement('div');
            spot.className = 'base-spot';
            spot.dataset.color = color;
            spot.dataset.index = i;
            inner.appendChild(spot);
        }
        base.appendChild(inner);
        board.appendChild(base);
    });

    // Create main path cells
    PATH_COORDS.forEach((coord, idx) => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.style.gridRow = coord.r;
        cell.style.gridColumn = coord.c;
        cell.dataset.pathIndex = idx;

        // Mark safe cells
        if (SAFE_POSITIONS.includes(idx)) {
            cell.classList.add('safe');
            const safeColor = getSafeColor(idx);
            cell.classList.add(`safe-${safeColor}`);
        }

        board.appendChild(cell);
    });

    // Create home path cells for each color
    Object.keys(COLORS).forEach(color => {
        const config = COLORS[color];
        config.homePath.forEach((coord, idx) => {
            const cell = document.createElement('div');
            cell.className = `cell hp-${color}-${idx}`;
            cell.style.gridRow = coord.r;
            cell.style.gridColumn = coord.c;
            cell.dataset.color = color;
            cell.dataset.homeIndex = idx;
            board.appendChild(cell);
        });
    });

    // Create center home
    const center = document.createElement('div');
    center.className = 'center-home';
    ['red', 'green', 'yellow', 'blue'].forEach(color => {
        const tri = document.createElement('div');
        tri.className = `home-triangle ${color}`;
        center.appendChild(tri);
    });
    board.appendChild(center);
}

function getSafeColor(pathIndex) {
    const map = {0:'red', 8:'green', 13:'yellow', 21:'red', 26:'green', 34:'yellow', 39:'blue', 47:'red'};
    return map[pathIndex];
}

function startGame() {
    const colors = ['red', 'green', 'yellow', 'blue'];
    gameState.players = [];

    for (let i = 0; i < playerCount; i++) {
        const input = document.getElementById(`name-${colors[i]}`);
        gameState.players.push({
            name: input.value || `Player ${i+1}`,
            color: colors[i],
            tokens: [-1, -1, -1, -1], // -1 = in base, 0-54 = main path, 55-59 = home path, 60 = finished
            finished: 0
        });
    }

    gameState.currentPlayer = 0;
    gameState.canRoll = true;
    gameState.waitingForMove = false;
    gameState.sixCount = 0;

    document.getElementById('setup-screen').classList.remove('active');
    renderTokens();
    updateTurnIndicator();
    showMessage(`${gameState.players[0].name}'s turn - Roll the dice!`);
}

function renderTokens() {
    // Clear existing tokens
    document.querySelectorAll('.token').forEach(t => t.remove());

    // Render each player's tokens
    gameState.players.forEach(player => {
        player.tokens.forEach((pos, idx) => {
            createToken(player.color, pos, idx);
        });
    });
}

function createToken(color, position, index) {
    const token = document.createElement('div');
    token.className = `token ${color}`;
    token.dataset.color = color;
    token.dataset.index = index;

    if (position === -1) {
        // Token in base
        const spot = document.querySelector(`.base-spot[data-color="${color}"][data-index="${index}"]`);
        if (spot) {
            token.classList.add('in-base');
            if (!spot.querySelector('.token')) {
                spot.appendChild(token);
            } else {
                let group = spot.querySelector('.token-group');
                if (!group) {
                    group = document.createElement('div');
                    group.className = 'token-group';
                    spot.innerHTML = '';
                    spot.appendChild(group);
                }
                group.appendChild(token);
            }
        }
    } else if (position >= 60) {
        // Token finished - in center
        const center = document.querySelector('.center-home');
        if (center) center.appendChild(token);
    } else if (position >= 55) {
        // Token in home path
        const homeIdx = position - 55;
        const config = COLORS[color];
        if (config && config.homePath[homeIdx]) {
            const coord = config.homePath[homeIdx];
            const cell = document.querySelector(`.hp-${color}-${homeIdx}`);
            if (cell) cell.appendChild(token);
        }
    } else {
        // Token on main path
        const coord = PATH_COORDS[position];
        const cell = document.querySelector(`.cell[data-path-index="${position}"]`);
        if (cell) {
            const existingTokens = cell.querySelectorAll('.token');
            if (existingTokens.length === 0) {
                cell.appendChild(token);
            } else if (existingTokens.length < 3) {
                let group = cell.querySelector('.token-group');
                if (!group) {
                    group = document.createElement('div');
                    group.className = 'token-group';
                    existingTokens.forEach(t => {
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
    gameState.diceValue = value;

    // Show dice face
    const rotations = {
        1: 'rotateX(0deg) rotateY(0deg)',
        2: 'rotateX(-90deg) rotateY(0deg)',
        3: 'rotateX(0deg) rotateY(-90deg)',
        4: 'rotateX(0deg) rotateY(90deg)',
        5: 'rotateX(90deg) rotateY(0deg)',
        6: 'rotateX(180deg) rotateY(0deg)'
    };

    setTimeout(() => {
        dice.classList.remove('rolling');
        dice.style.transform = rotations[value];
        
        setTimeout(() => handleDiceRoll(value), 300);
    }, 600);
}

function handleDiceRoll(value) {
    const player = gameState.players[gameState.currentPlayer];
    const validMoves = [];

    player.tokens.forEach((pos, idx) => {
        if (canMoveToken(player.color, pos, value)) {
            validMoves.push(idx);
        }
    });

    if (validMoves.length === 0) {
        showMessage(`No valid moves for ${player.name}`);
        if (value === 6) gameState.sixCount = 0;
        setTimeout(nextTurn, 1000);
        return;
    }

    // Handle rolling 6 (bonus turn)
    if (value === 6) {
        gameState.sixCount++;
        if (gameState.sixCount >= 3) {
            showMessage('Three sixes! Turn lost.');
            gameState.sixCount = 0;
            setTimeout(nextTurn, 1000);
            return;
        }
        showMessage(`${player.name} rolled a 6! Roll again.`, 'bonus');
        gameState.canRoll = true;
        document.getElementById('roll-dice').disabled = false;
    }

    if (validMoves.length === 1) {
        moveToken(validMoves[0], value);
    } else {
        gameState.waitingForMove = true;
        showMessage(`${player.name}: Click a token to move`);
        highlightMovableTokens(player.color, validMoves);
    }
}

function canMoveToken(color, position, diceValue) {
    if (position === -1) {
        return diceValue === 6;
    }

    if (position >= 60) {
        return false; // Already finished
    }

    if (position >= 55) {
        // In home path
        const homePos = position - 55;
        return homePos + diceValue <= 4;
    }

    // On main path - check if can enter home
    const config = COLORS[color];
    let currentPathPos = position;
    let distanceToHome = (52 - currentPathPos + config.start) % 52;
    
    // If going past start position this lap
    if (currentPathPos < config.start) {
        distanceToHome = config.start - currentPathPos;
    } else {
        distanceToHome = 52 - currentPathPos + config.start;
    }

    return diceValue <= distanceToHome + 5; // 5 cells in home path
}

function handleTokenClick(color, index) {
    const player = gameState.players[gameState.currentPlayer];
    
    if (color !== player.color || !gameState.waitingForMove) return;

    const diceValue = gameState.diceValue;
    const pos = player.tokens[index];

    if (!canMoveToken(color, pos, diceValue)) return;

    moveToken(index, diceValue);
}

function moveToken(tokenIndex, diceValue) {
    const player = gameState.players[gameState.currentPlayer];
    const color = player.color;
    let currentPos = player.tokens[tokenIndex];
    const config = COLORS[color];

    // Remove highlight
    document.querySelectorAll('.token').forEach(t => t.classList.remove('selected'));
    gameState.waitingForMove = false;

    if (currentPos === -1) {
        // Release from base
        player.tokens[tokenIndex] = config.start;
        showMessage(`${player.name} released a token!`, 'bonus');
    } else if (currentPos >= 55) {
        // In home path
        const homePos = currentPos - 55;
        const newHomePos = homePos + diceValue;
        
        if (newHomePos === 4) {
            player.tokens[tokenIndex] = 60; // Finished
            player.finished++;
            showMessage(`${player.name}'s token reached home!`, 'bonus');
            
            if (player.finished === 4) {
                showWinner(player);
                return;
            }
        } else {
            player.tokens[tokenIndex] = 55 + newHomePos;
        }
    } else {
        // On main path
        let newPos = currentPos + diceValue;
        
        // Check if entering home
        const distanceToHome = getDistanceToHome(color, currentPos);
        
        if (diceValue > distanceToHome) {
            // Enter home path
            const homeEntryPos = diceValue - distanceToHome - 1;
            if (homeEntryPos <= 4) {
                player.tokens[tokenIndex] = 55 + homeEntryPos;
            } else {
                return; // Can't move this way
            }
        } else {
            // Stay on main path
            player.tokens[tokenIndex] = newPos % 52;
            
            // Check for capture
            const captured = checkCapture(color, newPos % 52);
            if (captured) {
                showMessage(`${player.name} captured ${captured}'s token!`, 'capture');
            }
        }
    }

    renderTokens();

    if (diceValue !== 6) {
        setTimeout(nextTurn, 500);
    } else {
        gameState.canRoll = true;
        document.getElementById('roll-dice').disabled = false;
    }
}

function getDistanceToHome(color, position) {
    const config = COLORS[color];
    if (position < config.start) {
        return config.start - position;
    }
    return 52 - position + config.start;
}

function checkCapture(color, position) {
    if (SAFE_POSITIONS.includes(position)) return null;

    for (const player of gameState.players) {
        if (player.color === color) continue;
        
        for (let i = 0; i < player.tokens.length; i++) {
            const pos = player.tokens[i];
            if (pos === -1 || pos >= 55) continue;
            
            if (pos === position) {
                player.tokens[i] = -1; // Send back to base
                return player.name;
            }
        }
    }
    return null;
}

function highlightMovableTokens(color, validIndices) {
    validIndices.forEach(idx => {
        const token = document.querySelector(`.token[data-color="${color}"][data-index="${idx}"]`);
        if (token) token.classList.add('selected');
    });
}

function nextTurn() {
    gameState.currentPlayer = (gameState.currentPlayer + 1) % playerCount;
    gameState.diceValue = 0;
    gameState.sixCount = 0;
    gameState.canRoll = true;
    gameState.waitingForMove = false;

    updateTurnIndicator();
    const player = gameState.players[gameState.currentPlayer];
    showMessage(`${player.name}'s turn - Roll the dice!`);
    document.getElementById('roll-dice').disabled = false;
}

function updateTurnIndicator() {
    const player = gameState.players[gameState.currentPlayer];
    const colorDot = document.getElementById('current-player-color');
    const nameSpan = document.getElementById('current-player-name');

    const colorMap = { red: '#e63946', green: '#2a9d8f', yellow: '#f4a261', blue: '#457b9d' };
    colorDot.style.background = colorMap[player.color];
    nameSpan.textContent = player.name;
}

function showMessage(msg, type = '') {
    const msgBox = document.getElementById('game-message');
    msgBox.textContent = msg;
    msgBox.className = 'message-box' + (type ? ' ' + type : '');
}

function showWinner(player) {
    document.getElementById('winner-text').textContent = `${player.name} WINS!`;
    document.getElementById('winner-modal').classList.add('active');
}

function resetGame() {
    document.getElementById('winner-modal').classList.remove('active');
    document.getElementById('game-screen')?.classList.remove('active');
    document.getElementById('setup-screen').classList.add('active');
    document.getElementById('dice').style.transform = 'rotateX(0deg) rotateY(0deg)';
}
