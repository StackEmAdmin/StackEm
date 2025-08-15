/**
 * Converts a 2D array into a string, where each element of the array
 * is a row of the input string, and each element of the inner arrays
 * is a column of the input string.
 *
 * @param {string[][]} arr - The 2D array to be converted into a string.
 * @returns {string} String representation of the array.
 */
function parseGridArr(arr) {
  let copy = arr.map((row) => row.slice()).reverse();

  // Filter empty rows following the last non-empty row
  let foundOccupied = false;
  copy = copy.filter((row) => {
    if (foundOccupied) {
      return true;
    }
    foundOccupied = row.some((col) => col !== '');
    return foundOccupied;
  });

  // Replace empty spaces with '.'
  return copy
    .map((row) => row.map((col) => col.replace(' ', '') || '.').join(' '))
    .join('\n');
}

/**
 * Splits a string into a 2D array, where each element of the array
 * is a row of the input string, and each element of the inner arrays
 * is a column of the input string.
 *
 * If a row has fewer columns than the row with the most columns, the
 * row is padded (end) with '.' characters.
 *
 * @param {string} text - The input string to be split into a 2D array.
 * @returns {string[][]} 2D array of strings.
 */
function tokenizeGrid(text) {
  // Split text into rows and columns removing excess whitespace
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/));

  const cols = Math.max(...rows.map((row) => row.length));
  const grid = rows.map((row) => {
    const copy = row.slice();
    while (copy.length < cols) {
      copy.push('.');
    }
    return copy;
  });

  return grid;
}

/**
 * Formats the grid so that each column is padded to the width
 * of the longest token in that column.
 *
 * @param {string} text - The input string to be formatted.
 * @returns {string} Formatted string with padded columns.
 */
function formatGrid(text) {
  // Ensure valid before formatting
  if (text === '') {
    return text;
  }

  const grid = tokenizeGrid(text);
  const cols = grid[0].length;

  // Calculate max width for each column
  const colsWidths = new Array(cols).fill(0);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      colsWidths[c] = Math.max(colsWidths[c], grid[r][c].length);
    }
  }

  // Convert to string with padded columns
  const padded = grid.map((row) => {
    return row
      .map((col, i) => {
        return String(col).padStart(colsWidths[i], ' ');
      })
      .join(' ');
  });

  return padded.join('\n');
}

/**
 * Parses the input text by removing excess whitespace.
 * This includes collapsing extra spaces between tokens.
 *
 * @param {string} text - The input string to be parsed.
 * @returns {string} Parsed string with standardized spacing.
 */

function parseGrid(text) {
  // Remove excess whitespaces
  const parsed = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).join(' '))
    .join('\n');

  return parsed;
}

export { parseGridArr, tokenizeGrid, formatGrid, parseGrid };
