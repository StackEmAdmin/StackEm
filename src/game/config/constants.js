// Grid Regular Expression Calculation
//   Token is exactly one of:
//     1: . (dot)
//     2: type
//     3. type + highlight type
//     4. highlight type + type
//     5. highlight type
//   Row is exactly 10 tokens (space delimited)

const types = '[oiljstzgOILJSTZG]';
const hTypes = `[hH]${types}`;
const token = `(?:\\.|${types}|${types}?${hTypes}|${hTypes}${types}?)`;
const row = `^(?:${token} ){9}${token}$`;
const ROW_REGEX = new RegExp(row);

const c = {
  // Game
  ROWS_TYPE: 'integer',
  ROWS_VALUE: 26,
  COLS_TYPE: 'integer',
  COLS_VALUE: 10,

  ENABLE_UNDO_TYPE: 'boolean',
  ENABLE_UNDO_DEFAULT: false,

  // Spin Detection System Settings
  SPINS_TYPE: 'string',
  SPINS_OPTIONS: [
    'tSpin',
    'allSpin',
    'allMini+',
    'allSpin+',
    'allMini',
    'none',
  ],
  SPINS_NAME: {
    tSpin: 'T-Spin',
    allSpin: 'All-Spin',
    'allMini+': 'All-Mini+',
    'allSpin+': 'All-Spin+',
    allMini: 'All-Mini',
    none: 'None',
  },
  SPINS_DEFAULT: 'tSpin',

  // Kick (Rotation System) Settings
  KICK_TYPE: 'string',
  KICK_OPTIONS: ['srsPlus'],
  KICK_NAME: {
    srsPlus: 'SRS+',
  },
  KICK_DEFAULT: 'srsPlus',

  // Attack System
  ATTACK_TYPE: 'string',
  ATTACK_OPTIONS: ['tsOne'],
  ATTACK_NAME: {
    tsOne: 'tsOne',
  },
  ATTACK_DEFAULT: 'tsOne',

  // Gravity Settings
  GRAVITY_TYPE: 'number',
  GRAVITY_MIN: 0,
  GRAVITY_MAX: 20,
  GRAVITY_DEFAULT: 0.016666666666666666,
  GRAVITY_LOCK_TYPE: 'number',
  GRAVITY_LOCK_MIN: -1,
  GRAVITY_LOCK_MAX: 200000,
  GRAVITY_LOCK_DEFAULT: 500,
  GRAVITY_LOCK_CAP_TYPE: 'number',
  GRAVITY_LOCK_CAP_MIN: 0,
  GRAVITY_LOCK_CAP_MAX: 200000,
  GRAVITY_LOCK_CAP_DEFAULT: 5000,
  GRAVITY_LOCK_PENALTY_TYPE: 'number',
  GRAVITY_LOCK_PENALTY_MIN: 0,
  GRAVITY_LOCK_PENALTY_MAX: 200000,
  GRAVITY_LOCK_PENALTY_DEFAULT: 1000,
  GRAVITY_ACC_TYPE: 'number',
  GRAVITY_ACC_MIN: 0,
  GRAVITY_ACC_MAX: 20,
  GRAVITY_ACC_DEFAULT: 0,
  GRAVITY_ACC_DELAY_TYPE: 'number',
  GRAVITY_ACC_DELAY_MIN: 0,
  GRAVITY_ACC_DELAY_MAX: 3600000,
  GRAVITY_ACC_DELAY_DEFAULT: 0,

  // Queue Settings, seed is 32 char hex string
  QUEUE_SEED_TYPE: 'string',
  QUEUE_SEED_REGEX: /^[a-fA-F0-9]{32}$/,
  QUEUE_SEED_LENGTH: 32,
  QUEUE_NEW_SEED_ON_RESET_TYPE: 'boolean',
  QUEUE_NEW_SEED_ON_RESET_DEFAULT: true,
  QUEUE_HOLD_ENABLED_TYPE: 'boolean',
  QUEUE_HOLD_ENABLED_DEFAULT: true,
  QUEUE_LIMIT_SIZE_TYPE: 'integer',
  QUEUE_LIMIT_SIZE_MIN: 0,
  QUEUE_LIMIT_SIZE_MAX: 2000,
  QUEUE_LIMIT_SIZE_DEFAULT: 0,
  QUEUE_INITIAL_HOLD_TYPE: 'string',
  QUEUE_INITIAL_HOLD_REGEX: /^([oiljstzOILJSTZ])?$/,
  QUEUE_INITIAL_HOLD_DEFAULT: '',
  QUEUE_INITIAL_PIECES_TYPE: 'string',
  QUEUE_INITIAL_PIECES_REGEX: /^[oiljstzOILJSTZ]{0,2000}$/,
  QUEUE_INITIAL_PIECES_DEFAULT: '',
  QUEUE_NTH_PC_TYPE: 'integer',
  QUEUE_NTH_PC_MIN: 0,
  QUEUE_NTH_PC_MAX: 7,
  QUEUE_NTH_PC_DEFAULT: 1,
  QUEUE_HOLD_TYPE: 'string',
  QUEUE_HOLD_REGEX: /^([oiljstzOILJSTZ])?$/,
  QUEUE_NEXT_TYPE: 'string',
  QUEUE_NEXT_REGEX: /^[oiljstzOILJSTZ]*$/,

  // Garbage Settings, seed is 32 char hex string
  GARBAGE_SEED_TYPE: 'string',
  GARBAGE_SEED_REGEX: /^[a-fA-F0-9]{32}$/,
  GARBAGE_SEED_LENGTH: 32,
  GARBAGE_NEW_SEED_ON_RESET_TYPE: 'boolean',
  GARBAGE_NEW_SEED_ON_RESET_DEFAULT: true,
  GARBAGE_COMBO_BLOCK_TYPE: 'boolean',
  GARBAGE_COMBO_BLOCK_DEFAULT: true,
  GARBAGE_SPAWN_TYPE: 'string',
  GARBAGE_SPAWN_OPTIONS: ['drop', 'instant'],
  GARBAGE_SPAWN_DEFAULT: 'drop',
  GARBAGE_CHARGE_TYPE: 'string',
  GARBAGE_CHARGE_OPTIONS: ['delay', 'piece'],
  GARBAGE_CHARGE_DEFAULT: 'delay',
  GARBAGE_CHARGE_DELAY_TYPE: 'number',
  GARBAGE_CHARGE_DELAY_MIN: 0,
  GARBAGE_CHARGE_DELAY_MAX: 60000,
  GARBAGE_CHARGE_DELAY_DEFAULT: 500,
  GARBAGE_CHARGE_PIECES_TYPE: 'integer',
  GARBAGE_CHARGE_PIECES_MIN: 0,
  GARBAGE_CHARGE_PIECES_MAX: 49, // 7 bags
  GARBAGE_CHARGE_PIECES_DEFAULT: 1,
  GARBAGE_CAP_TYPE: 'integer',
  GARBAGE_CAP_MIN: 1,
  GARBAGE_CAP_MAX: 50,
  GARBAGE_CAP_DEFAULT: 8,
  GARBAGE_CHEESINESS_TYPE: 'number',
  GARBAGE_CHEESINESS_MIN: 0,
  GARBAGE_CHEESINESS_MAX: 1,
  GARBAGE_CHEESINESS_DEFAULT: 1,

  // Garbage Modes
  GARBAGE_MODE_APS_TYPE: 'boolean',
  GARBAGE_MODE_APS_DEFAULT: false,
  GARBAGE_MODE_APS_ATTACK_TYPE: 'integer',
  GARBAGE_MODE_APS_ATTACK_MIN: 0,
  GARBAGE_MODE_APS_ATTACK_MAX: 50,
  GARBAGE_MODE_APS_ATTACK_DEFAULT: 0,
  GARBAGE_MODE_APS_SECOND_TYPE: 'number',
  GARBAGE_MODE_APS_SECOND_MIN: 0.1,
  GARBAGE_MODE_APS_SECOND_MAX: 3600,
  GARBAGE_MODE_APS_SECOND_DEFAULT: 1,

  // Board Settings
  BOARD_INITIAL_GRID_TYPE: 'string',
  BOARD_INITIAL_GRID_ROW_REGEX: ROW_REGEX,
  BOARD_INITIAL_GRID_MAX_ROWS: 52,
  // Piece spawn coords
  BOARD_INITIAL_GRID_ILLEGAL_COORDS: [
    [21, 3],
    [21, 4],
    [21, 5],
    [21, 6],
    [22, 3],
    [22, 4],
    [22, 5],
  ],
  BOARD_INITIAL_GRID_DEFAULT: '',

  // Objectives
  OBJECTIVES_TYPE: 'array',
  OBJECTIVES_MAX_LENGTH: 10,
  OBJECTIVE_TYPE_TYPE: 'string',
  OBJECTIVE_TYPE_OPTIONS: [
    'attack',
    'lines',
    'maxCombo',
    'maxB2B',
    'linesCancelled',
    'linesSurvived',
    'allClears',
    'spins',
    'minis',
  ],
  OBJECTIVE_QUANTIFIER_TYPE: 'string',
  OBJECTIVE_QUANTIFIER_OPTIONS: ['atLeast', 'exact', 'atMost'],
  OBJECTIVE_AMOUNT_TYPE: 'integer',
  OBJECTIVE_AMOUNT_MIN: 0,
  OBJECTIVE_AMOUNT_MAX: 9999,
  OBJECTIVE_PIECE_TYPE: 'string',
  OBJECTIVE_PIECE_OPTIONS: ['all', 'o', 'i', 'l', 'j', 's', 't', 'z'],
  OBJECTIVE_LINES_TYPE: ['string', 'integer'],
  OBJECTIVE_LINES_OPTIONS: ['any', 1, 2, 3],

  FILL_TYPES: ['o', 'i', 'l', 'j', 's', 't', 'z', 'g'],
};

export default c;
