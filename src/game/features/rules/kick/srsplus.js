const srsPlusOLJSTZ = {
  0: {
    1: [
      [0, 0],
      [-1, 0],
      [-1, +1],
      [0, -2],
      [-1, -2],
    ],
    2: [
      [0, 0],
      [0, +1],
      [+1, +1],
      [-1, +1],
      [+1, 0],
      [-1, 0],
    ],
    3: [
      [0, 0],
      [+1, 0],
      [+1, +1],
      [0, -2],
      [+1, -2],
    ],
  },
  1: {
    0: [
      [0, 0],
      [+1, 0],
      [+1, -1],
      [0, +2],
      [+1, +2],
    ],
    2: [
      [0, 0],
      [+1, 0],
      [+1, -1],
      [0, +2],
      [+1, +2],
    ],
    3: [
      [0, 0],
      [+1, 0],
      [+1, +2],
      [+1, +1],
      [0, +2],
      [0, +1],
    ],
  },
  2: {
    0: [
      [0, 0],
      [0, -1],
      [-1, -1],
      [+1, -1],
      [-1, 0],
      [+1, 0],
    ],
    1: [
      [0, 0],
      [-1, 0],
      [-1, +1],
      [0, -2],
      [-1, -2],
    ],
    3: [
      [0, 0],
      [+1, 0],
      [+1, +1],
      [0, -2],
      [+1, -2],
    ],
  },
  3: {
    0: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, +2],
      [-1, +2],
    ],
    1: [
      [0, 0],
      [-1, 0],
      [-1, +2],
      [-1, +1],
      [0, +2],
      [0, +1],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [-1, -1],
      [0, +2],
      [-1, +2],
    ],
  },
};

const srsPlusI = {
  0: {
    1: [
      [0, 0],
      [+1, 0],
      [-2, 0],
      [-2, -1],
      [+1, +2],
    ],
    2: [
      [0, 0],
      [0, +1],
    ],
    3: [
      [0, 0],
      [-1, 0],
      [+2, 0],
      [+2, -1],
      [-1, +2],
    ],
  },
  1: {
    0: [
      [0, 0],
      [-1, 0],
      [+2, 0],
      [-1, -2],
      [+2, +1],
    ],
    2: [
      [0, 0],
      [-1, 0],
      [+2, 0],
      [-1, +2],
      [+2, -1],
    ],
    3: [
      [0, 0],
      [+1, 0],
    ],
  },
  2: {
    0: [
      [0, 0],
      [0, -1],
    ],
    1: [
      [0, 0],
      [-2, 0],
      [+1, 0],
      [-2, +1],
      [+1, -2],
    ],
    3: [
      [0, 0],
      [+2, 0],
      [-1, 0],
      [+2, +1],
      [-1, -2],
    ],
  },
  3: {
    0: [
      [0, 0],
      [+1, 0],
      [-2, 0],
      [+1, -2],
      [-2, +1],
    ],
    1: [
      [0, 0],
      [-1, 0],
    ],
    2: [
      [0, 0],
      [+1, 0],
      [-2, 0],
      [+1, +2],
      [-2, -1],
    ],
  },
};

/**
 * Checks if the given kick number and rotation combination represents a TST or FIN maneuver.
 *
 * @param {number} kickNum - The kick number attempt.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {number} newRotation - The new rotation of the piece.
 * @returns {boolean} - Returns true if the maneuver results in a TST or FIN move, false otherwise.
 */
function isTSTOrFIN(kickNum, prevRotation, newRotation) {
  // (kikNum, prevRot, newRot) = (4, 0, 1), (4, 0, 3), (4, 2, 1), or (4, 2, 3)

  if (kickNum !== 4) {
    return false;
  }

  if (prevRotation === 0 && newRotation === 1) {
    return true;
  }

  if (prevRotation === 0 && newRotation === 3) {
    return true;
  }

  if (prevRotation === 2 && newRotation === 1) {
    return true;
  }

  if (prevRotation === 2 && newRotation === 3) {
    return true;
  }

  return false;
}

// table[pieceType][prevRot][newRot] = kickTable // for that piece
// kickTable = [
//   [kick1X, kick1Y]  // offset
//   [kick2X, kick2Y]
//   ...
// ]
const srsPlusKickTable = {
  name: 'srsPlus',
  o: srsPlusOLJSTZ,
  i: srsPlusI,
  l: srsPlusOLJSTZ,
  j: srsPlusOLJSTZ,
  s: srsPlusOLJSTZ,
  t: srsPlusOLJSTZ,
  z: srsPlusOLJSTZ,
};

export { isTSTOrFIN, srsPlusKickTable as default };
