import { Link } from 'react-router-dom';
import { useState } from 'react';
import Hero from '../../components/hero/Hero';
import Menu from '../../components/menu/Menu';
import RightArrowSVG from '../../assets/img/RightArrowSVG';
import './Welcome.css';

const greetings = [
  'Hi',
  'Hello',
  'Hola',
  'Welcome',
  'Hey',
  'Bonjour',
  'Hallo',
  'Ola',
  'Namaste',
];

function getUsername() {
  const username = localStorage.getItem('username');
  return username ? username : 'username';
}

function SignIn() {
  const greetingStr = greetings[Math.floor(Math.random() * greetings.length)];
  return (
    <div className="welcome-container">
      <h1 className="welcome">{greetingStr}.</h1>
      <Link to="/sign-in" className="play-button">
        <span>Sign in</span>
        <RightArrowSVG />
      </Link>
    </div>
  );
}

function WelcomeBack({ name }) {
  const greetingStr = greetings[Math.floor(Math.random() * greetings.length)];
  return (
    <div className="welcome-container">
      <h1 className="welcome">
        {greetingStr}, <span className="username">{name}</span>.
      </h1>
      <Link to="/play" className="play-button">
        <span>Play</span>
        <RightArrowSVG />
      </Link>
    </div>
  );
}

function WelcomePage() {
  // Would be an API call
  const name = getUsername();
  const [isSignedIn, setIsSignedIn] = useState(true);

  return (
    <div className="welcome-page-container">
      {isSignedIn ? <WelcomeBack name={name} /> : <SignIn />}
    </div>
  );
}

function Welcome() {
  const [isHeroDone, setIsHeroDone] = useState(true);

  return (
    <>
      {isHeroDone && <Menu />}
      {isHeroDone ? <WelcomePage /> : <Hero setAnimationDone={setIsHeroDone} />}
    </>
  );
}

export default Welcome;
