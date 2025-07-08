import { boardLib } from '../../board/board';
import { isTSTOrFIN } from '../kick/srsplus';

/**
 * Determines the type of spin maneuver based on the given game board state and rotation.
 *
 * @param {Array} gameBoard - The current state of the game board.
 * @param {Object} piece - The (rotated & kicked) piece being placed on the board.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {string} kickTableName - The kick table name.
 * @param {number} kickNum - The kick number used for the piece.
 * @returns {string} - The type of maneuver ('spin' or 'mini'), or an empty string if no maneuver is detected.
 */
function getSpinInfo(gameBoard, piece, prevRotation, kickTableName, kickNum) {
  // Disclaimer:
  // T Spins are quite a curious sight,
  // Twists and turns in all its might.
  // If you're new, a warning clear,
  // Absorb the clues and have no fear.

  // 1. Piece is a t
  // 2. At least 3 of the 4 corners are occupied (from the 3x3 sub-grid of piece span)
  // 3. The t faces 2 of the occupied corners
  // 4. The t performed a TST or FIN kick:
  // 5. (Satisfied from caller) Last move is rotation

  // Conditions (1 & ((2 & 3) or 4)) must be true for a t spin
  // Conditions (1 & 2 & not (3 or 4)) must be true for a mini t spin

  // Condition 1
  if (piece.type !== 't') {
    return '';
  }

  // Condition 4 applies to srsPlus (and srs when implemented)
  const newRotation = piece.rot;
  if (
    kickTableName === 'srsPlus' &&
    isTSTOrFIN(kickNum, prevRotation, newRotation)
  ) {
    return 'spin';
  }

  // 3*3 possible sub-grids from t piece where x represent the corners:
  //    x t x   x t x   x - x   x t x
  //    t t t   - t t   t t t   t t -
  //    x - x   x t x   x t x   x t x

  const r = piece.y; // row
  const c = piece.x; // column
  const topLeft = boardLib.isOccupied(gameBoard, r + 1, c - 1) ? 1 : 0;
  const botLeft = boardLib.isOccupied(gameBoard, r - 1, c - 1) ? 1 : 0;
  const topRight = boardLib.isOccupied(gameBoard, r + 1, c + 1) ? 1 : 0;
  const botRight = boardLib.isOccupied(gameBoard, r - 1, c + 1) ? 1 : 0;

  // Condition 2
  if (topLeft + botLeft + botRight + topRight < 3) {
    return '';
  }

  // Condition 3
  if (newRotation === 0 && topLeft && topRight) {
    return 'spin';
  }
  if (newRotation === 1 && topRight && botRight) {
    return 'spin';
  }
  if (newRotation === 2 && botRight && botLeft) {
    return 'spin';
  }
  if (newRotation === 3 && botLeft && topLeft) {
    return 'spin';
  }

  // At this point, conditions:
  //  1 is true
  //  2 is true
  //  3 is false
  //  4 is false

  // Thus we have a mini. qed
  return 'mini';
}

export default { getSpinInfo };
