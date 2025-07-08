const pieceSpans = {
  o: {
    0: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    1: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    2: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
    3: [
      [0, 0],
      [0, 1],
      [1, 0],
      [1, 1],
    ],
  },
  i: {
    0: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [2, 0],
    ],
    1: [
      [1, 1],
      [1, 0],
      [1, -1],
      [1, -2],
    ],
    2: [
      [-1, -1],
      [0, -1],
      [1, -1],
      [2, -1],
    ],
    3: [
      [0, 1],
      [0, 0],
      [0, -1],
      [0, -2],
    ],
  },
  l: {
    0: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    1: [
      [0, 1],
      [0, 0],
      [0, -1],
      [1, -1],
    ],
    2: [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    3: [
      [-1, 1],
      [0, 1],
      [0, 0],
      [0, -1],
    ],
  },
  j: {
    0: [
      [-1, 1],
      [-1, 0],
      [0, 0],
      [1, 0],
    ],
    1: [
      [1, 1],
      [0, 1],
      [0, 0],
      [0, -1],
    ],
    2: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [1, -1],
    ],
    3: [
      [0, 1],
      [0, 0],
      [0, -1],
      [-1, -1],
    ],
  },
  s: {
    0: [
      [-1, 0],
      [0, 0],
      [0, 1],
      [1, 1],
    ],
    1: [
      [0, 1],
      [0, 0],
      [1, 0],
      [1, -1],
    ],
    2: [
      [-1, -1],
      [0, -1],
      [0, 0],
      [1, 0],
    ],
    3: [
      [-1, 1],
      [-1, 0],
      [0, 0],
      [0, -1],
    ],
  },
  t: {
    0: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, 1],
    ],
    1: [
      [0, 1],
      [0, 0],
      [0, -1],
      [1, 0],
    ],
    2: [
      [-1, 0],
      [0, 0],
      [1, 0],
      [0, -1],
    ],
    3: [
      [0, 1],
      [0, 0],
      [0, -1],
      [-1, 0],
    ],
  },
  z: {
    0: [
      [-1, 1],
      [0, 1],
      [0, 0],
      [1, 0],
    ],
    1: [
      [0, -1],
      [0, 0],
      [1, 0],
      [1, 1],
    ],
    2: [
      [-1, 0],
      [0, 0],
      [0, -1],
      [1, -1],
    ],
    3: [
      [-1, -1],
      [-1, 0],
      [0, 0],
      [0, 1],
    ],
  },
};

/**
 * Creates a new piece object with the given type, rotation, and position.
 *
 * @function newPiece
 * @param {string} type - The type of the piece (e.g., 'i', 'j', 'o', 's', 't', 'z').
 * @param {number} [rot=0] - The initial rotation of the piece (0, 1, 2, or 3).
 * @param {number} [x=4] - The initial x-coordinate of the piece.
 * @param {number} [y=21] - The initial y-coordinate of the piece.
 * @returns {Object} A new piece object with properties: type, rot, x, y, and span.
 *
 * @example
 * const piece = newPiece('i', 0, 5, 10);
 * console.log(piece); // { type: 'i', rot: 0, x: 5, y: 10, span: number[][]) }
 */
function newPiece(type, rot = 0, x = 4, y = 21) {
  return {
    type,
    rot,
    x,
    y,
    span: pieceSpans[type][rot],
  };
}

/**
 * Moves the given piece one unit to the left.
 *
 * @function left
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @returns {Object} A new piece object with the updated x-coordinate.
 *
 * @example
 * const piece = { type: 'i', rot: 0, x: 5, y: 10, span: number[][] };
 * const newPiece = left(piece)
 * console.log(newPiece); // { type: 'i', rot: 0, x: 4, y: 10, span: number[][]) }
 */
function left(piece) {
  return { ...piece, x: piece.x - 1 };
}

function right(piece) {
  return { ...piece, x: piece.x + 1 };
}

function down(piece) {
  return { ...piece, y: piece.y - 1 };
}

function up(piece) {
  return { ...piece, y: piece.y + 1 };
}

/**
 * Rotates the piece 90 degrees clockwise.
 *
 * @function rotateCW
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @returns {Object} A new piece object with the updated rotation and span.
 *
 * @example
 * const piece = { type: 'i', rot: 0, x: 5, y: 10, span: number[][] };
 * const newPiece = rotateCW(piece);
 * console.log(newPiece); // { type: 'i', rot: 1, x: 5, y: 10, span: number[][] }
 */

function rotateCW(piece) {
  const newRot = (piece.rot + 1) % 4;
  return {
    ...piece,
    rot: newRot,
    span: pieceSpans[piece.type][newRot],
  };
}

function rotate180(piece) {
  const newRot = (piece.rot + 2) % 4;
  return {
    ...piece,
    rot: newRot,
    span: pieceSpans[piece.type][newRot],
  };
}

function rotateCCW(piece) {
  const newRot = (piece.rot + 3) % 4;
  return {
    ...piece,
    rot: newRot,
    span: pieceSpans[piece.type][newRot],
  };
}

/**
 * Creates a shallow copy of the given piece object.
 * Note: properties are primitive so changes to properties will leave original unchanged
 *         span should be read-only
 *
 * @function copy
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @returns {Object} A new piece object with the same properties as the input piece.
 *
 * @example
 * const piece = { type: 'i', rot: 0, x: 5, y: 10, span: number[][] };
 * const newPiece = copy(piece);
 * console.log(newPiece); // { type: 'i', rot: 0, x: 5, y: 10, span: number[][] }
 */
function copy(piece) {
  return { ...piece };
}

function kick(piece, kickX, kickY) {
  return {
    ...piece,
    x: piece.x + kickX,
    y: piece.y + kickY,
  };
}

/**
 * Creates a 2D representation of the piece's span on a grid.
 *
 * @function subGrid
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @returns {Object} A 2D object representing the piece's span on a grid.
 *                   Each key in the object represents a row, and its value is another object.
 *                   The inner object's keys represent columns, and their values represent the piece's type.
 *                   If a row or column doesn't exist in the span, it's not included in the subgrid.
 *
 * @example
 * const piece = { type: 'i', rot: 0, x: 5, y: 10, span: number[][] };
 * const subGrid = subGrid(piece);
 * console.log(subGrid); // { 10: { 5: 'i', 6: 'i' }, 11: { 5: 'i', 6: 'i' } }
 */
function subGrid(piece) {
  if (!piece) {
    return {};
  }
  // Imitates an array of piece span: subGrid[row][col] = type
  // If row or column doesn't exist, it's not in the subgrid.
  const subGrid = {};
  for (let i = 0; i < piece.span.length; i++) {
    const row = piece.y + piece.span[i][1];
    const col = piece.x + piece.span[i][0];
    subGrid[row] = { ...subGrid[row], [col]: piece.type };
  }
  return subGrid;
}

function createGhost(piece) {
  return {
    ...piece,
    type: 'ghost',
  };
}

function plot(cells) {
  // Create empty 4x4 grid where (0, 0) is bottom left
  const len = 4;
  const subGrid = Array.from({ length: len }, () => Array(len).fill(0));

  // Translate cell row and col so they're in range [0, 4]
  const minRow = Math.min(...cells.map((cell) => cell.row));
  const minCol = Math.min(...cells.map((cell) => cell.col));
  const translatedCells = cells.map((cell) => {
    return {
      ...cell,
      row: cell.row - minRow,
      col: cell.col - minCol,
    };
  });

  // Plot translated cells on the grid
  let success = true;
  for (const cell of translatedCells) {
    if (cell.row < 0 || cell.row >= len || cell.col < 0 || cell.col >= len) {
      success = false;
      continue;
    }
    subGrid[cell.row][cell.col] = 1;
  }

  return { success, subGrid };
}

/**
 * Given an array of cells, determine the piece type.
 *
 * @function calculateTypeFromCells
 * @param {Array} cells - An array of cells with row and col properties.
 *
 * @returns {Object} An object with a success boolean and a type string.
 *                   If success is false, the type is null.
 */
function calculateTypeFromCells(cells) {
  const { success, subGrid } = plot(cells);
  if (!success) {
    return { success, type: null };
  }

  return calculateTypeFromGrid(subGrid);
}

function calculateTypeFromGrid(g) {
  // g is a 4x4 grid with 1s representing filled and 0 r
  // g[0][0] is bottom left

  // o
  if (g[0][0] && g[0][1] && g[1][0] && g[1][1]) {
    return { success: true, type: 'o' };
  }

  // i
  if (g[0][0] && g[0][1] && g[0][2] && g[0][3]) {
    return { success: true, type: 'i' };
  }
  if (g[0][0] && g[1][0] && g[2][0] && g[3][0]) {
    return { success: true, type: 'i' };
  }

  // l
  if (g[0][0] && g[0][1] && g[0][2] && g[1][2]) {
    return { success: true, type: 'l' };
  }
  if (g[2][0] && g[1][0] && g[0][0] && g[0][1]) {
    return { success: true, type: 'l' };
  }
  if (g[0][0] && g[1][0] && g[1][1] && g[1][2]) {
    return { success: true, type: 'l' };
  }
  if (g[2][0] && g[2][1] && g[1][1] && g[0][1]) {
    return { success: true, type: 'l' };
  }

  // j
  if (g[0][0] && g[0][1] && g[0][2] && g[1][0]) {
    return { success: true, type: 'j' };
  }
  if (g[0][0] && g[1][0] && g[2][0] && g[2][1]) {
    return { success: true, type: 'j' };
  }
  if (g[1][0] && g[1][1] && g[1][2] && g[0][2]) {
    return { success: true, type: 'j' };
  }
  if (g[0][0] && g[0][1] && g[1][1] && g[2][1]) {
    return { success: true, type: 'j' };
  }

  // s
  if (g[0][0] && g[0][1] && g[1][1] && g[1][2]) {
    return { success: true, type: 's' };
  }
  if (g[2][0] && g[1][0] && g[1][1] && g[0][1]) {
    return { success: true, type: 's' };
  }

  // t
  if (g[0][0] && g[0][1] && g[0][2] && g[1][1]) {
    return { success: true, type: 't' };
  }
  if (g[0][0] && g[1][0] && g[2][0] && g[1][1]) {
    return { success: true, type: 't' };
  }
  if (g[1][0] && g[1][1] && g[1][2] && g[0][1]) {
    return { success: true, type: 't' };
  }
  if (g[1][0] && g[0][1] && g[1][1] && g[2][1]) {
    return { success: true, type: 't' };
  }

  // z
  if (g[1][0] && g[1][1] && g[0][1] && g[0][2]) {
    return { success: true, type: 'z' };
  }
  if (g[0][0] && g[1][0] && g[1][1] && g[2][1]) {
    return { success: true, type: 'z' };
  }

  return { success: false, type: null };
}

const pieceLib = {
  left,
  right,
  down,
  up,
  rotateCW,
  rotate180,
  rotateCCW,
  kick,
  copy,
  subGrid,
  createGhost,
  calculateTypeFromCells,
};

export { newPiece as default, pieceLib };
