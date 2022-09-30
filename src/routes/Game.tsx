import {
  GoogleAuthProvider,
  linkWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { client } from '../client';
import { Counter } from '../components/Counter';
import { auth } from '../firebase/firebaseApp';
import { usePlanets } from '../hooks/usePlanets';
import { useUserData } from '../hooks/useUserData';
import { getDateString } from '../utils/getDateString';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { logError } from '../utils/logError';
import { Notification } from '../components/Notification';
import { DestinationPicker } from '../components/DestinationPicker';
import Visualizer from './Visualizer';
import './info.css';

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

const Section = styled.div`
  margin-top: 16px;
  margin-bottom: 16px;
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
  justify-content: center;
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

const CenterText = styled.div`
  display: flex;
  width: 100%;
  justify-content: center;
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
  const [selectedPlanet, setSelectedPlanet] = useState<number | ''>('');
  const navigate = useNavigate();

  const [isAnonymous, setIsAnonymous] = useState(user.isAnonymous);
  const [notification, setNotification] = useState<string | undefined>('');

  const {
    userInfo,
    invalidate: invalidateUserInfo,
    error: userError,
  } = useUserData(user);
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

  if (!userInfo) {
    return <div>Loading...</div>;
  }

  const nextBoost =
    new Date(userInfo.nextBoost).getTime() -
    new Date(userInfo.serverTime).getTime();

  const landingTime = userInfo.landingTime
    ? new Date(userInfo.landingTime).getTime() -
      new Date(userInfo.serverTime).getTime()
    : undefined;

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
          <div className={`info`}>
            {userInfo.status === 0 && (
              <div>Traveling to {userInfo.planet.name}</div>
            )}
            {userInfo.status === 1 && (
              <div>Welcome to {userInfo.planet.name}</div>
            )}
            <Section>
              <div>Speed: {userInfo.speed.toLocaleString()} km/hour</div>
            </Section>
            <Section>
              {userInfo.status === 0 &&
                !userInfo.speedBoostAvailable &&
                nextBoost < (landingTime ?? Infinity) && (
                  <div>
                    {'Next Boost: '}
                    <Counter
                      decrement
                      initialValue={nextBoost / 1000}
                      render={(time) =>
                        time <= 0
                          ? 'Speed Boost available shortly...'
                          : getDateString(time)
                      }
                      onReachZero={() => {
                        void invalidateUserInfo();
                      }}
                    ></Counter>
                  </div>
                )}
              {userInfo.speedBoostAvailable && (
                <Section>
                  <FlexContainer>
                    <div>You have an available Speed Boost!</div>
                    <div>
                      <button
                        onClick={() => {
                          client
                            .speedboost()
                            .then(async () => {
                              await invalidateUserInfo();
                            })
                            .catch((e) => console.error(e));
                        }}
                      >
                        Speed Boost
                      </button>
                    </div>
                  </FlexContainer>
                </Section>
              )}
              {landingTime && (
                <div>
                  {'Landing: '}
                  <Counter
                    decrement
                    initialValue={landingTime / 1000}
                    render={(time) =>
                      time <= 1 ? 'Soon...' : getDateString(time)
                    }
                    onReachZero={() => {
                      void invalidateUserInfo();
                    }}
                  ></Counter>
                </div>
              )}
            </Section>
            <FlexContainer>
              {planets && (
                <DestinationPicker
                  planets={planets}
                  selectedPlanet={selectedPlanet}
                  userInfo={userInfo}
                  onChange={(option) => setSelectedPlanet(option?.value ?? '')}
                ></DestinationPicker>
              )}
              {selectedPlanet && (
                <div>
                  <button
                    onClick={() => {
                      client
                        .updateTravelingTo(selectedPlanet)
                        .then(async () => {
                          await invalidateUserInfo();
                          setSelectedPlanet('');
                        })
                        .catch((e) => console.error(e));
                    }}
                  >
                    Go to{' '}
                    {
                      planets?.find((planet) => planet.id === selectedPlanet)
                        ?.name
                    }
                  </button>
                </div>
              )}
            </FlexContainer>
            <CenterText>
              <Notification text={notification}></Notification>
            </CenterText>
          </div>
        </Center>
        <Footer>
          {!isAnonymous && <SignOutButton />}
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
