import { boardLib } from '../../board/board';
import { pieceLib } from '../../piece/piece';

/**
 * Determines if a piece is immobile on the board, meaning it cannot move in any direction legally.
 *
 * @param {Object} board - The current game board state.
 * @param {Object} piece - The piece to check for immobility.
 * @returns {boolean} - Returns true if the piece cannot move down, left, right, or up legally; otherwise, false.
 */
function immobile(board, piece) {
  if (boardLib.isLegal(board, pieceLib.down(piece))) {
    return false;
  }

  if (boardLib.isLegal(board, pieceLib.left(piece))) {
    return false;
  }

  if (boardLib.isLegal(board, pieceLib.right(piece))) {
    return false;
  }

  if (boardLib.isLegal(board, pieceLib.up(piece))) {
    return false;
  }

  return true;
}

export default immobile;
