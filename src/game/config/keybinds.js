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
  undoMove: ['control', 'shift', 'z'],
  redoMove: ['control', 'shift', 'y'],
  undo: ['control', 'z'],
  redo: ['control', 'y'],
  setFillTypeO: ['alt', 'o'],
  setFillTypeI: ['alt', 'i'],
  setFillTypeL: ['alt', 'l'],
  setFillTypeJ: ['alt', 'j'],
  setFillTypeS: ['alt', 's'],
  setFillTypeT: ['alt', 't'],
  setFillTypeZ: ['alt', 'z'],
  setFillTypeG: ['alt', 'g'],
  toggleHighlight: ['alt', 'h'],
  modifier: ['control'],
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
 * Migrates an old object to a new object.
 * If a key exists in both objects, the value from the old object
 * is used. Otherwise, the value from the new object is used.
 *
 * If a key in the old object does not exist in the new object, it is ignored.
 *
 * @param {Object} oldObj - The old object to migrate.
 * @param {Object} newObj - The new object to migrate to.
 * @returns {Object} - The migrated object.
 */
function migrateObj(oldObj, newObj) {
  let migratedObj = {};

  for (const key in newObj) {
    if (oldObj[key]) {
      migratedObj[key] = oldObj[key];
    } else {
      migratedObj[key] = newObj[key];
    }
  }

  return migratedObj;
}

/**
 * Migrates old keybinds to new keybinds.
 * If a command doesn't exist in keybind, it is added.
 * If a command exists in keybind and not in DEFAULT_KEYBINDS, it is removed.
 *
 * main purposes:
 *  - Adds new commands to keybinds on updates.
 *  - (Validate and) sanitize keybinds.
 *
 * @param {Object} keybinds - The old keybinds to migrate.
 * @returns {Object} - The migrated keybinds.
 */
function migrateKeybinds(keybinds) {
  return migrateObj(keybinds, DEFAULT_KEYBINDS);
}

/**
 * Migrates old modifier keybinds to new modifier keybinds.
 * If a command doesn't exist in modKeybinds, it is added.
 * If a command exists in modKeybinds and not in DEFAULT_MOD_KEYBINDS, it is removed.
 *
 * @param {Object} modKeybinds - The old modifier keybinds to migrate.
 * @returns {Object} - The migrated modifier keybinds.
 */
function migrateModKeybinds(modKeybinds) {
  return migrateObj(modKeybinds, DEFAULT_MOD_KEYBINDS);
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
    if (!keybinds) {
      keybinds = DEFAULT_KEYBINDS;
    } else {
      keybinds = migrateKeybinds(keybinds);
    }
    if (!modKeybinds) {
      modKeybinds = DEFAULT_MOD_KEYBINDS;
    } else {
      modKeybinds = migrateModKeybinds(modKeybinds);
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
