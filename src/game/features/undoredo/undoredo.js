const MAX_HISTORY_SIZE = 5000;
// 5,000 moves is around 5 minutes of gameplay with:
//   ~ 5 keys per piece (high key input)
//   ~ 3.33 pieces per second ("average" fast player speed)

/**
 * Creates a new instance of the undo/redo system.
 *
 * @returns {Object} An object with two properties: undoStack and redoStack.
 *   - undoStack: An array of game states that can be undone.
 *   - redoStack: An array of game states that can be redone.
 */
function newUR(enabled) {
  return {
    enabled,
    undoStack: [],
    redoStack: [],
  };
}

/**
 * Saves the current state of the game to the undo stack.
 * Note this clears the redo stack
 *
 * @param {Object} UR - The current state of the undo/redo system.
 * @param {Object} currentState - The current state of the game.
 * @returns {Object} An updated state of the undo/redo system.
 */
function save(UR, currentState) {
  if (!UR.enabled) {
    return UR;
  }

  const nextUndoStack =
    UR.undoStack >= MAX_HISTORY_SIZE
      ? UR.undoStack.slice(1)
      : UR.undoStack.slice();

  nextUndoStack.push(currentState);

  return {
    ...UR,
    undoStack: nextUndoStack,
    redoStack: [],
  };
}

/**
 * Undoes the most recent state of the game.
 *
 * @param {Object} UR - The current state of the undo/redo system.
 * @param {Object} currentState - The current state of the game.
 * @returns {Object} An object with two properties: state and UR.
 *   - state: The previous state of the game, or null if no states are available.
 *   - UR: An updated state of the undo/redo system.
 */
function undo(UR, currentState) {
  if (!UR.enabled) {
    return { state: null, UR };
  }

  if (UR.undoStack.length === 0) {
    return { state: null, UR };
  }

  const nextUndoStack = UR.undoStack.slice();
  const prevState = nextUndoStack.pop();
  const nextRedoStack = [...UR.redoStack, currentState];

  return {
    state: prevState,
    UR: {
      ...UR,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
    },
  };
}

/**
 * Redoes the most recent state of the game.
 *
 * @param {Object} UR - The current state of the undo/redo system.
 * @param {Object} currentState - The current state of the game.
 * @returns {Object} An object with two properties: state and UR.
 *   - state: The next state of the game, or null if no states are available.
 *   - UR: An updated state of the undo/redo system.
 */
function redo(UR, currentState) {
  if (!UR.enabled) {
    return { state: null, UR };
  }

  if (UR.redoStack.length === 0) {
    return { state: null, UR };
  }

  const nextRedoStack = UR.redoStack.slice();
  const nextState = nextRedoStack.pop();
  const nextUndoStack = [...UR.undoStack, currentState];

  return {
    state: nextState,
    UR: {
      ...UR,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
    },
  };
}

/**
 * Undoes the game state until the given condition is met.
 *
 * @param {Object} UR - The current state of the undo/redo system.
 * @param {Object} currentState - The current state of the game.
 * @param {function} condition - A function that takes a state and returns a boolean.
 * @param {boolean} beforeConditionMet - If true, the state immediately before the condition is met is returned. Otherwise, the state after the condition is met is returned. Defaults to `false`.
 * @returns {Object} An object with two properties: state and UR.
 *   - state: The state of the game after undoing until the condition is met, or null if no states are available.
 *   - UR: An updated state of the undo/redo system.
 */
function undoUntil(UR, currentState, condition, beforeConditionMet = false) {
  if (!UR.enabled) {
    return { state: null, UR };
  }

  if (UR.undoStack.length === 0) {
    return { state: null, UR };
  }

  const nextUndoStack = UR.undoStack.slice();
  const nextRedoStack = [...UR.redoStack, currentState];

  // bState: state before the condition is met
  // mState: state after the condition is met
  let beforeState = nextUndoStack.pop();
  let metState = beforeState;
  let metCondition = condition(metState);

  while (nextUndoStack.length > 0 && !metCondition) {
    beforeState = metState;
    metState = nextUndoStack.pop();
    nextRedoStack.push(beforeState);
    metCondition = condition(metState);
  }

  // Ran out of moves
  if (!metCondition) {
    return {
      state: metState,
      UR: {
        ...UR,
        undoStack: nextUndoStack,
        redoStack: nextRedoStack,
      },
    };
  }

  // State before condition is met is the same as the current state (nothing to undo...)
  if (beforeConditionMet && beforeState === metState) {
    return {
      state: null,
      UR,
    };
  }

  // Requesting state before condition is met
  if (beforeConditionMet) {
    // restore stacks to state before condition is met
    nextRedoStack.pop();
    nextUndoStack.push(metState);
    return {
      state: beforeState,
      UR: {
        ...UR,
        undoStack: nextUndoStack,
        redoStack: nextRedoStack,
      },
    };
  }

  return {
    state: metState,
    UR: {
      ...UR,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
    },
  };
}

function redoUntil(UR, currentState, condition, beforeConditionMet = false) {
  if (!UR.enabled) {
    return { state: null, UR };
  }

  if (UR.redoStack.length === 0) {
    return { state: null, UR };
  }

  const nextRedoStack = UR.redoStack.slice();
  const nextUndoStack = [...UR.undoStack, currentState];

  // bState: state before the condition is met
  // mState: state after the condition is met
  let beforeState = nextRedoStack.pop();
  let metState = beforeState;
  let metCondition = condition(metState);

  while (nextRedoStack.length > 0 && !metCondition) {
    beforeState = metState;
    metState = nextRedoStack.pop();
    nextUndoStack.push(beforeState);
    metCondition = condition(metState);
  }

  // Ran out of moves
  if (!metCondition) {
    return {
      state: metState,
      UR: {
        ...UR,
        undoStack: nextUndoStack,
        redoStack: nextRedoStack,
      },
    };
  }

  // State before condition is met is the same as the current state (nothing to undo...)
  if (beforeConditionMet && beforeState === metState) {
    return {
      state: null,
      UR,
    };
  }

  // Requesting state before condition is met
  if (beforeConditionMet) {
    // restore stacks to state before condition is met
    nextUndoStack.pop();
    nextRedoStack.push(metState);
    return {
      state: beforeState,
      UR: {
        ...UR,
        undoStack: nextUndoStack,
        redoStack: nextRedoStack,
      },
    };
  }

  return {
    state: metState,
    UR: {
      ...UR,
      undoStack: nextUndoStack,
      redoStack: nextRedoStack,
    },
  };
}

const URLib = {
  save,
  undo,
  redo,
  undoUntil,
  redoUntil,
};

export { newUR as default, URLib };
