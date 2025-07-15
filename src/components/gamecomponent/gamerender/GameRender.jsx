import { useState, useEffect, useRef } from 'react';
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

function Cell({ cls }) {
  const className = 'cell' + (cls ? ` ${cls}` : '');
  return <div className={className}></div>;
}

function Cells({ grid }) {
  const height = grid.length;

  return (
    <>
      {grid.map((row, i) =>
        row.map((_, j) => (
          <Cell key={`${i}-${j}`} cls={grid[height - i - 1][j]} />
        ))
      )}
    </>
  );
}

function GridTop({ grid, onMouseDown, onMouseOver }) {
  // Board is split into two components
  // BoardTop is the component where pieces are spawned
  // Other pieces can be pushed into BoardTop with kicks and garbage

  const boardRef = useRef(null);
  const numRows = grid.length;
  const numCols = grid[0].length;

  // When clicking on a cell, call onClickCell
  useEffect(() => {
    const boardEle = boardRef.current;

    const onMouseDownListener = (ev) => onMouseDown(ev, boardEle, numRows);
    const onMouseOverListener = (ev) => onMouseOver(ev, boardEle, numRows);

    boardEle.addEventListener('mousedown', onMouseDownListener);
    boardEle.addEventListener('mouseover', onMouseOverListener);

    return () => {
      boardEle.removeEventListener('mousedown', onMouseDownListener);
      boardEle.removeEventListener('mouseover', onMouseOverListener);
    };
  }, [onMouseDown, onMouseOver, numRows]);

  return (
    <div
      className="board-top"
      style={{
        aspectRatio: `${numCols} / ${numRows}`,
        top: `calc(-${numRows} * var(--cell-size)`,
      }}
      ref={boardRef}
    >
      <Cells grid={grid} />
    </div>
  );
}

function Grid({ grid, onMouseDown, onMouseOver }) {
  const boardRef = useRef(null);

  // When clicking on a cell, call onClickCell
  useEffect(() => {
    const boardEle = boardRef.current;

    const onMouseDownListener = (ev) => onMouseDown(ev, boardEle, BOARD_HEIGHT);
    const onMouseOverListener = (ev) => onMouseOver(ev, boardEle, BOARD_HEIGHT);

    boardEle.addEventListener('mousedown', onMouseDownListener);
    boardEle.addEventListener('mouseover', onMouseOverListener);

    return () => {
      boardEle.removeEventListener('mousedown', onMouseDownListener);
      boardEle.removeEventListener('mouseover', onMouseOverListener);
    };
  }, [onMouseDown, onMouseOver]);

  return (
    <div className="board" ref={boardRef}>
      <Cells grid={grid} />
    </div>
  );
}

function GarbageCell({ cls }) {
  const className = 'garbage-cell' + (cls ? ` ${cls}` : '');
  return <div className={className}></div>;
}

function Garbage({ charged, uncharged }) {
  let emptyNumCells = MAX_GARBAGE;

  const differenceOrZero = (a, b) => (a - b < 0 ? 0 : a - b);

  // Calculate number of charged, uncharged, and empty cells in respective order
  const chargedNumCells = Math.min(emptyNumCells, charged);
  emptyNumCells = differenceOrZero(emptyNumCells, chargedNumCells);
  const unchargedNumCells = Math.min(emptyNumCells, uncharged);
  emptyNumCells = differenceOrZero(emptyNumCells, unchargedNumCells);

  // console.log('charged, uncharged: ', charged, uncharged);
  // console.log(chargedNumCells, unchargedNumCells, emptyNumCells, MAX_GARBAGE);

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
  const onMouseDown = (offSet) => (ev, gridEle, rows) => {
    gridMouseDownRef.current = true;

    // If right clicked, then clear in stead of fill
    if (ev.button === 2) {
      clearRef.current = true;
    }

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
  };

  const onMouseOver = (offSet) => (ev, gridEle, rows) => {
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
  };

  useEffect(() => {
    const onMouseUp = (ev) => {
      gridMouseDownRef.current = false;
      clearRef.current = false;
      resetFillCell();
      ev.preventDefault();
    };

    // Prevent context menu from opening
    const onContextMenu = (ev) => ev.preventDefault();

    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('contextmenu', onContextMenu);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('contextmenu', onContextMenu);
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

  return (
    <div className="game-container">
      <GridTop
        grid={gridTop}
        onMouseDown={onMouseDown(BOARD_HEIGHT)}
        onMouseOver={onMouseOver(BOARD_HEIGHT)}
      />
      <Grid
        grid={grid}
        onMouseDown={onMouseDown(0)}
        onMouseOver={onMouseOver(0)}
      />
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

export default GameRender;
