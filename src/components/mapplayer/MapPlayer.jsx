import { useState } from 'react';
import GameComponent from '../gamecomponent/GameComponent';
import { controller } from '../../game/game';

import './MapPlayer.css';

function tipify(objective) {
  const linesMap = {
    1: 'single',
    2: 'double',
    3: 'triple',
  };
  const quantifierMap = {
    atLeast: 'at least',
    exact: 'exactly',
    atMost: 'at most',
  };

  if (objective.type === 'spins' || objective.type === 'minis') {
    const piece = objective.piece === 'all' ? '' : `${objective.piece}-`;
    let lines = objective.lines === 'any' ? '' : linesMap[objective.lines];
    if (objective.amount > 1 && objective.lines !== 'any') {
      lines += 's';
    }

    // Reduce spins and minis to spin and mini respectively. Examples:
    //   Perform exactly 3 t-spin doubles
    //   Perform exactly 3 mini singles
    //   Perform exactly 1 mini
    let spin = objective.type;
    if (
      objective.lines !== 'any' ||
      (objective.lines === 'any' && objective.amount === 1)
    ) {
      spin = objective.type === 'spins' ? 'spin' : 'mini';
    }
    return `Perform ${quantifierMap[objective.quantifier]} ${
      objective.amount
    } ${piece}${spin} ${lines}`;
  }

  const phrase1Map = {
    attack: 'Send',
    lines: 'Clear',
    linesCancelled: 'Cancel',
    linesSurvived: 'Survive',
    maxCombo: 'Reach',
    maxB2B: 'Reach',
    allClears: 'Perform',
  };

  const phrase2Map = {
    attack: 'attack',
    lines: 'line',
    linesCancelled: 'line',
    linesSurvived: 'line',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clear',
  };

  const phrase2PluralMap = {
    attack: 'attack',
    lines: 'lines',
    linesCancelled: 'lines',
    linesSurvived: 'lines',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clears',
  };

  const word1 = phrase1Map[objective.type];
  const word2 =
    objective.amount > 1 || objective.amount === 0
      ? phrase2PluralMap[objective.type]
      : phrase2Map[objective.type];
  return `${word1} ${quantifierMap[objective.quantifier]} ${
    objective.amount
  } ${word2}`;
}

function Objectives({ objectives, startGame }) {
  return (
    <div className="objectives-container">
      <div className="objectives">
        <h1>Objectives</h1>
        {objectives.map((objective, index) => (
          <div key={index} className="objective">
            {tipify(objective)}
          </div>
        ))}
      </div>
      <button className="--global-button start" onClick={startGame}>
        Start
      </button>
    </div>
  );
}

function MapPlayer({ gameRef }) {
  const [startGame, setStartGame] = useState(false);
  const objectives = gameRef.current.objectives.objectives;

  const onSetStartGame = () => {
    gameRef.current = controller.reset(gameRef.current, performance.now());
    setStartGame(() => true);
  };

  return (
    <>
      <div className="map-player">
        {startGame ? (
          <GameComponent gameRef={gameRef} modEnabled={false} />
        ) : (
          <Objectives objectives={objectives} startGame={onSetStartGame} />
        )}
      </div>
    </>
  );
}

export default MapPlayer;
