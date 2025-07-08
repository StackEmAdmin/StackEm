// TS One attack table
// Formulas inspired by https://github.com/chouhy/Tetrio-Attack-Table

const base = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
  5: 5,
};

const spinBase = {
  0: 0,
  1: 2,
  2: 4,
  3: 6,
  4: 10,
  5: 12,
};

const miniBase = {
  0: 0,
  1: 0,
  2: 1,
  3: 2,
  4: 4,
};

const B2BB = 1;
const B2BL = 0.8;
const COMBOB = 0.25;
const COMBO_MIN = 1;
const COMBO_MINL = 1.25;
const ALL_CLEAR = 10;

function baseAttack(lineClears, spin, mini) {
  if (spin) {
    return spinBase[lineClears];
  } else if (mini) {
    return miniBase[lineClears];
  }

  return base[lineClears] ?? 0;
}

function b2bBonus(b2b) {
  if (b2b <= 0) {
    return 0;
  }

  const logValue = Math.log1p(B2BL * b2b);
  let b2bBonusValue = Math.floor(1 + logValue);

  if (b2b > 1) {
    b2bBonusValue += (1 + (logValue % 1)) / 3;
  }

  return B2BB * b2bBonusValue;
}

function comboBonus(attack, combo) {
  if (combo <= 0) {
    return attack;
  }

  let nextAttack = attack * (1 + COMBOB * combo);

  if (combo > 1) {
    const minAttack = Math.log1p(COMBO_MIN * COMBO_MINL * combo);
    nextAttack = Math.max(minAttack, nextAttack);
  }

  return nextAttack;
}

/**
 * Calculate the total attack given the number of line clears, combo, back to back, spin, and mini spin.
 * @param {number} lineClears - the number of line clears
 * @param {number} combo - the length of the combo
 * @param {number} b2b - the number of back to back clears
 * @param {boolean} spin - whether the clear was a spin or not
 * @param {boolean} mini - whether the clear was a mini spin or not
 * @param {boolean} allClear - whether an all clear was performed
 * @return {number} The total attack
 */
function calculateAttacks(lineClears, combo, b2b, spin, mini, allClear) {
  if (lineClears === 0) {
    return [];
  }

  let attack = baseAttack(lineClears, spin, mini);
  attack = attack + b2bBonus(b2b);
  attack = comboBonus(attack, combo);
  attack = Math.floor(attack);

  if (attack === 0) {
    return allClear ? [ALL_CLEAR] : [];
  }

  return allClear ? [attack, ALL_CLEAR] : [attack];
}

/**
 * Calculates the next combo and back-to-back (B2B) status based on the current line clears,
 * combo, B2B, and whether a spin or mini spin was performed.
 *
 * @param {number} lineClears - The number of lines cleared.
 * @param {number} combo - The current combo count.
 * @param {number} b2b - The current back-to-back count.
 * @param {boolean} spin - Whether the clear was a spin.
 * @param {boolean} mini - Whether the clear was a mini spin.
 * @returns {Object} An object containing the next combo and B2B values.
 */

function calculateComboB2B(lineClears, combo, b2b, spin, mini) {
  // Note the -1 on combo and b2b when broken (Not 0)
  // Ex:
  //   First line clear (combo -1 -> 0)
  //     - Value of 0 is used
  //   Second line clear (combo 0 -> 1)
  //     - Value of 1 is used

  // Broke combo then reset combo
  if (lineClears === 0) {
    return { nextCombo: -1, nextB2B: b2b };
  }

  const nextCombo = combo + 1;

  // Cleared 4 lines, or performed a spin or mini, increment b2b
  if (lineClears >= 4 || spin || mini) {
    return { nextCombo, nextB2B: b2b + 1 };
  }

  return { nextCombo, nextB2B: -1 };
}

const tsOne = {
  calculateAttacks,
  calculateComboB2B,
};

export default tsOne;
