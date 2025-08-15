/**
 * Calculate the row and column from the top left of a cell in the grid,
 * given the bounding rectangle of the cell and the bounding rectangle
 * of the board.
 *
 * @param {DOMRect} cellRect - The bounding rectangle of the cell.
 * @param {DOMRect} boardRect - The bounding rectangle of the board.
 * @param {Number} rows - The number of rows in the board.
 * @param {Number} offSet - The number of rows to offset the row calculation.
 * @returns {Object} - An object with `row` and `col` properties.
 */
function calcRowColFromRect(cellRect, boardRect, rows, offSet) {
  return {
    row:
      rows -
      1 -
      Math.round((cellRect.top - boardRect.top) / cellRect.height) +
      offSet,
    col: Math.round((cellRect.left - boardRect.left) / cellRect.width),
  };
}

export { calcRowColFromRect };
