import { useState, useRef, useEffect } from 'react';
import { useLoaderData } from 'react-router-dom';
import GameDesigner from '../../components/gamedesigner/GameDesigner';
import MapPlayer from '../../components/mapplayer/MapPlayer';
// import GameComponent from '../../components/gamecomponent/GameComponent';
import { getMap } from '../../api/map';
import newGame from '../../game/game';
import { decode } from '../../game/config/transform';
import { validateAll } from '../../game/config/config';
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
  const config = {
    enableUndo: true,
  };
  const gameRef = useRef(newGame(config));
  const [loadedMap, setLoadedMap] = useState(false);

  useEffect(() => {
    if (loadedMap) {
      return;
    }
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
        setLoadedMap(true);
        gameRef.current = newGame(config);
      } catch (error) {
        console.log(error);
      }
    }
  }, [loadedMap, setLoadedMap]);

  return (
    <div className="designer-container">
      {loadedMap ? (
        <MapPlayer gameRef={gameRef} />
      ) : (
        <GameDesigner gameRef={gameRef} />
      )}
    </div>
  );
}

export { Design as default, loader };
