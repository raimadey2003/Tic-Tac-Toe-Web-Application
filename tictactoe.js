const boardContainer = document.getElementById('boardContainer');
const playAgainBtn = document.getElementById('playAgain');
const scoreX = document.getElementById('scoreX');
const scoreO = document.getElementById('scoreO');
const winnerText = document.getElementById('winnerText');
const opponentLabel = document.getElementById('opponentLabel');
const scorecard = document.getElementById('scorecard');

let board = [];
let scores = { X: 0, O: 0 };
let currentPlayer = 'X';
let gameMode = localStorage.getItem("gameMode") || 'pvp';
let gameOver = false;

if (gameMode === 'ai') {
  opponentLabel.innerHTML = 'AI (O): <span id="scoreO">0</span>';
}

function initGame() {
  board = Array(3).fill().map(() => Array(3).fill(''));
  boardContainer.innerHTML = '';
  scorecard.classList.add('hidden');
  gameOver = false;
  currentPlayer = 'X';

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.dataset.row = r;
      cell.dataset.col = c;
      cell.addEventListener('click', handleMove);
      boardContainer.appendChild(cell);
    }
  }
}

function handleMove(e) {
  if (gameOver) return;
  const row = +e.target.dataset.row;
  const col = +e.target.dataset.col;
  if (board[row][col] !== '') return;

  board[row][col] = currentPlayer;
  e.target.textContent = currentPlayer;
  e.target.classList.add('animated');
  setTimeout(() => e.target.classList.remove('animated'), 1000);

  if (checkWinner(currentPlayer)) {
    endGame(`${currentPlayer === 'X' ? "Player X" : (gameMode === 'ai' ? "AI" : "Player O")} wins!`, currentPlayer);
    return;
  }

  if (isBoardFull()) {
    endGame("It's a draw!");
    return;
  }

  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

  if (gameMode === 'ai' && currentPlayer === 'O') {
    setTimeout(aiMove, 500);
  }
}

function aiMove() {
  const best = minimax(board, 0, true);
  board[best.row][best.col] = 'O';
  const cell = [...document.querySelectorAll('.cell')]
    .find(cell => +cell.dataset.row === best.row && +cell.dataset.col === best.col);
  cell.textContent = 'O';
  cell.classList.add('animated');
  setTimeout(() => cell.classList.remove('animated'), 1000);

  if (checkWinner('O')) {
    endGame("AI wins!", 'O');
    return;
  }

  if (isBoardFull()) {
    endGame("It's a draw!");
    return;
  }

  currentPlayer = 'X';
}

function checkWinner(player) {
  for (let i = 0; i < 3; i++) {
    if (board[i].every(val => val === player)) return true;
    if (board.map(row => row[i]).every(val => val === player)) return true;
  }
  if ([0, 1, 2].every(i => board[i][i] === player)) return true;
  if ([0, 1, 2].every(i => board[i][2 - i] === player)) return true;
  return false;
}

function isBoardFull() {
  return board.every(row => row.every(cell => cell !== ''));
}

function endGame(message, winner = null) {
  gameOver = true;
  winnerText.textContent = message;
  if (winner) {
    scores[winner]++;
    scoreX.textContent = scores.X;
    scoreO.textContent = scores.O;
  }
  scorecard.classList.remove('hidden');
}

function minimax(board, depth, isMax) {
  if (checkWinner('O')) return { score: 10 - depth };
  if (checkWinner('X')) return { score: depth - 10 };
  if (isBoardFull()) return { score: 0 };

  const best = { score: isMax ? -Infinity : Infinity };
  const symbol = isMax ? 'O' : 'X';

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[r][c] === '') {
        board[r][c] = symbol;
        const res = minimax(board, depth + 1, !isMax);
        board[r][c] = '';
        if (isMax && res.score > best.score) {
          best.score = res.score;
          best.row = r;
          best.col = c;
        } else if (!isMax && res.score < best.score) {
          best.score = res.score;
          best.row = r;
          best.col = c;
        }
      }
    }
  }
  return best;
}

playAgainBtn.addEventListener('click', () => {
  window.location.href = "index.html";
});

window.onload = initGame;
