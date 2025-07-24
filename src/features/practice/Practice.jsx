import { useRef } from 'react';
import GameComponent from '../../components/gamecomponent/GameComponent';
import newGame from '../../game/game';

import './Practice.css';

function Practice() {
  const config = {
    enableUndo: true,
  };
  const gameRef = useRef(newGame(config));

  return (
    <div className="practice-container">
      <GameComponent gameRef={gameRef} />
    </div>
  );
}

export default Practice;
