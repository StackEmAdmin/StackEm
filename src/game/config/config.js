import c from './constants.js';

function validRange(val, min, max) {
  return val >= min && val <= max;
}

function validType(val, type) {
  if (type === 'integer') {
    return Number.isInteger(val);
  }

  return typeof val === type;
}

function validSpins(val) {
  return typeof val === c.SPINS_TYPE && c.SPINS_OPTIONS.includes(val);
}

function validGravity(val) {
  return (
    typeof val === c.GRAVITY_TYPE &&
    validRange(val, c.GRAVITY_MIN, c.GRAVITY_MAX)
  );
}

function validGravityLock(val) {
  return (
    typeof val === c.GRAVITY_LOCK_TYPE &&
    validRange(val, c.GRAVITY_LOCK_MIN, c.GRAVITY_LOCK_MAX)
  );
}

function validGravityLockCap(val) {
  return (
    typeof val === c.GRAVITY_LOCK_CAP_TYPE &&
    validRange(val, c.GRAVITY_LOCK_CAP_MIN, c.GRAVITY_LOCK_CAP_MAX)
  );
}

function validGravityLockPenalty(val) {
  return (
    typeof val === c.GRAVITY_LOCK_PENALTY_TYPE &&
    validRange(val, c.GRAVITY_LOCK_PENALTY_MIN, c.GRAVITY_LOCK_PENALTY_MAX)
  );
}

function validGravityAcc(val) {
  return (
    typeof val === c.GRAVITY_ACC_TYPE &&
    validRange(val, c.GRAVITY_ACC_MIN, c.GRAVITY_ACC_MAX)
  );
}

function validGravityAccDelay(val) {
  return (
    typeof val === c.GRAVITY_ACC_DELAY_TYPE &&
    validRange(val, c.GRAVITY_ACC_DELAY_MIN, c.GRAVITY_ACC_DELAY_MAX)
  );
}

function validQueueSeed(val) {
  return typeof val === c.QUEUE_SEED_TYPE && c.QUEUE_SEED_REGEX.test(val);
}

function validQueueHoldEnabled(val) {
  return typeof val === c.QUEUE_HOLD_ENABLED_TYPE;
}

function validQueueLimitSize(val) {
  return (
    validType(val, c.QUEUE_LIMIT_SIZE_TYPE) &&
    validRange(val, c.QUEUE_LIMIT_SIZE_MIN, c.QUEUE_LIMIT_SIZE_MAX)
  );
}

function validQueueInitialHold(val) {
  return (
    typeof val === c.QUEUE_INITIAL_HOLD_TYPE &&
    c.QUEUE_INITIAL_HOLD_REGEX.test(val)
  );
}

function validQueueInitialPieces(val) {
  return (
    typeof val === c.QUEUE_INITIAL_PIECES_TYPE &&
    c.QUEUE_INITIAL_PIECES_REGEX.test(val)
  );
}

function validQueueNthPC(val) {
  return (
    validType(val, c.QUEUE_NTH_PC_TYPE) &&
    validRange(val, c.QUEUE_NTH_PC_MIN, c.QUEUE_NTH_PC_MAX)
  );
}

function validQueueHold(val) {
  return typeof val === c.QUEUE_HOLD_TYPE && c.QUEUE_HOLD_REGEX.test(val);
}

function validQueueNext(val) {
  return typeof val === c.QUEUE_NEXT_TYPE && c.QUEUE_NEXT_REGEX.test(val);
}

function validGarbageSeed(val) {
  return typeof val === c.GARBAGE_SEED_TYPE && c.GARBAGE_SEED_REGEX.test(val);
}

function validGarbageSpawn(val) {
  return (
    typeof val === c.GARBAGE_SPAWN_TYPE && c.GARBAGE_SPAWN_OPTIONS.includes(val)
  );
}

function validGarbageCharge(val) {
  return (
    typeof val === c.GARBAGE_CHARGE_TYPE &&
    c.GARBAGE_CHARGE_OPTIONS.includes(val)
  );
}

function validGarbageChargeDelay(val) {
  return (
    typeof val === c.GARBAGE_CHARGE_DELAY_TYPE &&
    validRange(val, c.GARBAGE_CHARGE_DELAY_MIN, c.GARBAGE_CHARGE_DELAY_MAX)
  );
}

function validGarbageChargePieces(val) {
  return (
    validType(val, c.GARBAGE_CHARGE_PIECES_TYPE) &&
    validRange(val, c.GARBAGE_CHARGE_PIECES_MIN, c.GARBAGE_CHARGE_PIECES_MAX)
  );
}

function validGarbageCap(val) {
  return (
    validType(val, c.GARBAGE_CAP_TYPE) &&
    validRange(val, c.GARBAGE_CAP_MIN, c.GARBAGE_CAP_MAX)
  );
}

function validGarbageCheesiness(val) {
  return (
    typeof val === c.GARBAGE_CHEESINESS_TYPE &&
    validRange(val, c.GARBAGE_CHEESINESS_MIN, c.GARBAGE_CHEESINESS_MAX)
  );
}

function validGarbageModeAPSAttack(val) {
  return (
    validType(val, c.GARBAGE_MODE_APS_ATTACK_TYPE) &&
    validRange(
      val,
      c.GARBAGE_MODE_APS_ATTACK_MIN,
      c.GARBAGE_MODE_APS_ATTACK_MAX
    )
  );
}

function validGarbageModeAPSSecond(val) {
  return (
    typeof val === c.GARBAGE_MODE_APS_SECOND_TYPE &&
    validRange(
      val,
      c.GARBAGE_MODE_APS_SECOND_MIN,
      c.GARBAGE_MODE_APS_SECOND_MAX
    )
  );
}

function validBoardInitialGrid(val) {
  if (typeof val !== c.BOARD_INITIAL_GRID_TYPE) {
    return false;
  }

  if (val === '') {
    return true;
  }

  // Split on new line and check every row
  const rows = val.split(/\r?\n/);
  if (rows.length > c.BOARD_INITIAL_GRID_MAX_ROWS) {
    return false;
  }

  for (const row of rows) {
    if (row.split(/\s+/).length !== c.COLS_VALUE) {
      return false;
    }

    if (!c.BOARD_INITIAL_GRID_ROW_REGEX.test(row)) {
      return false;
    }
  }

  // Validate that piece can spawn
  if (rows.length < 22) {
    return true;
  }
  // Returns non-highlight fill type
  const getType = (str) => {
    if (str.length === 0 || str.length === 2 || str === '.') {
      return '';
    }
    return str[0] === 'h' ? str[2] : str[0];
  };
  const grid = rows.reverse().map((row) => row.split(/\s+/));
  const legal = c.BOARD_INITIAL_GRID_ILLEGAL_COORDS.every((coord) => {
    const [row, col] = coord;
    if (grid.length <= row) {
      return true;
    }
    return getType(grid[row][col]) === '';
  });

  return legal;
}

const validate = {
  spins: validSpins,
  gravity: validGravity,
  gravityLock: validGravityLock,
  gravityLockCap: validGravityLockCap,
  gravityLockPenalty: validGravityLockPenalty,
  gravityAcc: validGravityAcc,
  gravityAccDelay: validGravityAccDelay,
  queueSeed: validQueueSeed,
  queueHoldEnabled: validQueueHoldEnabled,
  queueLimitSize: validQueueLimitSize,
  queueInitialHold: validQueueInitialHold,
  queueInitialPieces: validQueueInitialPieces,
  queueNthPC: validQueueNthPC,
  queueHold: validQueueHold,
  queueNext: validQueueNext,
  garbageSeed: validGarbageSeed,
  garbageSpawn: validGarbageSpawn,
  garbageCharge: validGarbageCharge,
  garbageChargeDelay: validGarbageChargeDelay,
  garbageChargePieces: validGarbageChargePieces,
  garbageCap: validGarbageCap,
  garbageCheesiness: validGarbageCheesiness,
  garbageModeAPSAttack: validGarbageModeAPSAttack,
  garbageModeAPSSecond: validGarbageModeAPSSecond,
  boardInitialGrid: validBoardInitialGrid,
};

const defaults = {
  spins: c.SPINS_DEFAULT,
  gravity: c.GRAVITY_DEFAULT,
  gravityLock: c.GRAVITY_LOCK_DEFAULT,
  gravityLockCap: c.GRAVITY_LOCK_CAP_DEFAULT,
  gravityLockPenalty: c.GRAVITY_LOCK_PENALTY_DEFAULT,
  gravityAcc: c.GRAVITY_ACC_DEFAULT,
  gravityAccDelay: c.GRAVITY_ACC_DELAY_DEFAULT,
  queueHoldEnabled: c.QUEUE_HOLD_ENABLED_DEFAULT,
  queueLimitSize: c.QUEUE_LIMIT_SIZE_DEFAULT,
  queueInitialHold: c.QUEUE_INITIAL_HOLD_DEFAULT,
  queueInitialPieces: c.QUEUE_INITIAL_PIECES_DEFAULT,
  queueNthPC: c.QUEUE_NTH_PC_DEFAULT,
  garbageSpawn: c.GARBAGE_SPAWN_DEFAULT,
  garbageCharge: c.GARBAGE_CHARGE_DEFAULT,
  garbageChargeDelay: c.GARBAGE_CHARGE_DELAY_DEFAULT,
  garbageChargePieces: c.GARBAGE_CHARGE_PIECES_DEFAULT,
  garbageCap: c.GARBAGE_CAP_DEFAULT,
  garbageCheesiness: c.GARBAGE_CHEESINESS_DEFAULT,
  garbageModeAPSAttack: c.GARBAGE_MODE_APS_ATTACK_DEFAULT,
  garbageModeAPSSecond: c.GARBAGE_MODE_APS_SECOND_DEFAULT,
  boardInitialGrid: c.BOARD_INITIAL_GRID_DEFAULT,
};

export { validate as default, defaults };
