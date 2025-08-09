import { useRef, useEffect } from 'react';
import GameComponent from '../../components/gamecomponent/GameComponent';
import GameSettingsMenu from '../../components/gamesettingsmenu/GameSettingsMenu';
import newGame from '../../game/game';
import { decode } from '../../game/config/transform';
import { validateAll } from '../../game/config/config';

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('data')) {
      try {
        const config = decode(params.get('data'));
        const cleanURL = `${window.location.origin}${window.location.pathname}`;
        window.history.replaceState({}, document.title, cleanURL);
        const { hasError, text } = validateAll(config);
        if (hasError) {
          throw new Error(text);
        }

        gameRef.current = newGame(config);
      } catch (e) {
        console.log(e);
      }
    }
  }, []);

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
