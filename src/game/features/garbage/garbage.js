import newRNG, { rngLib } from '../random/rng';
const MAX_INSTANT_GARBAGE_CAP = 100;
const MAX_GARBAGE_QUEUE_LENGTH = 1000;

/**
 * Creates a new garbage object.
 *
 * @param {number} seed - The random number generator seed.
 * @param {number} cols - The number of columns in the board.
 * @param {string} spawn - The spawn mode. Either 'drop' or 'instant'.
 * @param {boolean} comboBlock - Whether combos prevent garbage spawn.
 * @param {number} cap - The maximum number of garbage lines to spawn at once.
 * @param {number} cheesiness - The probability of garbage spawning in a different column.
 * @param {number} chargeDelay - The delay in ms before garbage is ready to spawn.
 *
 * @returns {Object} A new garbage object.
 */
function newGarbage(
  seed,
  cols,
  spawn,
  comboBlock,
  cap,
  cheesiness,
  chargeDelay
) {
  return {
    cols,
    spawn,
    comboBlock,
    cap,
    cheesiness,
    prevHole: -1,
    rng: newRNG(seed),
    queue: [],
    chargeDelay,
  };
}

function createHole(rng, cols, cheesiness, prevHole) {
  // First time creating a hole
  if (prevHole === -1) {
    const nextRNG = rngLib.next(rng);
    return {
      nextHole: Math.floor(nextRNG.random * cols),
      nextRNG,
    };
  }

  let nextHole = prevHole;
  let nextRNG = rngLib.next(rng);

  // Cheesiness is the likelihood of selecting a new column
  // Cheesiness of 1 means always select a new column
  // Cheesiness of 0 means never select a new column
  if (!(nextRNG.random < cheesiness)) {
    return { nextHole, nextRNG };
  }

  do {
    nextRNG = rngLib.next(nextRNG);
    nextHole = Math.floor(nextRNG.random * cols);
  } while (nextHole === prevHole);

  return { nextHole, nextRNG };
}

function queue(garbage, amountGarbage, currentTime) {
  if (garbage.queue.length > MAX_GARBAGE_QUEUE_LENGTH || amountGarbage <= 0) {
    return garbage;
  }

  const { nextHole, nextRNG } = createHole(
    garbage.rng,
    garbage.cols,
    garbage.cheesiness,
    garbage.prevHole
  );

  // Charged attacks are ready to spawn on next piece drop
  // Add garbage to end of queue (FIFO)
  const nextQueue = [
    ...garbage.queue,
    {
      hole: nextHole,
      amount: amountGarbage,
      charged: garbage.chargeDelay === 0 ? true : false,
      time: currentTime,
    },
  ];

  return {
    ...garbage,
    rng: nextRNG,
    queue: nextQueue,
    prevHole: nextHole,
  };
}

function updateGarbageQueue(garbage, currentTime) {
  if (garbage.queue.length === 0) {
    return garbage;
  }

  // Charge garbage lines once garbage charge delay has passed
  let changed = false;
  const nextQueue = garbage.queue.map((garbageLines) => {
    if (garbageLines.charged) {
      return garbageLines;
    }

    const timeElapsed = currentTime - garbageLines.time;
    if (timeElapsed >= garbage.chargeDelay) {
      changed = true;
      return {
        ...garbageLines,
        charged: true,
      };
    }

    return garbageLines;
  });

  if (!changed) {
    return garbage;
  }

  return {
    ...garbage,
    queue: nextQueue,
  };
}

/**
 * Updates the game garbage object, given the current time, start time of the game, and the game garbage object.
 * Charges garbage lines once charge delay has passed
 *
 * @param {Object} garbage - The game garbage object.
 * @param {number} startTime - The start time of the game in milliseconds.
 * @param {number} currentTime - The current time in milliseconds.
 *
 * @returns {Object} The updated game garbage object.
 */
function update(garbage, startTime, currentTime) {
  return updateGarbageQueue(garbage, currentTime);
}

/**
 * Cancels the attack on the garbage object and returns the updated garbage object
 * along with the updated attacks.
 *
 * @param {Object} garbage - The game garbage object.
 * @param {number} totalAttack - The total attack.
 * @param {Array<Number>} attacks - The attacks.
 *
 * @returns {Object} An object containing the updated game garbage object and the updated attacks.
 * @returns {Object} returns.nextGarbage - The updated game garbage object.
 * @returns {Array<Number>} returns.nextAttacks - The updated attacks.
 */
function cancel(garbage, totalAttack, attacks) {
  // No attack or garbage then nothing to cancel
  if (totalAttack === 0 || garbage.queue.length === 0) {
    return { nextGarbage: garbage, nextAttacks: attacks };
  }

  // Calculate garbage cancelled by removing lines from the garbage queue
  //   Keep doing this until totalAttack is 0 or garbage queue is empty
  // Remove lines cancelled from attack

  const nextQueue = garbage.queue.slice(0);
  let linesCancelled = 0;

  while (linesCancelled < totalAttack && nextQueue.length > 0) {
    const remainingAttack = totalAttack - linesCancelled;
    const lines = nextQueue.shift();
    if (lines.amount <= remainingAttack) {
      linesCancelled += lines.amount;
    } else {
      const nextLines = cancelFromLines(lines, remainingAttack);
      nextQueue.unshift(nextLines);
      linesCancelled += remainingAttack;
    }
  }

  const nextGarbage = {
    ...garbage,
    queue: nextQueue,
  };

  if (linesCancelled === totalAttack) {
    return { nextGarbage, nextAttacks: [] };
  }

  // Remove lines cancelled from attacks
  const nextAttacks = attacks.slice(0);
  while (linesCancelled > 0 && nextAttacks.length > 0) {
    if (nextAttacks[0] <= linesCancelled) {
      linesCancelled -= nextAttacks[0];
      nextAttacks.shift();
    } else {
      nextAttacks[0] -= linesCancelled;
      linesCancelled = 0;
    }
  }

  return { nextGarbage, nextAttacks };
}

/**
 * Cancels lines from the given garbage lines.
 *
 * @param {Object} lines - The garbage lines object containing the amount of lines and column hole.
 * @param {number} amount - The number of lines to cancel.
 *
 * @returns {Object} An object containing the updated amount of lines.
 */
function cancelFromLines(lines, amount) {
  return {
    ...lines,
    amount: lines.amount - amount,
  };
}

/**
 * Processes the incoming garbage lines and updates the garbage queue.
 *
 * @param {Object} garbage - The game garbage object containing the queue and other properties.
 * @param {boolean} isCombo - A flag indicating whether the current state is a combo.
 * @param {boolean} isDrop - A flag indicating whether the current action is a piece drop.
 *
 * @returns {Object} An object containing:
 *   - `nextGarbage`: The updated garbage object with the modified queue.
 *   - `chargedGarbage`: The charged garbage lines ready to be processed, or null if no lines were charged.
 */
function receive(garbage, isCombo, isDrop) {
  // No garbage or combo blocked, then no change
  if (garbage.queue.length === 0 || (garbage.comboBlock && isCombo)) {
    return { nextGarbage: garbage, chargedGarbage: null };
  }

  // Not a drop and no instant garbage, no change
  if (!isDrop && garbage.spawn !== 'instant') {
    return { nextGarbage: garbage, chargedGarbage: null };
  }

  // No charged garbage, then no change (FIFO, charged is always first)
  const chargedGarbageExists = garbage.queue[0].charged;
  if (!chargedGarbageExists) {
    return { nextGarbage: garbage, chargedGarbage: null };
  }

  // Retrieve spawn amount (garbage.cap) and remove that amount of charged garbage from queue
  const nextQueue = garbage.queue.slice(0);
  const chargedGarbage = [];
  let remainingLines = garbage.cap;
  if (garbage.spawn === 'instant') {
    remainingLines = MAX_INSTANT_GARBAGE_CAP;
  }

  while (remainingLines > 0 && nextQueue.length > 0 && nextQueue[0].charged) {
    const lines = nextQueue.shift();
    if (lines.amount <= remainingLines) {
      chargedGarbage.push(lines);
      remainingLines -= lines.amount;
    } else {
      // Ex: lines.amount 10 and remainingLine 1
      // Add that one line to chargedGarbage
      // Add 9 remaining lines to queue (Remove 1)
      const chargedLines = cancelFromLines(
        lines,
        lines.amount - remainingLines
      );
      const queueLines = cancelFromLines(lines, remainingLines);

      chargedGarbage.push(chargedLines);
      nextQueue.unshift(queueLines);
      remainingLines = 0;
    }
  }

  const nextGarbage = {
    ...garbage,
    queue: nextQueue,
  };

  return { nextGarbage, chargedGarbage };
}

const garbageLib = {
  update,
  cancel,
  queue,
  receive,
};

export { newGarbage as default, garbageLib };
