import newBoard, { boardLib } from './features/board/board';
import newQueue, { queueLib } from './features/queue/queue';
import newGravity, { gravityLib } from './features/gravity/gravity';
import { pieceLib } from './features/piece/piece';
import newRules, { rulesLib } from './features/rules/rules';

/**
 * Creates a new game state object.
 *
 * @param {Object} [options] - The options for creating a new game.
 * @param {number} [options.rows=26] - The number of rows in the game board. Default is 26.
 * @param {number} [options.cols=10] - The number of columns in the game board. Default is 10.
 * @param {string} [options.kick='srsPlus'] - The kick table to be used for rotation systems.
 * @param {string} [options.attack='tsOne'] - The attack table to be used for attacking mechanics.
 * @param {string} [options.spins='tSpin'] - The spin detection system to be used. Default is 'tSpin'.
 * @param {number} [options.gravity=0.016666666666666666] - The gravity system to be used. Default is 1/60.
 * @param {number} [options.gravityLock=500] - The time in milliseconds before a piece locks in place. Default is 500.
 * @param {number} [options.gravityLockCap=5000] - The maximum time in milliseconds before a piece locks in place. Default is 5000.
 * @param {number} [options.gravityLockPenalty=1000] - The penalty in milliseconds added to gravity lock time after a piece state goes from landed to unlanded. Default is 1000.
 * @param {number} [options.gravityAcc=0] - The acceleration in cells per frame per frame of gravity. Default is 0.
 * @param {number} [options.gravityAccDelay=0] - The delay in frames before gravity acceleration kicks in. Default is 0.
 * @param {number} [options.queueSeed=undefined] - The seed for the queue. Default is undefined.
 * @returns {Object} - The new game state object.
 */
function newGame({
  startTime = performance.now(),
  rows = 26,
  cols = 10,
  kick = 'srsPlus',
  attack = 'tsOne',
  spins = 'tSpin',
  gravity = 0.016666666666666666,
  gravityLock = 500,
  gravityLockCap = 5000,
  gravityLockPenalty = 1000,
  gravityAcc = 0,
  gravityAccDelay = 0,
  queueSeed = undefined,
} = {}) {
  const config = {
    rows,
    cols,
    kick,
    attack,
    spins,
    gravity,
    gravityLock,
    gravityLockCap,
    gravityLockPenalty,
    gravityAcc,
    gravityAccDelay,
    queueSeed,
  };

  return {
    config,
    startTime,
    end: null,
    over: false,
    combo: -1,
    b2b: -1,
    twist: '',
    numPieces: 0,
    numAttack: 0,
    board: newBoard(rows, cols),
    queue: newQueue(queueSeed, startTime),
    rules: newRules(kick, attack, spins),
    gravity: newGravity(
      gravity,
      gravityLock,
      gravityLockCap,
      gravityLockPenalty,
      gravityAcc,
      gravityAccDelay
    ),
  };
}

function update(game, currentTime) {
  // TODO: update garbage
  return updateGravity(game, currentTime);
}

function updateGravity(game, currentTime) {
  const hasLanded = (piece) => boardLib.hasLanded(game.board, piece);

  if (
    gravityLib.shouldLock(
      game.gravity,
      game.queue.pieces[0],
      hasLanded,
      currentTime
    )
  ) {
    return dropHelper(game, currentTime);
  }

  const updatedPiece = gravityLib.update(
    game.gravity,
    game.queue.pieces[0],
    hasLanded,
    game.startTime,
    currentTime
  );

  // No change (not affected by gravity)
  if (updatedPiece === game.queue.pieces[0]) {
    return game;
  }

  const nextQueue = queueLib.updateNextPiece(game.queue, updatedPiece);

  // If piece gets shifted by gravity, then twist type must be reset.
  return {
    ...game,
    queue: nextQueue,
    twist: '',
  };
}

function reset(game, currentTime) {
  const nextGame = newGame(game.config);
  return nextGame;
}

/**
 * Updates the gravity reference time for a piece.
 * Shifts kicked piece down if affected by gravity.
 * Returns a new piece object with the gravity reference time updated.
 *
 * @function gravityStamper
 * @param {Object} game - The game state object.
 * @param {Object} updatedPiece - The piece object.
 * @param {number} currentTime - The current time.
 * @param {boolean} kicked - Indicates if the piece was kicked.
 * @returns {Object} A new piece object with the gravity reference time updated.
 */
function gravityStamper(game, updatedPiece, currentTime, kicked = false) {
  let nextPiece = updatedPiece;
  const hasLanded = (piece) => boardLib.hasLanded(game.board, piece);
  const wasOnFloor = hasLanded(queueLib.nextPiece(game.queue));

  // Landed pieces affected by gravity 1g or greater when kicked.
  if (
    kicked &&
    wasOnFloor &&
    gravityLib.getGravity(game.gravity, game.startTime, currentTime) >= 1 &&
    !hasLanded(nextPiece)
  ) {
    nextPiece = pieceLib.down(nextPiece);
  }

  const currentlyOnFloor = hasLanded(nextPiece);

  if (currentlyOnFloor || (wasOnFloor && !currentlyOnFloor)) {
    nextPiece = pieceLib.stamp(nextPiece, currentTime);
  }

  if (wasOnFloor && currentlyOnFloor) {
    const newStampLand =
      nextPiece.gravityTimeLandRef +
      (currentTime - updatedPiece.gravityTimeRef);
    nextPiece = pieceLib.stampLand(nextPiece, newStampLand);
  } else if (wasOnFloor && !currentlyOnFloor) {
    const newStampLand =
      nextPiece.gravityTimeLandRef +
      game.gravity.lockPenalty +
      (currentTime - updatedPiece.gravityTimeRef);
    nextPiece = pieceLib.stampLand(nextPiece, newStampLand);
  }

  return nextPiece;
}

function shiftIfLegal(game, action, currentTime, stampPiece = false) {
  let shiftedPiece = action(queueLib.nextPiece(game.queue));
  // Illegal move, no change
  if (!boardLib.isLegal(game.board, shiftedPiece)) {
    return game;
  }

  // Update gravity reference
  shiftedPiece = gravityStamper(game, shiftedPiece, currentTime);
  // Check 20g gravity
  shiftedPiece = gravityLib.twentyG(
    game.gravity,
    shiftedPiece,
    (piece) => boardLib.hasLanded(game.board, piece),
    game.startTime,
    currentTime
  );
  if (stampPiece) {
    shiftedPiece = pieceLib.stamp(shiftedPiece, currentTime);
  }

  const nextQueue = queueLib.updateNextPiece(game.queue, shiftedPiece);

  return {
    ...game,
    twist: '',
    queue: nextQueue,
  };
}

/**
 * Moves the current piece in the game one column to the left.
 *
 * @param {Object} game - The game state object.
 *
 * @returns {Object} - The updated game state object. If the move is legal, the queue is updated with the shifted piece.
 * If the move is not legal, the game state remains unchanged.
 */
function left(game, currentTime) {
  return shiftIfLegal(game, pieceLib.left, currentTime);
}

/**
 * Moves the current piece in the game one column to the right.
 *
 * @param {Object} game - The game state object.
 *
 * @returns {Object} - The updated game state object. If the move is legal, the queue is updated with the shifted piece.
 * If the move is not legal, the game state remains unchanged.
 */
function right(game, currentTime) {
  return shiftIfLegal(game, pieceLib.right, currentTime);
}

/**
 * Moves the current piece in the game one row down.
 *
 * @param {Object} game - The game state object.
 *
 * @returns {Object} - The updated game state object. If the move is legal, the queue is updated with the shifted piece.
 * If the move is not legal, the game state remains unchanged.
 */
function softDrop(game, currentTime) {
  return shiftIfLegal(game, pieceLib.down, currentTime, true);
}

/**
 * Performs an infinite soft drop operation on the current piece in the game.
 * The infinite soft drop operation continuously moves the current piece downwards until it hits something.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object.
 * - If the piece is moved due to the infinite soft drop operation,
 *   the queue is updated with the new piece position.
 * - If the piece cannot be moved further without being illegal,
 *   the game state remains unchanged.
 */
function infSoftDrop(game, currentTime) {
  // DAS down lol
  return DAS(game, pieceLib.down, false, currentTime);
}

/**
 * Calculates kick information for a rotated piece based on the given kick offset and kick number.
 *
 * @param {Object} gameBoard - The game board object.
 * @param {Object} rotatedPiece - The rotated piece object.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {string} kickTableName - The name of the kick table.
 * @param {Array} kickTable - An array where every element is an array of (x, y) offsets.
 * @param {Array} kickOffset - The kick offset to be applied to the rotated piece.
 * @param {number} kickNum - The kick number.
 *
 * @returns {Object} - An object containing kick information:
 * - legal: A boolean indicating whether the kicked piece is legal on the game board.
 * - kickedPiece: The kicked piece object if the kick is legal.
 * - isSpin: A boolean indicating whether the kicked piece results in a spin maneuver.
 * - spinType: The type of spin maneuver.
 */
function getKickInfo(
  gameBoard,
  rotatedPiece,
  prevRotation,
  kickTableName,
  kickTable,
  kickNum,
  rulesSpins
) {
  const kickOffset = kickTable[kickNum];
  const kickedPiece = pieceLib.kick(rotatedPiece, kickOffset[0], kickOffset[1]);

  if (!boardLib.isLegal(gameBoard, kickedPiece)) {
    return { legal: false };
  }

  const twistType = rulesSpins(
    gameBoard,
    kickedPiece,
    prevRotation,
    kickTableName,
    kickNum
  );

  return { legal: true, kickedPiece, twistType };
}

function calculateFirstLegalKick(
  gameBoard,
  rotatedPiece,
  prevRotation,
  kickTableName,
  kickTable,
  rulesSpins
) {
  let kickNum = 0;
  while (kickNum < kickTable.length) {
    const { legal, kickedPiece, twistType } = getKickInfo(
      gameBoard,
      rotatedPiece,
      prevRotation,
      kickTableName,
      kickTable,
      kickNum,
      rulesSpins
    );

    if (!legal) {
      kickNum++;
      continue;
    }

    return { legal, kickedPiece, twistType };
  }

  return { legal: false };
}

/**
 * Performs a rotation and kick operation on the current piece in the game.
 *
 * @param {Object} game - The game state object.
 * @param {Function} action - The function to update the piece's position (like rotateCW).
 *
 * @returns {Object} - The updated game state object.
 * - If no rotation or kick operation, the function returns the original game state.
 * - If rotation or kick operation,
 *   the function returns a new game state with the updated queue and the current spin type.
 *
 * @remarks
 * - Kick 0 is usually [0, 0] in most rotation systems
 */
function rotateAndKick(game, action, currentTime) {
  const rotatedPiece = action(queueLib.nextPiece(game.queue));
  const prevRotation = queueLib.nextPiece(game.queue).rot;
  const kickTable =
    game.rules.kick[rotatedPiece.type][prevRotation][rotatedPiece.rot];

  const rulesSpins = (...args) => rulesLib.getSpinInfo(game.rules, ...args);
  let { legal, kickedPiece, twistType } = calculateFirstLegalKick(
    game.board,
    rotatedPiece,
    prevRotation,
    game.rules.kick.name,
    kickTable,
    rulesSpins
  );

  // No legal kick means no change in game state.
  if (!legal) {
    return game;
  }

  kickedPiece = gravityStamper(game, kickedPiece, currentTime, true);
  const nextQueue = queueLib.updateNextPiece(game.queue, kickedPiece);

  // Captures both a spin maneuver (t spin, mini or other)
  // OR a no spin maneuver (spinType === "")
  return {
    ...game,
    queue: nextQueue,
    twist: twistType,
  };
}

/**
 * Performs a clockwise rotation with kick operation on the current piece in the game.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 * @param {Object} updatedGame.rules - The rules object defining the game's mechanics.
 *
 * @returns {Object} - The updated game state object.
 * - If no rotation or kick operation, the function returns the original game state.
 * - If rotation or kick operation,
 *   the function returns a new game state with the updated queue and the current spin type.
 */
function rotateCW(game, currentTime) {
  return rotateAndKick(game, pieceLib.rotateCW, currentTime);
}

/**
 * Performs a counter-clockwise rotation with kick operation on the current piece in the game.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 * @param {Object} updatedGame.rules - The rules object defining the game's mechanics.
 *
 * @returns {Object} - The updated game state object.
 * - If no rotation or kick operation, the function returns the original game state.
 * - If rotation or kick operation,
 *   the function returns a new game state with the updated queue and the current spin type.
 */
function rotateCCW(game, currentTime) {
  return rotateAndKick(game, pieceLib.rotateCCW, currentTime);
}

/**
 * Performs a 180-degree rotation with kick operation on the current piece in the game.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 * @param {Object} updatedGame.rules - The rules object defining the game's mechanics.
 *
 * @returns {Object} - The updated game state object.
 * - If no rotation or kick operation, the function returns the original game state.
 * - If rotation or kick operation,
 *   the function returns a new game state with the updated queue and the current spin type.
 */
function rotate180(game, currentTime) {
  return rotateAndKick(game, pieceLib.rotate180, currentTime);
}

/**
 * Calculates the next legal position for a piece by repeatedly applying an action function until an illegal move is encountered.
 *
 * @param {Object} gameBoard - The game board object.
 * @param {Object} currentPiece - The current piece object.
 * @param {Function} action - The function to update the piece's position.
 *
 * @returns {Object} - The next legal position for the piece. If the piece cannot be moved further without being illegal,
 * the function returns the original piece position.
 */
function calculateWhileLegal(gameBoard, currentPiece, action) {
  let nextPiece = currentPiece;
  let pieceToCheck = action(currentPiece);

  // Update piece (like a shift left)
  // Then return last legal move (before it became an illegal move)
  while (boardLib.isLegal(gameBoard, pieceToCheck)) {
    nextPiece = pieceToCheck;
    pieceToCheck = action(pieceToCheck);
  }

  return nextPiece;
}

/**
 * Calculates the next legal position for a piece by performing an infinite soft drop operation on the current piece followed by an action function until an illegal move is encountered.
 *
 * @param {Object} gameBoard - The game board object.
 * @param {Object} currentPiece - The current piece object.
 * @param {Function} action - The function to update the piece's position (like shift left or right).
 *
 * @returns {Object} - The next legal position for the piece. If the piece cannot be moved further without being illegal,
 * the function returns the original piece position.
 */
function calculateWhileLegalInfSoftDrop(gameBoard, currentPiece, action) {
  // This function is used when player is DASing left or right and is is infinite soft dropping
  // Perform infinite soft drop first then perform action (left or right)
  const infSoftDropAction = (piece) =>
    calculateWhileLegal(gameBoard, piece, pieceLib.down);

  let nextPiece = infSoftDropAction(currentPiece);
  let pieceToCheck = action(nextPiece);

  while (boardLib.isLegal(gameBoard, pieceToCheck)) {
    nextPiece = infSoftDropAction(pieceToCheck);
    pieceToCheck = action(nextPiece);
  }

  return nextPiece;
}

/**
 * Use when Auto Repeat Rate (ARR) is 0, or when Soft Drop is Infinity.
 * Performs a Delayed Auto Shift (DAS) operation on the current piece in the game.
 * The DAS operation repeatedly applies an action function (shift) until an illegal move is encountered.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 * @param {Function} action - The function to update the piece's position (like shift left or right).
 * @param {boolean} infSoftDrop - A flag indicating whether the player is DASing left or right and is is infinite soft dropping.
 * @param {number} currentTime - The current time in ms.
 *
 * @returns {Object} - The updated game state object. If the piece is moved due to the DAS operation,
 * the queue is updated with the new piece position. If the piece cannot be moved further without being illegal,
 * the game state remains unchanged.
 */
function DAS(game, action, infSoftDrop, currentTime) {
  if (gravityLib.getGravity(game.gravity, game.startTime, currentTime) >= 20) {
    infSoftDrop = true;
  }

  const originalPiece = queueLib.nextPiece(game.queue);
  let updatedPiece = infSoftDrop
    ? calculateWhileLegalInfSoftDrop(game.board, originalPiece, action)
    : calculateWhileLegal(game.board, originalPiece, action);

  // No change on piece
  if (updatedPiece === originalPiece) {
    return game;
  }

  // Gravity reference, update when landing or unlanding
  updatedPiece = gravityStamper(game, updatedPiece, currentTime);
  const nextQueue = queueLib.updateNextPiece(game.queue, updatedPiece);

  return {
    ...game,
    twist: '',
    queue: nextQueue,
  };
}

/**
 * Performs a Delayed Auto Shift (DAS) operation to the left on the current piece in the game.
 * The DAS operation repeatedly applies the shift left operation until an illegal move is encountered.
 * Use this function when ARR = 0.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object. If the piece is moved due to the DAS operation,
 * the queue is updated with the new piece position. If the piece cannot be moved further without being illegal,
 * the game state remains unchanged.
 */
function DASLeft(game, currentTime) {
  // Just fyi, DASLeft or DASRight in this context, when ARR=0, means move piece instantly to the left or right, respectively.

  // IMO, the official term should be ARRLeft (or ARRRight) since repeat rate is the one causing the piece to move to the wall
  //   - When your repeat rate is >0, ARR will 'quickly' shift your piece to the wall
  //       Let go too early? you still DAS'd Left but didn't let ARR complete its job. and, uh, GL on your md.
  //   - When your repeat rate is 0, ARR causes an instant shift to the wall (because repeat action every 0s...)
  // Alas, DASLeft or DASRight, slip of the tongue.
  // Accidental theft is still wrong.
  return DAS(game, pieceLib.left, false, currentTime);
}

/**
 * Performs a Delayed Auto Shift (DAS) operation to the right on the current piece in the game.
 * The DAS operation repeatedly applies the shift right operation until an illegal move is encountered.
 * Use this function when ARR = 0.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object. If the piece is moved due to the DAS operation,
 * the queue is updated with the new piece position. If the piece cannot be moved further without being illegal,
 * the game state remains unchanged.
 */
function DASRight(game, currentTime) {
  return DAS(game, pieceLib.right, false, currentTime);
}

/**
 * Performs a Delayed Auto Shift (DAS) operation to the right on the current piece in the game,
 * along with an infinite soft drop operation.
 * The DAS operation repeatedly applies the shift right operation until an illegal move is encountered.
 * The infinite soft drop operation continuously moves the current piece downwards until it hits something.
 * Use this function when ARR = 0 and SRR = Infinity.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object. If the piece is moved due to the DAS operation and infinite soft drop operation,
 * the queue is updated with the new piece position. If the piece cannot be moved further without being illegal,
 * the game state remains unchanged.
 */
function DASRightInfSoftDrop(game, currentTime) {
  return DAS(game, pieceLib.right, true, currentTime);
}

/**
 * Performs a Delayed Auto Shift (DAS) operation to the left on the current piece in the game,
 * along with an infinite soft drop operation.
 * The DAS operation repeatedly applies the shift left operation until an illegal move is encountered.
 * The infinite soft drop operation continuously moves the current piece downwards until it hits something.
 * Use this function when ARR = 0 and SRR = Infinity.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object. If the piece is moved due to the DAS operation and infinite soft drop operation,
 * the queue is updated with the new piece position. If the piece cannot be moved further without being illegal,
 * the game state remains unchanged.
 */
function DASLeftInfSoftDrop(game, currentTime) {
  return DAS(game, pieceLib.left, true, currentTime);
}

/**
 * Performs the drop operation on the current piece in the game.
 * Calls the dropHelper function which drops piece, clears lines, and calculates attacks.
 *
 * @param {Object} game - The game state object.
 * @returns {Object} - The updated game state object.
 */
function drop(game, currentTime) {
  return dropHelper(game, currentTime);
}

/**
 * Performs the drop operation on the current piece in the game.
 * Moves the current piece downwards then places it on the board.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 * @param {number} currentTime - The current time.
 *
 * @returns {Object} - The updated game state object.
 *
 * @remarks
 * - The `nextPiece` (game.queue.pieces[0]) remains unchanged.
 *   - Case: Not moved (no change in `calculateWhileLegal` or `board.place`),
 *   - Case: Is moved (a new piece returned from `piece.down` in `calculateWhileLegal`),
 *     the `updatedPiece` is a new piece.
 */
function dropHelper(game, currentTime) {
  // 1. Drop Piece
  // 2. Clear lines
  // 3. Calculate attack (based on cleared lines)

  // 1 Drop Piece - Soft drop piece all the way down then place
  const droppedPiece = calculateWhileLegal(
    game.board,
    queueLib.nextPiece(game.queue),
    pieceLib.down
  );
  let nextQueue = queueLib.place(game.queue, currentTime);
  let nextBoard = boardLib.place(game.board, droppedPiece);

  // Check 20g gravity
  const twentyGPiece = gravityLib.twentyG(
    game.gravity,
    nextQueue.pieces[0],
    (piece) => boardLib.hasLanded(nextBoard, piece),
    game.startTime,
    currentTime
  );
  if (twentyGPiece !== nextQueue.pieces[0]) {
    nextQueue = queueLib.updateNextPiece(nextQueue, twentyGPiece);
  }

  // 2 Clear Lines
  const {
    lineClears,
    garbageLineClears,
    board: updatedBoard,
    allClear,
  } = boardLib.clearLines(nextBoard);
  nextBoard = updatedBoard;

  // 3 Calculate Attack
  const { nextCombo, nextB2B, attacks } = rulesLib.calculateAttacks(
    game.rules,
    {
      lineClears,
      garbageLineClears,
      combo: game.combo,
      b2b: game.b2b,
      spin: game.twist === 'spin',
      mini: game.twist === 'mini',
      allClear,
    }
  );

  const totalAttack = attacks.reduce((total, attack) => total + attack, 0);
  const nextNumAttack = game.numAttack + totalAttack;

  sendAttack(totalAttack, currentTime);

  return {
    ...game,
    numPieces: game.numPieces + 1,
    numAttack: nextNumAttack,
    twist: '',
    combo: nextCombo,
    b2b: nextB2B,
    board: nextBoard,
    queue: nextQueue,
  };
}

function sendAttack(attacks, currentTime) {
  return true;
}

/**
 * Performs the hold operation on the current piece in the game.
 * Moves the current piece to the hold queue and replaces it with the next piece from the queue.
 *
 * @param {Object} updatedGame - The game state object.
 * @param {Object} updatedGame.board - The game board object.
 * @param {Object} updatedGame.queue - The queue object containing the current piece and future pieces.
 *
 * @returns {Object} - The updated game state object.
 * - If the hold operation does not change the queue state (no piece is moved to the hold queue),
 *   the function returns the original game state.
 * - If the hold operation changes the queue state (a piece is moved to the hold queue),
 *   the function returns a new game state with the updated queue.
 */
function hold(game, currentTime) {
  let nextQueue = queueLib.hold(game.queue, currentTime);

  // Check 20g gravity
  const twentyGPiece = gravityLib.twentyG(
    game.gravity,
    nextQueue.pieces[0],
    (piece) => boardLib.hasLanded(game.board, piece),
    game.startTime,
    currentTime
  );
  if (twentyGPiece !== nextQueue.pieces[0]) {
    nextQueue = queueLib.updateNextPiece(nextQueue, twentyGPiece);
  }

  return nextQueue === game.queue
    ? game
    : {
        ...game,
        twist: '',
        queue: nextQueue,
      };
}

const controller = {
  update,
  reset,
  left,
  DASLeft,
  DASLeftInfSoftDrop,
  right,
  DASRight,
  DASRightInfSoftDrop,
  softDrop,
  infSoftDrop,
  drop,
  rotateCW,
  rotateCCW,
  rotate180,
  hold,
};

export { newGame as default, controller };
