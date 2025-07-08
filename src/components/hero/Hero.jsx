import { useEffect } from 'react';
import { toTop } from '../../util/scroll';
import './Hero.css';
import './AnimateHero.css';

function Letter({ letter, amount, index, delay }) {
  const letterAnimationDelay = 0.03;
  const xPos = ((index + 1) / (amount + 1)) * 100;
  return (
    <span
      style={{
        left: `${xPos}%`,
        animationDelay: `${delay + letterAnimationDelay * index}s`,
      }}
      className={'letter letter-' + (index + 1)}
    >
      {letter}
    </span>
  );
}

function Word({ word, index: wordIndex }) {
  const wordAnimationDelay = 1;
  // Add spaces and transform to array
  const letters = word.split('');

  return (
    <div className={'word-container word-container-' + (wordIndex + 1)}>
      {letters.map((letter, index) => (
        <Letter
          letter={letter}
          amount={letters.length}
          index={index}
          key={index}
          delay={wordAnimationDelay * wordIndex}
        />
      ))}
    </div>
  );
}

function Words() {
  const words = ['HELLO', 'WELCOME', 'STACKEM'];

  return (
    <div className="words-container">
      {words.map((word, index) => (
        <Word word={word} index={index} key={word} />
      ))}
    </div>
  );
}

function Hero({ setAnimationDone }) {
  useEffect(() => {
    toTop(); // scroll to top
    const animationDuration = 3800;

    const timeout = setTimeout(() => {
      setAnimationDone(true);
      console.log('animation done');
    }, animationDuration);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <section className="hero-container no-scroll">
      <div className="bar-animation"></div>
      <Words />
    </section>
  );
}

export default Hero;
