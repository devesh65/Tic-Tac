let xState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let zState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let turn = 1; // 1 for X (Player), 0 for O (Computer)
let gameActive = true;
let isComputerThinking = false;

const statusDisplay = document.querySelector('#status');
const cells = document.querySelectorAll('.cell');
const resetButton = document.querySelector('#reset-btn');
const winLine = document.getElementById('win-line');
const muteBtn = document.getElementById('mute-btn');

muteBtn.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent triggering board click interaction again
    const muted = toggleMute();
    muteBtn.innerHTML = muted ? '🔇 Sound Off (M)' : '🔊 Sound On (M)';
});

const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Cols
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function checkWinState(x, z) {
    for (let i = 0; i < wins.length; i++) {
        let win = wins[i];
        if (x[win[0]] + x[win[1]] + x[win[2]] === 3) {
            return { winStatus: 1, index: i }; // X won
        }
        if (z[win[0]] + z[win[1]] + z[win[2]] === 3) {
            return { winStatus: 0, index: i }; // O won
        }
    }
    
    let totalMoves = x.reduce((a, b) => a + b, 0) + z.reduce((a, b) => a + b, 0);
    if (totalMoves === 9) {
        return { winStatus: -2 }; // Draw
    }
    
    return { winStatus: -1 }; // Keep playing
}

function updateStatus() {
    if (turn === 1) {
        statusDisplay.innerHTML = "Your Turn (X)";
        statusDisplay.style.color = 'var(--x-color)';
        statusDisplay.style.textShadow = '0 0 10px var(--x-color)';
    } else {
        statusDisplay.innerHTML = "Computer Thinking...";
        statusDisplay.style.color = 'var(--o-color)';
        statusDisplay.style.textShadow = '0 0 10px var(--o-color)';
    }
}

function drawWinLine(winIndex, color) {
    winLine.style.display = 'block';
    winLine.style.backgroundColor = color;
    winLine.style.boxShadow = `0 0 15px ${color}`;
    
    const lineConfig = [
        { left: '15px', top: '46px', width: '300px', transform: 'rotate(0deg)' },
        { left: '15px', top: '161px', width: '300px', transform: 'rotate(0deg)' },
        { left: '15px', top: '276px', width: '300px', transform: 'rotate(0deg)' },
        { left: '50px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        { left: '165px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        { left: '280px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        { left: '15px', top: '11px', width: '424px', transform: 'rotate(45deg)' },
        { left: '315px', top: '11px', width: '424px', transform: 'rotate(135deg)' }
    ];

    const config = lineConfig[winIndex];
    winLine.style.left = config.left;
    winLine.style.top = config.top;
    winLine.style.transform = config.transform;
    
    setTimeout(() => {
        winLine.style.width = config.width;
    }, 10);
}

function handleWinResult(winResult) {
    const winStatus = winResult.winStatus;
    
    if (winStatus === 1) {
        statusDisplay.innerHTML = "🎉 YOU WON!";
        statusDisplay.style.color = 'var(--x-color)';
        statusDisplay.style.textShadow = '0 0 15px var(--x-color)';
        drawWinLine(winResult.index, 'var(--x-color)');
        playWinSound();
        gameActive = false;
        return true;
    } else if (winStatus === 0) {
        statusDisplay.innerHTML = "💻 COMPUTER WON!";
        statusDisplay.style.color = 'var(--o-color)';
        statusDisplay.style.textShadow = '0 0 15px var(--o-color)';
        drawWinLine(winResult.index, 'var(--o-color)');
        playWinSound();
        gameActive = false;
        return true;
    } else if (winStatus === -2) {
        statusDisplay.innerHTML = "🤝 MATCH DRAW!";
        statusDisplay.style.color = 'var(--text-color)';
        statusDisplay.style.textShadow = 'none';
        playDrawSound();
        gameActive = false;
        return true;
    }
    return false;
}

function handleCellClick(e) {
    if (!gameActive || turn !== 1 || isComputerThinking) return;

    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (xState[cellIndex] === 1 || zState[cellIndex] === 1) return;

    // Player Move
    xState[cellIndex] = 1;
    clickedCell.innerHTML = "X";
    clickedCell.classList.add('x');
    playTurnSound('X');

    const winResult = checkWinState(xState, zState);
    if (handleWinResult(winResult)) return;

    // Switch to computer
    turn = 0;
    updateStatus();
    isComputerThinking = true;

    // 600ms realistic thinking delay
    setTimeout(() => {
        makeComputerMove();
    }, 600);
}

function makeComputerMove() {
    if (!gameActive) return;

    let bestScore = -Infinity;
    let move = -1;

    for (let i = 0; i < 9; i++) {
        if (xState[i] === 0 && zState[i] === 0) {
            zState[i] = 1; // Try AI move
            let score = minimax(xState, zState, 0, false);
            zState[i] = 0;
            if (score > bestScore) {
                bestScore = score;
                move = i;
            }
        }
    }

    if (move !== -1) {
        zState[move] = 1;
        const targetCell = document.querySelector(`.cell[data-index="${move}"]`);
        targetCell.innerHTML = "O";
        targetCell.classList.add('o');
        playTurnSound('O');
    }

    const winResult = checkWinState(xState, zState);
    if (handleWinResult(winResult)) {
        isComputerThinking = false;
        return;
    }

    turn = 1;
    isComputerThinking = false;
    updateStatus();
}

// Unbeatable Minimax AI algorithm with depth scoring
function minimax(xState, zState, depth, isMaximizing) {
    let result = checkWinState(xState, zState).winStatus;
    if (result !== -1) {
        if (result === 0) return 10 - depth; // Computer wins (favor faster wins)
        if (result === 1) return -10 + depth; // Player wins (favor slower losses)
        if (result === -2) return 0; // Draw
    }
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < 9; i++) {
            if (xState[i] === 0 && zState[i] === 0) {
                zState[i] = 1; // Computer
                let score = minimax(xState, zState, depth + 1, false);
                zState[i] = 0;
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < 9; i++) {
            if (xState[i] === 0 && zState[i] === 0) {
                xState[i] = 1; // Player
                let score = minimax(xState, zState, depth + 1, true);
                xState[i] = 0;
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

function resetGame() {
    xState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    zState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    turn = 1; // Player always starts first
    gameActive = true;
    isComputerThinking = false;
    
    winLine.style.width = '0';
    setTimeout(() => {
        winLine.style.display = 'none';
    }, 400);

    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o');
    });
    
    if (typeof startBGM === 'function' && !isMuted && !isBgmPlaying) startBGM();
    updateStatus();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

updateStatus();
