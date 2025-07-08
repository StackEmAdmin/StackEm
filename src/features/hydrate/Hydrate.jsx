import Loading from '../../components/loading/Loading';
import './Hydrate.css';

const tips = [
  'Ever heard the song Korobeiniki?',
  'Take a guess on the first game ever played in space.',
  'Improve your KPP with DAS preservation.',
  'Alexey Pajitnov, a legend, and a chad.',
  'Kicks- weird, unintuitive, and almost always slick.',
  'Fun fact: Every all clear is a color clear (tmyk).',
  'Do you also confuse the L piece with the J piece?',
  'The rotation system defines how a piece is kicked.',
  'The spin detection system defines spins and minis.',
  'LST - L spin triple or LST stacking?',
  'You know, someone named it Super T Spin Double. Super.',
  'T spin mini doubles exist. Just ask Neo.',
  "Everyone asks where's the t spin? But no one asks how's the t spin.",
];

function Hydrate() {
  return (
    <div className="hydrate-container">
      <Loading />
      <p>{tips[Math.floor(Math.random() * tips.length)]}</p>
    </div>
  );
}

export default Hydrate;
