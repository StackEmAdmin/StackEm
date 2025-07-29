import { pieceLib } from '../piece/piece';

// Context
// Land means piece is on board floor or on an occupied spot (like another piece or garbage).
// Unland means piece was in a landed state but now it isn't.

/**
 * Creates a gravity object with the given properties.
 * Examples:
 *   1g soft drops a piece 60 times per second.
 *   (1/60)g soft drops a piece every second.
 *
 * Note: values of 20g or higher infinite soft drops piece.
 *
 * @param {number} g - The initial speed in units per frames at which pieces fall.
 * @param {number} lock - The amount of time in ms before a piece drops into place once on floor. Provide negative value to prevent locking.
 * @param {number} lockCap - The maximum amount of time in ms a piece is allowed on floor before dropping into place.
 * @param {number} lockPenalty - The amount of time in ms a piece is penalized for moving from landed state to unlanded state.
 * @param {number} acc - The amount by which gravity is increased every second.
 * @param {number} accDelay - The amount of time in ms before acc is applied to gravity.
 * @returns {Object} An object with the given properties.
 */
function newGravity(g, lock, lockCap, lockPenalty, acc, accDelay) {
  return {
    g,
    lock,
    lockCap,
    lockPenalty,
    acc,
    accDelay,
  };
}

/**
 * Calculates the current gravity, increasing it by the specified acceleration
 * continuously every second after a given delay period has passed since the game started.
 *
 * @param {Object} gravity - The game gravity object containing initial gravity speed (g),
 *                           acceleration (acc), and acceleration delay (accDelay).
 * @param {number} startTime - The start time of the game in milliseconds.
 * @param {number} currentTime - The current time in milliseconds.
 *
 * @returns {number} Gravity after accounting for acceleration and acceleration delay.
 */
function getGravity(gravity, startTime, currentTime) {
  let secondsElapsed = (currentTime - startTime - gravity.accDelay) / 1000;
  secondsElapsed = Math.max(0, secondsElapsed);
  let grav = gravity.g + gravity.acc * secondsElapsed;
  // Limit range of grav to [-20, 20].
  grav = Math.min(20, Math.max(-20, grav));
  return grav;
}

/**
 * Infinite soft drop piece on 20 gravity.
 *
 * @param {Object} gravity - The game gravity object.
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @param {function} hasLanded - A function that takes a piece object and returns true if it is on the floor or on another piece.
 * @param {number} currentTime - The current time in ms.
 * @returns {Object} The next piece object.
 */
function twentyG(gravity, piece, hasLanded, startTime, currentTime) {
  const grav = getGravity(gravity, startTime, currentTime);
  if (grav < 20 || hasLanded(piece)) {
    return piece;
  }

  let nextPiece = piece;
  while (!hasLanded(nextPiece)) {
    nextPiece = pieceLib.down(nextPiece);
  }
  nextPiece = pieceLib.stamp(nextPiece, currentTime);

  return nextPiece;
}

/**
 * Updates the position of a piece based on the game gravity and current time.
 * Handles gravity range from zero to high gravity (20g).
 * If a piece has landed, it returns the piece without changes.
 * For 20g gravity, the piece is soft-dropped until landing.
 * For other gravity values, it utilizes time to move the piece down
 * and updates the piece position accordingly.
 *
 * @param {Object} gravity - The game gravity object.
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @param {function} hasLanded - A function that returns true if the piece is on the floor or another piece.
 * @param {number} startTime - The start time of the game in milliseconds.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} The updated piece object.
 */
function update(gravity, piece, hasLanded, startTime, currentTime) {
  if (hasLanded(piece)) {
    return piece;
  }

  const grav = getGravity(gravity, startTime, currentTime);

  if (grav <= 0) {
    // Antigravity? Sounds fun, should implement maybe.
    return piece;
  }

  // Default 20g behavior (like TGM)
  // Infinite soft drop piece on 20 gravity
  if (grav >= 20) {
    let nextPiece = piece;
    while (!hasLanded(nextPiece)) {
      nextPiece = pieceLib.down(nextPiece);
      nextPiece = pieceLib.stamp(nextPiece, currentTime);
    }
    return nextPiece;
  }

  // Calculate if it's time to move piece down.
  // Gravity measured in frames (60fps), convert to ms
  const timeGravity = 1000 / (60 * grav);
  let timeElapsed = currentTime - piece.gravityTimeRef;

  let nextPiece = piece;
  while (timeElapsed >= timeGravity) {
    nextPiece = pieceLib.down(nextPiece);
    nextPiece = pieceLib.stamp(
      nextPiece,
      nextPiece.gravityTimeRef + timeGravity
    );
    timeElapsed -= timeGravity;

    if (hasLanded(nextPiece)) {
      break;
    }
  }

  return nextPiece;
}

/**
 * Returns true if the piece should lock based on the game gravity and current time.
 * Piece should only lock when there's something beneath it.
 * Disabled when lock is negative.
 * Lock piece when lock amount of time has passed.
 * Lock piece when LockCap amount of time has passed.
 *
 * @param {Object} gravity - The game gravity object.
 * @param {Object} piece - The piece object with properties: type, rot, x, y, span.
 * @param {function} hasLanded - A function that returns true if the piece is on the floor or another piece.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {boolean} True if the piece should lock, false otherwise.
 */
function shouldLock(gravity, piece, hasLanded, currentTime) {
  // Piece should only lock when there's something beneath it.
  // Disabled when lock is negative.
  if (!hasLanded(piece) || gravity.lock < 0) {
    return false;
  }

  if (gravity.lock === 0) {
    return true;
  }

  // Lock piece when lock amount of time has passed
  if (currentTime - piece.gravityTimeRef >= gravity.lock) {
    return true;
  }

  // Lock piece when LockCap amount of time has passed
  if (
    currentTime - piece.gravityTimeRef + piece.gravityTimeLandRef >=
    gravity.lockCap
  ) {
    return true;
  }

  return false;
}

const gravityLib = { getGravity, twentyG, update, shouldLock };

export { newGravity as default, gravityLib };
