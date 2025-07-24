import { useState, useEffect, useRef } from 'react';
import GameRender from './gamerender/GameRender';
import {
  loadKeybinds,
  loadHandling,
  handleKeyDown,
  handleKeyUp,
  releaseKeys,
  fillCell as fillCellClick,
  resetFillCell as resetFillCellClick,
  clearCell as clearCellClick,
} from '../../game/inputs/inputs';
import {
  update as engineUpdate,
  render as engineRender,
} from '../../game/core/engine';
import './GameComponent.css';

function GameComponent({ gameRef }) {
  const { keybinds, modKeybinds, pressed } = loadKeybinds();
  const { DAS, ARR, SRR } = loadHandling();
  const modEnabled = true;
  const [displayGame, setDisplayGame] = useState(gameRef.current);
  const pressedRef = useRef(pressed);
  const actionsRef = useRef([]);
  const lastTimeRef = useRef(null);
  const accumulatorRef = useRef(0);
  const animationRef = useRef(null);
  const workerRef = useRef(null);

  useEffect(() => {
    const keyDown = (ev) =>
      handleKeyDown(
        ev,
        pressedRef,
        actionsRef,
        keybinds,
        modKeybinds,
        modEnabled,
        DAS,
        ARR,
        SRR,
        performance.now()
      );
    const keyUp = (ev) =>
      handleKeyUp(
        ev,
        pressedRef,
        actionsRef,
        keybinds,
        modKeybinds,
        DAS,
        ARR,
        SRR,
        performance.now()
      );

    const visChange = () => {
      if (document.hidden) {
        releaseKeys(
          pressedRef,
          actionsRef,
          keybinds,
          modKeybinds,
          DAS,
          ARR,
          SRR,
          performance.now()
        );
      }
    };

    const onBlur = () => {
      releaseKeys(
        pressedRef,
        actionsRef,
        keybinds,
        modKeybinds,
        DAS,
        ARR,
        SRR,
        performance.now()
      );
    };

    window.addEventListener('keydown', keyDown);
    window.addEventListener('keyup', keyUp);
    document.addEventListener('visibilitychange', visChange);
    window.addEventListener('blur', onBlur);
    return () => {
      window.removeEventListener('keydown', keyDown);
      window.removeEventListener('keyup', keyUp);
      document.removeEventListener('visibilitychange', visChange);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    const animate = (currentTime) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      accumulatorRef.current += deltaTime;
      const { game: updatedGame, accumulator: newAccumulator } = engineUpdate(
        gameRef.current,
        actionsRef,
        accumulatorRef.current,
        currentTime
      );
      gameRef.current = updatedGame;
      accumulatorRef.current = newAccumulator;
      const updatedDisplayGame = engineRender(
        gameRef.current,
        actionsRef,
        accumulatorRef.current,
        currentTime
      );
      setDisplayGame(updatedDisplayGame);
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current);
  }, [gameRef]);

  // Run gameLoop in the background
  useEffect(() => {
    workerRef.current = new Worker(
      new URL('../../game/workers/gameLoopWorker.js', import.meta.url),
      { type: 'module' }
    );

    // Animate without rendering
    const animate = (currentTime) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
        return;
      }

      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      accumulatorRef.current += deltaTime;
      const { game: updatedGame, accumulator: newAccumulator } = engineUpdate(
        gameRef.current,
        actionsRef,
        accumulatorRef.current,
        currentTime
      );
      gameRef.current = updatedGame;
      accumulatorRef.current = newAccumulator;
    };

    workerRef.current.onmessage = (e) => {
      if (e.data.type === 'tick') {
        animate(performance.now());
      }
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        workerRef.current.postMessage({ type: 'start' });
      } else {
        workerRef.current.postMessage({ type: 'stop' });
      }
    };

    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      workerRef.current.terminate();
    };
  }, []);

  return (
    <section className="section game">
      <GameRender
        game={displayGame}
        fillCell={(row, col) =>
          fillCellClick(
            pressedRef,
            actionsRef,
            modKeybinds,
            modEnabled,
            row,
            col,
            performance.now()
          )
        }
        clearCell={(row, col) =>
          clearCellClick(
            pressedRef,
            actionsRef,
            modKeybinds,
            modEnabled,
            row,
            col,
            performance.now()
          )
        }
        resetFillCell={() =>
          resetFillCellClick(actionsRef, modEnabled, performance.now())
        }
      />
    </section>
  );
}

export default GameComponent;
