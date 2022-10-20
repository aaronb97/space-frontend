import { useNavigate } from 'react-router-dom';
import { IconAnchor } from '../components/IconAnchor';
import { TextIconButton } from '../components/TextIconButton';
import './About.css';

export const About = () => {
  const navigate = useNavigate();
  return (
    <>
      <h1 className="title">Space Game</h1>

      <body className="about-body">
        <div className="about-body-inner">
          Space Game is an asynchronous, multiplayer space-travel simulator
          where you travel between real planets, moons, and other objects in the
          solar sytem (and beyond!) in real-time.
        </div>
      </body>

      <div className="about-button-outer-container">
        <div className="about-button-inner-container">
          <TextIconButton
            iconClassName="fa-solid fa-rocket"
            onClick={() => navigate('/play')}
            style={{ fontSize: '14pt' }}
          >
            Play Space Game
          </TextIconButton>
        </div>
      </div>

      <footer className="about-footer">
        <IconAnchor
          href="mailto:spacegame.support@gmail.com"
          aria-label="Mail Support"
          target="_blank"
          iconClassName="fa-solid fa-envelope"
        />
        <IconAnchor
          href="https://github.com/aaronb97/space-frontend"
          aria-label="Github Repository"
          target="_blank"
          iconClassName="fa-brands fa-github"
        />
      </footer>
    </>
  );
};
