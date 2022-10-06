import { useState } from 'react';
import { useQueryClient } from 'react-query';
import styled from 'styled-components';
import { client } from '../client';
import { Planet } from '../types/Planet';
import { UserData } from '../types/UserData';
import { getDateString } from '../utils/getDateString';
import { Counter } from './Counter';
import { DestinationPicker } from './DestinationPicker';
import { Notification } from '../components/Notification';

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

const CenterText = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

interface Props {
  userInfo: UserData;
  planets: Planet[];
  notifications: Array<string | undefined>;
}

export const NavigationPanel = ({
  userInfo,
  planets,
  notifications,
}: Props) => {
  const [selectedPlanet, setSelectedPlanet] = useState<number | ''>('');

  const queryClient = useQueryClient();
  const invalidateUserInfo = async () =>
    await queryClient.invalidateQueries(['userInfo']);

  const nextBoost =
    new Date(userInfo.nextBoost).getTime() -
    new Date(userInfo.serverTime).getTime();

  const landingTime = userInfo.landingTime
    ? new Date(userInfo.landingTime).getTime() -
      new Date(userInfo.serverTime).getTime()
    : undefined;

  return (
    <>
      {userInfo.status === 0 && <div>Traveling to {userInfo.planet.name}</div>}
      {userInfo.status === 1 && <div>Welcome to {userInfo.planet.name}</div>}
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
              />
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
              render={(time) => (time <= 1 ? 'Soon...' : getDateString(time))}
              onReachZero={() => {
                void invalidateUserInfo();
              }}
            />
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
          />
        )}
        {selectedPlanet && (
          <>
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
                {planets?.find((planet) => planet.id === selectedPlanet)?.name}
              </button>
            </div>
            {userInfo.godmode && (
              <div>
                <button
                  onClick={() => {
                    client
                      .teleport(selectedPlanet)
                      .then(async () => {
                        await invalidateUserInfo();
                        setSelectedPlanet('');
                      })
                      .catch((e) => console.error(e));
                  }}
                >
                  Teleport to{' '}
                  {
                    planets?.find((planet) => planet.id === selectedPlanet)
                      ?.name
                  }
                </button>
              </div>
            )}
          </>
        )}
      </FlexContainer>
      <CenterText>
        {notifications.map((notif) => (
          <Notification
            key={notif}
            text={notif}
          />
        ))}
      </CenterText>
    </>
  );
};
