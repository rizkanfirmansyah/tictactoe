document.addEventListener('DOMContentLoaded', () => {
    const cells = document.querySelectorAll('.cell');
    const resetButton = document.getElementById('reset-button');
    const difficultySelect = document.getElementById('difficulty');
    const modeSelect = document.getElementById('mode');
    const timerInput = document.getElementById('timer');
    const timeRemaining = document.getElementById('time-remaining');
    const themeSelect = document.getElementById('theme');
    const scoreX = document.getElementById('score-x');
    const scoreO = document.getElementById('score-o');
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let startingPlayer = 'X'; // Keeps track of who should start the next game
    let score = { X: 0, O: 0 };
    let moves = { X: [], O: [] }; // Track the positions of each player's moves
    let countdown; // Interval for the countdown timer
    let first = false;
    let timeLeft; // Time left in seconds
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    cells.forEach(cell => cell.addEventListener('click', onCellClick));
    resetButton.addEventListener('click', resetGame);
    modeSelect.addEventListener('change', resetGame); // Reset game when mode changes
    themeSelect.addEventListener('change', changeTheme); // Change theme when theme changes

    function onCellClick(e) {
        const index = e.target.dataset.index;
        if (moves[currentPlayer].length < 1 && first === false) { setTimer(); first = true };
        if (board[index] === null || (board[index] === currentPlayer && moves[currentPlayer].length === 3)) {
            if (moves[currentPlayer].length === 3) {
                removeRandomMove(currentPlayer);
            }
            board[index] = currentPlayer;
            e.target.textContent = currentPlayer;
            moves[currentPlayer].push(index);

            if (checkWin(currentPlayer)) {
                clearInterval(countdown);
                setTimeout(() => alert(`${currentPlayer} wins!`), 100);
                score[currentPlayer]++;
                updateScores();
                startingPlayer = currentPlayer;
                resetGame();
                return;
            }
            if (board.every(cell => cell !== null)) {
                clearInterval(countdown);
                setTimeout(() => alert('Draw!'), 100);
                resetGame();
                return;
            }
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            if (currentPlayer === 'O' && modeSelect.value === 'single') {
                setTimeout(computerMove, 500);
            }
        }
    }

    function computerMove() {
        let move;
        const difficulty = difficultySelect.value;
        if (difficulty === 'easy') {
            move = getRandomMove();
        } else if (difficulty === 'medium') {
            move = getBestMove('O', 1);
        } else {
            move = getBestMove('O', -1);
        }
        if (move !== undefined) {
            if (moves[currentPlayer].length === 3) {
                removeRandomMove(currentPlayer);
            }
            board[move] = currentPlayer;
            cells[move].textContent = currentPlayer;
            moves[currentPlayer].push(move);

            if (checkWin(currentPlayer)) {
                clearInterval(countdown);
                setTimeout(() => alert(`${currentPlayer} wins!`), 100);
                score[currentPlayer]++;
                updateScores();
                startingPlayer = currentPlayer;
                resetGame();
                return;
            }
            if (board.every(cell => cell !== null)) {
                clearInterval(countdown);
                setTimeout(() => alert('Draw!'), 100);
                resetGame();
                return;
            }
            currentPlayer = 'X';
        }
    }

    function getRandomMove() {
        const availableMoves = board.map((cell, index) => cell === null ? index : null).filter(index => index !== null);
        return availableMoves[Math.floor(Math.random() * availableMoves.length)];
    }

    function getBestMove(player, difficulty) {
        let bestMove;
        let bestScore = -Infinity;
        board.forEach((cell, index) => {
            if (cell === null) {
                board[index] = player;
                let score = minimax(board, 0, false, difficulty);
                board[index] = null;
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = index;
                }
            }
        });
        return bestMove;
    }

    function minimax(board, depth, isMaximizing, difficulty) {
        if (checkWin('O')) return 10 - depth * difficulty;
        if (checkWin('X')) return depth * difficulty - 10;
        if (board.every(cell => cell !== null)) return 0;

        if (isMaximizing) {
            let bestScore = -Infinity;
            board.forEach((cell, index) => {
                if (cell === null) {
                    board[index] = 'O';
                    let score = minimax(board, depth + 1, false, difficulty);
                    board[index] = null;
                    bestScore = Math.max(score, bestScore);
                }
            });
            return bestScore;
        } else {
            let bestScore = Infinity;
            board.forEach((cell, index) => {
                if (cell === null) {
                    board[index] = 'X';
                    let score = minimax(board, depth + 1, true, difficulty);
                    board[index] = null;
                    bestScore = Math.min(score, bestScore);
                }
            });
            return bestScore;
        }
    }

    function checkWin(player) {
        return winningCombinations.some(combination => {
            return combination.every(index => board[index] === player);
        });
    }

    function removeRandomMove(player) {
        const playerMoves = moves[player];
        const randomIndex = Math.floor(Math.random() * playerMoves.length);
        const moveToRemove = playerMoves[randomIndex];
        board[moveToRemove] = null;
        cells[moveToRemove].textContent = '';
        moves[player].splice(randomIndex, 1);
    }

    function updateScores() {
        scoreX.textContent = score.X;
        scoreO.textContent = score.O;
    }

    function resetGame() {
        board.fill(null);
        cells.forEach(cell => cell.textContent = '');
        moves = { X: [], O: [] };
        currentPlayer = startingPlayer;
        clearInterval(countdown); // Clear any existing countdown
        const timerValue = timerInput.value;
        if (!timerValue) {
            timeRemaining.textContent = '';
        }
        if (currentPlayer === 'O' && modeSelect.value === 'single') {
            setTimeout(computerMove, 500);
        }
    }

    function setTimer() {
        const timerValue = timerInput.value;
        if (timerValue > 0) {
            timeLeft = timerValue * 60; // Convert minutes to seconds
            countdown = setInterval(updateTimer, 1000);
        }
    }

    function updateTimer() {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeRemaining.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
        if (timeLeft <= 0) {
            clearInterval(countdown);
            alert('Time is up! It\'s a draw!');
            resetGame();
        }
    }

    function changeTheme() {
        const theme = themeSelect.value;
        document.body.className = theme;
    }

    // Start the game with a timer when the page loads
    resetGame();
    changeTheme(); // Set the initial theme
});
