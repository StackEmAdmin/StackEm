const LS_KEYBINDS = 'keybinds';
const LS_MOD_KEYBINDS = 'modKeyBinds';

// Keybind activated by pressing key
const DEFAULT_KEYBINDS = {
  left: ['arrowleft'],
  right: ['arrowright'],
  softDrop: ['arrowdown'],
  drop: ['c'],
  rotateCW: ['arrowup'],
  rotateCCW: ['x'],
  rotate180: ['shift'],
  hold: ['z'],
};

// Modifiers activated by pressing all keys in order.
const DEFAULT_MOD_KEYBINDS = {
  reset: ['r'],
};

/**
 * Initializes the pressed object with default values based on the keybinds.
 * The pressed object is a map of key to an object with active, down, and up.
 * Active is a boolean indicating if the key is currently pressed.
 * Down and up are arrays of timestamps indicating when the key was pressed or released.
 *
 * @param {Object} keybinds - A map of command to array of key codes.
 * @param {Object} modKeybinds - A map of command to array of key codes.
 * @returns {Object} - The initialized pressed object.
 */
function initPressed(keybinds, modKeybinds) {
  let pressed = {};

  for (const keys of Object.values(keybinds)) {
    for (const k of keys) {
      if (pressed[k] || k === '') {
        continue;
      }
      pressed[k] = {
        active: false,
        down: [],
        up: [],
      };
    }
  }

  for (const keys of Object.values(modKeybinds)) {
    for (const k of keys) {
      if (pressed[k] || k === '') {
        continue;
      }
      pressed[k] = {
        active: false,
        down: [],
        up: [],
      };
    }
  }
  return pressed;
}

/**
 * Loads user keybinds from local storage and returns an object with the loaded
 * keybinds, modifier keybinds, and an initialized pressed object.
 *
 * @returns {{keybinds: Object, modKeybinds: Object, pressed: Object}}
 *   An object containing the loaded keybinds, modifier keybinds, and an
 *   initialized pressed object.
 */
function loadKeybinds() {
  try {
    let keybinds = JSON.parse(localStorage.getItem(LS_KEYBINDS));
    let modKeybinds = JSON.parse(localStorage.getItem(LS_MOD_KEYBINDS));
    if (!keybinds && !modKeybinds) {
      throw new Error('No user keybinds found');
    }
    if (!keybinds) {
      keybinds = DEFAULT_KEYBINDS;
    }
    if (!modKeybinds) {
      modKeybinds = DEFAULT_MOD_KEYBINDS;
    }
    return {
      keybinds,
      modKeybinds,
      pressed: initPressed(keybinds, modKeybinds),
    };
  } catch (e) {
    console.warn('Failed to load user keybinds: ', e);
    return {
      keybinds: DEFAULT_KEYBINDS,
      modKeybinds: DEFAULT_MOD_KEYBINDS,
      pressed: initPressed(DEFAULT_KEYBINDS, DEFAULT_MOD_KEYBINDS),
    };
  }
}

/**
 * Saves user keybinds to local storage. Mapped command keys must be lowercase.
 *
 * @param {Object} keybinds
 *   An object containing the keybinds to save.
 */
function saveKeybinds(keybinds) {
  try {
    localStorage.setItem('keybinds', JSON.stringify(keybinds));
  } catch (e) {
    console.error('Failed to save user keybinds: ', e);
  }
}

/**
 * Saves user modifier keybinds to local storage.
 *
 * @param {Object} keybinds
 *   An object containing the modifier keybinds to save.
 */
function saveModKeybinds(keybinds) {
  try {
    localStorage.setItem(LS_MOD_KEYBINDS, JSON.stringify(keybinds));
  } catch (e) {
    console.error('Failed to save user keybinds: ', e);
  }
}

export { loadKeybinds, saveKeybinds, saveModKeybinds };
