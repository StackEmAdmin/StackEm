import { useState, useEffect } from 'react';
import BlockSVG from '../../assets/img/BlockSVG';
import './Loading.css';

// Inspired by https://codepen.io/imathis/pen/ZYEWrw

const colors = ['white', 'o', 'i', 'l', 'j', 's', 't', 'z'];

function Loading() {
  const [colorIdx, setColorIdx] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setColorIdx((colorIdx + 1) % colors.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [colorIdx]);

  return (
    <div
      className="loading-container"
      onClick={() => setColorIdx((colorIdx + 1) % colors.length)}
    >
      <div className={'piece' + ` ${colors[colorIdx]}`}>
        <div className="p p-1">
          <BlockSVG />
        </div>
        <div className="p p-2">
          <BlockSVG />
        </div>
        <div className="p p-3">
          <BlockSVG />
        </div>
        <div className="p p-4">
          <BlockSVG />
        </div>
      </div>
    </div>
  );
}

export default Loading;
