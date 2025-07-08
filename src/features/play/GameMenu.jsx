import { useState, useRef, useEffect } from 'react';

import MapSVG from '../../assets/img/MapSVG';
import DesignSVG from '../../assets/img/HammerWrenchSVG';
import SoloSVG from '../../assets/img/PlaySVG';
import PracticeSVG from '../../assets/img/DumbbellSVG';
import SettingsSVG from '../../assets/img/CogSVG';

import MenuButton from '../../components/menu/menubutton/MenuButton';
import './GameMenu.css';

function MenuNav({ isNavActive, selected, setSelected }) {
  const navRef = useRef(null);

  const clickHandler = (ev, newSelected) => {
    if (newSelected === selected) {
      ev.preventDefault();
    } else {
      setSelected(newSelected);
    }
  };

  useEffect(() => {
    const navEle = navRef.current;
    let timeout;
    if (!isNavActive) {
      timeout = setTimeout(() => {
        navEle.classList.remove('animate');
      }, 350);
    } else {
      timeout = setTimeout(() => {
        navEle.classList.add('animate');
      }, 5);
    }

    return () => clearTimeout(timeout);
  }, [isNavActive]);

  return (
    <nav ref={navRef} className="game-nav">
      <ul>
        <li>
          <button
            className={selected === 'map' ? 'selected' : ''}
            onClick={(ev) => clickHandler(ev, 'map')}
          >
            <MapSVG />
            <span>Maps</span>
          </button>
        </li>
        <li>
          <button
            className={selected === 'design' ? 'selected' : ''}
            onClick={(ev) => clickHandler(ev, 'design')}
          >
            <DesignSVG />
            <span>Design</span>
          </button>
        </li>
        <li>
          <button
            className={selected === 'solo' ? 'selected' : ''}
            onClick={(ev) => clickHandler(ev, 'solo')}
          >
            <SoloSVG />
            <span>Solo</span>
          </button>
        </li>
        <li>
          <button
            className={selected === 'practice' ? 'selected' : ''}
            onClick={(ev) => clickHandler(ev, 'practice')}
          >
            <PracticeSVG />
            <span>Practice</span>
          </button>
        </li>
        <li>
          <button
            className={selected === 'settings' ? 'selected' : ''}
            onClick={(ev) => clickHandler(ev, 'settings')}
          >
            <SettingsSVG />
            <span>Settings</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}

function GameMenu({ selected, setSelected }) {
  const [openedMenu, setOpenedMenu] = useState(true);

  return (
    <>
      <div className={'game menu-container' + (openedMenu ? ' show' : ' hide')}>
        <MenuButton toggleMenu={() => setOpenedMenu(!openedMenu)} />
        <MenuNav
          isNavActive={openedMenu}
          selected={selected}
          setSelected={setSelected}
        />
      </div>
    </>
  );
}

export default GameMenu;
