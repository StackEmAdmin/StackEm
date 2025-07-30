import tSpin from './tSpin.js';
import all from './all.js';

/**
 * Creates a new instance of spin maneuvers allowed based on the specified mode.
 *
 * @function newSpins
 * @param {string} system - The mode of spins to create.
 * @returns {object} An instance of spins based on the specified mode.
 */
function newSpins(system) {
  return system;
}

/**
 * Retrieves information about a potential spin maneuver based on the specified game board state, rotated piece, previous rotation, kick offset, and kick number.
 *
 * @param {string} system - The mode of spins to check.
 * @param {Object} board - The game board object.
 * @param {Object} piece - The rotated piece object.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {string} kickTableName - The kick table name.
 * @param {number} kickNum - The kick number used for the piece.
 *
 * @returns {string} - Depending on maneuver performed, returns 'spin', 'mini', or ''.
 */
function getSpinInfo(
  system,
  board,
  piece,
  prevRotation,
  kickTableName,
  kickNum
) {
  if (system === 'none') {
    return '';
  }

  if (system === 'tSpin') {
    return tSpin.getSpinInfo(
      board,
      piece,
      prevRotation,
      kickTableName,
      kickNum
    );
  }

  if (
    system === 'allSpin' ||
    system === 'allMini' ||
    system === 'allSpin+' ||
    system === 'allMini+'
  ) {
    const type = system === 'allSpin' ? 'spin' : 'mini';
    const plus = system === 'allSpin+' || system === 'allMini+';

    return all.getSpinInfo(
      board,
      piece,
      prevRotation,
      kickTableName,
      kickNum,
      type,
      plus
    );
  }

  return '';
}

const spinLib = {
  getSpinInfo,
};

export { newSpins as default, spinLib };
