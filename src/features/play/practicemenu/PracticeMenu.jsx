import { Link } from 'react-router-dom';
import './PracticeMenu.css';

function PracticeMenu() {
  return (
    <div className="practice-menu-container">
      <Link className="--global-button practice" to="/practice">
        Practice
      </Link>
    </div>
  );
}

export default PracticeMenu;
