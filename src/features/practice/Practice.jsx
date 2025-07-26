import { useRef } from 'react';
import GameComponent from '../../components/gamecomponent/GameComponent';
import GameSettingsMenu from '../../components/gamesettingsmenu/GameSettingsMenu';
import newGame from '../../game/game';

import './Practice.css';

function Practice() {
  const config = {
    enableUndo: true,
  };
  const gameRef = useRef(newGame(config));
  const pubSubRef = useRef(
    (() => {
      const listeners = [];
      return {
        subscribe: (listener) => listeners.push(listener),
        unsubscribe: (listener) =>
          listeners.splice(listeners.indexOf(listener), 1),
        publish: (data) => listeners.forEach((fn) => fn(data)),
      };
    })()
  );
  const parentRef = useRef(null);

  return (
    <div className="practice-container">
      <div className="center">
        <GameComponent gameRef={gameRef} pubSubRef={pubSubRef} />
      </div>
      <div className="side" ref={parentRef}>
        <GameSettingsMenu
          parentRef={parentRef}
          gameRef={gameRef}
          pubSubRef={pubSubRef}
        />
      </div>
    </div>
  );
}

export default Practice;
