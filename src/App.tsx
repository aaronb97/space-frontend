import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { client } from './client';
import { Counter } from './components/Counter';
import { auth } from './firebaseApp';
import { Planet } from './types/Planet';
import { UserData } from './types/UserData';
import { getDateString } from './utils/getDateString';

function App() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserData>();
  const [planets, setPlanets] = useState<Planet[]>();
  const [selectedPlanet, setSelectedPlanet] = useState<Planet>();

  const getUserInfo = useCallback(async (user: User) => {
    const data = await client.login(user);
    setUserInfo(data?.data);
  }, []);

  const getPlanets = useCallback(async () => {
    const data = await client.getPlanets();
    setPlanets(data?.data);
  }, []);

  useEffect(() => {
    const unsubsribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/login');
      } else {
        void getUserInfo(user);
        void getPlanets();
      }
    });

    return () => unsubsribe();
  }, [navigate, getUserInfo, getPlanets]);

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
    <div className="App">
      <header className="App-header"></header>
      <div>Signed in as {userInfo.username}</div>
      {userInfo.status === 0 && <div>Traveling to {userInfo.planet.name}</div>}
      {userInfo.status === 1 && <div>Welcome to {userInfo.planet.name}</div>}
      <div>Speed: {userInfo.speed.toLocaleString()} km/hour</div>
      <Counter
        decrement={userInfo.velocityX < 0}
        title={'Pos X'}
        initialValue={userInfo.positionX}
        render={(position) => position.toFixed()}
        interval={Math.abs((1 / userInfo.velocityX) * 60 * 60 * 1000)}
      ></Counter>
      <Counter
        decrement={userInfo.velocityY < 0}
        title={'Pos Y'}
        initialValue={userInfo.positionY}
        render={(position) => position.toFixed()}
        interval={Math.abs((1 / userInfo.velocityY) * 60 * 60 * 1000)}
      ></Counter>
      <Counter
        decrement={userInfo.velocityZ < 0}
        title={'Pos Z'}
        initialValue={userInfo.positionZ}
        render={(position) => position.toFixed()}
        interval={Math.abs((1 / userInfo.velocityZ) * 60 * 60 * 1000)}
      ></Counter>
      <div>Vel X: {userInfo.velocityX.toFixed()}</div>
      <div>Vel Y: {userInfo.velocityY.toFixed()}</div>
      <div>Vel Z: {userInfo.velocityZ.toFixed()}</div>
      {userInfo.status === 0 && (
        <Counter
          decrement
          title={'Next Boost'}
          initialValue={nextBoost / 1000}
          render={(time) =>
            time <= 0
              ? 'You have an available Speed Boost!'
              : getDateString(time)
          }
        ></Counter>
      )}
      {landingTime && (
        <Counter
          decrement
          title={'Landing'}
          initialValue={landingTime / 1000}
          render={(time) => (time <= 1 ? 'Soon...' : getDateString(time))}
        ></Counter>
      )}
      <div>
        <button
          onClick={() => {
            void signOut(auth);
          }}
        >
          Sign Out
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            client
              .speedboost()
              .then((result) => setUserInfo(result?.data))
              .catch((e) => console.error(e));
          }}
        >
          Speed boost
        </button>
      </div>
      {planets && (
        <div>
          <select
            onChange={(e) => {
              setSelectedPlanet(
                planets.find((planet) => planet.id === Number(e.target.value)),
              );
            }}
            defaultValue=""
          >
            <option
              value=""
              disabled
            >
              Select a destination
            </option>
            {planets.map((planet) => (
              <option
                key={planet.id}
                value={planet.id}
                disabled={userInfo.planet.id === planet.id}
              >
                {planet.name}
              </option>
            ))}
          </select>
        </div>
      )}
      {selectedPlanet && (
        <div>
          <button
            onClick={() => {
              client
                .updateTravelingTo(selectedPlanet.id)
                .then((result) => setUserInfo(result?.data))
                .catch((e) => console.error(e));
            }}
          >
            Go to {selectedPlanet.name}
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
