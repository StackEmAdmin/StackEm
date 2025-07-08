import GitHubSVG from '../../assets/img/GitHubSVG';
import './Footer.css';
import c from '../../util/constants';

function Footer() {
  return (
    <footer>
      <div className="lines">
        <div className="line left-line"></div>
        <div className="line bottom-left-line"></div>
        <div className="line bottom-right-line"></div>
        <div className="line right-line"></div>
      </div>
      <a href={c.GITHUB_URL} target="_blank">
        <GitHubSVG />
      </a>
    </footer>
  );
}

export default Footer;
