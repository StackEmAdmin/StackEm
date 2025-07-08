import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import MenuButton from './menubutton/MenuButton';
import './Menu.css';
import c from '../../util/constants';

function MenuNav({ isNavActive, closeNav }) {
  const navRef = useRef(null);
  const overlayRef = useRef(null);

  // CSS animate {display: none} -> {display: flex} and vice versa breaks animation on some browsers
  // Add animate class with delay

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
      }, 10);
    }

    return () => clearTimeout(timeout);
  }, [isNavActive]);

  useEffect(() => {
    const overlayEle = overlayRef.current;
    overlayEle.addEventListener('click', closeNav);
    return () => overlayEle.removeEventListener('click', closeNav);
  });

  return (
    <>
      <nav ref={navRef}>
        <div ref={overlayRef} className="nav-overlay"></div>
        <ul>
          <li>
            <Link onClick={closeNav} to="/">
              Home
            </Link>
          </li>
          <li>
            <Link onClick={closeNav} to="/sign-in">
              Sign In
            </Link>
          </li>
          <li>
            <Link onClick={closeNav} to="/sign-up">
              Sign Up
            </Link>
          </li>
        </ul>
        <ul>
          <li>
            <a href={c.GITHUB_URL} target="_blank">
              GitHub
            </a>
          </li>
        </ul>
      </nav>
    </>
  );
}

function Menu() {
  const [openedMenu, setOpenedMenu] = useState(false);

  return (
    <div className={'main menu-container' + (openedMenu ? ' show' : ' hide')}>
      <MenuButton toggleMenu={() => setOpenedMenu(!openedMenu)} />
      <MenuNav isNavActive={openedMenu} closeNav={() => setOpenedMenu(false)} />
    </div>
  );
}

export default Menu;
