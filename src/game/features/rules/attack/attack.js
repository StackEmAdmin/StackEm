import tsOne from './tsone';

function newAttack(system) {
  return system;
}

/**
 * Calculates the total attack given the number of line clears, combo, back to back, spin, and mini spin.
 *
 * @param {string} system - The name of the attack system.
 * @param {Object} [options] - An object of options.
 * @param {number} [options.lineClears] - The number of lines cleared.
 * @param {number} [options.garbageLineClears] - The number of garbage lines cleared.
 * @param {number} [options.combo] - The length of the current combo.
 * @param {number} [options.b2b] - The number of back to back.
 * @param {boolean} [options.spin] - Whether the clear was a spin or not.
 * @param {boolean} [options.mini] - Whether the clear was a mini spin or not.
 * @param {boolean} [options.allClear] - Whether an all clear was performed.
 *
 * @returns {Object} - The attack calculation results.
 * @returns {Array<Number>} returns.attacks - The attacks.
 * @returns {number} returns.nextCombo - The next combo value.
 * @returns {number} returns.nextB2B - The next back to back value.
 */
function calculateAttacks(
  system,
  { lineClears, garbageLineClears, combo, b2b, spin, mini, allClear } = {}
) {
  if (system === 'tsOne') {
    const { nextCombo, nextB2B } = tsOne.calculateComboB2B(
      lineClears,
      combo,
      b2b,
      spin,
      mini
    );
    const attacks = tsOne.calculateAttacks(
      lineClears,
      nextCombo,
      nextB2B,
      spin,
      mini,
      allClear
    );
    return { attacks, nextCombo, nextB2B };
  }

  return { nextB2B: -1, nextCombo: -1, attacks: [] };
}

const attackLib = {
  calculateAttacks,
};

export { newAttack as default, attackLib };
