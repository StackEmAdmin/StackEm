import { useState, useEffect } from 'react';
import validate from '../../game/config/config';
import c from '../../game/config/constants';
import { modifyConfig } from '../../game/game';
import str from '../../util/str';

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
  valueSkipEmpty = false
) {
  setState((state) => {
    if (state.value === value) {
      return state;
    }

    if (valueSkipEmpty && value === '') {
      return { ...state, value: value };
    }

    const val = valueToLower
      ? value.toLowerCase()
      : valueToNumber
      ? Number(value)
      : value;

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

function ConfigurationMenu({ gameRef, game }) {
  const getSpin = (game) => game.config.spins;

  const [spins, setSpins] = useState({
    value: getSpin(gameRef.current),
    name: 'spins',
    error: false,
  });

  useEffect(() => {
    set(setSpins, getSpin(gameRef.current));
  }, [gameRef, game]);

  return (
    <>
      <label htmlFor="kick-option">Rotation System</label>
      <select
        className="--global-hover-focus-active-border"
        name="kick-option"
        id="kick-option"
      >
        <option value="srsPlus">SRS+</option>
      </select>
      <label htmlFor="spins-option">Spin Detection</label>
      <select
        className="--global-hover-focus-active-border"
        name="spins-option"
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
        name="attack-option"
        id="attack-option"
      >
        <option value="tsOne">TS One</option>
      </select>
    </>
  );
}

function GravityMenu({ gameRef, game }) {
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
    set(setGravity, getGravity(gameRef.current));
    set(setLock, getLock(gameRef.current));
    set(setLockCap, getLockCap(gameRef.current));
    set(setLockPenalty, getLockPenalty(gameRef.current));
    set(setAcceleration, getAcceleration(gameRef.current));
    set(setAccelerationDelay, getAccelerationDelay(gameRef.current));
  }, [gameRef, game]);

  return (
    <>
      <label htmlFor="gravity-menu-gravity">Gravity</label>
      <input
        className={'--global-no-spinner' + (gravity.error ? ' error' : '')}
        type="text"
        name="gravity"
        id="gravity-menu-gravity"
        aria-label="Gravity"
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
      <label htmlFor="gravity-menu-lock">Lock</label>
      <input
        className={'--global-no-spinner' + (lock.error ? ' error' : '')}
        type="text"
        name="lock"
        id="gravity-menu-lock"
        aria-label="Gravity lock"
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
      <label htmlFor="gravity-menu-lock-cap">Lock Cap</label>
      <input
        className={'--global-no-spinner' + (lockCap.error ? ' error' : '')}
        type="text"
        name="lock-cap"
        id="gravity-menu-lock-cap"
        aria-label="Gravity lock cap"
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
      <label htmlFor="gravity-menu-lock-penalty">Lock Penalty</label>
      <input
        className={'--global-no-spinner' + (lockPenalty.error ? ' error' : '')}
        type="text"
        name="lock-penalty"
        id="gravity-menu-lock-penalty"
        aria-label="Gravity lock penalty"
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
      <label htmlFor="gravity-menu-gravity-acc">Acceleration</label>
      <input
        className={'--global-no-spinner' + (acceleration.error ? ' error' : '')}
        type="text"
        name="gravity-acc"
        id="gravity-menu-gravity-acc"
        aria-label="Gravity"
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
      <label htmlFor="gravity-menu-gravity-delay">Acceleration Delay</label>
      <input
        className={
          '--global-no-spinner' + (accelerationDelay.error ? ' error' : '')
        }
        type="text"
        name="gravity-delay"
        id="gravity-menu-gravity-delay"
        aria-label="Gravity"
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

function QueueMenu({ gameRef, game }) {
  const getNewSeedOnReset = (game) => !!game.config.queueNewSeedOnReset;
  const getSeed = (game) => game.config.queueSeed.toUpperCase();
  const getHoldEnabled = (game) => !!game.config.queueHoldEnabled;
  const getLimitSize = (game) =>
    game.config.queueLimitSize === 0 ? '' : game.config.queueLimitSize;
  const getInitialHold = (game) => game.config.queueInitialHold.toUpperCase();
  const getInitialPieces = (game) =>
    game.config.queueInitialPieces.toUpperCase();
  const getNthPC = (game) =>
    game.config.queueNthPC < 2 ? '' : game.config.queueNthPC;
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

  const [limitSize, setLimitSize] = useState({
    value: getLimitSize(gameRef.current),
    name: 'queueLimitSize',
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
    set(setNewSeedReset, getNewSeedOnReset(gameRef.current));
    set(setHoldEnabled, getHoldEnabled(gameRef.current));
    set(setLimitSize, getLimitSize(gameRef.current));
    set(setnthPC, getNthPC(gameRef.current));
    set(setInitialHold, getInitialHold(gameRef.current));
    set(setInitialPieces, getInitialPieces(gameRef.current));
    set(setSeed, getSeed(gameRef.current));
    set(setHold, getHold(gameRef.current));
    set(setNext, getNext(gameRef.current));
  }, [gameRef, game]);

  return (
    <>
      <label className="custom-checkbox" htmlFor="queue-menu-new-seed">
        New seed on reset
        <input
          className="toggle"
          type="checkbox"
          name="queue-new-seed"
          id="queue-menu-new-seed"
          checked={newSeedReset.value}
          onChange={() => toggle(setNewSeedReset, gameRef, modifyConfig.queue)}
        />
        <span
          className="toggle-button"
          data-tg-off="Off"
          data-tg-on="On"
        ></span>
      </label>
      <label htmlFor="queue-menu-seed">Seed</label>
      <input
        className={'--global-no-spinner' + (seed.error ? ' error' : '')}
        type="text"
        maxLength={32}
        name="seed"
        id="queue-menu-seed"
        aria-label="Queue seed"
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
      />
      <label className="custom-checkbox" htmlFor="queue-menu-hold-enabled">
        Allow Hold
        <input
          className="toggle"
          type="checkbox"
          name="queue-hold-enabled"
          id="queue-menu-hold-enabled"
          checked={holdEnabled.value}
          onChange={() => toggle(setHoldEnabled, gameRef, modifyConfig.queue)}
        />
        <span
          className="toggle-button"
          data-tg-off="Off"
          data-tg-on="On"
        ></span>
      </label>
      <label htmlFor="queue-menu-hold">Hold Piece</label>
      <input
        className={'--global-no-spinner' + (hold.error ? ' error' : '')}
        type="text"
        maxLength={1}
        name="queue-hold"
        id="gravity-menu-gravity"
        aria-label="Hold piece"
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
      />
      <label htmlFor="queue-menu-next">Next Pieces</label>
      <input
        className={'--global-no-spinner' + (next.error ? ' error' : '')}
        type="text"
        name="queue-next"
        id="queue-menu-next"
        aria-label="Next pieces"
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
      <label htmlFor="queue-menu-nth-pc">PC Bag</label>
      <input
        className={'--global-no-spinner' + (nthPC.error ? ' error' : '')}
        type="text"
        name="queue-nth-pc"
        id="queue-menu-nth-pc"
        aria-label="PC bag"
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
      />
      <label htmlFor="queue-menu-initial-hold">Initial Hold</label>
      <input
        className={'--global-no-spinner' + (initialHold.error ? ' error' : '')}
        type="text"
        maxLength={1}
        name="queue-initial-hold"
        id="queue-menu-initial-hold"
        aria-label="Initial hold"
        onFocus={() => focus(setInitialHold)}
        onBlur={(e) =>
          blur(setInitialHold, getInitialHold(gameRef.current), e.target.value)
        }
        onChange={(e) => {
          changeUpdate(
            setInitialHold,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          );
        }}
        value={initialHold.value}
      />
      <label htmlFor="queue-menu-initial-pieces">Initial Pieces</label>
      <input
        className={
          '--global-no-spinner' + (initialPieces.error ? ' error' : '')
        }
        type="text"
        name="queue-initial-pieces"
        id="queue-menu-initial-pieces"
        aria-label="Initial pieces"
        onFocus={() => focus(setInitialPieces)}
        onBlur={(e) =>
          blur(
            setInitialPieces,
            getInitialPieces(gameRef.current),
            e.target.value
          )
        }
        onChange={(e) => {
          changeUpdate(
            setInitialPieces,
            gameRef,
            modifyConfig.queue,
            e.target.value,
            true
          );
        }}
        value={initialPieces.value}
      />
      <label htmlFor="queue-menu-limit-size">Limit Queue Size</label>
      <input
        className={'--global-no-spinner' + (limitSize.error ? ' error' : '')}
        type="text"
        name="queue-limit-size"
        id="queue-menu-limit-size"
        aria-label="Limit queue size"
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

function GarbageMenu({ gameRef, game }) {
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
    set(setNewSeedReset, getNewSeedOnReset(gameRef.current));
    set(setSeed, getSeed(gameRef.current));
    set(setComboBlock, getComboBlock(gameRef.current));
    set(setSpawn, getSpawn(gameRef.current));
    set(setCharge, getCharge(gameRef.current));
    set(setChargeDelay, getChargeDelay(gameRef.current));
    set(setChargePieces, getChargePieces(gameRef.current));
    set(setCap, getCap(gameRef.current));
    set(setCheesiness, getCheesiness(gameRef.current));
  }, [gameRef, game]);

  return (
    <>
      <label className="custom-checkbox" htmlFor="garbage-menu-new-seed">
        New seed on reset
        <input
          className="toggle"
          type="checkbox"
          name="garbage-new-seed"
          id="garbage-menu-new-seed"
          checked={newSeedReset.value}
          onChange={() =>
            toggle(setNewSeedReset, gameRef, modifyConfig.garbage)
          }
        />
        <span
          className="toggle-button"
          data-tg-off="Off"
          data-tg-on="On"
        ></span>
      </label>
      <label htmlFor="garbage-menu-seed">Seed</label>
      <input
        className={'--global-no-spinner' + (seed.error ? ' error' : '')}
        type="text"
        maxLength={32}
        name="seed"
        id="garbage-menu-seed"
        aria-label="Garbage seed"
        value={seed.value}
        onFocus={() => focus(setSeed)}
        onChange={(e) =>
          changeSeed(setSeed, e.target.value, c.GARBAGE_SEED_LENGTH)
        }
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
      />
      <label className="custom-checkbox" htmlFor="garbage-menu-combo-block">
        Combo Blocking
        <input
          className="toggle"
          type="checkbox"
          name="garbage-combo-block"
          id="garbage-menu-combo-block"
          checked={comboBlock.value}
          onChange={() => toggle(setComboBlock, gameRef, modifyConfig.garbage)}
        />
        <span
          className="toggle-button"
          data-tg-off="Off"
          data-tg-on="On"
        ></span>
      </label>
      <label htmlFor="garbage-menu-spawn">Garbage Spawn</label>
      <select
        className="--global-hover-focus-active-border"
        name="garbage-spawn"
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
        name="garbage-charge"
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
        <label htmlFor="garbage-menu-charge-delay">Garbage Charge Delay</label>
      )}
      {charge.value === 'delay' && (
        <input
          className={
            '--global-no-spinner' + (chargeDelay.error ? ' error' : '')
          }
          type="text"
          name="garbage-charge"
          id="garbage-menu-charge-delay"
          aria-label="Garbage charge delay"
          value={chargeDelay.value}
          onFocus={() => focus(setChargeDelay)}
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
          onBlur={(e) =>
            blur(
              setChargeDelay,
              getChargeDelay(gameRef.current),
              e.target.value,
              true,
              true
            )
          }
        />
      )}
      {charge.value === 'piece' && (
        <label htmlFor="garbage-menu-charge-pieces">
          Garbage Charge Pieces
        </label>
      )}
      {charge.value === 'piece' && (
        <input
          className={
            `--global-no-spinner` + (chargePieces.error ? ' error' : '')
          }
          type="text"
          name="garbage-charge-pieces"
          id="garbage-menu-charge-pieces"
          aria-label="Garbage charge pieces"
          value={chargePieces.value}
          onFocus={() => focus(setChargePieces)}
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
          onBlur={(e) =>
            blur(
              setChargePieces,
              getChargePieces(gameRef.current),
              e.target.value,
              true,
              true
            )
          }
        />
      )}
      <label htmlFor="garbage-menu-cap">Garbage Cap</label>
      <input
        className={'--global-no-spinner' + (cap.error ? ' error' : '')}
        type="text"
        name="garbage-cap"
        id="garbage-menu-cap"
        aria-label="Garbage cap"
        value={cap.value}
        onFocus={() => focus(setCap)}
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
        onBlur={(e) =>
          blur(setCap, getCap(gameRef.current), e.target.value, true, true)
        }
      />
      <label htmlFor="garbage-menu-cheese">Garbage Cheesiness</label>
      <input
        className={'--global-no-spinner' + (cheesiness.error ? ' error' : '')}
        type="text"
        name="garbage-cheese"
        id="garbage-menu-cheese"
        aria-label="Garbage cheesiness"
        value={cheesiness.value}
        onFocus={() => focus(setCheesiness)}
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
        onBlur={(e) =>
          blur(
            setCheesiness,
            getCheesiness(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
      />
    </>
  );
}

function GarbageModeMenu({ gameRef, game }) {
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
    set(setAPS, getAPS(gameRef.current));
    set(setAPSAttack, getAPSAttack(gameRef.current));
    set(setAPSSecond, getAPSSecond(gameRef.current));
  }, [gameRef, game]);

  return (
    <>
      <label className="custom-checkbox" htmlFor="garbage-mode-menu-enable-APS">
        Attack Per Second (APS)
        <input
          className="toggle"
          type="checkbox"
          name="garbage-mode-menu-enable-APS"
          id="garbage-mode-menu-enable-APS"
          checked={APS.value}
          onChange={() => toggle(setAPS, gameRef, modifyConfig.garbage)}
        />
        <span
          className="toggle-button"
          data-tg-off="Off"
          data-tg-on="On"
        ></span>
      </label>
      <label htmlFor="garbage-mode-menu-APS-attack">Attack</label>
      <input
        className={'--global-no-spinner' + (APSAttack.error ? ' error' : '')}
        type="text"
        name="garbage-APS-attack"
        id="garbage-mode-menu-APS"
        aria-label="Garbage APS"
        value={APSAttack.value}
        onFocus={() => focus(setAPSAttack)}
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
        onBlur={(e) =>
          blur(
            setAPSAttack,
            getAPSAttack(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
      />
      <label htmlFor="garbage-mode-menu-APS-second">Seconds</label>
      <input
        className={'--global-no-spinner' + (APSSecond.error ? ' error' : '')}
        type="text"
        name="garbage-APS-second"
        id="garbage-mode-menu-APS-second"
        aria-label="Garbage APS"
        value={APSSecond.value}
        onFocus={() => focus(setAPSSecond)}
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
        onBlur={(e) =>
          blur(
            setAPSSecond,
            getAPSSecond(gameRef.current),
            e.target.value,
            true,
            true
          )
        }
      />
    </>
  );
}

function GameSettingsMenuForm({ gameRef, pubSubRef, show }) {
  const [activeMenu, setActiveMenu] = useState('configuration');
  const [game, setGame] = useState(gameRef.current);

  useEffect(() => {
    const pubSub = pubSubRef.current;
    const handleUpdate = (newState) => show && setGame(newState);
    pubSub.subscribe(handleUpdate);
    return () => pubSub.unsubscribe(handleUpdate);
  }, [pubSubRef, show]);

  useEffect(() => {
    show && setGame(gameRef.current);
  }, [gameRef, show]);

  return (
    <div className="game-settings-menu-form-container">
      <form
        id="game-settings-menu-form"
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
        </select>
        {activeMenu === 'configuration' && (
          <ConfigurationMenu gameRef={gameRef} game={game} />
        )}
        {activeMenu === 'gravity' && (
          <GravityMenu gameRef={gameRef} game={game} />
        )}
        {activeMenu === 'queue' && <QueueMenu gameRef={gameRef} game={game} />}
        {activeMenu === 'garbage' && (
          <GarbageMenu gameRef={gameRef} game={game} />
        )}
        {activeMenu === 'garbage-mode' && (
          <GarbageModeMenu gameRef={gameRef} game={game} />
        )}
      </form>
    </div>
  );
}

export default GameSettingsMenuForm;
