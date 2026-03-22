let xState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let zState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let turn = 1; // 1 for X, 0 for O
let gameActive = true;

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

function checkWin() {
    for (let i = 0; i < wins.length; i++) {
        let win = wins[i];
        if (xState[win[0]] + xState[win[1]] + xState[win[2]] === 3) {
            return { winStatus: 1, index: i }; // X won
        }
        if (zState[win[0]] + zState[win[1]] + zState[win[2]] === 3) {
            return { winStatus: 0, index: i }; // O won
        }
    }
    
    // Check for draw
    let totalMoves = xState.reduce((a, b) => a + b, 0) + zState.reduce((a, b) => a + b, 0);
    if (totalMoves === 9) {
        return { winStatus: -2 }; // Draw
    }
    
    return { winStatus: -1 }; // Keep playing
}

function updateStatus() {
    if (turn === 1) {
        statusDisplay.innerHTML = "X's Turn";
        statusDisplay.style.color = 'var(--x-color)';
        statusDisplay.style.textShadow = '0 0 10px var(--x-color)';
    } else {
        statusDisplay.innerHTML = "O's Turn";
        statusDisplay.style.color = 'var(--o-color)';
        statusDisplay.style.textShadow = '0 0 10px var(--o-color)';
    }
}

function drawWinLine(winIndex, color) {
    winLine.style.display = 'block';
    winLine.style.backgroundColor = color;
    winLine.style.boxShadow = `0 0 15px ${color}`;
    
    const lineConfig = [
        // Rows
        { left: '15px', top: '46px', width: '300px', transform: 'rotate(0deg)' },
        { left: '15px', top: '161px', width: '300px', transform: 'rotate(0deg)' },
        { left: '15px', top: '276px', width: '300px', transform: 'rotate(0deg)' },
        // Cols
        { left: '50px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        { left: '165px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        { left: '280px', top: '11px', width: '300px', transform: 'rotate(90deg)' },
        // Diagonals
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

function handleCellClick(e) {
    const clickedCell = e.target;
    const cellIndex = parseInt(clickedCell.getAttribute('data-index'));

    if (xState[cellIndex] === 1 || zState[cellIndex] === 1 || !gameActive) {
        return; // Cell already filled or game over
    }

    if (turn === 1) {
        xState[cellIndex] = 1;
        clickedCell.innerHTML = "X";
        clickedCell.classList.add('x');
        playTurnSound('X');
    } else {
        zState[cellIndex] = 1;
        clickedCell.innerHTML = "O";
        clickedCell.classList.add('o');
        playTurnSound('O');
    }

    const winResult = checkWin();
    const winStatus = winResult.winStatus;
    
    if (winStatus === 1) {
        statusDisplay.innerHTML = "X WON THE MATCH!";
        statusDisplay.style.color = 'var(--x-color)';
        statusDisplay.style.textShadow = '0 0 15px var(--x-color)';
        drawWinLine(winResult.index, 'var(--x-color)');
        playWinSound();
        gameActive = false;
        return;
    } else if (winStatus === 0) {
        statusDisplay.innerHTML = "O WON THE MATCH!";
        statusDisplay.style.color = 'var(--o-color)';
        statusDisplay.style.textShadow = '0 0 15px var(--o-color)';
        drawWinLine(winResult.index, 'var(--o-color)');
        playWinSound();
        gameActive = false;
        return;
    } else if (winStatus === -2) {
        statusDisplay.innerHTML = "MATCH DRAW!";
        statusDisplay.style.color = 'var(--text-color)';
        statusDisplay.style.textShadow = 'none';
        playDrawSound();
        gameActive = false;
        return;
    }

    turn = 1 - turn;
    updateStatus();
}

function resetGame() {
    xState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    zState = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    turn = 1;
    gameActive = true;
    
    winLine.style.width = '0';
    setTimeout(() => {
        winLine.style.display = 'none';
    }, 400);

    cells.forEach(cell => {
        cell.innerHTML = "";
        cell.classList.remove('x', 'o');
    });
    
    if (!isMuted && !isBgmPlaying) startBGM();
    updateStatus();
}

cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetButton.addEventListener('click', resetGame);

updateStatus();
