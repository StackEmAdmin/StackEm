const objectiveMap = {
  attack: 'numAttack',
  lines: 'numLines',
  maxCombo: 'maxCombo',
  maxB2B: 'maxB2B',
  linesCancelled: 'numLinesCancelled',
  linesSurvived: 'numLinesSurvived',
  allClears: 'numAllClears',
};

/**
 * Creates a new objectives object.
 * An objective is one of the following:
 * A twist objective
 *   objective.type = 'spin' or 'mini'
 *   objective.lines = 'any' or 1, 2, or 3
 *   objective.amount = number of spins or minis
 *   objective.quantifier = 'atLeast', 'exact', or 'atMost'
 *   objective.piece = 'all' or 'o', 'i', 'l', 'j', 's', 't', or 'z'.
 *
 * A stat objective
 *   objective.type = 'lines', 'attack', 'survive', 'cancel', 'combo', 'b2b', or 'allClears'
 *   objective.amount = number of lines, attack, survive, cancel, combo, b2b, or allClears
 *   objective.quantifier = 'atLeast', 'exact', or 'atMost'
 *
 * @param {Object} objectives - An array of objectives
 * @returns {Object} - An objectives object with the given objectives.
 */
function newObjectives(objectives) {
  return { objectives };
}

/**
 * Returns true if the quantity satisfies the quantifier.
 * Quantifier can be atLeast, exact, or atMost
 *
 * @param {Object} objective - The objective to check.
 * @param {number} quantity - The quantity to check against.
 * @returns {boolean} - Whether the quantity meets the objective.
 */
function meetsQuantifier(objective, quantity) {
  if (objective.quantifier === 'atLeast' && objective.amount <= quantity) {
    return true;
  }
  if (objective.quantifier === 'exact' && objective.amount === quantity) {
    return true;
  }
  if (objective.quantifier === 'atMost' && objective.amount >= quantity) {
    return true;
  }
  return false;
}

/**
 * Returns true if the specified twists in objective are met by the game.
 *
 * @param {Object} objective - The twist objective to check.
 * @param {Object} game - The game to check against.
 * @returns {boolean} - Whether the number of twists meets the objective.
 */
function meetsTwists(objective, game) {
  const specifiedTwist = game.twists[objective.type];

  if (objective.piece === 'all' && objective.lines === 'any') {
    return meetsQuantifier(objective, specifiedTwist.length);
  }
  if (objective.piece === 'all') {
    const numTwists = specifiedTwist.filter(
      (twist) => twist.lines === objective.lines
    ).length;
    return meetsQuantifier(objective, numTwists);
  }
  if (objective.lines === 'any') {
    const numTwists = specifiedTwist.filter(
      (twist) => twist.piece === objective.piece
    ).length;
    return meetsQuantifier(objective, numTwists);
  }

  const numTwists = specifiedTwist.filter(
    (twist) =>
      twist.piece === objective.piece && twist.lines === objective.lines
  ).length;
  return meetsQuantifier(objective, numTwists);
}

/**
 * Returns true if the specified objective is met by the game.
 *
 * @param {Object} objective - The objective to check.
 * @param {Object} game - The game to check against.
 * @returns {boolean} - Whether the objective is met.
 */
function meetsObjective(objective, game) {
  if (
    objective.type === 'attack' ||
    objective.type === 'lines' ||
    objective.type === 'maxCombo' ||
    objective.type === 'maxB2B' ||
    objective.type === 'linesCancelled' ||
    objective.type === 'linesSurvived' ||
    objective.type === 'allClears'
  ) {
    return meetsQuantifier(objective, game[objectiveMap[objective.type]]);
  }
  if (objective.type === 'spins' || objective.type === 'minis') {
    return meetsTwists(objective, game);
  }

  return true;
}

/**
 * Returns true if all objectives in the objectives object are met by the game.
 *
 * @param {Object} objectives - The objectives object to check.
 * @param {Object} game - The game to check against.
 * @returns {boolean} - Whether all objectives are met.
 */
function met(objectives, game) {
  return objectives.objectives.every((objective) =>
    meetsObjective(objective, game)
  );
}

const objectivesLib = {
  met,
};

export { newObjectives as default, objectivesLib };
