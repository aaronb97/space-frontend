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

export function Game({ user }: Props) {
  const [selectedPlanet, setSelectedPlanet] = useState<number | ''>('');

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
      <header className="App-header"></header>
      <div>Signed in as {userInfo.username}</div>
      <div>
        <button
          onClick={() => {
            void signOut(auth);
          }}
        >
          Sign Out
        </button>
      </div>
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
                  onChange={(e) => {
                    setSelectedPlanet(e?.value ?? '');
                  }}
                  value={selectedOption ?? null}
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
