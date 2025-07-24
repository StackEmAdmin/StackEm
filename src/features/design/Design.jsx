import { useRef } from 'react';
import { useLoaderData } from 'react-router-dom';
import GameComponent from '../../components/gamecomponent/GameComponent';
import { getMap } from '../../api/map';
import newGame from '../../game/game';
import './Design.css';

async function loader({ params }) {
  const map = await getMap(params.id);
  if (!map) {
    throw new Response('', {
      status: 404,
      statusText: 'Map not found',
    });
  }
  return { map };
}

function Design() {
  const { map } = useLoaderData();

  const config = {
    enableUndo: true,
  };

  const gameRef = useRef(newGame(config));
  return (
    <div className="designer-container">
      <GameComponent gameRef={gameRef} />
    </div>
  );
}

export { Design as default, loader };
