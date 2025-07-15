const LS_DAS = 'DAS';
const LS_ARR = 'ARR';
const LS_SRR = 'SRR';

const DEFAULT_DAS = 83;
const DEFAULT_ARR = 0;
const DEFAULT_SRR = 0;

const MIN_ARR = 0;
const MAX_ARR = 500;
const MIN_DAS = 16;
const MAX_DAS = 500;
const MIN_SRR = 0;
const MAX_SRR = 500;

/**
 * Loads user handling settings from local storage.
 *
 * @return {Object} An object with the user's handling settings, fallback to default settings.
 * @property {number} DAS - Delayed Auto Shift (DAS) in milliseconds.
 * @property {number} ARR - Auto Repeat Rate (ARR) in milliseconds.
 * @property {number} SRR - Soft Repeat Rate (SRR) in milliseconds.
 */
function loadHandling() {
  try {
    const DAS = parseInt(localStorage.getItem(LS_DAS));
    const ARR = parseInt(localStorage.getItem(LS_ARR));
    const SRR = parseInt(localStorage.getItem(LS_SRR));

    return {
      DAS: validDAS(DAS) ? DAS : DEFAULT_DAS,
      ARR: validARR(ARR) ? ARR : DEFAULT_ARR,
      SRR: validSRR(SRR) ? SRR : DEFAULT_SRR,
    };
  } catch (e) {
    console.warn('Failed to load user handling: ', e);
    return {
      DAS: DEFAULT_DAS,
      ARR: DEFAULT_ARR,
      SRR: DEFAULT_SRR,
    };
  }
}

/**
 * Saves user handling settings to local storage.
 *
 * @param {number} DAS - Delayed Auto Shift (DAS) in milliseconds.
 * @param {number} ARR - Auto Repeat Rate (ARR) in milliseconds.
 * @param {number} SRR - Soft Repeat Rate (SRR) in milliseconds.
 */
function saveHandling(DAS, ARR, SRR) {
  try {
    if (!validateHandling(DAS, ARR, SRR)) {
      throw new Error(
        `Invalid handling settings. DAS: ${DAS}, ARR: ${ARR}, SRR: ${SRR}`
      );
    }
    localStorage.setItem(LS_DAS, DAS);
    localStorage.setItem(LS_ARR, ARR);
    localStorage.setItem(LS_SRR, SRR);
  } catch (e) {
    console.error('Failed to save user handling: ', e);
  }
}

function saveDAS(DAS) {
  try {
    if (!validDAS(DAS)) {
      throw new Error(`Invalid DAS: ${DAS}`);
    }
    localStorage.setItem(LS_DAS, DAS);
  } catch (e) {
    console.error('Failed to save user DAS: ', e);
  }
}

function saveARR(ARR) {
  try {
    if (!validARR(ARR)) {
      throw new Error(`Invalid ARR: ${ARR}`);
    }
    localStorage.setItem(LS_ARR, ARR);
  } catch (e) {
    console.error('Failed to save user ARR: ', e);
  }
}

function saveSRR(SRR) {
  try {
    if (!validSRR(SRR)) {
      throw new Error(`Invalid SRR: ${SRR}`);
    }
    localStorage.setItem(LS_SRR, SRR);
  } catch (e) {
    console.error('Failed to save user SRR: ', e);
  }
}

function validDAS(DAS) {
  if (isNaN(DAS) || DAS < MIN_DAS || DAS > MAX_DAS) {
    return false;
  }
  return true;
}

function validARR(ARR) {
  if (isNaN(ARR) || ARR < MIN_ARR || ARR > MAX_ARR) {
    return false;
  }
  return true;
}

function validSRR(SRR) {
  if (isNaN(SRR) || SRR < MIN_SRR || SRR > MAX_SRR) {
    return false;
  }
  return true;
}

function validateHandling(DAS, ARR, SRR) {
  return validDAS(DAS) && validARR(ARR) && validSRR(SRR);
}

const validate = {
  handling: validateHandling,
  DAS: validDAS,
  ARR: validARR,
  SRR: validSRR,
};

export { loadHandling, saveHandling, saveDAS, saveARR, saveSRR, validate };
