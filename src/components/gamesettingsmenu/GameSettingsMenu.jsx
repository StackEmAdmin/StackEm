import { useState, useRef, useEffect } from 'react';
import GameSettingsMenuForm from './GameSettingsMenuForm';
import ChevronLeftSVG from '../../assets/img/ChevronLeftSVG';
import CogSVG from '../../assets/img/CogSVG';
import DockRightSVG from '../../assets/img/DockRightSVG';
import DockBottomSVG from '../../assets/img/DockBottomSVG';
import './GameSettingsMenu.css';

const LS_GAME_SETTINGS_MENU_HEIGHT = 'game-settings-menu-height';
const LS_GAME_SETTINGS_MENU_WIDTH = 'game-settings-menu-width';
const LS_GAME_SETTINGS_MENU_DOCK = 'game-settings-menu-dock';
const DEFAULT_GAME_SETTINGS_MENU_WIDTH = `${30 * 16}`;
const DEFAULT_GAME_SETTINGS_MENU_HEIGHT = `${30 * 16}`;
const DEFAULT_GAME_SETTINGS_MENU_DOCK = false;

function loadGameSettingsMenuWidth() {
  const width = localStorage.getItem(LS_GAME_SETTINGS_MENU_WIDTH);
  if (width !== null) {
    return width;
  }
  return DEFAULT_GAME_SETTINGS_MENU_WIDTH;
}

function loadGameSettingsMenuHeight() {
  const height = localStorage.getItem(LS_GAME_SETTINGS_MENU_HEIGHT);
  if (height !== null) {
    return height;
  }
  return DEFAULT_GAME_SETTINGS_MENU_HEIGHT;
}

function loadGameSettingsMenuDock() {
  const dock = localStorage.getItem(LS_GAME_SETTINGS_MENU_DOCK);
  if (dock !== null) {
    return dock === 'true';
  }
  return DEFAULT_GAME_SETTINGS_MENU_DOCK;
}

function saveGameSettingsMenuHeight(height) {
  localStorage.setItem(LS_GAME_SETTINGS_MENU_HEIGHT, height);
}

function saveGameSettingsMenuWidth(width) {
  localStorage.setItem(LS_GAME_SETTINGS_MENU_WIDTH, width);
}

function saveGameSettingsMenuDock(dock) {
  localStorage.setItem(LS_GAME_SETTINGS_MENU_DOCK, dock);
}

function GameSettingsMenu({ parentRef, gameRef, pubSubRef }) {
  const [showSettings, setShowSettings] = useState(false);
  const [resizeData, setResizeData] = useState({
    active: false,
    height: loadGameSettingsMenuHeight(),
    width: loadGameSettingsMenuWidth(),
    startCursorY: null,
    startCursorX: null,
    smallScreen: window.innerWidth < 768,
  });
  const [docked, setDocked] = useState(loadGameSettingsMenuDock);
  const containerRef = useRef(null);
  const resizeHandleRef = useRef(null);
  const resizeTargetRef = useRef(null);

  // Animate debouncer
  useEffect(() => {
    const containerEle = containerRef.current;
    let timeout = setTimeout(() => {
      containerEle.classList.remove('animate');
    }, 550);
    return () => clearTimeout(timeout);
  });

  // Resize Handle event listener
  useEffect(() => {
    const resizeHandleEle = resizeHandleRef.current;
    const resizeTargetEle = resizeTargetRef.current;

    const mouseDown = (ev) => {
      // Check if on mobile
      if (window.innerWidth < 768) {
        setResizeData((resizeData) => {
          return {
            ...resizeData,
            active: true,
            height: resizeTargetEle.offsetHeight,
            startCursorY: ev.clientY,
            smallScreen: true,
          };
        });
      } else {
        setResizeData((resizeData) => {
          return {
            ...resizeData,
            active: true,
            width: resizeTargetEle.offsetWidth,
            startCursorX: ev.clientX,
            smallScreen: false,
          };
        });
      }
    };

    const mouseMove = (ev) => {
      setResizeData((resizeData) => {
        if (!resizeData.active) {
          return resizeData;
        }

        if (window.innerWidth < 768) {
          const height =
            resizeData.height + (resizeData.startCursorY - ev.clientY);
          return {
            ...resizeData,
            height: height,
            startCursorY: ev.clientY,
            smallScreen: true,
          };
        }

        const width = resizeData.width + (resizeData.startCursorX - ev.clientX);
        return {
          ...resizeData,
          width: width,
          startCursorX: ev.clientX,
          smallScreen: false,
        };
      });
    };

    const mouseUp = () => {
      setResizeData((resizeData) => {
        if (!resizeData.active) {
          return resizeData;
        }

        if (window.innerWidth < 768) {
          saveGameSettingsMenuHeight(`${resizeData.height}`);
          return { ...resizeData, active: null, smallScreen: true };
        }

        saveGameSettingsMenuWidth(`${resizeData.width}`);
        return { ...resizeData, active: null, smallScreen: false };
      });
    };

    resizeHandleEle.addEventListener('mousedown', mouseDown);
    window.addEventListener('mousemove', mouseMove);
    window.addEventListener('mouseup', mouseUp);

    return () => {
      resizeHandleEle.removeEventListener('mousedown', mouseDown);
      window.removeEventListener('mousemove', mouseMove);
      window.removeEventListener('mouseup', mouseUp);
    };
  }, []);

  // Window resize
  useEffect(() => {
    const windowResize = () => {
      if (window.innerWidth < 768) {
        setResizeData({ ...resizeData, smallScreen: true });
      } else {
        setResizeData({ ...resizeData, smallScreen: false });
      }
    };

    window.addEventListener('resize', windowResize);
    return () => window.removeEventListener('resize', windowResize);
  });

  useEffect(() => {
    if (!parentRef.current.classList.contains('parent-resize-target')) {
      parentRef.current.classList.add('parent-resize-target');
    }

    parentRef.current.style.removeProperty('width');
    parentRef.current.style.removeProperty('height');

    if (!showSettings || !docked) {
      return;
    }

    if (resizeData.smallScreen) {
      parentRef.current.style.height = `${resizeData.height}px`;
      parentRef.current.style.removeProperty;
      return;
    }
    if (!resizeData.smallScreen) {
      parentRef.current.style.width = `${resizeData.width}px`;
      return;
    }
  });

  return (
    <div
      ref={containerRef}
      className={
        'game-settings-menu-container' +
        (showSettings ? ' show animate' : ' hide animate')
      }
    >
      <div
        className="toggle-settings-button"
        onClick={() => setShowSettings(!showSettings)}
      >
        <ChevronLeftSVG />
        <CogSVG />
      </div>
      <div ref={resizeHandleRef} className="resize-handle"></div>
      <div
        ref={resizeTargetRef}
        style={
          resizeData.smallScreen
            ? { height: `${resizeData.height}px` }
            : { width: `${resizeData.width}px` }
        }
        className="resize-target"
      >
        <div
          className="dock-icon"
          onClick={() => {
            setDocked(!docked);
            saveGameSettingsMenuDock(!docked);
          }}
        >
          {resizeData.smallScreen ? <DockBottomSVG /> : <DockRightSVG />}
        </div>
        <GameSettingsMenuForm
          gameRef={gameRef}
          pubSubRef={pubSubRef}
          show={showSettings}
        />
      </div>
    </div>
  );
}

export default GameSettingsMenu;
