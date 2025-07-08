import { useLoaderData } from 'react-router-dom';
import GameComponent from '../../components/gamecomponent/GameComponent';
import { getMap } from '../../api/map';
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
  return (
    <div className="designer-container">
      <GameComponent />
    </div>
  );
}

export { Design as default, loader };
