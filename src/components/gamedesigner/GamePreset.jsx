import { useRef, useState, useCallback } from 'react';
import GameRender from '../gamerender/GameRender';
import CustomCheckbox from '../formelements/CustomCheckbox';
import LabelInput from '../formelements/LabelInput';
import validate from '../../game/config/config';
import { controller, modifyConfig } from '../../game/game';
import { parseGridArr } from '../gamesettingsmenu/util';

import './GamePreset.css';

function BoardLabelInputs({ game, setGame, fillRow, setFillRow }) {
  const fillTypes = ['g', 'o', 'i', 'l', 'j', 's', 't', 'z'];

  const toggleAutoColor = () =>
    setGame((game) => controller.toggleAutoColor(game, performance.now()));
  const setFillType = (type) =>
    setGame((game) => controller.setFillType(game, type, performance.now()));

  return (
    <>
      <CustomCheckbox
        id="game-preset-fill-row"
        labelText="Edit Mode"
        name="fill-row"
        checked={fillRow}
        onToggle={(e) => setFillRow(e.target.checked)}
        onText="Row"
        offText="Cell"
      />
      <CustomCheckbox
        id="game-preset-auto-color"
        labelText="Auto Color"
        name="auto-color"
        checked={game.autoColor}
        onToggle={toggleAutoColor}
      />
      <div className="game-preset-fill-type interactive-grid-fill-type">
        <p className="title">Fill Type</p>
        <div className="fill-type-options">
          {fillTypes.map((type) => (
            <button
              className={
                `fill-type ${type}` + (game.fillType === type ? ' active' : '')
              }
              key={type}
              onClick={() => setFillType(type)}
            ></button>
          ))}
        </div>
      </div>
    </>
  );
}

function QueueLabelInputs({ game, setGame }) {
  const get = {
    queueHoldEnabled: (game) => !!game.config.queueHoldEnabled,
    queueInitialHold: (game) => game.config.queueInitialHold.toUpperCase(),
    queueInitialPieces: (game) => game.config.queueInitialPieces.toUpperCase(),
    queueLimitSize: (game) =>
      game.config.queueLimitSize === 0 ? '' : game.config.queueLimitSize,
    queueNthPC: (game) =>
      game.config.queueNthPC < 2 ? '' : game.config.queueNthPC,
  };

  const setter = (key) => (setGame, val) => {
    // Reset game to view initial change instantly
    setGame((game) => {
      let updatedGame = modifyConfig.queue(game, key, val, performance.now());
      return controller.reset(updatedGame, performance.now());
    });
  };

  const set = {
    queueHoldEnabled: setter('queueHoldEnabled'),
    queueInitialHold: setter('queueInitialHold'),
    queueInitialPieces: setter('queueInitialPieces'),
    queueLimitSize: setter('queueLimitSize'),
    queueNthPC: setter('queueNthPC'),
  };

  const initFormInput = (name, game) => {
    return {
      value: get[name](game),
      name: name,
      error: false,
      focus: false,
    };
  };

  const [formInputs, setFormInputs] = useState({
    queueHoldEnabled: initFormInput('queueHoldEnabled', game),
    queueInitialHold: initFormInput('queueInitialHold', game),
    queueInitialPieces: initFormInput('queueInitialPieces', game),
    queueLimitSize: initFormInput('queueLimitSize', game),
    queueNthPC: initFormInput('queueNthPC', game),
  });

  const onFocus = (e) => {
    // Add focus to state
    const name = e.target.name;
    setFormInputs((inputs) => ({
      ...inputs,
      [name]: { ...inputs[name], focus: true },
    }));
  };

  const onBlur = (e) => {
    // Parse value then validate
    const name = e.target.name;
    let val = e.target.value;

    if (name === 'queueLimitSize' || name === 'queueNthPC') {
      val = Number(val);
    }

    if (validate[name](val)) {
      setFormInputs((inputs) => ({
        ...inputs,
        [name]: {
          ...inputs[name],
          value: get[name](game),
          error: false,
          focus: false,
        },
      }));
    } else {
      // Show error on blur
      setFormInputs((inputs) => ({
        ...inputs,
        [name]: { ...inputs[name], error: true, focus: false },
      }));
    }
  };

  const onChange = (e) => {
    // Parse value then make change in game if valid
    const name = e.target.name;
    const inputValue = e.target.value;
    let val = inputValue.toLowerCase();

    if (name === 'queueLimitSize' || name === 'queueNthPC') {
      val = Number(val);
    }

    if (validate[name](val)) {
      set[name](setGame, val);
      setFormInputs((inputs) => ({
        ...inputs,
        [name]: {
          ...inputs[name],
          value: inputValue,
          error: false,
        },
      }));
    } else {
      setFormInputs((inputs) => ({
        ...inputs,
        [name]: { ...inputs[name], value: inputValue },
      }));
    }
  };

  const onToggle = (e) => {
    const name = e.target.name;
    const val = e.target.checked;
    set[name](setGame, val);
    setFormInputs((inputs) => ({
      ...inputs,
      [name]: { ...inputs[name], value: val },
    }));
  };

  return (
    <>
      <CustomCheckbox
        id="game-preset-hold-enabled"
        labelText="Allow hold"
        name="queueHoldEnabled"
        checked={formInputs.queueHoldEnabled.value}
        onToggle={onToggle}
      />
      <LabelInput
        id="game-preset-initial-hold"
        labelText="Initial Hold"
        name="queueInitialHold"
        ariaLabel="Initial hold"
        hasError={formInputs.queueInitialHold.error}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={formInputs.queueInitialHold.value}
        maxLength={1}
      />
      <LabelInput
        id="game-preset-initial-pieces"
        labelText="Initial Pieces"
        name="queueInitialPieces"
        ariaLabel="Initial pieces"
        hasError={formInputs.queueInitialPieces.error}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={formInputs.queueInitialPieces.value}
      />
      <LabelInput
        id="game-preset-limit-size"
        labelText="Limit Queue Size"
        name="queueLimitSize"
        ariaLabel="Limit queue size"
        hasError={formInputs.queueLimitSize.error}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={formInputs.queueLimitSize.value}
      />
      <LabelInput
        id="game-preset-nth-pc"
        labelText="PC Bag"
        name="queueNthPC"
        ariaLabel="PC bag"
        hasError={formInputs.queueNthPC.error}
        onFocus={onFocus}
        onBlur={onBlur}
        onChange={onChange}
        value={formInputs.queueNthPC.value}
        maxLength={1}
      />
    </>
  );
}

function GamePresetForm({
  activeSubMenu,
  setActiveSubMenu,
  game,
  setGame,
  fillRow,
  setFillRow,
}) {
  return (
    <form
      className="game-settings-menu-form game-preset-form"
      action="#"
      onSubmit={(ev) => ev.preventDefault()}
    >
      <div className="form-row">
        <button
          className={activeSubMenu === 'board' ? 'active' : ''}
          onClick={() => setActiveSubMenu('board')}
        >
          Board
        </button>
        <button
          className={activeSubMenu === 'queue' ? 'active' : ''}
          onClick={() => setActiveSubMenu('queue')}
        >
          Queue
        </button>
      </div>
      {activeSubMenu === 'board' ? (
        <BoardLabelInputs
          game={game}
          setGame={setGame}
          fillRow={fillRow}
          setFillRow={setFillRow}
        />
      ) : (
        <QueueLabelInputs game={game} setGame={setGame} />
      )}
    </form>
  );
}

function GamePreset({ onNext, game, setGame }) {
  const [activeSubMenu, setActiveSubMenu] = useState('board');
  const [fillRow, setFillRow] = useState(false);
  const renderRef = useRef(null);

  const onClick = () => {
    if (activeSubMenu === 'queue') {
      onNext();
    } else {
      setActiveSubMenu('queue');
    }
  };

  const onFillCell = useCallback(
    (row, col) => {
      setGame((game) => {
        // Fill row/cell
        const now = performance.now();
        let updatedGame = fillRow
          ? controller.fillRow(game, row, col, now)
          : controller.fillCell(game, row, col, now);

        // Prevent fill on piece spawn
        const grid = parseGridArr(updatedGame.board.grid);
        if (validate.boardInitialGrid(grid)) {
          return updatedGame;
        }

        // Do not fill on piece spawn (invalid)
        return game;
      });
    },
    [setGame, fillRow]
  );

  const onClearCell = useCallback(
    (row, col) => {
      setGame((game) => {
        // Make change
        let updatedGame = fillRow
          ? controller.clearRow(game, row, col, performance.now())
          : controller.clearCell(game, row, col, performance.now());

        const name = 'boardInitialGrid';
        const now = performance.now();
        let grid = parseGridArr(updatedGame.board.grid);

        // Update initial state grid
        updatedGame = modifyConfig.board(updatedGame, name, grid, now);
        updatedGame = controller.reset(updatedGame, performance.now());

        return updatedGame;
      });
    },
    [setGame, fillRow]
  );

  const onResetFillCell = useCallback(() => {
    setGame((game) => {
      let updatedGame = controller.resetFillCell(game, performance.now());

      const name = 'boardInitialGrid';
      const now = performance.now();
      let grid = parseGridArr(updatedGame.board.grid);

      // Update initial state grid
      updatedGame = modifyConfig.board(updatedGame, name, grid, now);
      updatedGame = controller.reset(updatedGame, performance.now());

      return updatedGame;
    });
  }, [setGame]);

  return (
    <div className="game-preset-container">
      <div className="game-preset">
        <div ref={renderRef} className="render-container">
          <GameRender
            game={game}
            fillCell={onFillCell}
            clearCell={onClearCell}
            resetFillCell={onResetFillCell}
            showGhost={false}
            showStats={false}
          />
          <GamePresetForm
            activeSubMenu={activeSubMenu}
            setActiveSubMenu={setActiveSubMenu}
            game={game}
            setGame={setGame}
            fillRow={fillRow}
            setFillRow={setFillRow}
          />
        </div>
        <button className="--global-button next" onClick={onClick}>
          Next
        </button>
      </div>
    </div>
  );
}

export default GamePreset;
