import { useState } from 'react';
import GameMenu from './GameMenu';
import MapMenu, { loader } from './mapmenu/MapMenu';
import DesignMenu, { action } from './designMenu/DesignMenu';
import SoloMenu from './solomenu/SoloMenu';
import PracticeMenu from './practicemenu/PracticeMenu';
import SettingsMenu from './settingsmenu/SettingsMenu';
import './Play.css';

function Play() {
  const [selected, setSelected] = useState('map');

  return (
    <main className="play menu-container">
      <GameMenu selected={selected} setSelected={setSelected} />
      <section className="content-container">
        {selected === 'map' ? (
          <MapMenu />
        ) : selected === 'design' ? (
          <DesignMenu />
        ) : selected === 'solo' ? (
          <SoloMenu />
        ) : selected === 'practice' ? (
          <PracticeMenu />
        ) : selected === 'settings' ? (
          <SettingsMenu />
        ) : null}
      </section>
    </main>
  );
}

export { Play as default, loader, action };
