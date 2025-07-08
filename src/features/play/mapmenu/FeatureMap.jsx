import { Link } from 'react-router-dom';
import TagSVG from '../../../assets/img/TagSVG';
import StarSVG from '../../../assets/img/StarSVG';
import ChallengeSVG from '../../../assets/img/JigsawSVG';
import AttemptsSVG from '../../../assets/img/ShoePrintsSVG';
import PlaySVG from '../../../assets/img/PlaySVG';
import AddSVG from '../../../assets/img/AddSVG';
import './FeatureMap.css';

function FeatureMap({ title, tag, description }) {
  return (
    <div className="feature-map-container">
      <p className="title">{title}</p>
      <p className="author">ZacUser73</p>
      <p className="detail-icon tag">
        <TagSVG />
        <span>{tag}</span>
      </p>
      <p className="detail-icon stars">
        <StarSVG />
        <span>8.4k</span>
      </p>
      <p className="detail-icon difficulty">
        <ChallengeSVG />
        <span>7.4</span>
      </p>
      <p className="detail-icon attempts">
        <AttemptsSVG />
        <span>9.4k (80.3%)</span>
      </p>
      <p className="description">{description}</p>
      <div className="play-add">
        {/* <Link to="/map" className="detail-icon play --global-button"> */}
        <Link className="detail-icon play --global-button">
          <PlaySVG />
          <span>Play</span>
        </Link>
        <button className="detail-icon add --global-circle-button">
          <AddSVG />
        </button>
      </div>
      <div className="feature-map"></div>
    </div>
  );
}

export default FeatureMap;
