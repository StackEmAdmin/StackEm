import { getActions, applyReleaseActions } from './actions';

import { getMovesFromActions } from './moves';
import { loadKeybinds } from '../config/keybinds';
import { loadHandling } from '../config/handling';

/**
 * Handles a key down event.
 *
 * @param {KeyboardEvent} ev The event that triggered this call.
 * @param {Object} pressed A map of keys to their respective state.
 * @param {Array.<Object>} actionsQ The current queue of actions.
 * @param {Object} keybinds A map of action to the keys that activate it.
 * @param {Object} modKeybinds A map of action to the modifier keys that activate it.
 * @param {Boolean} modEnabled Whether modifier keys are enabled.
 * @param {Number} DAS The delay after key press before repeat action is enabled.
 * @param {Number} ARR The delay between each repeat action.
 * @param {Number} SRR The delay between each soft drop.
 * @param {Number} currentTime The time at which this event occurred.
 */
function handleKeyDown(
  ev,
  pressed,
  actionsQ,
  keybinds,
  modKeybinds,
  modEnabled,
  DAS,
  ARR,
  SRR,
  currentTime
) {
  const key = ev.key.toLowerCase();

  // Key not mapped or already pressed
  if (pressed.current[key] === undefined || pressed.current[key].active) {
    return;
  }

  pressed.current[key].active = true;
  pressed.current[key].down.push(currentTime);

  const acts = getActions(
    pressed,
    key,
    actionsQ,
    keybinds,
    modKeybinds,
    modEnabled,
    DAS,
    ARR,
    SRR,
    currentTime
  );
  if (acts.length > 0) {
    ev.preventDefault();
    actionsQ.current = actionsQ.current.concat(acts);
  }
}

/**
 * Handles a key up event.
 *
 * This function is triggered when a key is released. It updates the state of the key
 * to inactive, records the release time, and applies any necessary release actions.
 *
 * @param {KeyboardEvent} ev The event that triggered this call.
 * @param {Object} pressed A map of keys to their respective state.
 * @param {Array.<Object>} actionsQ The current queue of actions.
 * @param {Object} keybinds A map of action to the keys that activate it.
 * @param {Object} modKeybinds A map of action to the modifier keys that activate it.
 * @param {Number} DAS The delay after key press before repeat action is enabled.
 * @param {Number} ARR The delay between each repeat action.
 * @param {Number} SRR The delay between each soft drop.
 * @param {Number} currentTime The time at which this event occurred.
 */
function handleKeyUp(
  ev,
  pressed,
  actionsQ,
  keybinds,
  modKeybinds,
  DAS,
  ARR,
  SRR,
  currentTime
) {
  const key = ev.key.toLowerCase();

  // Key not mapped or already released
  if (pressed.current[key] === undefined || !pressed.current[key].active) {
    return;
  }

  pressed.current[key].active = false;
  pressed.current[key].up.push(currentTime);

  applyReleaseActions(
    actionsQ,
    pressed,
    key,
    keybinds,
    modKeybinds,
    DAS,
    ARR,
    SRR,
    currentTime
  );
}

/**
 * Releases all currently pressed keys.
 *
 * This function is used when the game loses focus. It sets all pressed keys
 * to inactive and records the release time, and applies any necessary release
 * actions.
 *
 * @param {Object} pressed A map of keys to their respective state.
 * @param {Array.<Object>} actionsQ The current queue of actions.
 * @param {Object} keybinds A map of action to the keys that activate it.
 * @param {Object} modKeybinds A map of action to the modifier keys that activate it.
 * @param {Number} DAS The delay after key press before repeat action is enabled.
 * @param {Number} ARR The delay between each repeat action.
 * @param {Number} SRR The delay between each soft drop.
 * @param {Number} currentTime The time at which this event occurred.
 */
function releaseKeys(
  pressed,
  actionsQ,
  keybinds,
  modKeybinds,
  DAS,
  ARR,
  SRR,
  currentTime
) {
  for (const key in pressed.current) {
    if (pressed.current[key].active) {
      pressed.current[key].active = false;
      pressed.current[key].up.push(currentTime);
      applyReleaseActions(
        actionsQ,
        pressed,
        key,
        keybinds,
        modKeybinds,
        DAS,
        ARR,
        SRR,
        currentTime
      );
    }
  }
}

/**
 * Converts a queue of actions into a queue of moves.
 *
 * @param {Array.<Object>} actionsQ - The queue of actions to be converted.
 * @param {number} currentTime - The time at which the actions are being converted.
 * @returns {Object} - An object containing the moves and any repeat actions that
 *   may still be active.
 */
function getMoves(actionsQ, currentTime) {
  return getMovesFromActions(actionsQ, currentTime);
}

export {
  loadKeybinds,
  loadHandling,
  handleKeyDown,
  handleKeyUp,
  releaseKeys,
  getMoves,
};
