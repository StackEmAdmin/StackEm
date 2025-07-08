import MapSearch, { loader } from './MapSearch';
import FeatureMap from './FeatureMap';
import './MapMenu.css';

function Map() {
  return (
    <div className="map-container">
      <MapSearch />
      <div className="featured-maps-container">
        <FeatureMap
          title="Learn LST with the Meoijasd technique"
          tag="puzzle"
          description="Automatically generated quizzes from top PC mode games. The PC is always possible using only the pieces you see when the mode starts. Hints available."
        />
        <FeatureMap
          title="Thistitledoesn'thavespacesandhaslengthlimitof50cha"
          tag="speed-run"
          description="Thisis150characterswithnospacesletsseehowitlookslikeinthedescriptionofhteleveltoseehowthewordsbreakcauseiwannaseehowresponsivethisisandseeifusersdoth."
        />
        <FeatureMap
          title="THISTITLEDOESN'THAVESPACESANDHASLENGTHLIMITOF50CHA"
          tag="attack"
          description="THISIS150CHARACTERSWITHNOSPACESLETSSEEHOWITLOOKSLIKEINTHEDESCRIPTIONOFHTELEVELTOSEEHOWTHEWORDSBREAKCAUSEIWANNASEEHOWRESPONSIVETHISISANDSEEIFUSERSDOTH"
        />
        <FeatureMap
          title="This title has a length of 50 characters but spaces"
          tag="efficiency"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit adipisicing elit adipisicing elit"
        />
        <FeatureMap
          title="This is quite a normal title"
          tag="efficiency"
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit adipisicing elit adipisicing elit"
        />
      </div>
    </div>
  );
}

export { Map as default, loader };
