import newAttack, { attackLib } from './attack/attack';
import newKick from './kick/kick';
import newSpins, { spinLib } from './spins/spins';

/**
 * Creates a new set of game rules by initializing kick, attack, and spin configurations.
 *
 * @param {Object} kick - The kick system.
 * @param {Object} attack - The attack system.
 * @param {Object} spin - The spin detection system.
 *
 * @returns {Object} - An object containing the initialized kick, attack, and spin rules.
 */
function newRules(kick, attack, spin) {
  return {
    kick: newKick(kick),
    attack: newAttack(attack),
    spins: newSpins(spin),
  };
}

/**
 * Calculates the attack given the rules and line clear information
 * @param {Object} rules The rules of the game
 * @param {Object} [info] - An object of options.
 * @param {number} [info.lineClears] - The number of lines cleared.
 * @param {number} [info.garbageLineClears] - The number of garbage lines cleared.
 * @param {number} [info.combo] - The length of the current combo.
 * @param {number} [info.b2b] - The number of back to back.
 * @param {boolean} [info.spin] - Whether the clear was a spin or not.
 * @param {boolean} [info.mini] - Whether the clear was a mini spin or not.
 * @param {boolean} [info.allClear] - Whether an all clear was performed.
 * @returns {Object} - The attack calculation results.
 * @returns {Array<Number>} returns.attacks - The attacks.
 * @returns {number} returns.nextCombo - The next combo value.
 * @returns {number} returns.nextB2B - The next back to back value.
 */
function calculateAttacks(rules, info) {
  return attackLib.calculateAttacks(rules.attack, info);
}

/**
 * Retrieves information about a potential spin maneuver based on the specified game board state, rotated piece, previous rotation, kick table, and kick number.
 *
 * @param {Object} rules - The rules of the game.
 * @param {Object} board - The game board object.
 * @param {Object} piece - The rotated piece object.
 * @param {number} prevRotation - The previous rotation of the piece.
 * @param {string} kickTableName - The kick table name.
 * @param {number} kickNum - The kick number used for the piece.
 *
 * @returns {string} - Depending on maneuver performed, returns 'spin', 'mini', or ''.
 */
function getSpinInfo(
  rules,
  board,
  piece,
  prevRotation,
  kickTableName,
  kickNum
) {
  return spinLib.getSpinInfo(
    rules.spins,
    board,
    piece,
    prevRotation,
    kickTableName,
    kickNum
  );
}

const rulesLib = { calculateAttacks, getSpinInfo };

export { newRules as default, rulesLib };
