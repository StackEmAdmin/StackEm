import newBoard, { boardLib } from './features/board/board';
import newQueue, { queueLib } from './features/queue/queue';
import newGarbage, { garbageLib } from './features/garbage/garbage';
import newGravity, { gravityLib } from './features/gravity/gravity';
import { pieceLib } from './features/piece/piece';
import newUR, { URLib } from './features/undoredo/undoredo';
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
 * @param {string} [options.garbageSpawn='drop'] - The garbage spawn system to be used.
 * @param {boolean} [options.garbageComboBlock=true] - Whether combos delay garbage spawn.
 * @param {number} [options.garbageChargeDelay=500] - The delay in ms before garbage is ready to spawn.
 * @param {number} [options.garbageCap=8] - The maximum number of garbage lines to spawn at a time.
 * @param {number} [options.garbageCheesiness=1] - The probability of garbage spawning in a different column.
 * @param {boolean} [options.garbageModeAPS=false] - Whether Attack Per Second (APS) mode is enabled.
 * @param {number} [options.garbageModeAPSAttack=0] - The number of garbage lines to receive.
 * @param {number} [options.garbageModeAPSSecond=0] - The interval in seconds between APS garbage line additions.
 * @param {number} [options.garbageSeed=undefined] - The RNG seed for the garbage spawn system.
 * @param {boolean} [options.garbageNewSeedOnReset=true] - Whether to generate a new seed for the garbage spawn system when the game is reset.
 * @param {boolean} [options.highlight=false] - Whether to highlight clicked cells.
 * @param {boolean} [options.autoColor=true] - Whether to automatically color filled cells based on its shape.
 * @param {number} [options.queueSeed=undefined] - The seed for the queue. Default is undefined.
 * @param {boolean} [options.queueNewSeedOnReset=true] - Whether to generate a new seed for the queue when the game is reset.
 * @param {boolean} [options.enableUndo=false] - Whether to enable undo and redo.
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
  garbageSpawn = 'drop',
  garbageComboBlock = true,
  garbageChargeDelay = 500,
  garbageCap = 8,
  garbageCheesiness = 1,
  garbageModeAPS = false,
  garbageModeAPSAttack = 0,
  garbageModeAPSSecond = 0,
  highlight = false,
  autoColor = true,
  queueSeed = undefined,
  queueNewSeedOnReset = true,
  garbageSeed = undefined,
  garbageNewSeedOnReset = true,
  enableUndo = false,
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
    garbageSpawn,
    garbageComboBlock,
    garbageChargeDelay,
    garbageCap,
    garbageCheesiness,
    garbageModeAPS,
    garbageModeAPSAttack,
    garbageModeAPSSecond,
    highlight,
    autoColor,
    queueSeed,
    queueNewSeedOnReset,
    garbageSeed,
    garbageNewSeedOnReset,
    enableUndo,
  };

  // Populate rng seed in config
  const initialQueue = newQueue(queueSeed, startTime);
  config.queueSeed = initialQueue.rng.seed;

  const initialGarbage = newGarbage(
    garbageSeed,
    cols,
    garbageSpawn,
    garbageComboBlock,
    garbageCap,
    garbageCheesiness,
    garbageChargeDelay,
    garbageModeAPS,
    garbageModeAPSAttack,
    garbageModeAPSSecond
  );
  config.garbageSeed = initialGarbage.rng.seed;

  return {
    config,
    highlight,
    fillType: 'g',
    autoColor,
    autoColorCells: [],
    UR: newUR(enableUndo),
    startTime,
    end: null,
    over: false,
    combo: -1,
    b2b: -1,
    twist: '',
    numPieces: 0,
    numAttack: 0,
    board: newBoard(rows, cols),
    queue: initialQueue,
    rules: newRules(kick, attack, spins),
    gravity: newGravity(
      gravity,
      gravityLock,
      gravityLockCap,
      gravityLockPenalty,
      gravityAcc,
      gravityAccDelay
    ),
    garbage: initialGarbage,
  };
}

function update(game, currentTime) {
  let nextGame = updateGravity(game, currentTime);
  nextGame = updateGarbage(nextGame, currentTime);

  return nextGame;
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

function updateGarbage(game, currentTime) {
  const updatedGarbage = garbageLib.update(
    game.garbage,
    game.startTime,
    currentTime
  );

  if (game.garbage.spawn === 'instant') {
    return updateSpawnGarbage(game, updatedGarbage, currentTime);
  }

  return updatedGarbage === game.garbage
    ? game
    : { ...game, garbage: updatedGarbage };
}

function updateSpawnGarbage(game, garbage, currentTime) {
  const { nextGarbage, chargedGarbage } = garbageLib.receive(
    garbage,
    false,
    false
  );

  // No change in garbage (thus no garbage to spawn)
  if (nextGarbage === game.garbage) {
    return game;
  }

  // No garbage to spawn
  if (!chargedGarbage) {
    return { ...game, garbage: nextGarbage };
  }

  let { nextBoard, nextPiece } = boardLib.receiveGarbage(
    game.board,
    chargedGarbage,
    game.queue.pieces[0],
    currentTime
  );

  const nextGame = {
    ...game,
    board: nextBoard,
    garbage: nextGarbage,
  };

  // Spawned garbage (and no change in nextPiece)
  if (game.queue.pieces[0] === nextPiece) {
    return nextGame;
  }

  nextPiece = gravityStamper(nextGame, nextPiece, currentTime);

  // Spawned garbage and shifted nextPiece up
  const nextQueue = queueLib.updateNextPiece(nextGame.queue, nextPiece);
  return {
    ...nextGame,
    queue: nextQueue,
    board: nextBoard,
    garbage: nextGarbage,
  };
}

function reset(game, currentTime) {
  // New rng seed on reset if enabled
  let nextConfig = { ...game.config };
  if (nextConfig.queueNewSeedOnReset) {
    nextConfig.queueSeed = undefined;
  }
  if (nextConfig.garbageNewSeedOnReset) {
    nextConfig.garbageSeed = undefined;
  }

  const nextGame = newGame(nextConfig);

  // Save game in undo/redo (UR) stack
  const nextUR = URLib.save(game.UR, game);
  nextGame.UR = nextUR;
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
    UR: URLib.save(game.UR, game),
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
    UR: URLib.save(game.UR, game),
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
    UR: URLib.save(game.UR, game),
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
 * Calls the dropHelper function which drops piece, clears lines, calculates attacks, and receives garbage.
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
  // 4. Receive garbage

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

  // 4 Receive Garbage
  let { nextGarbage, nextAttacks } = garbageLib.cancel(
    game.garbage,
    totalAttack,
    attacks
  );

  const { nextGarbage: updatedGarbage, chargedGarbage } = garbageLib.receive(
    nextGarbage,
    nextCombo >= 0,
    true
  );
  nextGarbage = updatedGarbage;

  sendAttack(nextAttacks, currentTime);

  // No change in garbage
  if (nextGarbage === game.garbage) {
    return {
      ...game,
      numPieces: game.numPieces + 1,
      numAttack: nextNumAttack,
      twist: '',
      combo: nextCombo,
      b2b: nextB2B,
      board: nextBoard,
      queue: nextQueue,
      UR: URLib.save(game.UR, game),
    };
  }

  // No garbage to spawn
  if (!chargedGarbage) {
    return {
      ...game,
      numPieces: game.numPieces + 1,
      numAttack: nextNumAttack,
      twist: '',
      combo: nextCombo,
      b2b: nextB2B,
      board: nextBoard,
      queue: nextQueue,
      garbage: nextGarbage,
      UR: URLib.save(game.UR, game),
    };
  }

  ({ nextBoard } = boardLib.receiveGarbage(nextBoard, chargedGarbage));

  return {
    ...game,
    numPieces: game.numPieces + 1,
    numAttack: nextNumAttack,
    twist: '',
    combo: nextCombo,
    b2b: nextB2B,
    board: nextBoard,
    queue: nextQueue,
    garbage: nextGarbage,
    UR: URLib.save(game.UR, game),
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
        UR: URLib.save(game.UR, game),
        twist: '',
        queue: nextQueue,
      };
}

/**
 * Adds the given amount of garbage lines to the game garbage queue.
 *
 * @param {Object} game - The game state object.
 * @param {number} amount - The amount of garbage lines to add.
 * @param {number} time - The current game time.
 *
 * @returns {Object} - The updated game state object with the updated garbage queue.
 */
function receiveGarbage(game, amount, time) {
  return {
    ...game,
    UR: URLib.save(game.UR, game),
    garbage: garbageLib.queue(game.garbage, amount, time),
  };
}

/**
 * Toggles the highlight mode of the game.
 *
 * @param {Object} game - The game state object.
 *
 * @returns {Object} - The updated game state object with the updated highlight mode.
 */
function toggleHighlight(game, currentTime) {
  return {
    ...game,
    UR: URLib.save(game.UR, game),
    highlight: !game.highlight,
  };
}

/**
 * Sets the fill type of the game to the given type.
 *
 * @param {Object} game - The game state object.
 * @param {string} nextFillType - The type to set the fill type to.
 *
 * @returns {Object} - The updated game state object with the updated fill type.
 */
function setFillType(game, nextFillType, currentTime) {
  return {
    ...game,
    UR: URLib.save(game.UR, game),
    fillType: nextFillType,
  };
}

/**
 * Fills a cell on the game board with a given type.
 *
 * @param {Object} game - The game state object.
 * @param {number} row - The row of the cell to fill.
 * @param {number} col - The column of the cell to fill.
 * @param {string} type - The type of piece to fill the cell with.
 * @param {boolean} [fillOnlyEmpty=true] - If true, only fills the cell if it is empty.
 *
 * @returns {Object} - The updated game state object.
 * - If the cell is not filled (no change in `boardLib.fillCell`),
 *   the function returns the original game state.
 * - If the cell is filled (a new board returned from `boardLib.fillCell`),
 *   the function returns a new game state with the updated board.
 */
function fillCell(game, row, col, currentTime, fillOnlyEmpty = true) {
  const nextBoard = boardLib.fillCell(
    game.board,
    row,
    col,
    game.fillType,
    game.highlight,
    queueLib.nextPiece(game.queue),
    fillOnlyEmpty
  );

  if (nextBoard === game.board) {
    return game;
  }

  if (game.autoColor && game.fillType === 'g') {
    return autoColor(game, nextBoard, { row, col, type: game.fillType });
  }

  return {
    ...game,
    UR: URLib.save(game.UR, game),
    board: nextBoard,
  };
}

/**
 * Clears a cell on the game board.
 *
 * @param {Object} game - The game state object.
 * @param {number} row - The row of the cell to clear.
 * @param {number} col - The column of the cell to clear.
 *
 * @returns {Object} - The updated game state object.
 * - If the cell is not cleared the function returns the original game state.
 * - If the cell is cleared the function returns a new game state with the updated board.
 *   If `autoColor` is true, the `autoColorCells` are reset to an empty array.
 */
function clearCell(game, row, col, currentTime) {
  const nextBoard = boardLib.clearCell(game.board, row, col, game.highlight);

  if (nextBoard === game.board) {
    return game;
  }

  if (game.autoColor && game.autoColorCells.length > 0) {
    // Reset autoColorCells
    return {
      ...game,
      UR: URLib.save(game.UR, game),
      board: nextBoard,
      autoColorCells: [],
    };
  }

  return {
    ...game,
    UR: URLib.save(game.UR, game),
    board: nextBoard,
  };
}

function autoColor(game, updatedBoard, cell) {
  // A piece is made of 4 cells. don't autocolor when > 4
  // Note the hard-coded value 3
  //   - A cell is added to autoColorCells making length 4
  if (game.autoColorCells.length > 3) {
    return { ...game, UR: URLib.save(game.UR, game), board: updatedBoard };
  }

  const nextAutoColorCells = game.autoColorCells.slice();
  nextAutoColorCells.push(cell);

  // Not enough cells to identify a piece
  if (nextAutoColorCells.length < 4) {
    return {
      ...game,
      UR: URLib.save(game.UR, game),
      board: updatedBoard,
      autoColorCells: nextAutoColorCells,
    };
  }

  const { success, type } = pieceLib.calculateTypeFromCells(nextAutoColorCells);

  if (!success) {
    return {
      ...game,
      UR: URLib.save(game.UR, game),
      board: updatedBoard,
      autoColorCells: nextAutoColorCells,
    };
  }

  const nextBoard = boardLib.fillCells(
    updatedBoard,
    nextAutoColorCells,
    type,
    game.highlight
  );

  return {
    ...game,
    UR: URLib.save(game.UR, game),
    board: nextBoard,
    autoColorCells: [],
  };
}

/**
 * Resets the autoColorCells array if it is not empty.
 * @param {Object} game - The game state object.
 * @returns {Object} - The updated game state object if autoColorCells is not empty, otherwise the original game state.
 */
function resetFillCell(game, currentTime) {
  return game.autoColorCells.length === 0
    ? game
    : { ...game, autoColorCells: [] };
}

/**
 * Fills a row on the game board with a given type.
 * If autoColor is enabled and there are cells in autoColorCells, clears autoColorCells.
 * @param {Object} game - The game state object.
 * @param {number} row - The row index of the cell to fill.
 * @param {number} col - The column index of the cell to fill.
 * @param {string} type - The type of piece to fill the row with.
 * @returns {Object} - The updated game state object.
 */
function fillRow(game, row, col, currentTime) {
  const nextBoard = boardLib.fillRow(
    game.board,
    row,
    col,
    game.fillType,
    queueLib.nextPiece(game.queue)
  );

  if (nextBoard === game.board) {
    return game;
  }

  if (game.autoColor && game.autoColorCells.length > 0) {
    return {
      ...game,
      UR: URLib.save(game.UR, game),
      board: nextBoard,
      autoColorCells: [],
    };
  }

  return {
    ...game,
    UR: URLib.save(game.UR, game),
    board: nextBoard,
  };
}

/**
 * Clears a row on the game board.
 * @param {Object} game - The game state object.
 * @param {number} row - The row index of the row to clear.
 * @returns {Object} - The updated game state object.
 */
function clearRow(game, row, col, currentTime) {
  const nextBoard = boardLib.clearRow(game.board, row);

  if (nextBoard === game.board) {
    return game;
  }

  if (game.autoColor && game.autoColorCells.length > 0) {
    return {
      ...game,
      UR: URLib.save(game.UR, game),
      board: nextBoard,
      autoColorCells: [],
    };
  }

  return {
    ...game,
    UR: URLib.save(game.UR, game),
    board: nextBoard,
  };
}

function undo(game, currentTime) {
  const { state: nextGame, UR: nextUR } = URLib.undo(game.UR, game);

  if (!nextGame || nextGame === game) {
    return game;
  }

  const nextQueue = queueLib.restampNextPiece(nextGame.queue, currentTime);

  return {
    ...nextGame,
    queue: nextQueue,
    UR: nextUR,
  };
}

function redo(game, currentTime) {
  const { state: nextGame, UR: nextUR } = URLib.redo(game.UR, game);

  if (!nextGame || nextGame === game) {
    return game;
  }

  const nextQueue = queueLib.restampNextPiece(nextGame.queue, currentTime);

  return {
    ...nextGame,
    queue: nextQueue,
    UR: nextUR,
  };
}

function undoReset(game, currentTime) {
  // Assumes game.numPieces = 0 and player placed >1 piece after reset
  // could be improved by not relying on assumptions but practical... (Why would you reset if you didn't place anything, mess up already?)

  // Try resetting
  const resetState = undo(game, currentTime);
  if (resetState.numPieces === 0) {
    return game;
  }

  // If player placed > 0 pieces after reset, might as well respawn piece
  if (resetState.numPieces > 0) {
    return undoToPieceRespawn(resetState, currentTime);
  }

  return resetState;
}

function undoPieceZeroRespawn(game, currentTime) {
  // Undo until before we hit a reset point (or run out of moves)
  const { state: nextGame, UR: nextUR } = URLib.undoUntil(
    game.UR,
    game,
    (gameToCheck) => gameToCheck.numPieces !== 0,
    true
  );

  if (nextGame === game) {
    return game;
  }

  // Ran out of moves
  if (!nextGame) {
    const nextQueue = queueLib.restampNextPiece(game.queue, currentTime, true);
    return {
      ...game,
      queue: nextQueue,
      UR: nextUR,
    };
  }

  // Hit a reset point respawn and restamp (gravity reference) piece

  const nextQueue = queueLib.restampNextPiece(
    nextGame.queue,
    currentTime,
    true
  );

  return {
    ...nextGame,
    queue: nextQueue,
    UR: nextUR,
  };
}

function undoUntilZeroPieces(game) {
  // Undo until player has 0 pieces
  const { state: nextGame, UR: nextUR } = URLib.undoUntil(
    game.UR,
    game,
    (gameToCheck) => gameToCheck.numPieces === 0
  );

  if (!nextGame || nextGame === game) {
    return game;
  }

  return {
    ...nextGame,
    UR: nextUR,
  };
}

function undoToPieceRespawn(game, currentTime, undoDrop = false) {
  // Assumption:
  //   game.numPieces >= 2 (undoOnDrop true)
  //   game.numPieces >= 1 (undoOnDrop false)

  const piecesToCheck = game.numPieces - 1 - (undoDrop ? 1 : 0);
  const drop = (gameToCheck) => gameToCheck.numPieces === piecesToCheck;

  // Undo until a piece is dropped, and retrieve the state before the condition is met
  const { state: nextGame, UR: nextUR } = URLib.undoUntil(
    game.UR,
    game,
    drop,
    true
  );

  if (!nextGame || nextGame === game) {
    return game;
  }

  const nextQueue = queueLib.restampNextPiece(
    nextGame.queue,
    currentTime,
    true
  );

  return {
    ...nextGame,
    queue: nextQueue,
    UR: nextUR,
  };
}

/**
 * Undo a piece drop until piece's respawn point.
 * Also undoes effect on gravity by restamping piece.
 *
 * @param {Object} game - The game state object.
 * @returns {Object} - The updated game state object.
 */
function undoOnDrop(game, currentTime) {
  // FIXME: Edge case: undo on reset on 0 pieces doesn't work.
  //   state 1: new game
  //   state 2: move piece (don't drop)
  //   state 3: reset, provides a new game (separate from state 1)
  //   state 4: undo. Goes to state 1 instead of state 3.

  if (game.numPieces === 0) {
    // If player reset game, undo that
    // If not, undo until piece respawns
    const resetState = undoReset(game, currentTime);
    return resetState !== game
      ? resetState
      : undoPieceZeroRespawn(game, currentTime);
  }

  if (game.numPieces === 1) {
    return undoPieceZeroRespawn(undoUntilZeroPieces(game), currentTime);
  }

  // Respawn piece
  return undoToPieceRespawn(game, currentTime, true);
}

/**
 * Redoes the game state until the number of pieces is one more than the current.
 * If the redo is a reset (i.e., the number of pieces is 0), redoes that instead.
 * @param {Object} game - The game state object.
 * @returns {Object} - The updated game state object.
 */
function redoOnDrop(game, currentTime) {
  // Check if redo is a reset
  //   Caused by player placed pieces, reset, undo to reset, then redoing reset
  //   Improve functionality by not making assumption on number of pieces
  if (game.numPieces > 0) {
    const resetState = redo(game);
    if (resetState.numPieces === 0) {
      return resetState;
    }
  }

  const drop = (gameToCheck) => gameToCheck.numPieces === game.numPieces + 1;
  const { state: nextGame, UR: nextUR } = URLib.redoUntil(game.UR, game, drop);

  if (!nextGame || nextGame === game) {
    return game;
  }

  const nextQueue = queueLib.restampNextPiece(nextGame.queue, currentTime);

  return {
    ...nextGame,
    queue: nextQueue,
    UR: nextUR,
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
  receiveGarbage,
  toggleHighlight,
  setFillType,
  fillCell,
  clearCell,
  resetFillCell,
  fillRow,
  clearRow,
  undo,
  redo,
  undoOnDrop,
  redoOnDrop,
};

export { newGame as default, controller };
