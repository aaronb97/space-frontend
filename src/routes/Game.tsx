import {
  GoogleAuthProvider,
  linkWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebase/firebaseApp';
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { logError } from '../utils/logError';
import Visualizer from './Visualizer';
import { NavigationPanel } from '../components/NavigationPanel';

interface Props {
  user: User;
}

const Center = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 500px;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  margin: 16px;
`;

const Footer = styled.footer`
  position: fixed;
  padding-left: 16px;
  bottom: 16px;
  display: flex;
  justify-content: space-between;
`;

const SignOutButton = () => {
  return (
    <button
      style={{ margin: '8px' }}
      onClick={() => {
        void signOut(auth);
      }}
    >
      Sign Out
    </button>
  );
};

export function Game({ user }: Props) {
  const navigate = useNavigate();

  const [isAnonymous, setIsAnonymous] = useState(user.isAnonymous);
  const [notification, setNotification] = useState<string | undefined>('');

  const { userInfo, error: userError } = useUserData(user);
  const { planets, error: planetsError } = usePlanets();

  useEffect(() => {
    if (userInfo?.notification) {
      setNotification(userInfo.notification);

      setTimeout(() => {
        setNotification(undefined);
      }, 10000);
    }
  }, [userInfo?.notification]);

  if (userError || planetsError) {
    return (
      <div>
        Holey smokes! Space Game ran into a problem. We have notified our
        engineers about this and they are working VERY hard to fix the issue.
      </div>
    );
  }

  if (!userInfo || !planets) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Visualizer user={user} />
      <>
        <Header>
          <div>
            {isAnonymous ? (
              <div>Signed in as Guest ({userInfo.username})</div>
            ) : (
              <>
                <div>Signed in as {userInfo.username}</div>
              </>
            )}
          </div>
          <div>
            <button
              onClick={() => {
                navigate('/items');
              }}
            >
              Go to Items
            </button>
          </div>
        </Header>
        <Center>
          <NavigationPanel
            userInfo={userInfo}
            planets={planets}
            notification={notification}
          ></NavigationPanel>
        </Center>
        <Footer>
          {<SignOutButton />}
          {isAnonymous && (
            <button
              onClick={() => {
                linkWithPopup(user, new GoogleAuthProvider())
                  .then((cred) => setIsAnonymous(cred.user.isAnonymous))
                  .catch(logError);
              }}
            >
              Sign In to save your progress!
            </button>
          )}
        </Footer>
      </>
    </>
  );
}
