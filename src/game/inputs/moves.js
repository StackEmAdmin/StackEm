import { controller } from '../game';

const instaActionNameMap = {
  ARRLeft: 'DASLeft',
  ARRRight: 'DASRight',
  SRRDown: 'infSoftDrop',
};

const repeatActionNameMap = {
  ARRLeft: 'left',
  ARRRight: 'right',
  SRRDown: 'softDrop',
};

const actionMap = {
  left: controller.left,
  DASLeft: controller.DASLeft,
  right: controller.right,
  DASRight: controller.DASRight,
  softDrop: controller.softDrop,
  infSoftDrop: controller.infSoftDrop,
  drop: controller.drop,
  rotateCW: controller.rotateCW,
  rotateCCW: controller.rotateCCW,
  rotate180: controller.rotate180,
  hold: controller.hold,
  DASLeftInfSoftDrop: controller.DASLeftInfSoftDrop,
  DASRightInfSoftDrop: controller.DASRightInfSoftDrop,
};

const modMap = {
  reset: controller.reset,
};

/**
 * Copies an array of actions into a new array of actions.
 * @param {object[]} actions - An array of actions to be copied.
 * @returns {object[]} A new array of actions that is a copy of the input.
 */
function copyActions(actions) {
  return actions.map((a) => ({ ...a }));
}

/**
 * Converts a modifier action into a move object for the game.
 *
 * This function maps a given modifier action to its corresponding game move.
 *
 * @param {Object} a - The action object containing action details.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} An object containing the move and null repeatAction.
 * @throws {Error} Throws an error if the action is unknown.
 */
function modActionToMoves(a, currentTime) {
  if (!modMap[a.action]) {
    throw new Error(`Unknown modifier action: ${a.action}`);
  }

  const move = {
    name: a.action,
    fn: (game) => modMap[a.action](game, a.time),
    time: a.time,
  };

  return {
    repeatAction: null,
    moves: [move],
  };
}

/**
 * Converts an instant action into a move object for the game when it has
 * stopped.
 *
 * This function maps a given instant action to its corresponding game move
 * when it has stopped. If the action is still active, the function returns
 * an empty array of moves and null repeatAction.
 *
 * @param {Object} a - The action object containing action details.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} An object containing the move and null repeatAction if the
 *   action has stopped, otherwise an object with an empty array of moves and
 *   null repeatAction.
 * @throws {Error} Throws an error if the action is unknown.
 */
function stoppedInstaActionsToMove(a, currentTime) {
  if (!a.stopTime || a.stopTime > currentTime) {
    return { moves: [], repeatAction: null };
  }

  const name = instaActionNameMap[a.action];
  if (!name) {
    throw new Error(`Unknown instant action: ${a.action}`);
  }

  const move = {
    name: name,
    fn: (game) => actionMap[name](game, a.stopTime),
    time: a.stopTime,
  };

  return {
    moves: [move],
    repeatAction: null,
  };
}

/**
 * Converts a repeat action into a list of moves and an updated repeat action.
 *
 * This function maps a given repeat action to its corresponding game moves
 * and updates the repeat action count. If the action is still active and the
 * repeat interval has not passed, the function returns an empty array of moves
 * and the repeat action. If the action has stopped, the function returns an
 * object with an empty array of moves and null repeatAction.
 *
 * @param {Object} a - The action object containing action details.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} An object containing the moves and updated repeat action if
 *   the action has not stopped, otherwise an object with an empty array of moves
 *   and null repeatAction.
 * @throws {Error} Throws an error if the action is unknown.
 */
function repeatActionToMoves(a, currentTime) {
  if (a.delay === 0) {
    return stoppedInstaActionsToMove(a, currentTime);
  }

  // Repeat interval hasn't passed
  if (a.time + a.delay * a.count > currentTime) {
    return { moves: [], repeatAction: a };
  }

  const name = repeatActionNameMap[a.action];
  if (!name) {
    throw new Error(`Unknown repeat action: ${a.action}`);
  }

  // Accumulate moves and update repeat action count
  const repeatAction = { ...a };
  const moves = [];
  const stop = a.stopTime ? a.stopTime : currentTime;

  // Stop when current time or stopTime has passed.
  while (repeatAction.time + repeatAction.delay * repeatAction.count < stop) {
    const time = repeatAction.time + repeatAction.delay * repeatAction.count;
    moves.push({
      name,
      fn: (game) => actionMap[name](game, time),
      time,
    });
    repeatAction.count += 1;
  }

  // No repeat action when stopTime passed
  if (a.stopTime && a.stopTime < currentTime) {
    return { moves, repeatAction: null };
  }

  return { moves, repeatAction };
}

/**
 * Converts a basic action into a move object for the game.
 *
 * This function maps a given action to its corresponding game move.
 *
 * @param {Object} a - The action object containing action details, including the action name and time.
 * @returns {Object} An object representing the move, which includes the name, execution function, and time.
 * @throws {Error} Throws an error if the action is unknown.
 */
function actionToMove(a) {
  const fn = actionMap[a.action];
  if (!fn) {
    throw new Error(`Unknown action: ${a.action}`);
  }

  return {
    name: a.action,
    fn: (game) => fn(game, a.time),
    time: a.time,
  };
}

/**
 * Calculates the instant action name for the given actions at the given time.
 *
 * This function iterates through the given actions and determines the
 * appropriate instant action name based on the actions that are active at
 * the given time. The instant action name is determined by the combination
 * of ARRLeft, ARRRight, and SRRDown actions. If none of these actions are
 * active, the function returns null.
 *
 * @param {Array.<Object>} actions - The list of actions to calculate the instant action name from.
 * @param {number} currentTime - The time at which the actions are being calculated.
 * @returns {Object} An object with the name of the instant action and any repeat actions that may still be active.
 */
function calcInstActionName(actions, currentTime) {
  let DASLeft = false;
  let DASRight = false;
  let infSoftDrop = false;
  const repeatActions = [];

  for (const a of actions) {
    // Check delay is 0, and is an instant action (and stop time hasn't passed)
    if (
      a.delay !== 0 ||
      !instaActionNameMap[a.action] ||
      (a.stopTime && a.stopTime < currentTime)
    ) {
      continue;
    }

    // Track which actions are active
    if (a.action === 'ARRLeft') {
      DASLeft = true;
    }
    if (a.action === 'ARRRight') {
      DASRight = true;
    }
    if (a.action === 'SRRDown') {
      infSoftDrop = true;
    }
    repeatActions.push(a);
  }

  if (DASLeft && infSoftDrop) {
    return {
      name: 'DASLeftInfSoftDrop',
      repeatActions,
    };
  }
  if (DASRight && infSoftDrop) {
    return {
      name: 'DASRightInfSoftDrop',
      repeatActions,
    };
  }
  if (DASLeft) {
    return {
      name: 'DASLeft',
      repeatActions,
    };
  }
  if (DASRight) {
    return {
      name: 'DASRight',
      repeatActions,
    };
  }
  if (infSoftDrop) {
    return {
      name: 'infSoftDrop',
      repeatActions,
    };
  }

  return {
    name: null,
    repeatActions,
  };
}

/**
 * Converts post actions into moves for the game.
 *
 * This function processes a set of actions to determine any post moves that need
 * to be executed and any repeat actions that remain active. It uses the
 * `calcInstActionName` function to map actions to their corresponding move names
 * and retrieves the appropriate function from the `actionMap`.
 *
 * @param {Array.<Object>} actions - The list of actions to convert.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} An object containing the post moves to execute and any active repeat actions.
 * @throws {Error} Throws an error if the action name is unknown.
 */
function postActionsToMoves(actions, currentTime) {
  const { name, repeatActions } = calcInstActionName(actions, currentTime);

  if (!name) {
    return { postMoves: [], repeatActions };
  }

  const fn = actionMap[name];
  if (!fn) {
    throw new Error(`Unknown action: ${name}`);
  }

  const move = {
    name,
    fn: (game) => fn(game, currentTime),
    time: currentTime,
  };

  return {
    postMoves: [move],
    repeatActions,
  };
}

/**
 * Checks if the given action is a repeat action.
 *
 * A repeat action is defined as any action with a count property. This
 * function returns true if the action is a repeat action, otherwise false.
 *
 * @param {Object} action - The action to be checked.
 * @returns {boolean} - True if the action is a repeat action, otherwise false.
 */
function isRepeatAction(action) {
  // Repeat action when count is defined
  return action.count !== undefined;
}

/**
 * Converts a list of actions into a list of moves and repeat actions.
 * The moves are sorted by time, and repeat actions are added to the repeatActions array.
 *
 * @param {Array.<Object>} actions - The list of actions to be converted.
 * @param {number} currentTime - The time at which the actions are being converted.
 * @returns {Object} An object containing the moves and repeat actions.
 */
function actionsToMoves(actions, currentTime) {
  let moves = [];
  let repeatActions = [];
  for (const a of actions) {
    if (a.isMod) {
      const { moves: mvs, repeatAction } = modActionToMoves(a, currentTime);
      if (repeatAction) {
        repeatActions.push(repeatAction);
      }
      if (mvs.length > 0) {
        moves = moves.concat(mvs);
      }
    } else if (isRepeatAction(a)) {
      const { moves: mvs, repeatAction } = repeatActionToMoves(a, currentTime);
      if (repeatAction) {
        repeatActions.push(repeatAction);
      }
      if (mvs.length > 0) {
        moves = moves.concat(mvs);
      }
    } else {
      moves.push(actionToMove(a, currentTime));
    }
  }

  // Sort moves by time
  moves.sort((a, b) => a.time - b.time);

  const { postMoves, repeatActions: postRepeatActions } = postActionsToMoves(
    actions,
    currentTime
  );
  moves = moves.concat(postMoves);
  repeatActions = repeatActions.concat(postRepeatActions);

  return { moves, repeatActions };
}

/**
 * Converts a queue of actions into a queue of moves.
 *
 * This function takes a queue of actions and the current time, and returns an
 * object containing the moves and the next actions to be applied. The moves are
 * sorted by time, and the repeat actions are included in the next actions array.
 *
 * @param {Array.<Object>} actionsQ - The queue of actions to be converted.
 * @param {number} currentTime - The time at which the actions are being converted.
 * @returns {Object} An object containing the moves and the next actions to be
 *   applied.
 */

function getMovesFromActions(actionsQ, currentTime) {
  if (actionsQ.current.length === 0) {
    return { moves: [], nextActions: actionsQ.current };
  }

  // Sort actions by time
  actionsQ.current.sort((a, b) => a.time - b.time);

  // No actions to apply given time
  if (currentTime < actionsQ.current[0].time) {
    return { moves: [], nextActions: actionsQ.current };
  }

  let nextActions = copyActions(actionsQ.current);
  const actionsToApply = [];
  while (nextActions.length > 0 && nextActions[0].time <= currentTime) {
    actionsToApply.push(nextActions.shift());
  }

  try {
    const { moves, repeatActions } = actionsToMoves(
      actionsToApply,
      currentTime
    );
    nextActions = nextActions.concat(repeatActions);
    return { moves, nextActions };
  } catch (e) {
    console.error(e);
    return { moves: [], nextActions };
  }
}

export { getMovesFromActions };
