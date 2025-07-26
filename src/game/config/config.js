import c from './constants.js';

function validRange(val, min, max) {
  return val >= min && val <= max;
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

function validGarbageChargeDelay(val) {
  return (
    typeof val === c.GARBAGE_CHARGE_DELAY_TYPE &&
    validRange(val, c.GARBAGE_CHARGE_DELAY_MIN, c.GARBAGE_CHARGE_DELAY_MAX)
  );
}

function validGarbageCap(val) {
  return (
    typeof val === c.GARBAGE_CAP_TYPE &&
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
    typeof val === c.GARBAGE_MODE_APS_ATTACK_TYPE &&
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

const validate = {
  gravity: validGravity,
  gravityLock: validGravityLock,
  gravityLockCap: validGravityLockCap,
  gravityLockPenalty: validGravityLockPenalty,
  gravityAcc: validGravityAcc,
  gravityAccDelay: validGravityAccDelay,
  queueSeed: validQueueSeed,
  queueHold: validQueueHold,
  queueNext: validQueueNext,
  garbageSeed: validGarbageSeed,
  garbageSpawn: validGarbageSpawn,
  garbageChargeDelay: validGarbageChargeDelay,
  garbageCap: validGarbageCap,
  garbageCheesiness: validGarbageCheesiness,
  garbageModeAPSAttack: validGarbageModeAPSAttack,
  garbageModeAPSSecond: validGarbageModeAPSSecond,
};

const defaults = {
  gravity: c.GRAVITY_DEFAULT,
  gravityLock: c.GRAVITY_LOCK_DEFAULT,
  gravityLockCap: c.GRAVITY_LOCK_CAP_DEFAULT,
  gravityLockPenalty: c.GRAVITY_LOCK_PENALTY_DEFAULT,
  gravityAcc: c.GRAVITY_ACC_DEFAULT,
  gravityAccDelay: c.GRAVITY_ACC_DELAY_DEFAULT,
  garbageSpawn: c.GARBAGE_SPAWN_DEFAULT,
  garbageChargeDelay: c.GARBAGE_CHARGE_DELAY_DEFAULT,
  garbageCap: c.GARBAGE_CAP_DEFAULT,
  garbageCheesiness: c.GARBAGE_CHEESINESS_DEFAULT,
};

export { validate as default, defaults };
