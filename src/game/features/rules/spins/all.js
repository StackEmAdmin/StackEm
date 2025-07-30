import tSpin from './tSpin';
import immobile from './immobile';

/**
 * Determines the type of twist maneuver.
 * Enabling plus includes immobile t.
 *
 * @param {Array} board - The current state of the game board.
 * @param {Object} piece - The rotated piece object.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {string} kickTableName - The kick table name.
 * @param {number} kickNum - The kick number used for the piece.
 * @param {string} type - The type of twist maneuver to categorize as.
 * @param {boolean} plus - If true, check for immobile t pieces.
 *
 * @returns {string} - The type of twist maneuver ('spin' or 'mini'), or an empty string if no maneuver is detected.
 */
function getSpinInfo(
  board,
  piece,
  prevRotation,
  kickTableName,
  kickNum,
  type,
  plus
) {
  // All spin, pretty simple really.
  // 1. T piece: t-spin rules apply.
  // 2. All other pieces (not T): if immobile then it's a twist.

  // All spin+, short for All spin + immobile t
  // 1. T piece: t-spin rules take priority.
  // 2. All pieces (including T): if immobile then it's a twist.

  if (piece.type === 't') {
    const twist = tSpin.getSpinInfo(
      board,
      piece,
      prevRotation,
      kickTableName,
      kickNum
    );

    if (twist !== '') {
      return twist;
    }

    if (!plus) {
      return '';
    }
  }

  return immobile(board, piece) ? type : '';
}

export default { getSpinInfo };
