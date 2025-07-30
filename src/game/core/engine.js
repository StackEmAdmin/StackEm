import { controller } from '../game';
import { getMoves } from '../inputs/inputs';

const FPS = 60;
const TIME_STEP = 1000 / FPS;
const MAX_UPDATES = 100;

/**
 * Applies a series of moves to the game state.
 *
 * This function takes a game object and an array of move objects.
 * Each move object contains a function that modifies the game state.
 * The function iterates over the moves and applies each move to the
 * game object in sequence, returning the final modified game state.
 *
 * @param {Object} game - The current state of the game.
 * @param {Array.<Object>} moves - An array of move objects to be applied.
 * @returns {Object} The updated game state after all moves are applied.
 */
function applyMoves(game, moves) {
  return moves.reduce((state, move) => move.fn(state), game);
}

/**
 * Updates the game state by applying moves from the actions queue and
 * executing any game logic.
 *
 * This function takes a game object, an actions reference, and the current time
 * in milliseconds. It returns an object containing the updated game state.
 *
 * @param {Object} game - The current state of the game.
 * @param {Object} actionsRef - A reference to the actions queue.
 * @param {number} currentTickTime - The current time in milliseconds.
 * @returns {Object} The updated game state.
 */
function tick(game, actionsRef, currentTickTime) {
  const { moves, nextActions } = getMoves(actionsRef, currentTickTime);
  actionsRef.current = nextActions;
  const updatedGame = applyMoves(game, moves);
  return controller.update(updatedGame, currentTickTime);
}

/**
 * Updates the game state by applying the moves from the action queue and
 * executing any game logic.
 *
 * This function takes a game object, an actions reference, an accumulator, and
 * the current time in milliseconds. It returns an object containing the updated
 * game state and the new accumulator value.
 *
 * The update function iterates over the moves and applies each move to the
 * game object in sequence. It then calls the controller's update function to
 * execute any game logic. The function returns the final updated game state and
 * the new accumulator value.
 *
 * @param {Object} game - The current state of the game.
 * @param {Object} actionsRef - A reference to the actions queue.
 * @param {number} newAccumulator - The current time accumulator.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} An object containing the updated game state and the new
 * accumulator value.
 */
function update(game, actionsRef, accumulator, currentTime) {
  let newAccumulator = accumulator;
  let lastTime = currentTime - newAccumulator;
  let updatedGame = game;

  let count = 0;
  while (newAccumulator >= TIME_STEP && count < MAX_UPDATES) {
    updatedGame = tick(updatedGame, actionsRef, lastTime + TIME_STEP);

    lastTime += TIME_STEP;
    newAccumulator -= TIME_STEP;
    count += 1;
  }

  return {
    game: updatedGame,
    accumulator: newAccumulator,
  };
}

/**
 * Determines whether extrapolation should be skipped based on the game and moves.
 *
 * @param {Object} game - The current state of the game.
 * @param {Array.<Object>} moves - An array of move objects to be checked.
 * @returns {boolean} True if extrapolation should be skipped, false otherwise.
 */

function skipExtrapolation(game, moves) {
  if (moves.length === 0) {
    return true;
  }

  // Prevent flash of different queue due to seed
  if (
    moves.some((move) => move.name === 'reset') &&
    game.config.queueNewSeedOnReset
  ) {
    return true;
  }

  return false;
}

/**
 * Extrapolates the current game state from the actions queue and updates the
 * game state by calling the controller's update function.
 *
 * This function takes a game object, an actions reference, an accumulator, and
 * the current time in milliseconds. It returns the updated game state.
 *
 * The render function first checks if the accumulator is greater than the time
 * step. If it is, the render function returns the current game state.
 *
 * Otherwise, the render function gets the moves from the actions queue that
 * should be applied up to the current time. It then applies those moves to the
 * game state and calls the controller's update function to execute any game
 * logic. The function returns the final updated game state.
 *
 * @param {Object} game - The current state of the game.
 * @param {Object} actionsRef - A reference to the actions queue.
 * @param {number} accumulator - The current time accumulator.
 * @param {number} currentTime - The current time in milliseconds.
 * @returns {Object} The updated game state.
 */
function render(game, actionsRef, accumulator, currentTime) {
  // Game is behind. Skip extrapolation until update catches up.
  if (accumulator >= TIME_STEP) {
    return game;
  }

  // Extrapolate moves. Does not mutate actions or game state (instead new game state returned).
  const { moves } = getMoves(actionsRef, currentTime, true);
  if (skipExtrapolation(game, moves)) {
    return game;
  }

  let updatedGame = game;
  updatedGame = applyMoves(updatedGame, moves);
  return controller.update(updatedGame, currentTime);
}

export { update, render };
