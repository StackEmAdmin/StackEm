import './MenuButton.css';

function MenuButton({ toggleMenu }) {
  return (
    <button className="menu --global-button" onClick={toggleMenu}>
      <span>Menu</span>
      <div className="circles diagonals">
        <div className="circle top"></div>
        <div className="circle bot"></div>
        <div className="diagonal top"></div>
        <div className="diagonal bot"></div>
      </div>
    </button>
  );
}

export default MenuButton;
