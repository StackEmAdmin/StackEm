import newPiece, { pieceLib } from '../piece/piece';
import newRNG, { rngLib } from '../random/rng';

/**
 * Creates a new piece queue with provided seed and start time.
 * State based queue
 *
 * @param {number} seed - The seed for the random number generator. If not provided, a random seed will be generated.
 * @param {number} startTime - The start time for spawning the initial piece.
 * @returns {Object} A new game queue object with the following properties:
 *  - rng: A random number generator initialized with the given seed.
 *  - held: A boolean indicating if a piece is held.
 *  - hold: An empty string representing the currently held piece.
 *  - pieces: An array containing the upcoming pieces for the game.
 */
function newQueue(seed, startTime) {
  const emptyQ = {
    rng: newRNG(seed),
    held: false,
    hold: '',
    pieces: [],
  };

  let nextQueue = addPieces(emptyQ);
  const spawnedPiece = pieceLib.stamp(nextQueue.pieces[0], startTime);
  nextQueue = updateNextPiece(nextQueue, spawnedPiece);

  return nextQueue;
}

function addPiecesIfNeeded(queue) {
  // 1 active piece + 5 preview pieces
  if (queue.pieces.length < 6) {
    return addPieces(queue);
  }
  return queue;
}

function addPieces(queue) {
  const { arr: shuffledTypes, nextRNG } = shuffle(
    ['o', 'i', 'l', 'j', 's', 't', 'z'],
    queue.rng
  );

  // Shallow copy
  // Ok since no change is made to piece
  const nextPieces = queue.pieces.slice();

  shuffledTypes.forEach((type) => nextPieces.push(newPiece(type)));

  return {
    ...queue,
    rng: nextRNG,
    pieces: nextPieces,
  };
}

function shuffle(arr, rng) {
  let nextRNG = rng;

  // Durstenfeld shuffle
  for (let i = arr.length - 1; i >= 0; i--) {
    // Select index to swap with
    nextRNG = rngLib.next(nextRNG);
    let j = Math.floor(nextRNG.random * (i + 1));

    // Swap!
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return { arr, nextRNG };
}

/**
 * Returns the next piece in the queue.
 *
 * @param {Object} queue - The queue object.
 * @param {Array.<Object>} queue.pieces - The upcoming pieces for the game.
 * @returns {Object} The next piece in the queue.
 */
function nextPiece(queue) {
  return queue.pieces[0];
}

/**
 * Removes the next piece from the queue and adds new pieces if necessary.
 *
 * @param {Object} queue - The queue object.
 * @param {Object} queue.rng - The random number generator.
 * @param {boolean} queue.held - Indicates if a piece is currently held.
 * @param {string} queue.hold - The currently held piece.
 * @param {Array.<Object>} queue.pieces - The upcoming pieces for the game.
 * @returns {Object} The updated game queue object with the next piece removed.
 *  If necessary, new pieces will be added to maintain the required queue length.
 */
function removeNextPiece(queue, currentTime) {
  // Remove first piece (original array unaffected)
  const nextPieces = queue.pieces.slice(1);
  nextPieces[0] = pieceLib.stamp(nextPieces[0], currentTime);
  return addPiecesIfNeeded({
    ...queue,
    pieces: nextPieces,
  });
}

/**
 * Removes the next piece from the queue and adds new pieces if necessary.
 * Imitates placing a piece from the queue.
 *
 * @param {Object} queue - The queue object.
 * @param {Object} queue.rng - The random number generator.
 * @param {boolean} queue.held - Indicates if a piece is currently held.
 * @param {string} queue.hold - The currently held piece.
 * @param {Array.<Object>} queue.pieces - The upcoming pieces for the game.
 * @param {number} currentTime - The current time to set the spawn time for next piece.
 * @returns {Object} The updated game queue object with the next piece removed.
 *  If necessary, new pieces will be added to maintain the required queue length.
 */
function place(queue, currentTime) {
  const nextPieces = queue.pieces.slice(1);
  nextPieces[0] = pieceLib.stamp(nextPieces[0], currentTime);

  return addPiecesIfNeeded({
    ...queue,
    held: false,
    pieces: nextPieces,
  });
}

function hold(queue, currentTime) {
  // No change if already held piecce
  if (queue.held) {
    return queue;
  }

  const nextHold = newPiece(nextPiece(queue).type);

  if (!queue.hold) {
    const nextQueue = removeNextPiece(queue, currentTime);
    return {
      ...nextQueue,
      held: true,
      hold: nextHold,
    };
  }

  // Swap with hold
  const prevHold = queue.hold;
  const nextPieces = queue.pieces.slice(0);
  nextPieces[0] = pieceLib.stamp(prevHold, currentTime);

  return {
    ...queue,
    held: true,
    hold: nextHold,
    pieces: nextPieces,
  };
}

/**
 * Updates the next piece in the queue with a new piece.
 *
 * @function updateNextPiece
 * @param {Object} queue - The queue object.
 * @param {Array.<Object>} queue.pieces - The upcoming pieces for the game.
 * @param {Object} updatedPiece - The new piece to replace the current next piece.
 * @returns {Object} The updated game queue object with the next piece replaced.
 *  The original queue object is not modified.
 */
function updateNextPiece(queue, updatedPiece) {
  const nextPieces = queue.pieces.slice(0);
  nextPieces[0] = updatedPiece;
  return {
    ...queue,
    pieces: nextPieces,
  };
}

const queueLib = {
  nextPiece,
  hold,
  place,
  updateNextPiece,
};

export { newQueue as default, queueLib };
