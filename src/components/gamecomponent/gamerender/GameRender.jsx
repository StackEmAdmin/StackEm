import { useState, useEffect, useRef, useCallback, memo } from 'react';
import displayCalculate from '../../../game/util/displayHelper';
import './GameRender.css';

const BOARD_HEIGHT = 20;
const MAX_GARBAGE = 30;

function calcRowColFromRect(cellRect, boardRect, rows, offSet) {
  return {
    row:
      rows -
      1 -
      Math.round((cellRect.top - boardRect.top) / cellRect.height) +
      offSet,
    col: Math.round((cellRect.left - boardRect.left) / cellRect.width),
  };
}

/**
 * Returns the CSS variable corresponding to the piece type found in the input string.
 * Removes the substring 'ghost' from the input string if present, then checks for
 * specific piece type identifiers ('hg ', 'ho ', etc.). Each identifier corresponds
 * to a different piece type, and the function returns the associated CSS variable.
 *
 * @param {string} string - The input string containing the piece type identifier.
 * @returns {string} - The CSS variable representing the color for the piece type.
 * Returns an empty string if no valid piece type is found.
 */

function pieceTypeToColor(string) {
  const stringToCheck = string.replace('ghost', '');
  if (stringToCheck.includes('hg ')) {
    return 'var(--g)';
  }
  if (stringToCheck.includes('ho ')) {
    return 'var(--o)';
  }
  if (stringToCheck.includes('hi ')) {
    return 'var(--i)';
  }
  if (stringToCheck.includes('hl ')) {
    return 'var(--l)';
  }
  if (stringToCheck.includes('hj ')) {
    return 'var(--j)';
  }
  if (stringToCheck.includes('hs ')) {
    return 'var(--s)';
  }
  if (stringToCheck.includes('hz ')) {
    return 'var(--z)';
  }
  if (stringToCheck.includes('ht ')) {
    return 'var(--t)';
  }
  return '';
}

/**
 * Adds a linear gradient to the given CSS style string to create a corner
 * shape.
 *
 * @param {string} style - The CSS style string to add the gradient to.
 * @param {string} color - The color of the gradient.
 * @param {string} width - The width of the gradient.
 * @param {string} top - The top position of the gradient.
 * @param {string} left - The left position of the gradient.
 * @returns {string} - The modified CSS style string with the gradient added.
 */
function addCornerStylesLinGrad(style, color, width, top, left) {
  const s = `linear-gradient(to right, ${color} ${width}, transparent ${width}) ${top} ${left} / ${width} ${width} no-repeat, 
  linear-gradient(to bottom, ${color} ${width}, transparent ${width}) ${top} ${left} / ${width} ${width} no-repeat`;

  if (style === '') {
    return s;
  }

  return style + ', ' + s;
}

/**
 * Calculates the CSS styles needed to create a corner shape for a given
 * piece type. The function takes a string containing the
 * piece type identifier, and returns an object with the calculated CSS
 * style string for the `background` property.
 *
 * @param {string} string - The input string containing the highlighted
 * piece type and corner identifiers.
 * @returns {Object} - An object with the calculated CSS style string for
 * the `background` property.
 */
function calcCornerStyles(string) {
  if (!string.includes('corner')) {
    return null;
  }

  let background = '';
  const color = pieceTypeToColor(string);
  const w = 'var(--border-width)';

  if (string.includes('tl-corner')) {
    background = addCornerStylesLinGrad(background, color, w, '0', '0');
  }
  if (string.includes('tr-corner')) {
    background = addCornerStylesLinGrad(background, color, w, '100%', '0');
  }
  if (string.includes('bl-corner')) {
    background = addCornerStylesLinGrad(background, color, w, '0', '100%');
  }
  if (string.includes('br-corner')) {
    background = addCornerStylesLinGrad(background, color, w, '100%', '100%');
  }

  return { background };
}

const Cell = memo(function Cell({ cls }) {
  const styles = calcCornerStyles(cls);
  const className = 'cell' + (cls ? ` ${cls}` : '');
  return styles ? (
    <div className={className}>
      <div style={styles} className="corner"></div>
    </div>
  ) : (
    <div className={className}></div>
  );
});

function GridTop({ grid, split, onMouseDown, onMouseOver }) {
  // Board is split into two components
  // BoardTop is the component where pieces are spawned
  // Other pieces can be pushed into BoardTop with kicks and garbage

  const boardRef = useRef(null);
  const rows = grid.length;

  // When clicking on a cell, call onClickCell
  useEffect(() => {
    const boardEle = boardRef.current;

    const onMouseDownListener = (ev) => onMouseDown(ev, split, boardEle, rows);
    const onMouseOverListener = (ev) => onMouseOver(ev, split, boardEle, rows);

    boardEle.addEventListener('mousedown', onMouseDownListener);
    boardEle.addEventListener('mouseover', onMouseOverListener);
    return () => {
      boardEle.removeEventListener('mousedown', onMouseDownListener);
      boardEle.removeEventListener('mouseover', onMouseOverListener);
    };
  }, [onMouseDown, onMouseOver, rows, split]);

  return (
    <div
      className="board-top"
      ref={boardRef}
      onContextMenu={(ev) => ev.preventDefault()}
    >
      {grid.map((row, i) =>
        row.map((_, j) => (
          <Cell key={`${i}-${j}`} cls={grid[grid.length - i - 1][j]} />
        ))
      )}
    </div>
  );
}

function Grid({ grid, onMouseDown, onMouseOver }) {
  const boardRef = useRef(null);

  // When clicking on a cell, call onClickCell
  useEffect(() => {
    const boardEle = boardRef.current;

    const onMouseDownListener = (ev) =>
      onMouseDown(ev, 0, boardEle, BOARD_HEIGHT);
    const onMouseOverListener = (ev) =>
      onMouseOver(ev, 0, boardEle, BOARD_HEIGHT);

    boardEle.addEventListener('mousedown', onMouseDownListener);
    boardEle.addEventListener('mouseover', onMouseOverListener);

    return () => {
      boardEle.removeEventListener('mousedown', onMouseDownListener);
      boardEle.removeEventListener('mouseover', onMouseOverListener);
    };
  }, [onMouseDown, onMouseOver]);

  return (
    <div
      className="board"
      ref={boardRef}
      onContextMenu={(ev) => ev.preventDefault()}
    >
      {grid.map((row, i) =>
        row.map((_, j) => (
          <Cell key={`${i}-${j}`} cls={grid[grid.length - i - 1][j]} />
        ))
      )}
    </div>
  );
}

const GarbageCell = memo(function GarbageCell({ cls }) {
  const className = 'garbage-cell' + (cls ? ` ${cls}` : '');
  return <div className={className}></div>;
});

function Garbage({ charged, uncharged }) {
  let emptyNumCells = MAX_GARBAGE;

  const differenceOrZero = (a, b) => (a - b < 0 ? 0 : a - b);

  // Calculate number of charged, uncharged, and empty cells in respective order
  const chargedNumCells = Math.min(emptyNumCells, charged);
  emptyNumCells = differenceOrZero(emptyNumCells, chargedNumCells);
  const unchargedNumCells = Math.min(emptyNumCells, uncharged);
  emptyNumCells = differenceOrZero(emptyNumCells, unchargedNumCells);

  return (
    <div className="garbage">
      {Array(MAX_GARBAGE)
        .fill('')
        .map((_, i) => {
          if (i < emptyNumCells) {
            return <GarbageCell key={`g${i}`} />;
          } else if (i < emptyNumCells + unchargedNumCells) {
            return <GarbageCell key={`g${i}`} cls="uncharged" />;
          }
          return <GarbageCell key={`g${i}`} cls="charged" />;
        })}
    </div>
  );
}

function Next({ nextPieces }) {
  const rows = 14;
  const cols = 4;
  const cells = Array(rows * cols).fill('');

  // Piece num will be used to calculate the row
  // Each will piece take up 3 rows
  const center = { x: 1, y: 1 };
  nextPieces.forEach((piece, pieceNum) => {
    for (let i = 0; i < piece.span.length; i++) {
      let row = center.y - piece.span[i][1] + pieceNum * 3;
      let col = center.x + piece.span[i][0];
      const flatIndex = row * cols + col;
      cells[flatIndex] = piece.type;
    }
  });

  return (
    <div className="next">
      {cells.map((cell, i) => (
        <Cell key={`n${i}`} cls={cell} />
      ))}
    </div>
  );
}

function Hold({ piece }) {
  const rows = 2;
  const cols = 4;

  // Hold is 2 rows by 4 columns (flattened)
  const cells = Array(rows * cols).fill('');

  if (!piece) {
    return (
      <div className="hold">
        {cells.map((cell, i) => (
          <Cell key={`h${i}`} cls={cell} />
        ))}
      </div>
    );
  }

  // Center point in hold is (1, 1), flattened: (5)
  const center = { x: 1, y: 1 };

  for (let i = 0; i < piece.span.length; i++) {
    const row = center.y - piece.span[i][1];
    const col = center.x + piece.span[i][0];
    const flatIndex = row * cols + col;
    cells[flatIndex] = piece.type;
  }

  return (
    <div className="hold">
      {cells.map((cell, i) => (
        <Cell key={`h${i}`} cls={cell} />
      ))}
    </div>
  );
}

function Stat({ title, value, valueTime }) {
  return (
    <div className="stat">
      <p className="title">{title}</p>
      <p className="value">{value}</p>
      <p className="valueTime">{valueTime}</p>
    </div>
  );
}

function MoreStat({ minutes, seconds }) {
  const minsDisplay = minutes >= 10 ? minutes : `0${minutes}`;
  const secsDisplay = seconds >= 10 ? seconds : `0${seconds}`;
  return (
    <div className="more-stat">
      <p className="title">Time</p>
      <p className="value">{`${minsDisplay}:${secsDisplay}`}</p>
    </div>
  );
}

function Stats({ b2b, combo, pieces, attack, start, combat }) {
  const [durationSecs, setDurationSecs] = useState(0);
  const durationMins = durationSecs / 60;

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = performance.now();
      const newDurationSecs = (currentTime - start) / 1000;
      setDurationSecs(newDurationSecs);
    }, 50);

    return () => clearInterval(timer);
  }, [start]);

  return (
    <>
      <div className="stats">
        <Stat title="B2B" value={b2b} />
        <Stat title="Combo" value={combo} />
        <Stat
          title="Pieces"
          value={pieces}
          valueTime={(pieces / durationSecs).toFixed(1)}
        />
        <Stat
          title="Attack"
          value={attack}
          valueTime={(attack / durationMins).toFixed(1)}
        />
      </div>
      <MoreStat
        minutes={Math.floor(durationMins)}
        seconds={(Math.floor((durationSecs * 10) % 600) / 10).toFixed(1)}
      />
    </>
  );
}

function GameRender({ game, fillCell, clearCell, resetFillCell }) {
  const gridMouseDownRef = useRef(false);
  const clearRef = useRef(false);

  // Fill and clear cell for Grid and GridTop
  const onMouseDown = useCallback(
    (ev, offSet, gridEle, rows) => {
      // If right clicked, then clear in stead of fill
      if (ev.button === 2) {
        clearRef.current = true;
      }
      gridMouseDownRef.current = true;

      // Clicked on grid (and not cell)
      if (ev.target === gridEle) {
        return;
      }

      // Calculate row and col clicked cell (target)
      const { row, col } = calcRowColFromRect(
        ev.target.getBoundingClientRect(),
        gridEle.getBoundingClientRect(),
        rows,
        offSet
      );

      if (clearRef.current) {
        clearCell(row, col);
      } else {
        fillCell(row, col);
      }
    },
    [clearCell, fillCell]
  );

  const onMouseOver = useCallback(
    (ev, offSet, gridEle, rows) => {
      if (!gridMouseDownRef.current || ev.target === gridEle) {
        return;
      }

      const { row, col } = calcRowColFromRect(
        ev.target.getBoundingClientRect(),
        gridEle.getBoundingClientRect(),
        rows,
        offSet
      );

      if (clearRef.current) {
        clearCell(row, col);
      } else {
        fillCell(row, col);
      }
    },
    [clearCell, fillCell]
  );

  useEffect(() => {
    const onMouseUp = () => {
      // Delay to allow contextMenu handler to run first
      setTimeout(() => {
        resetFillCell();
        gridMouseDownRef.current = false;
        clearRef.current = false;
      }, 1);
    };

    const onContextMenu = (ev) => {
      gridMouseDownRef.current && ev.preventDefault();
    };

    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [resetFillCell]);

  // Assumes game has at least 20 rows
  const { grid, gridTop, garbageQueue } = displayCalculate.grids(
    game,
    BOARD_HEIGHT
  );
  const { nextPieces, holdPiece } = displayCalculate.queue(game);
  const { b2b, combo, numPieces, numAttack, startTime, combatScore } =
    displayCalculate.stats(game);

  const userAgentFF = navigator.userAgent.toLowerCase().includes('firefox');

  return (
    <div className={'game-container' + (userAgentFF ? ' ff' : '')}>
      <GridTop
        grid={gridTop}
        split={BOARD_HEIGHT}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
      />
      <Grid grid={grid} onMouseDown={onMouseDown} onMouseOver={onMouseOver} />
      <Garbage
        uncharged={garbageQueue.uncharged}
        charged={garbageQueue.charged}
      />
      <Next nextPieces={nextPieces} />
      <Hold piece={holdPiece} />
      <Stats
        b2b={b2b}
        combo={combo}
        pieces={numPieces}
        attack={numAttack}
        start={startTime}
        combat={combatScore}
      />
    </div>
  );
}

export { GameRender as default, GridTop, Grid, calcRowColFromRect };
