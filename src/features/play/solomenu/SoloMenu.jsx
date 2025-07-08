import { Link } from 'react-router-dom';
import './SoloMenu.css';

function SoloMenu() {
  return (
    <div className="solo-container">
      <Link className="--global-button mode sprint">Sprint</Link>
      <Link className="--global-button mode sssprint">SSSprint</Link>
      <Link className="--global-button mode cheese">Cheese</Link>
      <Link className="--global-button mode tactician">Tactician</Link>
    </div>
  );
}

export default SoloMenu;
