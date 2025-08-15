import { boardLib } from '../features/board/board';
import { pieceLib } from '../features/piece/piece';

function calculateGhostPiece(board, piece) {
  let ghostPiece = piece;
  let pieceToCheck = pieceLib.down(piece);

  while (boardLib.isLegal(board, pieceToCheck)) {
    ghostPiece = pieceToCheck;
    pieceToCheck = pieceLib.down(pieceToCheck);
  }

  return pieceLib.createGhost(ghostPiece);
}

function placeGhostPiece(board, piece) {
  return boardLib.place(board, calculateGhostPiece(board, piece));
}

/**
 * Calculates the total amount of charged and uncharged garbage lines
 * in the game garbage queue.
 *
 * @param {Object} game - The game object containing the garbage queue.
 * @param {Array} game.garbage.queue - The game garbage queue containing
 *   objects with properties `charged` (boolean) and `amount` (number).
 *
 * @returns {Object} An object with two properties: `uncharged` and `charged`.
 *   These properties contain the total amount of uncharged and charged
 *   garbage lines, respectively.
 */
function calculateGarbageQueue(game) {
  return game.garbage.queue.reduce(
    (acc, garbage) => {
      if (garbage.charged) {
        acc.charged += garbage.amount;
      } else {
        acc.uncharged += garbage.amount;
      }
      return acc;
    },
    { uncharged: 0, charged: 0 }
  );
}

/**
 * Checks if the cell at the specified row and col in the grid has
 * the given highlight value.
 *
 * @param {Array<string[]>} grid - The 2D array representing the game board.
 * @param {string} val - The value to check for.
 * @param {number} row - The row to check.
 * @param {number} col - The col to check.
 *
 * @returns {boolean} True if the cell has the given highlight value, false otherwise.
 */
function hasHighlight(grid, val, row, col) {
  if (row < 0 || row >= grid.length || col < 0 || col >= grid[row].length) {
    return false;
  }

  const string = grid[row][col].replace('ghost', '');
  return string.includes(val);
}

/**
 * Modifies the cell at the specified row and col in the grid to
 * reflect its connected highlights.
 *
 * If the cell does not have a highlight value, this function does nothing.
 *
 * @param {Array<string[]>} grid - The 2D array representing the game board.
 * @param {number} row - The row of the cell to check.
 * @param {number} col - The col of the cell to check.
 */
function markGridConnectedHighlights(grid, row, col) {
  // Remove the word 'ghost'
  const string = grid[row][col].replace('ghost', '');

  // No highlight
  if (!string.includes('h')) {
    return;
  }

  const highlight = grid[row][col].split(' ').filter((s) => s.includes('h'))[0];

  const bot = hasHighlight(grid, highlight, row - 1, col);
  const top = hasHighlight(grid, highlight, row + 1, col);
  const left = hasHighlight(grid, highlight, row, col - 1);
  const right = hasHighlight(grid, highlight, row, col + 1);

  if (top) {
    grid[row][col] += ' no-border-top';
  }

  if (bot) {
    grid[row][col] += ' no-border-bottom';
  }

  if (left) {
    grid[row][col] += ' no-border-left';
  }

  if (right) {
    grid[row][col] += ' no-border-right';
  }

  if (top && left) {
    grid[row][col] += ' tl-corner';
  }

  if (top && right) {
    grid[row][col] += ' tr-corner';
  }

  if (bot && right) {
    grid[row][col] += ' br-corner';
  }

  if (bot && left) {
    grid[row][col] += ' bl-corner';
  }
}

/**
 * Iterates over each cell in the grid and marks connected highlights.
 * @param {Object} board - The board object.
 * @param {Array} board.grid - The 2D array representing the game board.
 * @returns {Object} The updated board object with connected highlights marked.
 */
function markConnectedHighlights(board) {
  for (let i = 0; i < board.grid.length; i++) {
    for (let j = 0; j < board.grid[i].length; j++) {
      markGridConnectedHighlights(board.grid, i, j);
    }
  }
}

/**
 * Calculates the display grid for the game.
 * The display grid includes the current piece and its ghost piece.
 *
 * @param {Object} updatedGame - The game object containing the board and queue.
 * @param {Object} updatedGame.board - The current game board.
 * @param {Object} updatedGame.queue - The game queue containing the next pieces.
 * @param {Array} game.queue.pieces - The array of next pieces.
 * @param {number} splitPoint - The point at which to split the display grid.
 * @param {boolean} calcNextPiece - Whether to calculate next piece and ghost piece.
 * @param {boolean} calcGhost - Whether to calculate ghost piece.
 *
 * @returns {Object} An object containing the display grid split into two parts: grid and gridTop.
 * @returns {Array} grid - The bottom part of the display grid.
 * @returns {Array} gridTop - The top part of the display grid.
 */
function grids(game, splitPoint, calcNextPiece = true, calcGhost = true) {
  // Display grid has current piece, and ghost piece
  let displayBoard = boardLib.copyBoard(game.board);
  const nextPiece = game.queue.pieces[0];

  if (calcNextPiece && nextPiece) {
    if (calcGhost) {
      displayBoard = placeGhostPiece(displayBoard, nextPiece);
    }
    displayBoard = boardLib.place(displayBoard, nextPiece);
  }

  markConnectedHighlights(displayBoard);

  const grid = displayBoard.grid.slice(0, splitPoint);
  const gridTop = displayBoard.grid.slice(splitPoint);

  return { grid, gridTop, garbageQueue: calculateGarbageQueue(game) };
}

/**
 * Calculates the next five pieces from the game queue.
 *
 * @param {Object} updatedGame - The game object containing the queue.
 * @param {Object} updatedGame.queue - The game queue containing the next pieces.
 * @param {Array} game.queue.pieces - The array of next pieces.
 *
 * @returns {Array} The next five pieces from the game queue.
 */
function calculateNextPieces(game) {
  // 5 next piece previews
  return game.queue.pieces.slice(1, 6);
}

/**
 * Calculates the currently held piece from the game queue.
 *
 * @param {Object} updatedGame - The game object containing the queue.
 * @param {Object} updatedGame.queue - The game queue containing the held piece and next pieces.
 * @param {Object} game.queue.hold - The currently held piece.
 *
 * @returns {Object} The currently held piece from the game queue.
 */
function calculateHoldPiece(game) {
  return game.queue.hold;
}

function queue(game) {
  return {
    nextPieces: calculateNextPieces(game),
    holdPiece: calculateHoldPiece(game),
  };
}

function stats(game) {
  return {
    b2b: Math.max(game.b2b, 0),
    combo: Math.max(game.combo, 0),
    numPieces: game.numPieces,
    numAttack: game.numAttack,
    startTime: game.startTime,
    combatScore: 3141.59,
  };
}

export default {
  grids,
  queue,
  stats,
};
