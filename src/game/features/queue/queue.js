import newPiece, { pieceLib } from '../piece/piece';
import newRNG, { rngLib } from '../random/rng';

/**
 * Creates a new piece queue with provided seed and start time.
 * State based queue
 *
 * @param {number} seed - The seed for the random number generator. If not provided, a random seed will be generated.
 * @param {boolean} holdEnabled - A boolean indicating if holding a piece is allowed.
 * @param {number} limitSize - The maximum number of pieces to generate. Provide 0 to disable limit.
 * @param {string} initialHold - A string specifying the initial held piece.
 * @param {string} initialPieces - A string specifying the initial piece type sequence in the queue.
 * @param {number} nthPC - Specifies which All Clear (PC) scenario to simulate by removing pieces from the initial bag added.
 * @param {number} startTime - The start time for spawning the initial piece.
 * @returns {Object} A new game queue object with the following properties:
 *  - rng: A random number generator initialized with the given seed.
 *  - numPieces: The number of pieces generated.
 *  - limitSize: The maximum number of pieces to generate.
 *  - holdEnabled: A boolean indicating if holding a piece is allowed.
 *  - held: A boolean indicating if a piece is held.
 *  - hold: An empty string representing the currently held piece.
 *  - pieces: An array containing the upcoming pieces for the game.
 */
function newQueue(
  seed,
  holdEnabled,
  limitSize,
  initialHold,
  initialPieces,
  nthPC,
  startTime
) {
  let baseQueue = addPieces({
    rng: newRNG(seed),
    numPieces: 0,
    limitSize: 0, // disable limit to generate pieces
    holdEnabled: holdEnabled,
    held: false,
    hold: initialHold ? newPiece(initialHold) : null,
    pieces: [],
  });

  // Configure to simulate nth PC
  baseQueue = adjustNthPC(baseQueue, nthPC);

  // Add initial pieces (if any)
  baseQueue.pieces = typesToPieces(initialPieces).concat(baseQueue.pieces);
  baseQueue.numPieces = baseQueue.pieces.length;

  // Trim queue to ensure it does not exceed limit
  baseQueue = limitQueueSize(baseQueue, limitSize);

  // Ensure enough pieces in queue (3rd pc bag has 1 piece)
  baseQueue = addPiecesIfNeeded(baseQueue);

  // Time stamp spawn piece
  baseQueue.pieces[0] = pieceLib.stamp(baseQueue.pieces[0], startTime);

  return baseQueue;
}

/**
 * Converts a string of piece types into an array of piece objects.
 *
 * @param {string} types - A string representing the piece types ('o', 'i', 'l', 'j', 's', 't', 'z').
 * @returns {Array.<Object>} An array of piece objects corresponding to the given types.
 *  Returns an empty array if the input string is empty.
 */
function typesToPieces(types) {
  if (types === '') {
    return [];
  }

  return types.split('').map((type) => newPiece(type));
}

/**
 * Adjusts the queue by removing the appropriate number of pieces at the beginning
 * based on the nth PC (1-indexed).
 *
 * @param {Object} queue - The queue object.
 * @param {number} nthPC - The nth PC (1-indexed) to adjust the queue for.
 * @returns {Object} The updated queue object with the appropriate number of
 *  pieces removed from the beginning.
 */
function adjustNthPC(queue, nthPC) {
  // No pieces to remove on first pc
  if (nthPC <= 1) {
    return queue;
  }

  // nthPC is an integer in range [1, 7], map to [0, 6].
  const nth = (nthPC + 6) % 7;
  const numToRemove = (10 * nth) % 7;

  return {
    ...queue,
    numPieces: queue.numPieces - numToRemove,
    pieces: queue.pieces.slice(numToRemove),
  };
}

/**
 * Limits the size of the queue to the given size. If the size is 1 and a hold
 * piece exists, the hold piece is used as the queue. Otherwise, extra pieces
 * are removed from the queue.
 *
 * @param {Object} queue - The queue object.
 * @param {number} limitSize - The new size limit for the queue.
 * @returns {Object} The updated queue object with the size limit applied.
 */
function limitQueueSize(queue, limitSize) {
  // Disabled
  if (limitSize <= 0) {
    return queue;
  }

  // If limit is 1 piece and hold provided then use hold piece as queue
  const holdExists = queue.hold !== null;
  if (limitSize === 1 && holdExists) {
    return {
      ...queue,
      numPieces: limitSize,
      limitSize: limitSize,
      hold: null,
      pieces: [queue.hold],
    };
  }

  // Remove extra pieces
  let extraPieces = queue.pieces.length + (holdExists ? 1 : 0) - limitSize;
  if (extraPieces > 0) {
    const pieces = queue.pieces.slice(0, queue.pieces.length - extraPieces);
    return {
      ...queue,
      numPieces: limitSize,
      limitSize: limitSize,
      pieces: pieces,
    };
  }

  return {
    ...queue,
    numPieces: queue.pieces.length + (holdExists ? 1 : 0),
    limitSize: limitSize,
  };
}

function addPiecesIfNeeded(queue, updateRNG = true) {
  // If limit is enabled and reached limit, then add no pieces
  if (queue.limitSize > 0 && queue.numPieces >= queue.limitSize) {
    return queue;
  }

  // 1 active piece + 5 preview pieces
  if (queue.pieces.length < 6) {
    return addPieces(queue, updateRNG);
  }
  return queue;
}

function addPieces(queue, updateRNG = true) {
  const { arr: shuffledTypes, nextRNG } = shuffle(
    ['o', 'i', 'l', 'j', 's', 't', 'z'],
    queue.rng
  );

  // Only add up to limit provided
  let numToAdd = shuffledTypes.length;
  if (
    queue.limitSize > 0 &&
    queue.numPieces + shuffledTypes.length > queue.limitSize
  ) {
    numToAdd = queue.limitSize - queue.numPieces;
    shuffledTypes.splice(numToAdd);
  }

  const nextPieces = queue.pieces.slice();
  shuffledTypes.forEach((type) => nextPieces.push(newPiece(type)));

  if (updateRNG) {
    return {
      ...queue,
      rng: nextRNG,
      numPieces: queue.numPieces + numToAdd,
      pieces: nextPieces,
    };
  }

  return {
    ...queue,
    numPieces: queue.numPieces + numToAdd,
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

  // If no pieces left add hold piece to queue
  if (nextPieces.length === 0 && queue.hold) {
    return {
      ...queue,
      held: false,
      hold: null,
      pieces: [pieceLib.stamp(queue.hold, currentTime)],
    };
  } else if (nextPieces.length > 0) {
    nextPieces[0] = pieceLib.stamp(nextPieces[0], currentTime);
  }

  return addPiecesIfNeeded({
    ...queue,
    held: false,
    pieces: nextPieces,
  });
}

/**
 * Performs the hold operation on the queue. If no piece is currently held,
 * the next piece is moved to the hold queue and the queue state is updated.
 * If a piece is already held, it swaps the held piece with the next piece.
 *
 * @param {Object} queue - The queue object.
 * @param {boolean} queue.held - Indicates if a piece is currently held.
 * @param {string} queue.hold - The currently held piece.
 * @param {Array.<Object>} queue.pieces - The upcoming pieces for the game.
 * @param {number} currentTime - The current time to stamp the piece with.
 *
 * @returns {Object} - The updated queue object after the hold operation.
 */
function hold(queue, currentTime) {
  // No change if already held piece, hold disabled, or only piece with no hold
  if (
    queue.held ||
    !queue.holdEnabled ||
    (queue.pieces.length === 1 && !queue.hold)
  ) {
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

/**
 * Restamps the next piece in the queue with the given current time.
 * Also reset landing time.
 *
 * @function restampNextPiece
 * @param {Object} queue - The queue object.
 * @param {number} currentTime - The current time to stamp the next piece with.
 * @param {boolean} respawn - If true, the next piece will be a respawned.
 * @returns {Object} The updated game queue object with the next piece restamped.
 */
function restampNextPiece(queue, currentTime, respawn = false) {
  const nextPieces = queue.pieces.slice(0);
  if (respawn) {
    nextPieces[0] = pieceLib.stamp(newPiece(nextPieces[0].type), currentTime);
  } else {
    nextPieces[0] = pieceLib.stampLand(
      pieceLib.stamp(nextPieces[0], currentTime),
      0
    );
  }
  return {
    ...queue,
    pieces: nextPieces,
  };
}

/**
 * Sets the hold enabled status of the queue.
 *
 * @param {Object} queue - The queue object.
 * @param {boolean} enabled - The status to set for holdEnabled.
 * @returns {Object} The updated queue object with holdEnabled set to the specified status.
 */
function setHoldEnabled(queue, enabled) {
  return {
    ...queue,
    held: false,
    holdEnabled: enabled,
  };
}

/**
 * Sets the hold piece in the queue to the given type.
 * If none provided, the hold is cleared.
 *
 * @function setHold
 * @param {Object} queue - The queue object.
 * @param {string} holdType - The type of the hold piece to set.
 * @returns {Object} The updated game queue object with the hold piece set.
 */
function setHold(queue, holdType) {
  // No change if adding same hold piece
  if (queue.hold && holdType === queue.hold.type) {
    return queue;
  }

  // No change if removing hold and no hold piece
  if (!queue.hold && holdType === '') {
    return queue;
  }

  // Enforce limit if enabled
  // Reached limit and no hold (don't add a hold)
  if (
    queue.limitSize > 0 &&
    queue.numPieces >= queue.limitSize &&
    !queue.hold
  ) {
    return queue;
  }

  // Removing hold
  if (holdType === '') {
    const newNumPieces = queue.hold ? queue.numPieces - 1 : queue.numPieces;
    return {
      ...queue,
      numPieces: newNumPieces,
      held: false,
      hold: null,
    };
  }

  return {
    ...queue,
    numPieces: queue.hold ? queue.numPieces : queue.numPieces + 1,
    held: false,
    hold: newPiece(holdType),
  };
}

/**
 * Sets the next pieces in the queue to the given types.
 *
 * @param {Object} queue - The queue object.
 * @param {string} nextTypes - The types of the next pieces to set.
 * @param {number} currentTime - The current time to stamp the first next piece with.
 * @returns {Object} The updated game queue object with the next pieces set.
 */
function setNext(queue, nextTypes, currentTime) {
  if (nextTypes.length === 0) {
    return queue;
  }

  // Create new pieces
  const nextTypeArr = nextTypes.split('');
  let nextPieces = nextTypeArr.map((type) => newPiece(type));
  nextPieces[0] = pieceLib.stamp(nextPieces[0], currentTime);

  // Enforce limit if enabled
  const size = queue.numPieces + nextPieces.length - queue.pieces.length;
  if (queue.limitSize > 0 && size > queue.limitSize) {
    const numToRemove = size - queue.limitSize;
    nextPieces = nextPieces.slice(0, nextPieces.length - numToRemove);
  }

  // Update generated number of pieces (note numPieces >= pieces.length)
  const newGenerated =
    queue.numPieces - queue.pieces.length + nextPieces.length;

  // When adding new pieces don't update RNG
  // So that when user changes next pieces,
  // next bag added (if needed) is consistent
  return addPiecesIfNeeded(
    {
      ...queue,
      numPieces: newGenerated,
      pieces: nextPieces,
    },
    false
  );
}

/**
 * Sets the seed for the random number generator.
 *
 * @param {Object} queue - The queue object.
 * @param {number} seed - The seed for the random number generator.
 * @returns {Object} The updated queue with the new seed.
 */
function setSeed(queue, seed) {
  return {
    ...queue,
    rng: newRNG(seed),
  };
}

const queueLib = {
  nextPiece,
  hold,
  place,
  updateNextPiece,
  restampNextPiece,
  setHoldEnabled,
  setHold,
  setNext,
  setSeed,
};

export { newQueue as default, queueLib };
