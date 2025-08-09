import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import validate from '../../game/config/config';
import c from '../../game/config/constants';
import { modifyConfig } from '../../game/game';
import str from '../../util/str';
import GameGrid from '../gamegrid/GameGrid';
import newGame, { controller } from '../../game/game';

import GridSVG from '../../assets/img/GridSVG';
import CloseSVG from '../../assets/img/CloseSVG';
import './GameSettingsMenuForm.css';

function set(setState, value) {
  setState((state) => {
    if (state.focus || state.error || state.value === value) {
      return state;
    }
    return { ...state, value, error: false };
  });
}

function focus(setState) {
  setState((state) => {
    if (state.focus) {
      return state;
    }
    return { ...state, focus: true };
  });
}

function toggle(setState, gameRef, update) {
  setState((state) => {
    gameRef.current = update(
      gameRef.current,
      state.name,
      !state.value,
      performance.now()
    );
    return { ...state, value: !state.value };
  });
}

function blur(
  setState,
  gameVal,
  value,
  toNumber = false,
  gameValOnEmpty = false
) {
  setState((state) => {
    if (gameValOnEmpty && value === '') {
      return {
        ...state,
        value: gameVal,
        error: false,
        focus: false,
      };
    }

    const val = toNumber ? Number(value) : value;
    if (validate[state.name](val)) {
      return {
        ...state,
        value: gameVal,
        error: false,
        focus: false,
      };
    }

    return { ...state, error: true, focus: false };
  });
}

function blurSeed(setState, gameRef, update, gameValue, value, padAmount) {
  setState((state) => {
    if (value === '') {
      return {
        ...state,
        value: gameValue,
        error: false,
        focus: false,
      };
    }

    const paddedValue = value.padStart(padAmount, '0');
    if (validate[state.name](paddedValue)) {
      gameRef.current = update(
        gameRef.current,
        state.name,
        paddedValue.toLowerCase(),
        performance.now()
      );
      return {
        ...state,
        value: paddedValue.toUpperCase(),
        error: false,
        focus: false,
      };
    }

    return { ...state, error: true, focus: false };
  });
}

function changeSeed(setState, value, padAmount) {
  setState((state) => {
    if (state.value === value) {
      return state;
    }

    if (value === '') {
      return { ...state, value: value };
    }

    const paddedValue = value.padStart(padAmount, '0');
    if (validate[state.name](paddedValue)) {
      return { ...state, value: value, error: false };
    }

    return { ...state, value: value };
  });
}

function changeUpdate(
  setState,
  gameRef,
  update,
  value,
  valueToLower = false,
  valueToNumber = false,
  valueSkipEmpty = false,
  valueParseGrid = false
) {
  setState((state) => {
    if (state.value === value) {
      return state;
    }

    if (valueSkipEmpty && value === '') {
      return { ...state, value: value };
    }

    let val = valueToLower
      ? value.toLowerCase()
      : valueToNumber
      ? Number(value)
      : value;

    if (valueParseGrid) {
      val = parseGrid(val);
    }

    if (validate[state.name](val)) {
      gameRef.current = update(
        gameRef.current,
        state.name,
        val,
        performance.now()
      );
      return { ...state, value: value, error: false };
    }

    return { ...state, value: value };
  });
}

/**
 * Splits a string into a 2D array, where each element of the array
 * is a row of the input string, and each element of the inner arrays
 * is a column of the input string.
 *
 * If a row has fewer columns than the row with the most columns, the
 * row is padded (end) with '.' characters.
 *
 * @param {string} text - The input string to be split into a 2D array.
 * @returns {string[][]} 2D array of strings.
 */
function tokenizeGrid(text) {
  // Split text into rows and columns removing excess whitespace
  const rows = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/));

  const cols = Math.max(...rows.map((row) => row.length));
  const grid = rows.map((row) => {
    const copy = row.slice();
    while (copy.length < cols) {
      copy.push('.');
    }
    return copy;
  });

  return grid;
}

/**
 * Formats the grid so that each column is padded to the width
 * of the longest token in that column.
 *
 * @param {string} text - The input string to be formatted.
 * @returns {string} Formatted string with padded columns.
 */
function formatGrid(text) {
  // Ensure valid before formatting
  if (text === '') {
    return text;
  }

  const grid = tokenizeGrid(text);
  const cols = grid[0].length;

  // Calculate max width for each column
  const colsWidths = new Array(cols).fill(0);
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      colsWidths[c] = Math.max(colsWidths[c], grid[r][c].length);
    }
  }

  // Convert to string with padded columns
  const padded = grid.map((row) => {
    return row
      .map((col, i) => {
        return String(col).padStart(colsWidths[i], ' ');
      })
      .join(' ');
  });

  return padded.join('\n');
}

/**
 * Parses the input text by removing excess whitespace.
 * This includes collapsing extra spaces between tokens.
 *
 * @param {string} text - The input string to be parsed.
 * @returns {string} Parsed string with standardized spacing.
 */

function parseGrid(text) {
  // Remove excess whitespaces
  const parsed = text
    .trim()
    .split(/\r?\n/)
    .map((line) => line.trim().split(/\s+/).join(' '))
    .join('\n');

  return parsed;
}

/**
 * Converts a 2D array into a string, where each element of the array
 * is a row of the input string, and each element of the inner arrays
 * is a column of the input string.
 *
 * @param {string[][]} arr - The 2D array to be converted into a string.
 * @returns {string} String representation of the array.
 */
function parseGridArr(arr) {
  let copy = arr.map((row) => row.slice()).reverse();

  // Filter empty rows following the last non-empty row
  let foundOccupied = false;
  copy = copy.filter((row) => {
    if (foundOccupied) {
      return true;
    }
    foundOccupied = row.some((col) => col !== '');
    return foundOccupied;
  });

  // Replace empty spaces with '.'
  return copy
    .map((row) => row.map((col) => col.replace(' ', '') || '.').join(' '))
    .join('\n');
}

function CustomCheckbox({
  id,
  labelText,
  name,
  checked,
  onToggle,
  onText = 'On',
  offText = 'Off',
}) {
  return (
    <label htmlFor={id} className="custom-checkbox">
      {labelText}
      <input
        type="checkbox"
        className="toggle"
        id={id}
        name={name}
        checked={checked}
        onChange={onToggle}
      />
      <span
        className="toggle-button"
        data-tg-on={onText}
        data-tg-off={offText}
      ></span>
    </label>
  );
}

function LabelInput({
  id,
  labelText,
  hasError,
  name,
  ariaLabel,
  onFocus,
  onBlur,
  onChange,
  value,
  maxLength,
}) {
  return (
    <>
      <label htmlFor={id}>{labelText}</label>
      <input
        type="text"
        className={'--global-no-spinner' + (hasError ? ' error' : '')}
        name={name}
        id={id}
        aria-label={ariaLabel}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={value}
        maxLength={maxLength}
      />
    </>
  );
}

function ConfigurationMenu({ gameRef, show, pubSubRef }) {
  const getSpin = (game) => game.config.spins;

  const [spins, setSpins] = useState({
    value: getSpin(gameRef.current),
    name: 'spins',
    error: false,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (spins.value !== getSpin(game)) {
        set(setSpins, getSpin(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [gameRef, pubSubRef, show, spins]);

  return (
    <>
      <label htmlFor="kick-option">Rotation System</label>
      <select
        className="--global-hover-focus-active-border"
        name="kick"
        id="kick-option"
      >
        <option value="srsPlus">SRS+</option>
      </select>
      <label htmlFor="spins-option">Spin Detection</label>
      <select
        className="--global-hover-focus-active-border"
        name={spins.name}
        id="spins-option"
        value={spins.value}
        onChange={(e) =>
          changeUpdate(setSpins, gameRef, modifyConfig.rules, e.target.value)
        }
      >
        {c.SPINS_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {c.SPINS_NAME[option]}
          </option>
        ))}
      </select>
      <label htmlFor="attack-option">Attack System</label>
      <select
        className="--global-hover-focus-active-border"
        name="attack"
        id="attack-option"
      >
        <option value="tsOne">TS One</option>
      </select>
    </>
  );
}

function GravityMenu({ gameRef, show, pubSubRef }) {
  const getGravity = (game) => game.gravity.g;
  const getLock = (game) => game.gravity.lock;
  const getLockCap = (game) => game.gravity.lockCap;
  const getLockPenalty = (game) => game.gravity.lockPenalty;
  const getAcceleration = (game) => game.gravity.acc;
  const getAccelerationDelay = (game) => game.gravity.accDelay;

  const [gravity, setGravity] = useState({
    value: getGravity(gameRef.current),
    name: 'gravity',
    error: false,
    focus: false,
  });
  const [lock, setLock] = useState({
    value: getLock(gameRef.current),
    name: 'gravityLock',
    error: false,
    active: false,
  });
  const [lockCap, setLockCap] = useState({
    value: getLockCap(gameRef.current),
    name: 'gravityLockCap',
    error: false,
    focus: false,
  });
  const [lockPenalty, setLockPenalty] = useState({
    value: getLockPenalty(gameRef.current),
    name: 'gravityLockPenalty',
    error: false,
    focus: false,
  });
  const [acceleration, setAcceleration] = useState({
    value: getAcceleration(gameRef.current),
    name: 'gravityAcc',
    error: false,
    focus: false,
  });
  const [accelerationDelay, setAccelerationDelay] = useState({
    value: getAccelerationDelay(gameRef.current),
    name: 'gravityAccDelay',
    error: false,
    focus: false,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (gravity.value !== getGravity(game)) {
        set(setGravity, getGravity(game));
      }
      if (lock.value !== getLock(game)) {
        set(setLock, getLock(game));
      }
      if (lockCap.value !== getLockCap(game)) {
        set(setLockCap, getLockCap(game));
      }
      if (lockPenalty.value !== getLockPenalty(game)) {
        set(setLockPenalty, getLockPenalty(game));
      }
      if (acceleration.value !== getAcceleration(game)) {
        set(setAcceleration, getAcceleration(game));
      }
      if (accelerationDelay.value !== getAccelerationDelay(game)) {
        set(setAccelerationDelay, getAccelerationDelay(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [
    gameRef,
    pubSubRef,
    show,
    gravity,
    lock,
    lockCap,
    lockPenalty,
    acceleration,
    accelerationDelay,
  ]);

  return (
    <>
      <LabelInput
        id="gravity-menu-gravity"
        labelText="Gravity"
        hasError={gravity.error}
        name={gravity.name}
        ariaLabel="Gravity"
        onFocus={() => focus(setGravity)}
        onBlur={(e) =>
          blur(
            setGravity,
            getGravity(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setGravity,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={gravity.value}
      />
      <LabelInput
        id="gravity-menu-lock"
        labelText="Lock"
        hasError={lock.error}
        name={lock.name}
        ariaLabel="Gravity lock"
        onFocus={() => focus(setLock)}
        onBlur={(e) =>
          blur(setLock, getLock(gameRef.current), e.target.value, true, true)
        }
        onChange={(e) =>
          changeUpdate(
            setLock,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={lock.value}
      />
      <LabelInput
        id="gravity-menu-lock-cap"
        labelText="Lock Cap"
        hasError={lockCap.error}
        name={lockCap.name}
        ariaLabel="Gravity lock cap"
        onFocus={() => focus(setLockCap)}
        onBlur={(e) =>
          blur(
            setLockCap,
            getLockCap(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setLockCap,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={lockCap.value}
      />
      <LabelInput
        id="gravity-menu-lock-penalty"
        labelText="Lock Penalty"
        hasError={lockPenalty.error}
        name={lockPenalty.name}
        ariaLabel="Gravity lock penalty"
        onFocus={() => focus(setLockPenalty)}
        onBlur={(e) =>
          blur(
            setLockPenalty,
            getLockPenalty(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setLockPenalty,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={lockPenalty.value}
      />
      <LabelInput
        id="gravity-menu-gravity-acc"
        labelText="Acceleration"
        hasError={acceleration.error}
        name={acceleration.name}
        ariaLabel="Gravity acceleration"
        onFocus={() => focus(setAcceleration)}
        onBlur={(e) =>
          blur(
            setAcceleration,
            getAcceleration(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setAcceleration,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={acceleration.value}
      />
      <LabelInput
        id="gravity-menu-gravity-acc-delay"
        labelText="Acceleration Delay"
        hasError={accelerationDelay.error}
        name={accelerationDelay.name}
        ariaLabel="Gravity acceleration delay"
        onFocus={() => focus(setAccelerationDelay)}
        onBlur={(e) =>
          blur(
            setAccelerationDelay,
            getAccelerationDelay(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setAccelerationDelay,
            gameRef,
            modifyConfig.gravity,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={accelerationDelay.value}
      />
    </>
  );
}

function QueueMenu({ gameRef, show, pubSubRef }) {
  const getNewSeedOnReset = (game) => !!game.config.queueNewSeedOnReset;
  const getSeed = (game) => game.config.queueSeed.toUpperCase();
  const getHoldEnabled = (game) => !!game.config.queueHoldEnabled;
  const getHold = (game) => {
    if (game.queue.hold && game.queue.hold.type) {
      return game.queue.hold.type.toUpperCase();
    }
    return '';
  };
  const getNext = (game) =>
    game.queue.pieces.reduce(
      (acc, piece) => acc + piece.type.toUpperCase(),
      ''
    );

  const [newSeedReset, setNewSeedReset] = useState({
    value: getNewSeedOnReset(gameRef.current),
    name: 'queueNewSeedOnReset',
  });

  const [seed, setSeed] = useState({
    value: getSeed(gameRef.current),
    name: 'queueSeed',
    error: false,
    focus: false,
  });

  const [holdEnabled, setHoldEnabled] = useState({
    value: getHoldEnabled(gameRef.current),
    name: 'queueHoldEnabled',
  });

  const [hold, setHold] = useState({
    value: getHold(gameRef.current),
    name: 'queueHold',
    error: false,
    focus: false,
  });

  const [next, setNext] = useState({
    value: getNext(gameRef.current),
    name: 'queueNext',
    error: false,
    focus: false,
  });

  useEffect(() => {
    // Don't update when menu is hidden
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (newSeedReset.value !== getNewSeedOnReset(game)) {
        set(setNewSeedReset, getNewSeedOnReset(game));
      }
      if (holdEnabled.value !== getHoldEnabled(game)) {
        set(setHoldEnabled, getHoldEnabled(game));
      }
      if (seed.value !== getSeed(game)) {
        set(setSeed, getSeed(game));
      }
      if (hold.value !== getHold(game)) {
        set(setHold, getHold(game));
      }
      if (next.value !== getNext(game)) {
        set(setNext, getNext(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [gameRef, pubSubRef, show, newSeedReset, holdEnabled, seed, hold, next]);

  return (
    <>
      <CustomCheckbox
        id="queue-menu-new-seed"
        labelText="New seed on reset"
        name={newSeedReset.name}
        checked={newSeedReset.value}
        onToggle={() => toggle(setNewSeedReset, gameRef, modifyConfig.queue)}
      />
      <LabelInput
        id="queue-menu-seed"
        labelText="Seed"
        hasError={seed.error}
        name={seed.name}
        ariaLabel="Queue seed"
        onFocus={() => focus(setSeed)}
        onBlur={(e) =>
          blurSeed(
            setSeed,
            gameRef,
            modifyConfig.queue,
            getSeed(gameRef.current),
            e.target.value,
            c.QUEUE_SEED_LENGTH
          )
        }
        onChange={(e) =>
          changeSeed(setSeed, e.target.value, c.QUEUE_SEED_LENGTH)
        }
        value={seed.value}
        maxLength={c.QUEUE_SEED_LENGTH}
      />
      <CustomCheckbox
        id="queue-menu-hold-enabled"
        labelText="Allow hold"
        name={holdEnabled.name}
        checked={holdEnabled.value}
        onToggle={() => toggle(setHoldEnabled, gameRef, modifyConfig.queue)}
      />
      <LabelInput
        id="queue-menu-hold"
        labelText="Hold Piece"
        hasError={hold.error}
        name={hold.name}
        ariaLabel="Hold piece"
        onFocus={() => focus(setHold)}
        onBlur={(e) => blur(setHold, getHold(gameRef.current), e.target.value)}
        onChange={(e) =>
          changeUpdate(
            setHold,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          )
        }
        value={hold.value}
        maxLength={1}
      />
      <LabelInput
        id="queue-menu-next"
        labelText="Next Pieces"
        hasError={next.error}
        name={next.name}
        ariaLabel="Next pieces"
        onFocus={() => focus(setNext)}
        onBlur={(e) =>
          blur(setNext, getNext(gameRef.current), e.target.value, false, true)
        }
        onChange={(e) =>
          changeUpdate(
            setNext,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          )
        }
        value={next.value}
      />
    </>
  );
}

function GarbageMenu({ gameRef, show, pubSubRef }) {
  const getNewSeedOnReset = (game) => !!game.config.garbageNewSeedOnReset;
  const getSeed = (game) => game.config.garbageSeed.toUpperCase();
  const getComboBlock = (game) => !!game.config.garbageComboBlock;
  const getSpawn = (game) => game.config.garbageSpawn;
  const getCharge = (game) => game.config.garbageCharge;
  const getChargeDelay = (game) => game.config.garbageChargeDelay;
  const getChargePieces = (game) => game.config.garbageChargePieces;
  const getCap = (game) => game.config.garbageCap;
  const getCheesiness = (game) => game.config.garbageCheesiness;

  const [newSeedReset, setNewSeedReset] = useState({
    value: getNewSeedOnReset(gameRef.current),
    name: 'garbageNewSeedOnReset',
  });

  const [seed, setSeed] = useState({
    value: getSeed(gameRef.current),
    name: 'garbageSeed',
    error: false,
    focus: false,
  });

  const [comboBlock, setComboBlock] = useState({
    value: getComboBlock(gameRef.current),
    name: 'garbageComboBlock',
  });

  const [spawn, setSpawn] = useState({
    value: getSpawn(gameRef.current),
    name: 'garbageSpawn',
    error: false,
  });

  const [charge, setCharge] = useState({
    value: getCharge(gameRef.current),
    name: 'garbageCharge',
    error: false,
  });

  const [chargeDelay, setChargeDelay] = useState({
    value: getChargeDelay(gameRef.current),
    name: 'garbageChargeDelay',
    error: false,
    focus: false,
  });

  const [chargePieces, setChargePieces] = useState({
    value: getChargePieces(gameRef.current),
    name: 'garbageChargePieces',
    error: false,
    focus: false,
  });

  const [cap, setCap] = useState({
    value: getCap(gameRef.current),
    name: 'garbageCap',
    error: false,
    focus: false,
  });

  const [cheesiness, setCheesiness] = useState({
    value: getCheesiness(gameRef.current),
    name: 'garbageCheesiness',
    error: false,
    focus: false,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (newSeedReset.value !== getNewSeedOnReset(game)) {
        set(setNewSeedReset, getNewSeedOnReset(game));
      }
      if (seed.value !== getSeed(game)) {
        set(setSeed, getSeed(game));
      }
      if (comboBlock.value !== getComboBlock(game)) {
        set(setComboBlock, getComboBlock(game));
      }
      if (spawn.value !== getSpawn(game)) {
        set(setSpawn, getSpawn(game));
      }
      if (charge.value !== getCharge(game)) {
        set(setCharge, getCharge(game));
      }
      if (chargeDelay.value !== getChargeDelay(game)) {
        set(setChargeDelay, getChargeDelay(game));
      }
      if (chargePieces.value !== getChargePieces(game)) {
        set(setChargePieces, getChargePieces(game));
      }
      if (cap.value !== getCap(game)) {
        set(setCap, getCap(game));
      }
      if (cheesiness.value !== getCheesiness(game)) {
        set(setCheesiness, getCheesiness(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [
    gameRef,
    pubSubRef,
    show,
    newSeedReset,
    seed,
    comboBlock,
    spawn,
    charge,
    chargeDelay,
    chargePieces,
    cap,
    cheesiness,
  ]);

  return (
    <>
      <CustomCheckbox
        id="garbage-menu-new-seed"
        labelText="New seed on reset"
        name={newSeedReset.name}
        checked={newSeedReset.value}
        onToggle={() => toggle(setNewSeedReset, gameRef, modifyConfig.garbage)}
      />
      <LabelInput
        id="garbage-menu-seed"
        labelText="Seed"
        hasError={seed.error}
        name={seed.name}
        ariaLabel="Garbage seed"
        onFocus={() => focus(setSeed)}
        onBlur={(e) =>
          blurSeed(
            setSeed,
            gameRef,
            modifyConfig.garbage,
            getSeed(gameRef.current),
            e.target.value,
            c.GARBAGE_SEED_LENGTH
          )
        }
        onChange={(e) =>
          changeSeed(setSeed, e.target.value, c.GARBAGE_SEED_LENGTH)
        }
        value={seed.value}
        maxLength={32}
      />
      <CustomCheckbox
        id="garbage-menu-combo-block"
        labelText="Combo Blocking"
        name={comboBlock.name}
        checked={comboBlock.value}
        onToggle={() => toggle(setComboBlock, gameRef, modifyConfig.garbage)}
      />
      <label htmlFor="garbage-menu-spawn">Garbage Spawn</label>
      <select
        className="--global-hover-focus-active-border"
        name={spawn.name}
        id="garbage-menu-spawn"
        value={spawn.value}
        onChange={(e) =>
          changeUpdate(setSpawn, gameRef, modifyConfig.garbage, e.target.value)
        }
      >
        {c.GARBAGE_SPAWN_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {str.capitalize(option)}
          </option>
        ))}
      </select>
      <label htmlFor="garbage-menu-charge">Garbage Charge</label>
      <select
        className="--global-hover-focus-active-border"
        name={charge.name}
        id="garbage-menu-charge"
        value={charge.value}
        onChange={(e) =>
          changeUpdate(setCharge, gameRef, modifyConfig.garbage, e.target.value)
        }
      >
        {c.GARBAGE_CHARGE_OPTIONS.map((option) => (
          <option key={option} value={option}>
            {str.capitalize(option)}
          </option>
        ))}
      </select>
      {charge.value === 'delay' && (
        <LabelInput
          id="garbage-menu-charge-delay"
          labelText="Garbage Charge Delay"
          hasError={chargeDelay.error}
          name={chargeDelay.name}
          ariaLabel="Garbage charge delay"
          onFocus={() => focus(setChargeDelay)}
          onBlur={(e) =>
            blur(
              setChargeDelay,
              getChargeDelay(gameRef.current),
              e.target.value,
              true,
              true
            )
          }
          onChange={(e) =>
            changeUpdate(
              setChargeDelay,
              gameRef,
              modifyConfig.garbage,
              e.target.value,
              false,
              true,
              true
            )
          }
          value={chargeDelay.value}
        />
      )}
      {charge.value === 'piece' && (
        <LabelInput
          id="garbage-menu-charge-pieces"
          labelText="Garbage Charge Pieces"
          hasError={chargePieces.error}
          name={chargePieces.name}
          ariaLabel="Garbage charge pieces"
          onFocus={() => focus(setChargePieces)}
          onBlur={(e) =>
            blur(
              setChargePieces,
              getChargePieces(gameRef.current),
              e.target.value,
              true,
              true
            )
          }
          onChange={(e) =>
            changeUpdate(
              setChargePieces,
              gameRef,
              modifyConfig.garbage,
              e.target.value,
              false,
              true,
              true
            )
          }
          value={chargePieces.value}
        />
      )}
      <LabelInput
        id="garbage-menu-cap"
        labelText="Garbage Cap"
        hasError={cap.error}
        name={cap.name}
        ariaLabel="Garbage cap"
        onFocus={() => focus(setCap)}
        onBlur={(e) =>
          blur(setCap, getCap(gameRef.current), e.target.value, true, true)
        }
        onChange={(e) =>
          changeUpdate(
            setCap,
            gameRef,
            modifyConfig.garbage,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={cap.value}
      />
      <LabelInput
        id="garbage-menu-cheesiness"
        labelText="Garbage Cheesiness"
        hasError={cheesiness.error}
        name={cheesiness.name}
        ariaLabel="Garbage cheesiness"
        onFocus={() => focus(setCheesiness)}
        onBlur={(e) =>
          blur(
            setCheesiness,
            getCheesiness(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setCheesiness,
            gameRef,
            modifyConfig.garbage,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={cheesiness.value}
      />
    </>
  );
}

function GarbageModeMenu({ gameRef, show, pubSubRef }) {
  const getAPS = (game) => !!game.config.garbageModeAPS;
  const getAPSAttack = (game) => game.config.garbageModeAPSAttack;
  const getAPSSecond = (game) => game.config.garbageModeAPSSecond;

  const [APS, setAPS] = useState({
    value: getAPS(gameRef.current),
    name: 'garbageModeAPS',
  });
  const [APSAttack, setAPSAttack] = useState({
    value: getAPSAttack(gameRef.current),
    name: 'garbageModeAPSAttack',
    error: false,
    focus: false,
  });
  const [APSSecond, setAPSSecond] = useState({
    value: getAPSSecond(gameRef.current),
    name: 'garbageModeAPSSecond',
    error: false,
    focus: false,
  });

  useEffect(() => {
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (APS.value !== getAPS(game)) {
        set(setAPS, getAPS(game));
      }
      if (APSAttack.value !== getAPSAttack(game)) {
        set(setAPSAttack, getAPSAttack(game));
      }
      if (APSSecond.value !== getAPSSecond(game)) {
        set(setAPSSecond, getAPSSecond(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [gameRef, pubSubRef, show, APS, APSAttack, APSSecond]);

  return (
    <>
      <CustomCheckbox
        id="garbage-mode-menu-enable-APS"
        labelText="Attack Per Second (APS)"
        name={APS.name}
        checked={APS.value}
        onToggle={() => toggle(setAPS, gameRef, modifyConfig.garbage)}
      />
      <LabelInput
        id="garbage-mode-menu-APS-attack"
        labelText="Attack"
        hasError={APSAttack.error}
        name={APSAttack.name}
        ariaLabel="Garbage APS"
        onFocus={() => focus(setAPSAttack)}
        onBlur={(e) =>
          blur(
            setAPSAttack,
            getAPSAttack(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setAPSAttack,
            gameRef,
            modifyConfig.garbage,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={APSAttack.value}
      />
      <LabelInput
        id="garbage-mode-menu-APS-second"
        labelText="Seconds"
        hasError={APSSecond.error}
        name={APSSecond.name}
        ariaLabel="Garbage APS"
        onFocus={() => focus(setAPSSecond)}
        onBlur={(e) =>
          blur(
            setAPSSecond,
            getAPSSecond(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setAPSSecond,
            gameRef,
            modifyConfig.garbage,
            e.target.value,
            false,
            true,
            true
          )
        }
        value={APSSecond.value}
      />
    </>
  );
}

function InitialStateMenu({ gameRef, show, pubSubRef }) {
  const getEnableUndo = (game) => !!game.config.enableUndo;
  const getInitialGrid = (game) => formatGrid(game.config.boardInitialGrid);
  const getNthPC = (game) =>
    game.config.queueNthPC < 2 ? '' : game.config.queueNthPC;
  const getInitialHold = (game) => game.config.queueInitialHold.toUpperCase();
  const getInitialPieces = (game) =>
    game.config.queueInitialPieces.toUpperCase();
  const getLimitSize = (game) =>
    game.config.queueLimitSize === 0 ? '' : game.config.queueLimitSize;

  const [enableUndo, setEnableUndo] = useState({
    value: getEnableUndo(gameRef.current),
    name: 'enableUndo',
  });

  const [initialGrid, setInitialGrid] = useState({
    value: getInitialGrid(gameRef.current),
    name: 'boardInitialGrid',
    error: false,
    focus: false,
  });

  const [nthPC, setnthPC] = useState({
    value: getNthPC(gameRef.current),
    name: 'queueNthPC',
    error: false,
    focus: false,
  });

  const [initialHold, setInitialHold] = useState({
    value: getInitialHold(gameRef.current),
    name: 'queueInitialHold',
    error: false,
    focus: false,
  });

  const [initialPieces, setInitialPieces] = useState({
    value: getInitialPieces(gameRef.current),
    name: 'queueInitialPieces',
    error: false,
    focus: false,
  });

  const [limitSize, setLimitSize] = useState({
    value: getLimitSize(gameRef.current),
    name: 'queueLimitSize',
    error: false,
    focus: false,
  });

  const [showInteractiveGrid, setShowInteractiveGrid] = useState(false);

  useEffect(() => {
    // Don't update when menu is hidden
    if (!show) {
      return;
    }

    const setAll = (game) => {
      if (enableUndo.value !== getEnableUndo(game)) {
        set(setEnableUndo, getEnableUndo(game));
      }
      if (initialGrid.value !== getInitialGrid(game)) {
        set(setInitialGrid, getInitialGrid(game));
      }
      if (limitSize.value !== getLimitSize(game)) {
        set(setLimitSize, getLimitSize(game));
      }
      if (nthPC.value !== getNthPC(game)) {
        set(setnthPC, getNthPC(game));
      }
      if (initialHold.value !== getInitialHold(game)) {
        set(setInitialHold, getInitialHold(game));
      }
      if (initialPieces.value !== getInitialPieces(game)) {
        set(setInitialPieces, getInitialPieces(game));
      }
    };
    setAll(gameRef.current);

    const handleUpdate = () => setAll(gameRef.current);
    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [
    gameRef,
    pubSubRef,
    show,
    enableUndo,
    initialGrid,
    limitSize,
    nthPC,
    initialHold,
    initialPieces,
  ]);

  return (
    <>
      {showInteractiveGrid && (
        <InteractiveGrid
          initialGrid={parseGrid(initialGrid.value)}
          onClose={() => setShowInteractiveGrid(false)}
          onSubmit={(value) => {
            changeUpdate(
              setInitialGrid,
              gameRef,
              modifyConfig.board,
              value,
              true,
              false,
              false,
              true
            );
          }}
        />
      )}
      <CustomCheckbox
        id="initial-menu-enable-undo"
        labelText="Enable Undo"
        name={enableUndo.name}
        checked={enableUndo.value}
        onToggle={() => toggle(setEnableUndo, gameRef, modifyConfig.config)}
      />
      <div className="menu-row">
        <label htmlFor="initial-menu-initial-grid">Initial Grid</label>
        <button onClick={() => setShowInteractiveGrid(!showInteractiveGrid)}>
          <GridSVG />
        </button>
      </div>
      <textarea
        className={'--global-no-spinner' + (initialGrid.error ? ' error' : '')}
        type="text"
        name={initialGrid.name}
        id="initial-menu-initial-grid"
        aria-label="Initial grid"
        spellCheck={false}
        rows={initialGrid.value ? initialGrid.value.split('\n').length : 1}
        onFocus={() => focus(setInitialGrid)}
        onBlur={(e) =>
          blur(
            setInitialGrid,
            getInitialGrid(gameRef.current),
            parseGrid(e.target.value),
            false,
            false
          )
        }
        onChange={(e) =>
          changeUpdate(
            setInitialGrid,
            gameRef,
            modifyConfig.board,
            e.target.value,
            true,
            false,
            false,
            true
          )
        }
        value={initialGrid.value}
      ></textarea>
      <LabelInput
        id="initial-menu-nth-pc"
        labelText="PC Bag"
        hasError={nthPC.error}
        name={nthPC.name}
        ariaLabel="PC bag"
        onFocus={() => focus(setnthPC)}
        onBlur={(e) =>
          blur(setnthPC, getNthPC(gameRef.current), e.target.value, true)
        }
        onChange={(e) =>
          changeUpdate(
            setnthPC,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            false,
            true
          )
        }
        value={nthPC.value}
        maxLength={1}
      />
      <LabelInput
        id="initial-menu-initial-hold"
        labelText="Initial Hold"
        hasError={initialHold.error}
        name={initialHold.name}
        ariaLabel="Initial hold"
        onFocus={() => focus(setInitialHold)}
        onBlur={(e) =>
          blur(setInitialHold, getInitialHold(gameRef.current), e.target.value)
        }
        onChange={(e) =>
          changeUpdate(
            setInitialHold,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          )
        }
        value={initialHold.value}
        maxLength={1}
      />
      <LabelInput
        id="initial-menu-initial-pieces"
        labelText="Initial Pieces"
        hasError={initialPieces.error}
        name={initialPieces.name}
        ariaLabel="Initial pieces"
        onFocus={() => focus(setInitialPieces)}
        onBlur={(e) =>
          blur(
            setInitialPieces,
            getInitialPieces(gameRef.current),
            e.target.value
          )
        }
        onChange={(e) =>
          changeUpdate(
            setInitialPieces,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          )
        }
        value={initialPieces.value}
      />
      <LabelInput
        id="initial-menu-limit-size"
        labelText="Limit Queue Size"
        hasError={limitSize.error}
        name={limitSize.name}
        ariaLabel="Limit queue size"
        onFocus={() => focus(setLimitSize)}
        onBlur={(e) =>
          blur(
            setLimitSize,
            getLimitSize(gameRef.current),
            e.target.value,
            true
          )
        }
        onChange={(e) =>
          changeUpdate(
            setLimitSize,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            false,
            true
          )
        }
        value={limitSize.value}
      />
    </>
  );
}

function InteractiveGrid({ initialGrid, onClose, onSubmit }) {
  const boardInitialGrid = validate.boardInitialGrid(initialGrid)
    ? initialGrid
    : '';
  const [game, setGame] = useState(newGame({ boardInitialGrid }));
  const [fillRow, setFillRow] = useState(false);

  const toggleHighlight = () =>
    setGame((game) => controller.toggleHighlight(game, performance.now()));
  const toggleAutoColor = () =>
    setGame((game) => controller.toggleAutoColor(game, performance.now()));
  const setFillType = (type) =>
    setGame((game) => controller.setFillType(game, type, performance.now()));

  // Reorder so garbage type is first
  const fillTypes = [
    ...c.FILL_TYPES.filter((type) => type === 'g'),
    ...c.FILL_TYPES.filter((type) => type !== 'g'),
  ];

  useEffect(() => {
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const onSetGame = (update) => {
    setGame((game) => {
      const updatedGame = update(game);
      // Prevent fill on piece spawn
      if (validate.boardInitialGrid(parseGridArr(updatedGame.board.grid))) {
        return updatedGame;
      }
      return game;
    });
  };

  return createPortal(
    <div className="menu-overlay-container">
      <button className="close" onClick={onClose}>
        <CloseSVG />
      </button>
      <div className="menu-overlay">
        <GameGrid game={game} setGame={onSetGame} fillRow={fillRow} />
        <form
          className="game-settings-menu-form game-settings-interactive-grid"
          action="#"
          onSubmit={(ev) => ev.preventDefault()}
        >
          <CustomCheckbox
            id="interactive-grid-fill-row"
            labelText="Edit mode"
            name="fill-row"
            checked={fillRow}
            onToggle={(e) => setFillRow(e.target.checked)}
            onText="Row"
            offText="Cell"
          />
          <CustomCheckbox
            id="interactive-grid-highlight"
            labelText="Highlight cell"
            name="highlight"
            checked={game.highlight}
            onToggle={(e) => toggleHighlight(e.target.checked)}
          />
          <CustomCheckbox
            id="interactive-grid-autoColor"
            labelText="Auto color"
            name="autoColor"
            checked={game.autoColor}
            onToggle={(e) => toggleAutoColor(e.target.checked)}
          />
          <div id="interactive-grid-fill-type">
            <p className="title">Fill Type</p>
            <div className="options">
              {fillTypes.map((type) => (
                <button
                  className={
                    `fill-type ${type}` +
                    (game.fillType === type ? ' active' : '')
                  }
                  key={type}
                  onClick={() => setFillType(type)}
                ></button>
              ))}
            </div>
          </div>
          <button
            className="--global-button submit"
            onClick={() => {
              onSubmit(parseGridArr(game.board.grid));
              onClose();
            }}
          >
            Apply
          </button>
        </form>
      </div>
    </div>,
    document.body
  );
}

function GameSettingsMenuForm({ gameRef, pubSubRef, show }) {
  const [activeMenu, setActiveMenu] = useState('configuration');

  return (
    <div className="game-settings-menu-form-container">
      <form
        className="game-settings-menu-form"
        action="#"
        onSubmit={(ev) => ev.preventDefault()}
      >
        <label className="title" htmlFor="game-settings-options">
          Game Settings
        </label>
        <select
          name="game-settings-options"
          id="game-settings-options"
          className="--global-hover-focus-active-border main"
          value={activeMenu}
          onChange={(ev) => setActiveMenu(ev.target.value)}
        >
          <option value="configuration">Configuration</option>
          <option value="gravity">Gravity</option>
          <option value="queue">Queue</option>
          <option value="garbage">Garbage</option>
          <option value="garbage-mode">Garbage Modes</option>
          <option value="initial-state">Initial State</option>
        </select>
        {activeMenu === 'configuration' && (
          <ConfigurationMenu
            gameRef={gameRef}
            show={show}
            pubSubRef={pubSubRef}
          />
        )}
        {activeMenu === 'gravity' && (
          <GravityMenu gameRef={gameRef} show={show} pubSubRef={pubSubRef} />
        )}
        {activeMenu === 'queue' && (
          <QueueMenu gameRef={gameRef} show={show} pubSubRef={pubSubRef} />
        )}
        {activeMenu === 'garbage' && (
          <GarbageMenu gameRef={gameRef} show={show} pubSubRef={pubSubRef} />
        )}
        {activeMenu === 'garbage-mode' && (
          <GarbageModeMenu
            gameRef={gameRef}
            show={show}
            pubSubRef={pubSubRef}
          />
        )}
        {activeMenu === 'initial-state' && (
          <InitialStateMenu
            gameRef={gameRef}
            show={show}
            pubSubRef={pubSubRef}
          />
        )}
      </form>
    </div>
  );
}

export default GameSettingsMenuForm;
