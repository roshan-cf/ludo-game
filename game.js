// Precise path for a 15x15 board starting from Blue's entrance
const PATH = [
    {r:7,c:1}, {r:7,c:2}, {r:7,c:3}, {r:7,c:4}, {r:7,c:5}, {r:7,c:6}, 
    {r:6,c:6}, {r:5,c:6}, {r:4,c:6}, {r:3,c:6}, {r:2,c:6}, {r:1,c:6}, 
    {r:1,c:7}, {r:1,c:8}, {r:1,c:9}, 
    {r:2,c:9}, {r:3,c:9}, {r:4,c:9}, {r:5,c:9}, {r:6,c:9}, {r:7,c:9}, 
    {r:7,c:10}, {r:7,c:11}, {r:7,c:12}, {r:7,c:13}, {r:7,c:14}, {r:7,c:15}, 
    {r:8,c:15}, {r:9,c:15}, 
    {r:9,c:14}, {r:9,c:13}, {r:9,c:12}, {r:9,c:11}, {r:9,c:10}, {r:9,c:9}, 
    {r:10,c:9}, {r:11,c:9}, {r:12,c:9}, {r:13,c:9}, {r:14,c:9}, {r:15,c:9}, 
    {r:15,c:8}, {r:15,c:7}, {r:15,c:6}, 
    {r:14,c:6}, {r:13,c:6}, {r:12,c:6}, {r:11,c:6}, {r:10,c:6}, {r:9,c:6}, 
    {r:9,c:5}, {r:9,c:4}, {r:9,c:3}, {r:9,c:2}, {r:9,c:1}, 
    {r:8,c:1} 
];

const COLORS = {
    BLUE: { name: 'blue', start: 1, home: 51, basePos: {r:1, c:1} },
    ORANGE: { name: 'orange', start: 14, home: 12, basePos: {r:1, c:10} },
    GREEN: { name: 'green', start: 27, home: 25, basePos: {r:10, c:10} },
    YELLOW: { name: 'yellow', start: 40, home: 38, basePos: {r:10, c:1} }
};

const HOME_PATHS = {
    blue: [{r:8,c:2}, {r:8,c:3}, {r:8,c:4}, {r:8,c:5}, {r:8,c:6}],
    orange: [{r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:8}],
    green: [{r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}],
    yellow: [{r:14,c:8}, {r:13,c:8}, {r:12,c:8}, {r:11,c:8}, {r:10,c:8}]
};

let gameState = {
    playerCount: 4,
    players: [],
    currentPlayerIndex: 0,
    diceValue: 0,
    isRolling: false,
    waitingForMove: false
};

function createBoard() {
    const board = document.getElementById('ludo-board');
    board.innerHTML = '';

    // Create 225 cells
    for (let r = 1; r <= 15; r++) {
        for (let c = 1; c <= 15; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${r}-${c}`;
            
            // Home Path Styling
            if (r === 8 && c >= 2 && c <= 6) cell.classList.add('home-blue');
            if (c === 8 && r >= 2 && r <= 6) cell.classList.add('home-orange');
            if (r === 8 && c >= 10 && c <= 14) cell.classList.add('home-green');
            if (c === 8 && r >= 10 && r <= 14) cell.classList.add('home-yellow');

            board.appendChild(cell);
        }
    }

    // Replace corners with bases
    Object.values(COLORS).forEach(config => {
        const base = document.createElement('div');
        base.className = `base ${config.name}`;
        base.style.gridArea = `${config.basePos.r} / ${config.basePos.c} / span 6 / span 6`;
        
        const inner = document.createElement('div');
        inner.className = 'base-inner';
        for (let i = 0; i < 4; i++) {
            const slot = document.createElement('div');
            slot.className = 'token-slot';
            slot.id = `slot-${config.name}-${i}`;
            inner.appendChild(slot);
        }
        
        base.appendChild(inner);
        board.appendChild(base);
    });

    // Center area
    const center = document.createElement('div');
    center.className = 'center-area';
    center.style.gridArea = '7 / 7 / span 3 / span 3';
    board.appendChild(center);
}

function startGame() {
    const names = ['Blue', 'Orange', 'Green', 'Yellow'];
    gameState.players = Object.values(COLORS).map((c, i) => ({
        ...c,
        tokens: [-1, -1, -1, -1], // -1 means in base, 0-51 is path, 52-56 is home path
        finished: 0
    }));

    document.getElementById('setup-screen').classList.remove('active');
    updateTurnIndicator();
    renderTokens();
}

function renderTokens() {
    // Clear all tokens
    document.querySelectorAll('.token').forEach(t => t.remove());

    gameState.players.forEach((player, pIdx) => {
        player.tokens.forEach((pos, tIdx) => {
            if (pos === 99) return; // Finished

            const token = document.createElement('div');
            token.className = `token ${player.name}`;
            token.style.backgroundColor = `var(--${player.name})`;
            token.onclick = () => handleTokenClick(pIdx, tIdx);

            if (pos === -1) {
                document.getElementById(`slot-${player.name}-${tIdx}`).appendChild(token);
            } else if (pos < 52) {
                const coord = PATH[pos];
                document.getElementById(`cell-${coord.r}-${coord.c}`).appendChild(token);
            } else {
                const homeIdx = pos - 52;
                const coord = HOME_PATHS[player.name][homeIdx];
                document.getElementById(`cell-${coord.r}-${coord.c}`).appendChild(token);
            }
        });
    });
}

function rollDice() {
    if (gameState.isRolling || gameState.waitingForMove) return;

    gameState.isRolling = true;
    const val = Math.floor(Math.random() * 6) + 1;
    gameState.diceValue = val;

    // Dice animation (pseudo)
    const dice = document.getElementById('dice');
    dice.innerText = val;
    
    setTimeout(() => {
        gameState.isRolling = false;
        checkMoves();
    }, 500);
}

function checkMoves() {
    const player = gameState.players[gameState.currentPlayerIndex];
    const canMove = player.tokens.some((pos, idx) => isValidMove(player, pos, gameState.diceValue));

    if (!canMove) {
        log(`No moves for ${player.name}. Switching turn.`);
        setTimeout(nextTurn, 1000);
    } else {
        gameState.waitingForMove = true;
        highlightMovableTokens();
    }
}

function isValidMove(player, pos, dice) {
    if (pos === -1) return dice === 6;
    if (pos + dice > 56) return false;
    return true;
}

function handleTokenClick(pIdx, tIdx) {
    if (!gameState.waitingForMove || pIdx !== gameState.currentPlayerIndex) return;

    const player = gameState.players[pIdx];
    const pos = player.tokens[tIdx];

    if (!isValidMove(player, pos, gameState.diceValue)) return;

    if (pos === -1) {
        player.tokens[tIdx] = player.start;
    } else {
        player.tokens[tIdx] += gameState.diceValue;
    }

    // Check for capture
    checkCapture(player.tokens[tIdx], player.name);

    gameState.waitingForMove = false;
    renderTokens();

    if (gameState.diceValue === 6) {
        log(`${player.name} gets another turn!`);
    } else {
        nextTurn();
    }
}

function checkCapture(newPos, colorName) {
    if (newPos >= 52) return; // Can't capture in home path

    const targetCoord = PATH[newPos];
    gameState.players.forEach(p => {
        if (p.name === colorName) return;
        p.tokens.forEach((pos, idx) => {
            if (pos === -1 || pos >= 52) return;
            const coord = PATH[pos];
            if (coord.r === targetCoord.r && coord.c === targetCoord.c) {
                p.tokens[idx] = -1;
                log(`Capture! ${colorName} sent ${p.name} back.`);
            }
        });
    });
}

function nextTurn() {
    gameState.currentPlayerIndex = (gameState.currentPlayerIndex + 1) % gameState.playerCount;
    updateTurnIndicator();
}

function updateTurnIndicator() {
    const player = gameState.players[gameState.currentPlayerIndex];
    document.getElementById('current-player-indicator').style.backgroundColor = `var(--${player.name})`;
    document.getElementById('current-player-name').innerText = player.name.toUpperCase();
}

function log(msg) {
    const logEl = document.getElementById('game-log');
    logEl.innerText = msg;
}

function highlightMovableTokens() {
    // Add visual feedback
}

document.getElementById('start-btn').onclick = startGame;
document.getElementById('roll-btn').onclick = rollDice;

createBoard();
updatePlayerInputs();

function updatePlayerInputs() {
    const container = document.getElementById('player-names');
    container.innerHTML = '';
    for(let i=0; i<gameState.playerCount; i++) {
        const div = document.createElement('div');
        div.innerText = `Player ${i+1}`;
        container.appendChild(div);
    }
}
