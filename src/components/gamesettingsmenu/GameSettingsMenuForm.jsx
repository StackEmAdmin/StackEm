import { useState, useEffect } from 'react';
import validate from '../../game/config/config';
import c from '../../game/config/constants';
import { modifyConfig } from '../../game/game';
import str from '../../util/str';

import './GameSettingsMenuForm.css';

function ConfigurationMenu() {
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
      <label htmlFor="spin-option">Spin Detection</label>
      <select
        className="--global-hover-focus-active-border"
        name="spin-option"
        id="spin-option"
      >
        <option value="tSpin">T-Spin</option>
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

  const onChange = (val, setState) => {
    setState((state) => {
      // On valid value make change in game immediate
      if (val !== '' && validate[state.name](Number(val))) {
        gameRef.current = modifyConfig.gravity(
          gameRef.current,
          state.name,
          Number(val),
          performance.now()
        );
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val };
    });
  };

  const onBlur = (val, setState, getGameVal) => {
    // Show error on blur
    setState((state) => {
      // Current value for empty string
      if (val === '') {
        return {
          ...state,
          value: getGameVal(gameRef.current),
          error: false,
          focus: false,
        };
      }

      if (!validate[state.name](Number(val))) {
        return { ...state, error: true, focus: false };
      }
      return { ...state, error: false, focus: false };
    });
  };

  useEffect(() => {
    const setValIfBlurred = (state, val) => {
      // Don't change value when user is typing
      if (state.focus || state.error) {
        return state;
      }
      return { ...state, value: val, error: false };
    };

    setGravity((state) => setValIfBlurred(state, getGravity(gameRef.current)));
    setLock((state) => setValIfBlurred(state, getLock(gameRef.current)));
    setLockCap((state) => setValIfBlurred(state, getLockCap(gameRef.current)));
    setLockPenalty((state) =>
      setValIfBlurred(state, getLockPenalty(gameRef.current))
    );
    setAcceleration((state) =>
      setValIfBlurred(state, getAcceleration(gameRef.current))
    );
    setAccelerationDelay((state) =>
      setValIfBlurred(state, getAccelerationDelay(gameRef.current))
    );
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
        onFocus={() => setGravity((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlur(e.target.value, setGravity, getGravity)}
        onChange={(e) => onChange(e.target.value, setGravity)}
        value={gravity.value}
      />
      <label htmlFor="gravity-menu-lock">Lock</label>
      <input
        className={'--global-no-spinner' + (lock.error ? ' error' : '')}
        type="text"
        name="lock"
        id="gravity-menu-lock"
        aria-label="Gravity lock"
        onFocus={() => setLock((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlur(e.target.value, setLock, getLock)}
        onChange={(e) => onChange(e.target.value, setLock)}
        value={lock.value}
      />
      <label htmlFor="gravity-menu-lock-cap">Lock Cap</label>
      <input
        className={'--global-no-spinner' + (lockCap.error ? ' error' : '')}
        type="text"
        name="lock-cap"
        id="gravity-menu-lock-cap"
        aria-label="Gravity lock cap"
        onFocus={() => setLockCap((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlur(e.target.value, setLockCap, getLockCap)}
        onChange={(e) => onChange(e.target.value, setLockCap)}
        value={lockCap.value}
      />
      <label htmlFor="gravity-menu-lock-penalty">Lock Penalty</label>
      <input
        className={'--global-no-spinner' + (lockPenalty.error ? ' error' : '')}
        type="text"
        name="lock-penalty"
        id="gravity-menu-lock-penalty"
        aria-label="Gravity lock penalty"
        onFocus={() => setLockPenalty((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlur(e.target.value, setLockPenalty, getLockPenalty)}
        onChange={(e) => onChange(e.target.value, setLockPenalty)}
        value={lockPenalty.value}
      />
      <label htmlFor="gravity-menu-gravity-acc">Acceleration</label>
      <input
        className={'--global-no-spinner' + (acceleration.error ? ' error' : '')}
        type="text"
        name="gravity-acc"
        id="gravity-menu-gravity-acc"
        aria-label="Gravity"
        onFocus={() => setAcceleration((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlur(e.target.value, setAcceleration, getAcceleration)}
        onChange={(e) => onChange(e.target.value, setAcceleration)}
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
        onFocus={() =>
          setAccelerationDelay((state) => ({ ...state, focus: true }))
        }
        onBlur={(e) =>
          onBlur(e.target.value, setAccelerationDelay, getAccelerationDelay)
        }
        onChange={(e) => onChange(e.target.value, setAccelerationDelay)}
        value={accelerationDelay.value}
      />
    </>
  );
}

function QueueMenu({ gameRef, game }) {
  const getNewSeedOnReset = (game) => !!game.config.queueNewSeedOnReset;
  const getSeed = (game) => game.config.queueSeed.toUpperCase();
  const getHold = (game) => {
    if (game.queue.hold.type) {
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
    const setValIfBlurred = (state, val) => {
      if (state.focus || state.error) {
        return state;
      }
      return { ...state, value: val, error: false };
    };

    setNewSeedReset((state) => setValIfBlurred(state, getNewSeedOnReset(game)));
    setSeed((state) => setValIfBlurred(state, getSeed(game)));
    setHold((state) => setValIfBlurred(state, getHold(game)));
    setNext((state) => setValIfBlurred(state, getNext(game)));
  }, [gameRef, game]);

  const toggleNewSeedOnReset = (newSeedReset) => {
    newSeedReset((state) => {
      gameRef.current = modifyConfig.queue(
        gameRef.current,
        state.name,
        !state.value,
        performance.now()
      );
      return { ...state, value: !state.value };
    });
  };

  const onChangeSeed = (val, setSeed) => {
    setSeed((state) => {
      const paddedVal = val.padStart(c.QUEUE_SEED_LENGTH, '0');
      if (val !== '' && validate[state.name](paddedVal)) {
        // Update seed on blur
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val };
    });
  };

  const onBlurSeed = (val, setSeed) => {
    setSeed((state) => {
      // Show current seed on empty input
      if (val === '') {
        return {
          ...state,
          value: getSeed(gameRef.current),
          error: false,
          focus: false,
        };
      }

      const paddedVal = val.padStart(c.QUEUE_SEED_LENGTH, '0');
      if (validate[state.name](paddedVal)) {
        gameRef.current = modifyConfig.queue(
          gameRef.current,
          state.name,
          paddedVal.toLowerCase(),
          performance.now()
        );
        return {
          ...state,
          value: paddedVal.toUpperCase(),
          error: false,
          focus: false,
        };
      }

      return { ...state, error: true, focus: false };
    });
  };

  const onChange = (val, setState) => {
    setState((state) => {
      // On queue piece change make change immediate
      if (validate[state.name](val)) {
        gameRef.current = modifyConfig.queue(
          gameRef.current,
          state.name,
          val.toLowerCase(),
          performance.now()
        );
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val };
    });
  };

  const onBlurHold = (val, setState) => {
    setState((state) => {
      if (validate[state.name](val)) {
        return {
          ...state,
          value: val.toUpperCase(),
          error: false,
          focus: false,
        };
      }
      return { ...state, error: true, focus: false };
    });
  };

  const onBlurNext = (val, setNext) => {
    setNext((state) => {
      if (val === '') {
        return {
          ...state,
          value: getNext(gameRef.current),
          error: false,
          focus: false,
        };
      }

      if (validate[state.name](val)) {
        return {
          ...state,
          value: getNext(gameRef.current),
          error: false,
          focus: false,
        };
      }

      return { ...state, error: true, focus: false };
    });
  };

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
          onChange={() => toggleNewSeedOnReset(setNewSeedReset)}
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
        onFocus={() => setSeed((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlurSeed(e.target.value, setSeed)}
        onChange={(e) => onChangeSeed(e.target.value, setSeed)}
        value={seed.value}
      />
      <label htmlFor="queue-menu-hold">Hold Piece</label>
      <input
        className={'--global-no-spinner' + (hold.error ? ' error' : '')}
        type="text"
        maxLength={1}
        name="queue-hold"
        id="gravity-menu-gravity"
        aria-label="Hold piece"
        onFocus={() => setHold((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlurHold(e.target.value, setHold)}
        onChange={(e) => onChange(e.target.value, setHold)}
        value={hold.value}
      />
      <label htmlFor="queue-menu-next">Next Pieces</label>
      <input
        className={'--global-no-spinner' + (next.error ? ' error' : '')}
        type="text"
        name="queue-next"
        id="queue-menu-next"
        aria-label="Next pieces"
        onFocus={() => setNext((state) => ({ ...state, focus: true }))}
        onBlur={(e) => onBlurNext(e.target.value, setNext)}
        onChange={(e) => onChange(e.target.value, setNext)}
        value={next.value}
      />
    </>
  );
}

function GarbageMenu({ gameRef, game }) {
  const getNewSeedOnReset = (game) => !!game.config.garbageNewSeedOnReset;
  const getSeed = (game) => game.config.garbageSeed.toUpperCase();
  const getComboBlock = (game) => !!game.config.garbageComboBlock;
  const getGarbageSpawn = (game) => game.config.garbageSpawn;
  const getGarbageCharge = (game) => game.config.garbageCharge;
  const getGarbageChargeDelay = (game) => game.config.garbageChargeDelay;
  const getGarbageChargePieces = (game) => game.config.garbageChargePieces;
  const getGarbageCap = (game) => game.config.garbageCap;
  const getGarbageCheesiness = (game) => game.config.garbageCheesiness;

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
    value: getGarbageSpawn(gameRef.current),
    name: 'garbageSpawn',
    error: false,
  });

  const [charge, setCharge] = useState({
    value: getGarbageCharge(gameRef.current),
    name: 'garbageCharge',
    error: false,
  });

  const [chargeDelay, setChargeDelay] = useState({
    value: getGarbageChargeDelay(gameRef.current),
    name: 'garbageChargeDelay',
    error: false,
    focus: false,
  });

  const [chargePieces, setChargePieces] = useState({
    value: getGarbageChargePieces(gameRef.current),
    name: 'garbageChargePieces',
    error: false,
    focus: false,
  });

  const [cap, setCap] = useState({
    value: getGarbageCap(gameRef.current),
    name: 'garbageCap',
    error: false,
    focus: false,
  });

  const [cheesiness, setCheesiness] = useState({
    value: getGarbageCheesiness(gameRef.current),
    name: 'garbageCheesiness',
    error: false,
    focus: false,
  });

  useEffect(() => {
    const setValIfBlurred = (state, val) => {
      // Don't change value when user is typing or on error
      if (state.focus || state.error) {
        return state;
      }
      return { ...state, value: val, error: false };
    };

    setNewSeedReset((state) =>
      setValIfBlurred(state, getNewSeedOnReset(gameRef.current))
    );
    setSeed((state) => setValIfBlurred(state, getSeed(gameRef.current)));
    setComboBlock((state) =>
      setValIfBlurred(state, getComboBlock(gameRef.current))
    );
    setSpawn((state) =>
      setValIfBlurred(state, getGarbageSpawn(gameRef.current))
    );
    setCharge((state) =>
      setValIfBlurred(state, getGarbageCharge(gameRef.current))
    );
    setChargeDelay((state) =>
      setValIfBlurred(state, getGarbageChargeDelay(gameRef.current))
    );
    setChargePieces((state) =>
      setValIfBlurred(state, getGarbageChargePieces(gameRef.current))
    );
    setCap((state) => setValIfBlurred(state, getGarbageCap(gameRef.current)));
    setCheesiness((state) =>
      setValIfBlurred(state, getGarbageCheesiness(gameRef.current))
    );
  }, [gameRef, game]);

  const toggleGarbageOption = (setToggleOption) => {
    setToggleOption((state) => {
      gameRef.current = modifyConfig.garbage(
        gameRef.current,
        state.name,
        !state.value,
        performance.now()
      );
      return { ...state, value: !state.value };
    });
  };

  const onChangeSeed = (val, setSeed) => {
    setSeed((state) => {
      const paddedVal = val.padStart(c.GARBAGE_SEED_LENGTH, '0');
      if (val !== '' && validate[state.name](paddedVal)) {
        // Update seed in game on blur
        return { ...state, value: val, error: false };
      }
      return { ...state, value: val };
    });
  };

  const onBlurSeed = (val, setSeed) => {
    setSeed((state) => {
      // Show current seed on empty input
      if (val === '') {
        return {
          ...state,
          value: getSeed(gameRef.current),
          error: false,
          focus: false,
        };
      }

      const paddedVal = val.padStart(c.GARBAGE_SEED_LENGTH, '0');
      if (validate[state.name](paddedVal)) {
        gameRef.current = modifyConfig.garbage(
          gameRef.current,
          state.name,
          paddedVal.toLowerCase(),
          performance.now()
        );
        return {
          ...state,
          value: paddedVal.toUpperCase(),
          error: false,
          focus: false,
        };
      }

      return { ...state, error: true, focus: false };
    });
  };

  const onChangeGarbageSpawn = (val, setState) => {
    setState((state) => {
      if (val !== '' && validate[state.name](val)) {
        gameRef.current = modifyConfig.garbage(
          gameRef.current,
          state.name,
          val,
          performance.now()
        );
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val, error: true };
    });
  };

  const onChangeGarbageCharge = (val, setState) => {
    setState((state) => {
      if (val !== '' && validate[state.name](val)) {
        gameRef.current = modifyConfig.garbage(
          gameRef.current,
          state.name,
          val,
          performance.now()
        );
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val, error: true };
    });
  };

  const onChange = (val, setState) => {
    setState((state) => {
      // Save (game) state on blur
      if (val !== '' && validate[state.name](Number(val))) {
        return { ...state, value: val, error: false };
      }

      return { ...state, value: val };
    });
  };

  const onBlur = (val, setState, getGameVal) => {
    // Show error on blur
    setState((state) => {
      // Current value for empty string
      if (val === '') {
        return {
          ...state,
          value: getGameVal(gameRef.current),
          error: false,
          focus: false,
        };
      }

      if (!validate[state.name](Number(val))) {
        return { ...state, error: true, focus: false };
      }

      gameRef.current = modifyConfig.garbage(
        gameRef.current,
        state.name,
        Number(val),
        performance.now()
      );
      return { ...state, value: val, error: false, focus: false };
    });
  };

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
          onChange={() => toggleGarbageOption(setNewSeedReset)}
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
        onFocus={() => setSeed((state) => ({ ...state, focus: true }))}
        onChange={(e) => onChangeSeed(e.target.value, setSeed)}
        onBlur={(e) => onBlurSeed(e.target.value, setSeed)}
      />
      <label className="custom-checkbox" htmlFor="garbage-menu-combo-block">
        Combo Blocking
        <input
          className="toggle"
          type="checkbox"
          name="garbage-combo-block"
          id="garbage-menu-combo-block"
          checked={comboBlock.value}
          onChange={() => toggleGarbageOption(setComboBlock)}
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
        onChange={(e) => onChangeGarbageSpawn(e.target.value, setSpawn)}
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
        onChange={(e) => onChangeGarbageCharge(e.target.value, setCharge)}
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
          onFocus={() => setChargeDelay((state) => ({ ...state, focus: true }))}
          onChange={(e) => onChange(e.target.value, setChargeDelay)}
          onBlur={(e) =>
            onBlur(e.target.value, setChargeDelay, getGarbageChargeDelay)
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
          onFocus={() =>
            setChargePieces((state) => ({ ...state, focus: true }))
          }
          onChange={(e) => onChange(e.target.value, setChargePieces)}
          onBlur={(e) =>
            onBlur(e.target.value, setChargePieces, getGarbageChargePieces)
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
        onFocus={() => setCap((state) => ({ ...state, focus: true }))}
        onChange={(e) => onChange(e.target.value, setCap)}
        onBlur={(e) => onBlur(e.target.value, setCap, getGarbageCap)}
      />
      <label htmlFor="garbage-menu-cheese">Garbage Cheesiness</label>
      <input
        className={'--global-no-spinner' + (cheesiness.error ? ' error' : '')}
        type="text"
        name="garbage-cheese"
        id="garbage-menu-cheese"
        aria-label="Garbage cheesiness"
        value={cheesiness.value}
        onFocus={() => setCheesiness((state) => ({ ...state, focus: true }))}
        onChange={(e) => onChange(e.target.value, setCheesiness)}
        onBlur={(e) =>
          onBlur(e.target.value, setCheesiness, getGarbageCheesiness)
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
    const setValIfBlurred = (state, val) => {
      // Don't change value when user is typing
      if (state.focus || state.error) {
        return state;
      }
      return { ...state, value: val, error: false };
    };
    setAPS((state) => setValIfBlurred(state, getAPS(gameRef.current)));
    setAPSAttack((state) =>
      setValIfBlurred(state, getAPSAttack(gameRef.current))
    );
    setAPSSecond((state) =>
      setValIfBlurred(state, getAPSSecond(gameRef.current))
    );
  }, [gameRef, game]);

  const toggleGarbageOption = (setOption) => {
    setOption((state) => {
      gameRef.current = modifyConfig.garbage(
        gameRef.current,
        state.name,
        !state.value,
        performance.now()
      );
      return { ...state, value: !state.value };
    });
  };

  const onChange = (value, setOption) => {
    setOption((state) => {
      if (value !== '' && validate[state.name](Number(value))) {
        gameRef.current = modifyConfig.garbage(
          gameRef.current,
          state.name,
          Number(value),
          performance.now()
        );
        return { ...state, value, error: false };
      }

      return { ...state, value };
    });
  };

  const onBlur = (value, setOption, getValue) => {
    setOption((state) => {
      // Show current value
      if (value === '') {
        return {
          ...state,
          value: getValue(gameRef.current),
          error: false,
          focus: false,
        };
      }

      if (validate[state.name](Number(value))) {
        return { ...state, value, error: false, focus: false };
      }
      return { ...state, value, error: true, focus: false };
    });
  };

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
          onChange={() => toggleGarbageOption(setAPS)}
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
        onFocus={() => setAPSAttack((state) => ({ ...state, focus: true }))}
        onChange={(e) => onChange(e.target.value, setAPSAttack)}
        onBlur={(e) => onBlur(e.target.value, setAPSAttack, getAPSAttack)}
      />
      <label htmlFor="garbage-mode-menu-APS-second">Seconds</label>
      <input
        className={'--global-no-spinner' + (APSSecond.error ? ' error' : '')}
        type="text"
        name="garbage-APS-second"
        id="garbage-mode-menu-APS-second"
        aria-label="Garbage APS"
        value={APSSecond.value}
        onFocus={() => setAPSSecond((state) => ({ ...state, focus: true }))}
        onChange={(e) => onChange(e.target.value, setAPSSecond)}
        onBlur={(e) => onBlur(e.target.value, setAPSSecond, getAPSSecond)}
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
