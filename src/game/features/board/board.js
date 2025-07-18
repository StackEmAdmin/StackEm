import { pieceLib } from '../piece/piece';

/**
 * Creates a new board object with a specified number of rows and columns,
 * and initializes the grid with empty cells.
 *
 * @function newBoard
 * @param {number} rows - The number of rows in the board grid.
 * @param {number} cols - The number of columns in the board grid.
 *
 * @returns {Object} The new board object.
 * @property {number} rows - The number of rows in the board grid.
 * @property {number} cols - The number of columns in the board grid.
 * @property {Array} grid - The 2D array representing the board grid.
 */
function newBoard(rows, cols) {
  return {
    rows: rows,
    cols: cols,
    grid: newGrid(rows, cols),
  };
}

function newGrid(rows, cols) {
  return Array.from({ length: rows }, () => Array(cols).fill(''));
}

function copyBoard(board) {
  return {
    ...board,
    grid: copyGrid(board),
  };
}

function copyGrid(board) {
  return board.grid.map((row) => row.slice());
}

/**
 * Adds rows to the grid if the current number of rows is less than or equal to the specified length.
 * The added rows are filled with empty cells and are added on top.
 *
 * @function addRowsIfNeeded
 * @param {Array} grid - The 2D array representing the board grid.
 * @param {number} length - The minimum number of rows required in the grid.
 *
 * @returns {void} The function does not return a value, but it modifies the grid in place.
 */
function addRowsIfNeeded(grid, length) {
  const cols = grid[0].length;
  while (grid.length < length) {
    grid.push(Array(cols).fill(''));
  }
}

/**
 * Places a piece on the board and updates the grid accordingly.
 * If the piece is kicked above line 26, it adds rows to allow placement.
 *
 * @function place
 * @param {Object} grid - The board object.
 * @param {Array} grid.grid - The 2D array representing the board grid.
 * @param {number} grid.rows - The number of rows in the board grid.
 * @param {number} grid.cols - The number of columns in the board grid.
 * @param {Object} piece - The piece to be placed on the board.
 * @param {Array} piece.span - The coordinates of the piece's cells relative to its position.
 * @param {number} piece.span[].0 - The x-coordinate of the piece's cell relative to its position.
 * @param {number} piece.span[].1 - The y-coordinate of the piece's cell relative to its position.
 * @param {string} piece.type - The type of the piece.
 * @param {number} piece.x - The x-coordinate of the piece's position on the board.
 * @param {number} piece.y - The y-coordinate of the piece's position on the board.
 *
 * @returns {Object} The updated board object.
 * @returns {Array} board.grid - The updated 2D array representing the board grid.
 */
function place(board, piece) {
  const nextGrid = copyGrid(board);

  for (let i = 0; i < piece.span.length; i++) {
    // Row represents y and col represents x
    const row = piece.y + piece.span[i][1];
    const col = piece.x + piece.span[i][0];

    // When piece is kicked above line 26, add rows to allow placement
    addRowsIfNeeded(nextGrid, row + 1);
    nextGrid[row][col] = addStrUniqueHighlight(nextGrid[row][col], piece.type);
  }

  return {
    ...board,
    grid: nextGrid,
  };
}

/**
 * Combines two strings.
 * Ensures only one occurrence of a highlighted segment ('h') exists.
 *
 * @param {string} str1 - The first string to combine.
 * @param {string} str2 - The second string to combine.
 *
 * @returns {string} - The combined string with a single highlight if applicable.
 *                     If the first string is empty, returns the second string.
 *
 * @example
 * addStringsUnique('o ho', 'hz'); // returns 'o hz'
 */

function addStrUniqueHighlight(str1, str2) {
  // Adding highlight
  if (str2[0].includes('h')) {
    return addUniqueHighlight(str1, str2);
  }

  // Adding piece (keep highlight in str1)
  const filtered = filterHighlight(str1);

  if (filtered === '') {
    return str2;
  }
  return filtered + ' ' + str2;
}

function addUniqueHighlight(str1, str2) {
  // Remove highlight in str1
  const filtered = filterHighlight(str1, true);

  if (filtered === '') {
    return str2;
  }
  return filtered + ' ' + str2;
}

/**
 * Filters a string to only include or exclude words that contain the highlight ('h') character.
 *
 * @param {string} str - The string to filter.
 * @param {boolean} [inverse=false] - If true, words with 'h' persist. If false, words with 'h' are removed.
 *
 * @returns {string} - The filtered string.
 *
 * @example
 * filterHighlight('o hz', true); // returns 'o'
 * filterHighlight('o hz', false); // returns 'hz'
 */
function filterHighlight(str, inverse = false) {
  if (inverse) {
    return str
      .split(' ')
      .filter((word) => !word.includes('h'))
      .join(' ');
  }

  return str
    .split(' ')
    .filter((word) => word.includes('h'))
    .join(' ');
}

/**
 * Fills a specific cell on the board with a given type.
 *
 * @function fillCell
 * @param {Object} board - The board object containing the grid.
 * @param {Array} board.grid - The 2D array representing the board grid.
 * @param {number} row - The row index of the cell to fill.
 * @param {number} col - The column index of the cell to fill.
 * @param {string} type - The type of piece to fill the cell with.
 * @param {boolean} [fillOnlyEmpty=true] - If true, only fills the cell if it is empty.
 *
 * @returns {Object} The updated board object.
 *
 * @description Fills the specified cell on the board with the given type.
 * If `fillOnlyEmpty` is true, the cell will only be filled if it is empty.
 * If the cell is already filled with the specified type, no changes are made.
 * The function returns the updated board object with the modified grid.
 */

function fillCell(
  board,
  row,
  col,
  type,
  highlight,
  nextPiece,
  fillOnlyEmpty = true
) {
  if (highlight) {
    return highlightCell(board, row, col, type);
  }

  // Don't allow filling on top of next piece
  for (let i = 0; i < nextPiece.span.length; i++) {
    if (
      row === nextPiece.y + nextPiece.span[i][1] &&
      col === nextPiece.x + nextPiece.span[i][0]
    ) {
      return board;
    }
  }

  // If only filling on empty cells and cell is filled then do nothing
  if (fillOnlyEmpty && isOccupied(board, row, col)) {
    return board;
  }

  // If cell is already filled with the same type then do nothing
  if (board.grid[row] && board.grid[row][col] === type) {
    return board;
  }

  // Fill cell
  const nextGrid = copyGrid(board);
  addRowsIfNeeded(nextGrid, row + 1);
  nextGrid[row][col] = addStrUniqueHighlight(nextGrid[row][col], type);
  return { ...board, grid: nextGrid };
}

function highlightCell(board, row, col, type) {
  const fillType = `h${type}`;

  // Already highlighted
  if (board.grid[row] && board.grid[row][col].includes('h')) {
    return board;
  }

  // highlight cell
  const nextGrid = copyGrid(board);
  addRowsIfNeeded(nextGrid, row + 1);
  nextGrid[row][col] = addStrUniqueHighlight(nextGrid[row][col], fillType);
  return { ...board, grid: nextGrid };
}

function removeHighlightCell(board, row, col) {
  // If removing highlight but no highlight
  if (board.grid[row] && !board.grid[row][col].includes('h')) {
    return board;
  }

  const nextGrid = copyGrid(board);
  // Highlighted cell can b 'z hg'. Remove 'hg' part.
  const filtered = filterHighlight(board.grid[row][col], true);
  nextGrid[row][col] = filtered;
  return { ...board, grid: nextGrid };
}

/**
 * Clears a specific cell on the board.
 *
 * @function clearCell
 * @param {Object} board - The board object containing the grid.
 * @param {Array} board.grid - The 2D array representing the board grid.
 * @param {number} row - The row index of the cell to clear.
 * @param {number} col - The column index of the cell to clear.
 *
 * @returns {Object} An object containing a boolean indicating if the cell was cleared and the updated board object.
 * @returns {boolean} cleared - True if the cell was cleared, false otherwise.
 * @returns {Object} board - The updated board object with the modified grid.
 *
 * @description Clears the specified cell on the board.
 * If the cell is already empty, no changes are made and the function returns the same board object.
 * The function returns an object containing a boolean indicating if the cell was cleared and the updated board object with the modified grid.
 */

function clearCell(board, row, col, highlight) {
  if (!board.grid[row]) {
    return board;
  }

  // If cell is already empty then do nothing
  if (board.grid[row][col] === '') {
    return board;
  }

  if (highlight) {
    return removeHighlightCell(board, row, col);
  }

  // Clear cell and leave highlight
  const nextGrid = copyGrid(board);
  const filtered = filterHighlight(board.grid[row][col]);
  nextGrid[row][col] = filtered;
  return { ...board, grid: nextGrid };
}

/**
 * Fills cells on the board with a given type.
 * Assumes cells are in range and validated.
 * (Use this function after calling fillCell.)
 *
 * @function fillCells
 * @param {Object} board - The board object.
 * @param {Array} cells - The array of cells to fill.
 * @param {number} cells[].row - The row index of the cell to fill.
 * @param {number} cells[].col - The column index of the cell to fill.
 * @param {string} type - The type of piece to fill the cells with.
 *
 * @returns {Object} The same board object updated.
 */
function fillCells(board, cells, type, highlight) {
  const fillType = highlight ? `h${type}` : type;
  const nextGrid = copyGrid(board);

  for (const cell of cells) {
    nextGrid[cell.row][cell.col] = addStrUniqueHighlight(
      nextGrid[cell.row][cell.col],
      fillType
    );
  }

  return { ...board, grid: nextGrid };
}

/**
 * Fills a row on the board with a given type.
 * Prevents filling on top of the next piece.
 *
 * @function fillRow
 * @param {Object} board - The board object.
 * @param {number} row - The row index of the cell to fill.
 * @param {number} col - The column index of the cell to fill.
 * @param {string} type - The type of piece to fill the row with.
 * @param {Object} nextPiece - The next piece object.
 *
 * @returns {Object} The updated board object.
 */
function fillRow(board, row, col, type, nextPiece) {
  // Prevent filling on top of next piece
  for (let i = 0; i < nextPiece.span.length; i++) {
    if (
      row === nextPiece.y + nextPiece.span[i][1] &&
      col === nextPiece.x + nextPiece.span[i][0]
    ) {
      continue;
    }
    if (row === nextPiece.y + nextPiece.span[i][1]) {
      return board;
    }
  }

  // If already filled then do nothing
  const gridRow = board.grid[row];
  if (gridRow) {
    // Ensure row is full and has a hole at col
    let filled = true;
    for (let i = 0; i < gridRow.length; i++) {
      if (i === col && isGridOccupied(board.grid, row, i)) {
        filled = false;
        break;
      } else if (i !== col && !gridRow[i].includes(type)) {
        filled = false;
        break;
      }
    }

    if (filled) {
      return board;
    }
  }

  // Fill row
  const nextGrid = copyGrid(board);
  addRowsIfNeeded(nextGrid, row + 1);
  for (let i = 0; i < nextGrid[row].length; i++) {
    // Remove types and leave highlight
    nextGrid[row][i] = filterHighlight(nextGrid[row][i]);
    if (i === col) {
      // hole
      continue;
    }
    nextGrid[row][i] = addStrUniqueHighlight(nextGrid[row][i], type);
  }
  return { ...board, grid: nextGrid };
}

/**
 * Clears a row on the board.
 *
 * @param {Object} board - The board object containing the grid.
 * @param {number} row - The row index of the row to clear.
 *
 * @returns {Object} The updated board object.
 * - If the row is already empty the function returns the original board.
 * - If the row is cleared the function returns a new board with the updated grid.
 */
function clearRow(board, row) {
  const gridRow = board.grid[row];
  if (!gridRow) {
    return board;
  }

  // If row is already empty then do nothing
  let cleared = true;
  for (let i = 0; i < gridRow.length; i++) {
    if (isGridOccupied(board.grid, row, i)) {
      cleared = false;
      break;
    }
  }
  if (cleared) {
    return board;
  }

  // Clear row
  const nextGrid = copyGrid(board);
  for (let i = 0; i < nextGrid[row].length; i++) {
    // Leave highlighted cell
    nextGrid[row][i] = filterHighlight(nextGrid[row][i]);
  }
  return { ...board, grid: nextGrid };
}

/**
 * Checks if a given piece can be legally placed on the board.
 * Legal move when spots taken by piece are empty and in bounds
 *
 * @function isLegal
 * @param {Object} grid - The board object.
 * @param {Array} grid.grid - The 2D array representing the board grid.
 * @param {number} grid.rows - The number of rows in the board grid.
 * @param {number} grid.cols - The number of columns in the board grid.
 * @param {Object} piece - The piece to be placed on the board.
 * @param {Array} piece.span - The coordinates of the piece's cells relative to its position.
 * @param {number} piece.span[].0 - The x-coordinate of the piece's cell relative to its position.
 * @param {number} piece.span[].1 - The y-coordinate of the piece's cell relative to its position.
 * @param {string} piece.type - The type of the piece.
 * @param {number} piece.x - The x-coordinate of the piece's position on the board.
 * @param {number} piece.y - The y-coordinate of the piece's position on the board.
 *
 * @returns {boolean} Returns true if the piece can be legally placed on the board, false otherwise.
 */
function isLegal(board, piece) {
  for (let i = 0; i < piece.span.length; i++) {
    const row = piece.y + piece.span[i][1];
    const col = piece.x + piece.span[i][0];

    // Validate in bounds
    if (row < 0 || col < 0 || col >= board.cols) {
      return false;
    }

    // If above (board.rows) will add more rows to grid (can occur with kicks)
    if (row >= board.grid.length) {
      continue;
    }

    if (isGridOccupied(board.grid, row, col)) {
      return false;
    }
  }

  return true;
}

/**
 * Checks if a given piece is on something, either floor or another piece.
 * True if one row below its current position is not legal.
 *
 * @function hasLanded
 * @param {Object} board - The board object.
 * @param {Object} piece - The piece to check.
 *
 * @returns {boolean} Returns true if the piece is on the floor or on another piece, false otherwise.
 */
function hasLanded(board, piece) {
  return !isLegal(board, pieceLib.down(piece));
}

function isLegalGrid(grid, piece) {
  for (let i = 0; i < piece.span.length; i++) {
    const row = piece.y + piece.span[i][1];
    const col = piece.x + piece.span[i][0];
    if (isGridOccupied(grid, row, col)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if a given position on the board is occupied or out of bounds.
 *
 * @function isOccupied
 * @param {Object} grid - The board object.
 * @param {Array} grid.grid - The 2D array representing the board grid.
 * @param {number} grid.cols - The number of columns in the board grid.
 * @param {number} row - The row index to check.
 * @param {number} col - The column index to check.
 *
 * @returns {boolean} Returns true if the given position is occupied or out of bounds, false otherwise.
 *
 * @remarks
 * Note: The board is not restricted on height (rows). If the given row is above the current board height,
 * then the position is considered not occupied.
 */
function isOccupied(board, row, col) {
  // If above current board height, then not occupied
  if (row >= board.grid.length) {
    return false;
  }

  // Wall
  if (row < 0 || col < 0 || col >= board.cols) {
    return true;
  }

  return isGridOccupied(board.grid, row, col);
}

function isGridOccupied(grid, row, col) {
  // Occupied when one of the pieces or garbage (oiljstzg) is there
  return grid[row][col]
    .split(' ')
    .some((word) => ['o', 'i', 'l', 'j', 's', 't', 'z', 'g'].includes(word));
}

function isGridRowOccupied(grid, row) {
  for (let i = 0; i < grid[row].length; i++) {
    if (!isGridOccupied(grid, row, i)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if all cells in the grid are empty.
 *
 * @function isAllClear
 * @param {Array} grid - The 2D array representing the board grid.
 *
 * @returns {boolean} Returns true if all cells in the grid are empty, false otherwise.
 */

function isAllClear(grid) {
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < grid[i].length; j++) {
      if (isGridOccupied(grid, i, j)) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Identifies and removes full rows from the grid,
 * Then appends empty rows to the top of grid to maintain a minimum of board.rows
 *
 * @param {Object} board - The board object.
 * @param {Array} board.grid - The 2D array representing the board grid.
 * @param {number} board.rows - The number of rows in the board grid.
 *
 * @returns {Object} An object containing the number of lines cleared and the updated board.
 * @returns {number} lineClears - The total number of lines cleared (includes garbage line clears).
 * @returns {number} garbageLineClears - The number of garbage lines cleared.
 * @returns {Object} board - The updated board object.
 * @returns {Array} board.grid - The updated 2D array representing the board grid.
 */
function clearLines(board) {
  const nextGrid = copyGrid(board);
  let lineClears = 0;
  let garbageLineClears = 0;
  for (let row = nextGrid.length - 1; row >= 0; row--) {
    // Row is full (no empty grid spot)
    if (isGridRowOccupied(nextGrid, row)) {
      // Clear line and increment counter
      const removedLine = nextGrid.splice(row, 1)[0];
      const hasGarbage = removedLine.some((word) =>
        word.split(' ').includes('g')
      );
      if (hasGarbage) {
        garbageLineClears++;
      }
      lineClears++;
    }
  }

  if (!lineClears) {
    return { lineClears, garbageLineClears, board, allClear: false };
  }

  const allClear = isAllClear(nextGrid);

  // If there were 26 rows, (board.rows is 26), and 2 were removed,
  // Add back rows so there's 26 rows again

  // Garbage example:
  //   player was at line 20 (4w likely) and tanks 10 lines, which results in 30 rows
  // If there are 30 rows, (board.rows is 26), and 2 were removed,
  // Add no rows because minimum of 26 is satisfied.
  addRowsIfNeeded(nextGrid, board.rows);

  return {
    lineClears,
    garbageLineClears,
    allClear,
    board: {
      ...board,
      grid: nextGrid,
    },
  };
}

/**
 * Receives and adds garbage lines to the board's grid.
 *
 * @function receiveGarbage
 * @param {Object} board - The board object.
 * @param {Array} board.grid - The 2D array representing the board grid.
 * @param {number} board.cols - The number of columns in the board grid.
 * @param {Object} garbage - The garbage object containing the garbage lines to be added.
 * @param {number} garbage.amount - The number of garbage lines.
 * @param {Array} garbage.hole - The position of the hole in each garbage line.
 *
 * @returns {Object} An object containing the updated board object.
 * @returns {Array} board.grid - The updated 2D array representing the board grid with added garbage lines.
 */
function receiveGarbage(board, garbage, nextPiece) {
  // Piece is shifted up if needed

  const lines = [];
  for (let i = 0; i < garbage.length; i++) {
    lines.push(
      ...createGarbageLines(board.cols, garbage[i].amount, garbage[i].hole)
    );
  }
  return addLines(board, lines, nextPiece);
}

/**
 * Adds the given lines to the board's grid.
 *
 * @param {Object} board - The board object.
 * @param {Array} lines - The lines to be added to the board's grid.
 *                        Each line is an array of strings representing the
 *                        type of block in the grid, and the arrays represent
 *                        the rows of the grid.
 *
 * @returns {Object} An object containing the updated board object.
 * @returns {Array} board.grid - The updated 2D array representing the board grid.
 */
function addLines(board, lines, piece) {
  const nextGrid = copyGrid(board);
  let nextPiece = piece;

  for (let i = 0; i < lines.length; i++) {
    nextGrid.unshift(lines[i]);
    if (piece && !isLegalGrid(nextGrid, piece)) {
      nextPiece = pieceLib.up(nextPiece);
    }
  }
  const nextBoard = { ...board, grid: nextGrid };
  return { nextBoard, nextPiece };
}

/**
 * Creates an array of arrays of strings representing garbage lines, with holes.
 * The strings represent the type of block in the grid, and the arrays represent
 * the rows of the grid.
 *
 * @param {number} cols - The number of columns in the grid.
 * @param {number} amountLines - The number of lines to create.
 * @param {number} hole - The column index where the hole should be placed
 *
 * @returns {Array} An array of arrays of strings, representing the garbage lines
 *   with holes.
 */

function createGarbageLines(cols, amountLines, hole) {
  const lines = Array.from({ length: amountLines }, () =>
    Array(cols).fill('g')
  );

  for (let i = 0; i < lines.length; i++) {
    lines[i][hole] = '';
  }
  return lines;
}

const boardLib = {
  place,
  fillCell,
  fillCells,
  clearCell,
  fillRow,
  clearRow,
  isLegal,
  hasLanded,
  isOccupied,
  clearLines,
  receiveGarbage,
  copyBoard,
};

export { newBoard as default, boardLib };
