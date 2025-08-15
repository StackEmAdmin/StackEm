import { useState, useRef, useEffect } from 'react';
import GamePreset from './GamePreset';
import newGame from '../../game/game';
import AddSVG from '../../assets/img/AddSVG';
import CloseSVG from '../../assets/img/CloseSVG';
import validate from '../../game/config/config';
import { controller, modifyConfig } from '../../game/game';
import GameSettingsMenu from '../gamesettingsmenu/GameSettingsMenu';
import GameComponent from '../gamecomponent/GameComponent';
import LinkSVG from '../../assets/img/LinkSVG';
import CheckSVG from '../../assets/img/CheckSVG';
import { encode } from '../../game/config/transform';

import './GameDesigner.css';

function GameDesignerNav({ stepMap, step, setStep }) {
  return (
    <nav className="game-designer-nav">
      <ul>
        {Object.keys(stepMap).map((key) => (
          <li key={key}>
            <button
              className={step === Number(key) ? 'active' : ''}
              onClick={() => setStep(() => Number(key))}
            >
              {stepMap[key]}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Overview({ onNext }) {
  return (
    <div className="overview-container">
      <div className="overview info pop-up">
        <h1>Stage Designer Overview</h1>
        <p>
          Craft custom puzzles with unique win conditions and gameplay rules.
          Each stage presents a unique challenge under specific constraints.
          Perfect for testing strategy, speed, and even spin vision. All up to
          you!
        </p>
        <h2>Preset</h2>
        <p>
          Define the starting board layout and piece queue. You can also limit
          which pieces are available to use. Overall, you set the stage for what
          players must work with to pass the challenge.
        </p>
        <h2>Objectives</h2>
        <p>
          Each stage includes one or more objectives that determines success.
          These are evaluated when the game ends. Example: Achieve 2 All Clears.
        </p>
        <h2>Rules</h2>
        <p>
          Fine tune the game mechanics to shape how the puzzle plays out. You
          can configure:
        </p>
        <ul>
          <li>Rotation System</li>
          <li>Spin Detection</li>
          <li>Attack System</li>
          <li>Gravity</li>
          <li>Garbage</li>
          <li>And more...</li>
        </ul>
        <button className="--global-button next" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function TwistInputs({ addObjective }) {
  const [quantifier, setQuantifier] = useState('exact');
  const [amount, setAmount] = useState(2);
  const [piece, setPiece] = useState('t');
  const [twist, setTwist] = useState('spins');
  const [lines, setLines] = useState(2);
  const [error, setError] = useState(false);

  const onAdd = () => {
    if (amount === '') {
      return;
    }

    const objective = {
      type: twist,
      amount: Number.isInteger(Number(amount)) ? Number(amount) : amount,
      lines: lines === 'any' ? 'any' : Number(lines),
      quantifier,
      piece,
    };
    if (!validate.objectives([objective])) {
      return;
    }
    addObjective(objective);
  };

  const onBlur = () => {
    if (amount === '') {
      setError(true);
      return;
    }

    // Validate only amount (other attributes valid)
    const objective = {
      type: 'spins',
      amount: Number.isInteger(Number(amount)) ? Number(amount) : amount,
      lines: 1,
      quantifier: 'exact',
      piece: 't',
    };
    setError(!validate.objectives([objective]));
  };

  return (
    <>
      <p>Perform</p>
      <select
        className="objectives-input --global-hover-focus-active-border"
        name="quantifier"
        id="game-designer-quantifier"
        value={quantifier}
        onChange={(e) => setQuantifier(e.target.value)}
      >
        <option value="atLeast">at least</option>
        <option value="exact">exactly</option>
        <option value="atMost">at most</option>
      </select>
      <input
        className={`objectives-input --global-hover-focus-active-border amount${
          error ? ' error' : ''
        }`}
        type="text"
        name="count"
        id="game-designer-count"
        placeholder="amount"
        maxLength={4}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={onBlur}
      />
      <select
        className="objectives-input --global-hover-focus-active-border piece"
        name="piece"
        id="game-designer-piece"
        value={piece}
        onChange={(e) => setPiece(e.target.value)}
      >
        <option value="all">all</option>
        <option value="t">T</option>
        <option value="o">O</option>
        <option value="i">I</option>
        <option value="l">L</option>
        <option value="j">J</option>
        <option value="s">S</option>
        <option value="z">Z</option>
      </select>
      <select
        className="objectives-input --global-hover-focus-active-border"
        name="twist-type"
        id="game-designer-twist-type"
        value={twist}
        onChange={(e) => setTwist(e.target.value)}
      >
        <option value="spins">spin</option>
        <option value="minis">mini</option>
      </select>
      <select
        className="objectives-input --global-hover-focus-active-border"
        name="line-count"
        id="game-designer-line-count"
        value={lines}
        onChange={(e) => setLines(e.target.value)}
      >
        <option value="any">any</option>
        <option value="1">{amount > 1 ? 'singles' : 'single'}</option>
        <option value="2">{amount > 1 ? 'doubles' : 'double'}</option>
        <option value="3">{amount > 1 ? 'triples' : 'triple'}</option>
      </select>
      <button className="--global-circle-button add" onClick={onAdd}>
        <AddSVG />
      </button>
    </>
  );
}

function StatInputs({ addObjective }) {
  const phrase1Map = {
    attack: 'Send',
    lines: 'Clear',
    linesCancelled: 'Cancel',
    linesSurvived: 'Survive',
    maxCombo: 'Reach',
    maxB2B: 'Reach',
    allClears: 'Perform',
  };

  const phrase2Map = {
    attack: 'attack',
    lines: 'line',
    linesCancelled: 'line',
    linesSurvived: 'line',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clear',
  };

  const phrase2PluralMap = {
    attack: 'attack',
    lines: 'lines',
    linesCancelled: 'lines',
    linesSurvived: 'lines',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clears',
  };

  const [stat, setStat] = useState('attack');
  const [quantifier, setQuantifier] = useState('exact');
  const [amount, setAmount] = useState(2);
  const [error, setError] = useState(false);

  const onAdd = () => {
    if (amount === '') {
      return;
    }

    const objective = {
      type: stat,
      amount: Number.isInteger(Number(amount)) ? Number(amount) : amount,
      quantifier,
    };

    if (!validate.objectives([objective])) {
      return;
    }
    addObjective(objective);
  };

  const onBlur = () => {
    if (amount === '') {
      setError(true);
      return;
    }

    // Only validate amount (other fields valid)
    const objective = {
      type: 'lines',
      amount: Number.isInteger(Number(amount)) ? Number(amount) : amount,
      quantifier: 'exact',
    };

    setError(!validate.objectives([objective]));
  };

  return (
    <>
      <select
        className="objectives-input --global-hover-focus-active-border stat"
        name="stat"
        id="game-designer-stat"
        value={stat}
        onChange={(ev) => setStat(ev.target.value)}
      >
        <option value="attack">Attack</option>
        <option value="lines">Clears</option>
        <option value="linesCancelled">Cancel Lines</option>
        <option value="linesSurvived">Survive Lines</option>
        <option value="maxCombo">Max Combo</option>
        <option value="maxB2B">Max B2B</option>
        <option value="allClears">All Clears</option>
      </select>
      <p>: {phrase1Map[stat]}</p>
      <select
        className="objectives-input --global-hover-focus-active-border"
        name="stat-quantifier"
        id="game-designer-stat-quantifier"
        value={quantifier}
        onChange={(ev) => setQuantifier(ev.target.value)}
      >
        <option value="atLeast">at least</option>
        <option value="exact">exactly</option>
        <option value="atMost">at most</option>
      </select>
      <input
        className={`objectives-input --global-hover-focus-active-border amount${
          error ? ' error' : ''
        }`}
        type="text"
        name="stat-count"
        id="game-designer-stat-count"
        placeholder="amount"
        maxLength={4}
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        onBlur={onBlur}
      />
      <p>
        {Number(amount) > 1 || Number(amount) === 0
          ? phrase2PluralMap[stat]
          : phrase2Map[stat]}
      </p>
      <button className="--global-circle-button add" onClick={onAdd}>
        <AddSVG />
      </button>
    </>
  );
}

function tipify(objective) {
  const linesMap = {
    1: 'single',
    2: 'double',
    3: 'triple',
  };
  const quantifierMap = {
    atLeast: 'at least',
    exact: 'exactly',
    atMost: 'at most',
  };

  if (objective.type === 'spins' || objective.type === 'minis') {
    const piece = objective.piece === 'all' ? '' : `${objective.piece}-`;
    let lines = objective.lines === 'any' ? '' : linesMap[objective.lines];
    if (objective.amount > 1 && objective.lines !== 'any') {
      lines += 's';
    }

    // Reduce spins and minis to spin and mini respectively. Examples:
    //   Perform exactly 3 t-spin doubles
    //   Perform exactly 3 mini singles
    //   Perform exactly 1 mini
    let spin = objective.type;
    if (
      objective.lines !== 'any' ||
      (objective.lines === 'any' && objective.amount === 1)
    ) {
      spin = objective.type === 'spins' ? 'spin' : 'mini';
    }
    return `Perform ${quantifierMap[objective.quantifier]} ${
      objective.amount
    } ${piece}${spin} ${lines}`;
  }

  const phrase1Map = {
    attack: 'Send',
    lines: 'Clear',
    linesCancelled: 'Cancel',
    linesSurvived: 'Survive',
    maxCombo: 'Reach',
    maxB2B: 'Reach',
    allClears: 'Perform',
  };

  const phrase2Map = {
    attack: 'attack',
    lines: 'line',
    linesCancelled: 'line',
    linesSurvived: 'line',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clear',
  };

  const phrase2PluralMap = {
    attack: 'attack',
    lines: 'lines',
    linesCancelled: 'lines',
    linesSurvived: 'lines',
    maxCombo: 'max combo',
    maxB2B: 'max B2B',
    allClears: 'all clears',
  };

  const word1 = phrase1Map[objective.type];
  const word2 =
    objective.amount > 1 || objective.amount === 0
      ? phrase2PluralMap[objective.type]
      : phrase2Map[objective.type];
  return `${word1} ${quantifierMap[objective.quantifier]} ${
    objective.amount
  } ${word2}`;
}

function Objectives({ onNext, game, setGame }) {
  const addedObjectives = game.objectives.objectives;
  const [error, setError] = useState(false);

  const addObjective = (objective) => {
    if (addedObjectives.length >= 10) {
      setError(true);
      return;
    }

    const newObjectives = [...addedObjectives, objective];
    if (!validate.objectives(newObjectives)) {
      return;
    }

    setGame((game) => {
      let updatedGame = modifyConfig.config(game, 'objectives', newObjectives);
      updatedGame = controller.reset(updatedGame, performance.now());
      return updatedGame;
    });
  };

  const removeObjective = (index) => {
    const newObjectives = [...game.objectives.objectives];
    newObjectives.splice(index, 1);

    setError(false);
    setGame((game) => {
      let updatedGame = modifyConfig.config(game, 'objectives', newObjectives);
      updatedGame = controller.reset(updatedGame, performance.now());
      return updatedGame;
    });
  };

  return (
    <div className="objectives-container">
      <div className="objectives">
        <form action="#" onSubmit={(ev) => ev.preventDefault()}>
          <h1>Spins and Minis</h1>
          <div className="form-row">
            <TwistInputs addObjective={addObjective} />
          </div>
          <h1>Clear Quests</h1>
          <div className="form-row">
            <StatInputs addObjective={addObjective} />
          </div>
        </form>
        <div className="row">
          <h1>Added Objectives</h1>
          {error && <p>Only 10 objectives allowed</p>}
        </div>
        <div className="added-objectives">
          {addedObjectives.map((objective, i) => (
            <div className="added-objective" key={i}>
              <p>{tipify(objective)}</p>
              <button
                className="--global-circle-button remove"
                onClick={() => removeObjective(i)}
              >
                <CloseSVG />
              </button>
            </div>
          ))}
        </div>
        <button className="--global-button next" onClick={onNext}>
          Next
        </button>
      </div>
    </div>
  );
}

function Rules({ onNext, game, setGame }) {
  const gameRef = useRef(controller.reset(game, performance.now()));
  const configRef = useRef({ ...game.config });
  const parentRef = useRef(null);
  const pubSubRef = useRef(
    (() => {
      const listeners = [];
      return {
        subscribe: (listener) => listeners.push(listener),
        unsubscribe: (listener) =>
          listeners.splice(listeners.indexOf(listener), 1),
        publish: (data) => listeners.forEach((fn) => fn(data)),
      };
    })()
  );

  useEffect(() => {
    const newConfig = configRef.current;
    const handleUpdate = (data) => {
      if (
        typeof data !== 'object' ||
        data.type !== 'config' ||
        !validate[data.name](data.value)
      ) {
        return;
      }
      newConfig[data.name] = data.value;
    };

    const pubSub = pubSubRef.current;
    pubSub.subscribe(handleUpdate);
    return () => {
      // Update config on unmount
      pubSub.unsubscribe(handleUpdate);
      setGame(newGame(newConfig));
    };
  }, [setGame]);

  return (
    <div className="rules-container practice-container">
      <div className="center">
        <GameComponent gameRef={gameRef} pubSubRef={pubSubRef} />
      </div>
      <div className="side" ref={parentRef}>
        <GameSettingsMenu
          parentRef={parentRef}
          gameRef={gameRef}
          pubSubRef={pubSubRef}
          designer={'stage'}
          showMenu={true}
        />
      </div>
      <button className="--global-button next" onClick={onNext}>
        Next
      </button>
    </div>
  );
}

function stagifyConfig(config) {
  const newConfig = { ...config };

  // Queue seed removed intentionally
  delete newConfig.queueSeed;
  delete newConfig.queueNewSeedOnReset;

  // Remove garbage seed (and properties) if not used
  if (!newConfig.garbageModeAPS || newConfig.garbageModeApsAttack <= 0) {
    delete newConfig.garbageModeAPS;
    delete newConfig.garbageModeApsAttack;
    delete newConfig.garbageModeApsSecond;
    delete newConfig.garbageSeed;
    delete newConfig.garbageNewSeedOnReset;
    delete newConfig.garbageSpawn;
    delete newConfig.garbageComboBlock;
    delete newConfig.garbageCharge;
    delete newConfig.garbageChargeDelay;
    delete newConfig.garbageChargePieces;
    delete newConfig.garbageCap;
    delete newConfig.garbageCheesiness;
  }

  delete newConfig.enableUndo;
  return newConfig;
}

function Share({ game }) {
  const [showGame, setShowGame] = useState(false);
  const [verified, setVerified] = useState(false);
  const [animateCopy, setAnimateCopy] = useState(false);
  const gameRef = useRef(controller.reset(game, performance.now()));

  const onGameOver = (game) => {
    if (!game.won) {
      return;
    }
    setVerified(true);
    setShowGame(false);
  };

  const onShowGame = () => {
    gameRef.current = controller.reset(game, performance.now());
    setShowGame(true);
  };

  const onCopyLink = () => {
    const serialized = encode(stagifyConfig(game.config));
    const shareURL = `${window.location.origin}/design?data=${serialized}`;
    navigator.clipboard.writeText(shareURL);
    setAnimateCopy(true);
    setTimeout(() => {
      setAnimateCopy(false);
    }, 5000);
  };

  useEffect(() => {
    const keyHandler = (e) => e.key === 'Escape' && setShowGame(false);
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, []);

  return (
    <div className="share-container">
      <div className="share">
        <h1>Share</h1>
        <p>One last step before sharing your stage!</p>
        <button className="--global-button" onClick={onShowGame}>
          Verify
        </button>
        {verified && (
          <div className="verified">
            <h1>Stage Verified</h1>
            <div className="row">
              <button className="share-icon" onClick={onCopyLink}>
                {animateCopy ? <CheckSVG /> : <LinkSVG />}
              </button>
              <p>You can now share your stage.</p>
            </div>
            <textarea
              name="game-designer-link"
              id="game-designer-link"
              readOnly
              value={`${window.location.origin}/design?data=${encode(
                stagifyConfig(game.config)
              )}`}
              onFocus={(e) => e.target.select()}
            ></textarea>
          </div>
        )}
      </div>
      {showGame && (
        <>
          <div className="game-comp-container-blur"></div>
          <div className="game-comp-container">
            <div className="game-comp">
              <GameComponent
                gameRef={gameRef}
                onGameOver={onGameOver}
                modEnabled={false}
              />
            </div>
            <button className="close" onClick={() => setShowGame(false)}>
              <CloseSVG />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function GameDesigner() {
  const [game, setGame] = useState(
    newGame({
      queueNewSeedOnReset: false,
      garbageNewSeedOnReset: false,
    })
  );

  const stepMap = {
    0: 'Overview',
    1: 'Preset',
    2: 'Objectives',
    3: 'Rules',
    4: 'Share',
  };

  const [step, setStep] = useState(0);
  const onNext = () => setStep((step) => step + 1);

  return (
    <section className="section game-designer">
      <GameDesignerNav stepMap={stepMap} step={step} setStep={setStep} />
      {stepMap[step] === 'Overview' ? (
        <Overview onNext={onNext} />
      ) : stepMap[step] === 'Preset' ? (
        <GamePreset onNext={onNext} game={game} setGame={setGame} />
      ) : stepMap[step] === 'Objectives' ? (
        <Objectives onNext={onNext} game={game} setGame={setGame} />
      ) : stepMap[step] === 'Rules' ? (
        <Rules onNext={onNext} game={game} setGame={setGame} />
      ) : stepMap[step] === 'Share' ? (
        <Share game={game} />
      ) : null}
    </section>
  );
}

export default GameDesigner;
