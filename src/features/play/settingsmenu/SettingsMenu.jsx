import { useState, useEffect } from 'react';
import {
  loadKeybinds,
  saveKeybinds,
  saveModKeybinds,
} from '../../../game/config/keybinds';
import {
  loadHandling,
  saveDAS,
  saveARR,
  saveSRR,
  validate,
} from '../../../game/config/handling';
import str from '../../../util/str';
import './SettingsMenu.css';

const keyNameMap = {
  ' ': 'Space',
  arrowleft: 'Left',
  arrowright: 'Right',
  arrowdown: 'Down',
  arrowup: 'Up',
};

const commandNameMap = {
  left: 'Left',
  right: 'Right',
  softDrop: 'Soft Drop',
  drop: 'Hard Drop',
  rotateCW: 'Rotate CW',
  rotateCCW: 'Rotate CCW',
  rotate180: 'Rotate 180',
  hold: 'Hold',
  reset: 'Reset',
  undoMove: 'Undo Move',
  redoMove: 'Redo Move',
  undo: 'Undo Drop',
  redo: 'Redo Drop',
  setFillTypeO: 'Set Fill Type O',
  setFillTypeI: 'Set Fill Type I',
  setFillTypeL: 'Set Fill Type L',
  setFillTypeJ: 'Set Fill Type J',
  setFillTypeS: 'Set Fill Type S',
  setFillTypeT: 'Set Fill Type T',
  setFillTypeZ: 'Set Fill Type Z',
  setFillTypeG: 'Set Fill Type G',
  toggleHighlight: 'Toggle Highlight',
  receiveGarbage1: 'Receive 1 Garbage',
  receiveGarbage2: 'Receive 2 Garbage',
  receiveGarbage3: 'Receive 3 Garbage',
  receiveGarbage4: 'Receive 4 Garbage',
  receiveGarbage5: 'Receive 5 Garbage',
  receiveGarbage6: 'Receive 6 Garbage',
  receiveGarbage7: 'Receive 7 Garbage',
  receiveGarbage8: 'Receive 8 Garbage',
  receiveGarbage9: 'Receive 9 Garbage',
  receiveGarbage10: 'Receive 10 Garbage',
};

function getKeyName(key) {
  if (key in keyNameMap) {
    return keyNameMap[key];
  }
  return str.capitalize(key);
}

function getCommandName(command) {
  if (command in commandNameMap) {
    return commandNameMap[command];
  }
  return str.capitalize(command);
}

function SettingsMenu() {
  const [instructions, setInstructions] = useState({
    show: false,
    title: 'Press a key',
    text: 'Click to cancel',
    keys: [],
    command: null,
    isMod: false,
  });
  const { DAS, ARR, SRR } = loadHandling();
  const [DASState, setDASState] = useState({ value: DAS, error: false });
  const [ARRState, setARRState] = useState({ value: ARR, error: false });
  const [SRRState, setSRRState] = useState({ value: SRR, error: false });
  const { keybinds, modKeybinds } = loadKeybinds();

  const onClickCancel = () => {
    setInstructions({ ...instructions, show: false });
  };

  const onClickKeyOption = (command) => {
    setInstructions({
      show: true,
      title: `Press a key for ${command.toLowerCase()}`,
      text: 'Click to cancel',
      keys: [],
      command: command,
      isMod: false,
    });
  };

  const onClickModKeyOption = (command) => {
    setInstructions({
      show: true,
      title: 'Press a combination of keys',
      text: 'Click to cancel',
      keys: [],
      command: command,
      isMod: true,
    });
  };

  const onBlurHandling = (key, val) => {
    if (key === 'DAS') {
      const error = !validate.handling(val, ARR, SRR);
      setDASState({ value: val, error: error });
      if (!error) {
        saveDAS(val);
      }
    } else if (key === 'ARR') {
      const error = !validate.handling(DAS, val, SRR);
      setARRState({ value: val, error: error });
      if (!error) {
        saveARR(val);
      }
    } else if (key === 'SRR') {
      const error = !validate.handling(DAS, ARR, val);
      setSRRState({ value: val, error: error });
      if (!error) {
        saveSRR(val);
      }
    }
  };

  useEffect(() => {
    const handleKeyDown = (ev) => {
      // If not enabled or key repeated then do nothing
      if (!instructions.show || instructions.keys.includes(ev.key)) {
        return;
      }
      ev.preventDefault();
      if (!instructions.isMod) {
        keybinds[instructions.command] = [ev.key.toLowerCase()];
        saveKeybinds(keybinds);
        setInstructions({ ...instructions, show: false });
        return;
      }
      setInstructions({
        ...instructions,
        keys: [...instructions.keys, ev.key],
      });
    };

    const handleKeyUp = (ev) => {
      if (
        !instructions.show ||
        !instructions.isMod ||
        instructions.keys.length === 0
      ) {
        return;
      }

      ev.preventDefault();

      const keyArrLower = instructions.keys.map((key) => key.toLowerCase());
      modKeybinds[instructions.command] = keyArrLower;
      saveModKeybinds(modKeybinds);
      setInstructions({ ...instructions, show: false });
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  });

  return (
    <div className="settings-container">
      {instructions.show && (
        <div onClick={onClickCancel} className="instructions">
          <p className="title">{instructions.title}</p>
          <p className="text">{instructions.text}</p>
          <div className="keys">
            <p>
              {instructions.keys.length >= 1 &&
                instructions.keys.reduce((a, b) => `${a} + ${b}`)}
            </p>
          </div>
        </div>
      )}
      <div className="config-container">
        <p className="title">Handling configuration (in ms)</p>
        <div className="key-binds">
          <div className="key-config">
            <label htmlFor="DAS" className="key-config-name">
              DAS
            </label>
            <input
              className={
                'key-config-key --global-no-spinner' +
                (DASState.error ? ' error' : '')
              }
              type="number"
              id="DAS"
              name="DAS"
              defaultValue={DASState.value}
              onChange={(ev) =>
                setDASState({ ...DASState, value: ev.target.value })
              }
              onBlur={(ev) =>
                onBlurHandling('DAS', Number(ev.currentTarget.value))
              }
            />
          </div>
          <div className="key-config">
            <label htmlFor="ARR" className="key-config-name">
              ARR
            </label>
            <input
              className={
                'key-config-key --global-no-spinner' +
                (ARRState.error ? ' error' : '')
              }
              type="number"
              id="ARR"
              name="ARR"
              defaultValue={ARRState.value}
              onChange={(ev) =>
                setARRState({ ...ARRState, value: ev.target.value })
              }
              onBlur={(ev) =>
                onBlurHandling('ARR', Number(ev.currentTarget.value))
              }
            />
          </div>
          <div className="key-config">
            <label htmlFor="SRR" className="key-config-name">
              SRR
            </label>
            <input
              className={
                'key-config-key --global-no-spinner' +
                (SRRState.error ? ' error' : '')
              }
              type="number"
              id="SRR"
              name="SRR"
              defaultValue={SRRState.value}
              onChange={(ev) =>
                setSRRState({ ...SRRState, value: ev.target.value })
              }
              onBlur={(ev) =>
                onBlurHandling('SRR', Number(ev.currentTarget.value))
              }
            />
          </div>
        </div>
      </div>
      <div className="config-container">
        <p className="title">Key configuration</p>
        <div className="key-binds">
          {Object.entries(keybinds).map(([command, keys]) => {
            return (
              <div
                className="key-config"
                onClick={() => onClickKeyOption(command)}
                key={command}
              >
                <p className="key-config-name">{getCommandName(command)}</p>
                <p className="key-config-key">{getKeyName(keys[0])}</p>
              </div>
            );
          })}
        </div>
      </div>
      <div className="config-container">
        <div className="title">Modifier key configuration</div>
        <div className="key-binds">
          {Object.entries(modKeybinds).map(([command, keys]) => {
            return (
              <div
                className="key-config"
                onClick={() => onClickModKeyOption(command)}
                key={command}
              >
                <p className="key-config-name">{getCommandName(command)}</p>
                <p className="key-config-key">
                  {keys.map((key) => getKeyName(key)).join(' + ')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SettingsMenu;
