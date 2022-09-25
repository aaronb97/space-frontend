import { signOut, User } from 'firebase/auth';
import { useState } from 'react';
import { client } from './client';
import { Counter } from './components/Counter';
import { auth } from './firebaseApp';
import { usePlanets } from './usePlanets';
import { useUserData } from './useUserData';
import { getDateString } from './utils/getDateString';
import styled from 'styled-components';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

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
  margin: 8px;
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 8px;
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

  const {
    userInfo,
    invalidate: invalidateUserInfo,
    error: userError,
  } = useUserData(user);
  const { planets, error: planetsError } = usePlanets();

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

  const options = planets
    ?.filter((planet) => planet.id !== userInfo.planet.id)
    ?.map((planet) => ({
      value: planet.id,
      label: planet.name,
    }));

  const selectedOption = options?.find(
    (option) => option.value === selectedPlanet,
  );

  return (
    <div className="App">
      <Header>
        <div>
          <div>Signed in as {userInfo.username}</div>
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
        <div>
          {userInfo.status === 0 && (
            <div>Traveling to {userInfo.planet.name}</div>
          )}
          {userInfo.status === 1 && (
            <div>Welcome to {userInfo.planet.name}</div>
          )}
          <Section>
            <div>Speed: {userInfo.speed.toLocaleString()} km/hour</div>
            <div>
              {'Coordinates: '}
              <PositionCounter
                position={userInfo.positionX}
                velocity={userInfo.velocityX}
              />
              {', '}
              <PositionCounter
                position={userInfo.positionY}
                velocity={userInfo.velocityY}
              />
              {', '}
              <PositionCounter
                position={userInfo.positionZ}
                velocity={userInfo.velocityZ}
              />
            </div>
          </Section>
          <Section>
            {userInfo.status === 0 && !userInfo.speedBoostAvailable && (
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
                          .then(async () => await invalidateUserInfo())
                          .catch((e) => console.error(e));
                      }}
                    >
                      Speed boost
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
              <>
                <Select
                  placeholder="Select a Destination"
                  options={options}
                  isSearchable={false}
                  onChange={(e) => {
                    setSelectedPlanet(e?.value ?? '');
                  }}
                  value={selectedOption ?? null}
                  theme={(theme) => ({
                    ...theme,
                    colors: {
                      ...theme.colors,
                      text: 'white',
                      neutral0: 'hsl(0, 0%, 10%)',
                      neutral5: 'hsl(0, 0%, 20%)',
                      neutral10: 'hsl(0, 0%, 30%)',
                      neutral20: 'hsl(0, 0%, 40%)',
                      neutral30: 'hsl(0, 0%, 50%)',
                      neutral40: 'hsl(0, 0%, 60%)',
                      neutral50: 'hsl(0, 0%, 70%)',
                      neutral60: 'hsl(0, 0%, 80%)',
                      neutral70: 'hsl(0, 0%, 90%)',
                      neutral80: 'hsl(0, 0%, 95%)',
                      neutral90: 'hsl(0, 0%, 100%)',
                      primary: '#444',
                      primary25: '#444',
                      primary50: '#444',
                      primary75: '#444',
                    },
                  })}
                ></Select>
              </>
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
        </div>
      </Center>
      <Footer>
        <SignOutButton />
      </Footer>
    </div>
  );
}

interface PositionCounterProps {
  velocity: number;
  position: number;
}

const PositionCounter = ({ velocity, position }: PositionCounterProps) => {
  if (velocity === 0) {
    return <>{position.toFixed()}</>;
  }

  return (
    <Counter
      decrement={velocity < 0}
      initialValue={position}
      render={(position) => position.toFixed()}
      interval={Math.abs((1 / velocity) * 60 * 60 * 1000)}
    ></Counter>
  );
};
