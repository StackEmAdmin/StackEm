import { describe, it, expect } from 'vitest';
import tsOne from '../src/game/features/rules/attack/tsone';

const B2B0 = [
  [
    [],
    [],
    [1],
    [1],
    [1],
    [1],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [3],
    [3],
    [3],
    [3],
    [3],
  ],
  [
    [1],
    [1],
    [1],
    [1],
    [2],
    [2],
    [2],
    [2],
    [3],
    [3],
    [3],
    [3],
    [4],
    [4],
    [4],
    [4],
    [5],
    [5],
    [5],
    [5],
    [6],
  ],
  [
    [2],
    [2],
    [3],
    [3],
    [4],
    [4],
    [5],
    [5],
    [6],
    [6],
    [7],
    [7],
    [8],
    [8],
    [9],
    [9],
    [10],
    [10],
    [11],
    [11],
    [12],
  ],
  [
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [20],
    [21],
    [22],
    [23],
    [24],
  ],
];

const B2B0Spin = [
  [
    [2],
    [2],
    [3],
    [3],
    [4],
    [4],
    [5],
    [5],
    [6],
    [6],
    [7],
    [7],
    [8],
    [8],
    [9],
    [9],
    [10],
    [10],
    [11],
    [11],
    [12],
  ],
  [
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [20],
    [21],
    [22],
    [23],
    [24],
  ],
  [
    [6],
    [7],
    [9],
    [10],
    [12],
    [13],
    [15],
    [16],
    [18],
    [19],
    [21],
    [22],
    [24],
    [25],
    [27],
    [28],
    [30],
    [31],
    [33],
    [34],
    [36],
  ],
];

const B2B0Mini = [
  [
    [],
    [],
    [1],
    [1],
    [1],
    [1],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [2],
    [3],
    [3],
    [3],
    [3],
    [3],
  ],
  [
    [1],
    [1],
    [1],
    [1],
    [2],
    [2],
    [2],
    [2],
    [3],
    [3],
    [3],
    [3],
    [4],
    [4],
    [4],
    [4],
    [5],
    [5],
    [5],
    [5],
    [6],
  ],
];

describe('No clear attack', () => {
  it('should return empty array', () => {
    expect(tsOne.calculateAttacks(0, 0, 0, false, false, false)).toEqual([]);
    expect(tsOne.calculateAttacks(0, 7, 7, false, false, false)).toEqual([]);
    expect(tsOne.calculateAttacks(0, 0, 0, true, true, true)).toEqual([]);
    expect(tsOne.calculateAttacks(0, 7, 7, true, true, true)).toEqual([]);
    expect(tsOne.calculateAttacks(0, 0, 0, false, false, true)).toEqual([]);
  });
});

describe('ALL clear attack', () => {
  it('should return array with element 10 as last element', () => {
    expect(tsOne.calculateAttacks(1, 0, 0, false, false, true)).toEqual([10]);
    expect(tsOne.calculateAttacks(2, 0, 0, false, false, true)).toEqual([
      1, 10,
    ]);
    expect(tsOne.calculateAttacks(3, 0, 0, false, false, true)).toEqual([
      2, 10,
    ]);
    expect(tsOne.calculateAttacks(4, 0, 0, false, false, true)).toEqual([
      4, 10,
    ]);
  });
});

describe('B2B0', () => {
  for (let lines = 0; lines < B2B0.length; lines++) {
    for (let combo = 0; combo < B2B0[lines].length; combo++) {
      it(`Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B0[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 0, false, false)
        ).toEqual(B2B0[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B0Spin.length; lines++) {
    for (let combo = 0; combo < B2B0Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B0Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 0, true, false)
        ).toEqual(B2B0Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B0Mini.length; lines++) {
    for (let combo = 0; combo < B2B0Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B0Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 0, false, true)
        ).toEqual(B2B0Mini[lines][combo]);
      });
    }
  }
});

const B2B1Quad = [
  [5],
  [6],
  [7],
  [8],
  [10],
  [11],
  [12],
  [13],
  [15],
  [16],
  [17],
  [18],
  [20],
  [21],
  [22],
  [23],
  [25],
  [26],
  [27],
  [28],
  [30],
];

const B2B1Spin = [
  [
    [3],
    [3],
    [4],
    [5],
    [6],
    [6],
    [7],
    [8],
    [9],
    [9],
    [10],
    [11],
    [12],
    [12],
    [13],
    [14],
    [15],
    [15],
    [16],
    [17],
    [18],
  ],
  [
    [5],
    [6],
    [7],
    [8],
    [10],
    [11],
    [12],
    [13],
    [15],
    [16],
    [17],
    [18],
    [20],
    [21],
    [22],
    [23],
    [25],
    [26],
    [27],
    [28],
    [30],
  ],
  [
    [7],
    [8],
    [10],
    [12],
    [14],
    [15],
    [17],
    [19],
    [21],
    [22],
    [24],
    [26],
    [28],
    [29],
    [31],
    [33],
    [35],
    [36],
    [38],
    [40],
    [42],
  ],
];

const B2B1Mini = [
  [
    [1],
    [1],
    [1],
    [1],
    [2],
    [2],
    [2],
    [2],
    [3],
    [3],
    [3],
    [3],
    [4],
    [4],
    [4],
    [4],
    [5],
    [5],
    [5],
    [5],
    [6],
  ],
  [
    [2],
    [2],
    [3],
    [3],
    [4],
    [4],
    [5],
    [5],
    [6],
    [6],
    [7],
    [7],
    [8],
    [8],
    [9],
    [9],
    [10],
    [10],
    [11],
    [11],
    [12],
  ],
];

describe('B2B1', () => {
  for (let combo = 0; combo < B2B1Quad.length; combo++) {
    it(`Quad Combo: ${combo} to be ${B2B1Quad[combo]}`, () => {
      expect(tsOne.calculateAttacks(4, combo, 1, false, false)).toEqual(
        B2B1Quad[combo]
      );
    });
  }

  for (let lines = 0; lines < B2B1Spin.length; lines++) {
    for (let combo = 0; combo < B2B1Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B1Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 1, true, false)
        ).toEqual(B2B1Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B1Mini.length; lines++) {
    for (let combo = 0; combo < B2B1Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B1Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 1, false, true)
        ).toEqual(B2B1Mini[lines][combo]);
      });
    }
  }
});

const B2B2Quad = [
  [5],
  [7],
  [8],
  [9],
  [11],
  [12],
  [14],
  [15],
  [16],
  [18],
  [19],
  [21],
  [22],
  [24],
  [25],
  [26],
  [28],
  [29],
  [31],
  [32],
  [33],
];
const B2B2Spin = [
  [
    [3],
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [10],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [20],
    [20],
    [21],
  ],
  [
    [5],
    [7],
    [8],
    [9],
    [11],
    [12],
    [14],
    [15],
    [16],
    [18],
    [19],
    [21],
    [22],
    [24],
    [25],
    [26],
    [28],
    [29],
    [31],
    [32],
    [33],
  ],
  [
    [7],
    [9],
    [11],
    [13],
    [15],
    [17],
    [19],
    [21],
    [22],
    [24],
    [26],
    [28],
    [30],
    [32],
    [34],
    [36],
    [38],
    [40],
    [42],
    [43],
    [45],
  ],
];
const B2B2Mini = [
  [
    [1],
    [2],
    [2],
    [2],
    [3],
    [3],
    [4],
    [4],
    [4],
    [5],
    [5],
    [6],
    [6],
    [7],
    [7],
    [7],
    [8],
    [8],
    [9],
    [9],
    [9],
  ],
  [
    [2],
    [3],
    [3],
    [4],
    [5],
    [5],
    [6],
    [7],
    [7],
    [8],
    [9],
    [9],
    [10],
    [11],
    [11],
    [12],
    [13],
    [13],
    [14],
    [15],
    [15],
  ],
];

describe('B2B2', () => {
  for (let combo = 0; combo < B2B2Quad.length; combo++) {
    it(`Quad Combo: ${combo} to be ${B2B2Quad[combo]}`, () => {
      expect(tsOne.calculateAttacks(4, combo, 2, false, false)).toEqual(
        B2B2Quad[combo]
      );
    });
  }

  for (let lines = 0; lines < B2B2Spin.length; lines++) {
    for (let combo = 0; combo < B2B2Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B2Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 2, true, false)
        ).toEqual(B2B2Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B2Mini.length; lines++) {
    for (let combo = 0; combo < B2B2Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B2Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 2, false, true)
        ).toEqual(B2B2Mini[lines][combo]);
      });
    }
  }
});

const B2B3Quad = [
  [6],
  [8],
  [9],
  [11],
  [12],
  [14],
  [16],
  [17],
  [19],
  [20],
  [22],
  [24],
  [25],
  [27],
  [28],
  [30],
  [32],
  [33],
  [35],
  [36],
  [38],
];

const B2B3Spin = [
  [
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [20],
    [22],
    [23],
    [24],
    [25],
    [26],
  ],
  [
    [6],
    [8],
    [9],
    [11],
    [12],
    [14],
    [16],
    [17],
    [19],
    [20],
    [22],
    [24],
    [25],
    [27],
    [28],
    [30],
    [32],
    [33],
    [35],
    [36],
    [38],
  ],
  [
    [8],
    [10],
    [12],
    [14],
    [16],
    [18],
    [21],
    [23],
    [25],
    [27],
    [29],
    [31],
    [33],
    [35],
    [37],
    [39],
    [42],
    [44],
    [46],
    [48],
    [50],
  ],
];

const B2B3Mini = [
  [
    [2],
    [3],
    [3],
    [4],
    [4],
    [5],
    [6],
    [6],
    [7],
    [7],
    [8],
    [9],
    [9],
    [10],
    [10],
    [11],
    [12],
    [12],
    [13],
    [13],
    [14],
  ],
  [
    [3],
    [4],
    [5],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [17],
    [18],
    [19],
    [20],
  ],
];

describe('B2B3', () => {
  for (let combo = 0; combo < B2B3Quad.length; combo++) {
    it(`Quad Combo: ${combo} to be ${B2B3Quad[combo]}`, () => {
      expect(tsOne.calculateAttacks(4, combo, 3, false, false)).toEqual(
        B2B3Quad[combo]
      );
    });
  }

  for (let lines = 0; lines < B2B3Spin.length; lines++) {
    for (let combo = 0; combo < B2B3Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B3Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 3, true, false)
        ).toEqual(B2B3Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B3Mini.length; lines++) {
    for (let combo = 0; combo < B2B3Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B3Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 3, false, true)
        ).toEqual(B2B3Mini[lines][combo]);
      });
    }
  }
});

const B2B11Quad = [
  [7],
  [9],
  [11],
  [12],
  [14],
  [16],
  [18],
  [20],
  [22],
  [24],
  [25],
  [27],
  [29],
  [31],
  [33],
  [35],
  [37],
  [38],
  [40],
  [42],
  [44],
];

const B2B11Spin = [
  [
    [5],
    [6],
    [8],
    [9],
    [10],
    [12],
    [13],
    [14],
    [16],
    [17],
    [18],
    [20],
    [21],
    [23],
    [24],
    [25],
    [27],
    [28],
    [29],
    [31],
    [32],
  ],
  [
    [7],
    [9],
    [11],
    [12],
    [14],
    [16],
    [18],
    [20],
    [22],
    [24],
    [25],
    [27],
    [29],
    [31],
    [33],
    [35],
    [37],
    [38],
    [40],
    [42],
    [44],
  ],
  [
    [9],
    [11],
    [14],
    [16],
    [18],
    [21],
    [23],
    [25],
    [28],
    [30],
    [32],
    [35],
    [37],
    [40],
    [42],
    [44],
    [47],
    [49],
    [51],
    [54],
    [56],
  ],
];

const B2B11Mini = [
  [
    [3],
    [4],
    [5],
    [5],
    [6],
    [7],
    [8],
    [9],
    [10],
    [11],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [17],
    [18],
    [19],
    [20],
  ],
  [
    [4],
    [5],
    [6],
    [7],
    [8],
    [9],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [17],
    [18],
    [19],
    [21],
    [22],
    [23],
    [24],
    [25],
    [26],
  ],
];

describe('B2B11', () => {
  for (let combo = 0; combo < B2B11Quad.length; combo++) {
    it(`Quad Combo: ${combo} to be ${B2B11Quad[combo]}`, () => {
      expect(tsOne.calculateAttacks(4, combo, 11, false, false)).toEqual(
        B2B11Quad[combo]
      );
    });
  }

  for (let lines = 0; lines < B2B11Spin.length; lines++) {
    for (let combo = 0; combo < B2B11Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B11Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 11, true, false)
        ).toEqual(B2B11Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B11Mini.length; lines++) {
    for (let combo = 0; combo < B2B11Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B11Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 11, false, true)
        ).toEqual(B2B11Mini[lines][combo]);
      });
    }
  }
});

const B2B42Quad = [
  [8],
  [10],
  [12],
  [14],
  [17],
  [19],
  [21],
  [23],
  [25],
  [27],
  [29],
  [31],
  [34],
  [36],
  [38],
  [40],
  [42],
  [44],
  [46],
  [48],
  [51],
];

const B2B42Spin = [
  [
    [6],
    [8],
    [9],
    [11],
    [13],
    [14],
    [16],
    [17],
    [19],
    [21],
    [22],
    [24],
    [26],
    [27],
    [29],
    [30],
    [32],
    [34],
    [35],
    [37],
    [39],
  ],
  [
    [8],
    [10],
    [12],
    [14],
    [17],
    [19],
    [21],
    [23],
    [25],
    [27],
    [29],
    [31],
    [34],
    [36],
    [38],
    [40],
    [42],
    [44],
    [46],
    [48],
    [51],
  ],
  [
    [10],
    [13],
    [15],
    [18],
    [21],
    [23],
    [26],
    [28],
    [31],
    [34],
    [36],
    [39],
    [42],
    [44],
    [47],
    [49],
    [52],
    [55],
    [57],
    [60],
    [63],
  ],
];

const B2B42Mini = [
  [
    [4],
    [5],
    [6],
    [7],
    [9],
    [10],
    [11],
    [12],
    [13],
    [14],
    [15],
    [16],
    [18],
    [19],
    [20],
    [21],
    [22],
    [23],
    [24],
    [25],
    [27],
  ],
  [
    [5],
    [6],
    [8],
    [9],
    [11],
    [12],
    [13],
    [15],
    [16],
    [17],
    [19],
    [20],
    [22],
    [23],
    [24],
    [26],
    [27],
    [28],
    [30],
    [31],
    [33],
  ],
];

describe('B2B42', () => {
  for (let combo = 0; combo < B2B42Quad.length; combo++) {
    it(`Quad Combo: ${combo} to be ${B2B42Quad[combo]}`, () => {
      expect(tsOne.calculateAttacks(4, combo, 42, false, false)).toEqual(
        B2B42Quad[combo]
      );
    });
  }

  for (let lines = 0; lines < B2B42Spin.length; lines++) {
    for (let combo = 0; combo < B2B42Spin[lines].length; combo++) {
      it(`Spin Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B42Spin[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 42, true, false)
        ).toEqual(B2B42Spin[lines][combo]);
      });
    }
  }

  for (let lines = 0; lines < B2B42Mini.length; lines++) {
    for (let combo = 0; combo < B2B42Mini[lines].length; combo++) {
      it(`Mini Lines: ${lines + 1} Combo: ${combo} to be ${
        B2B42Mini[lines][combo]
      }`, () => {
        expect(
          tsOne.calculateAttacks(lines + 1, combo, 42, false, true)
        ).toEqual(B2B42Mini[lines][combo]);
      });
    }
  }
});
