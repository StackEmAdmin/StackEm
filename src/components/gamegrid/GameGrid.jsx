import { useCallback, useEffect, useRef } from 'react';
import { Grid, GridTop } from '../gamerender/GameRender';
import { calcRowColFromRect } from '../gamerender/util';
import { controller } from '../../game/game';
import displayCalc from '../../game/util/displayHelper';

import '../gamerender/GameRender.css';
import './GameGrid.css';

const BOARD_HEIGHT = 20;

function GameGrid({ game, setGame, fillRow }) {
  const gridMouseDownRef = useRef(false);
  const clearRef = useRef(false);
  const { grid, gridTop } = displayCalc.grids(game, BOARD_HEIGHT, false);

  const onMouseDown = useCallback(
    (ev, offSet, gridEle, rows) => {
      if (ev.button === 2) {
        clearRef.current = true;
      }
      gridMouseDownRef.current = true;
      if (ev.target === gridEle) {
        return;
      }
      const { row, col } = calcRowColFromRect(
        ev.target.getBoundingClientRect(),
        gridEle.getBoundingClientRect(),
        rows,
        offSet
      );

      setGame((game) => {
        if (clearRef.current) {
          return fillRow
            ? controller.clearRow(game, row, col, performance.now())
            : controller.clearCell(game, row, col, performance.now());
        }
        return fillRow
          ? controller.fillRow(game, row, col, performance.now())
          : controller.fillCell(game, row, col, performance.now());
      });
    },
    [fillRow, setGame]
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

      setGame((game) => {
        if (clearRef.current) {
          return fillRow
            ? controller.clearRow(game, row, col, performance.now())
            : controller.clearCell(game, row, col, performance.now());
        }
        return fillRow
          ? controller.fillRow(game, row, col, performance.now())
          : controller.fillCell(game, row, col, performance.now());
      });
    },
    [fillRow, setGame]
  );

  useEffect(() => {
    const onMouseUp = () => {
      setTimeout(() => {
        if (game.autoColorCells.length > 0) {
          setGame((game) => controller.resetFillCell(game, performance.now()));
        }
        gridMouseDownRef.current = false;
        clearRef.current = false;
      }, 1);
    };

    const onContextMenu = (e) => gridMouseDownRef.current && e.preventDefault();

    window.addEventListener('contextmenu', onContextMenu);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('contextmenu', onContextMenu);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [game, setGame]);

  return (
    <div className="game-container grid-container">
      <GridTop
        grid={gridTop}
        split={BOARD_HEIGHT}
        onMouseDown={onMouseDown}
        onMouseOver={onMouseOver}
      />
      <Grid grid={grid} onMouseDown={onMouseDown} onMouseOver={onMouseOver} />
    </div>
  );
}

export default GameGrid;
